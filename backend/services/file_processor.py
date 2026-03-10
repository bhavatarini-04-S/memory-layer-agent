"""
File processing module - handles background file processing tasks
VERSION_TAG: NO_OPENAI_NO_GEMINI_TEXT_ONLY_V3
"""
import logging
import json
from pathlib import Path
from sqlalchemy.orm import Session

from models.database_models import UploadedFile, DocumentChunk
from services.universal_file_parser import parser
from services.text_processor import split_text_into_chunks
from services.text_analyzer import text_analyzer
from services.meeting_detector import analyze_text_for_meetings
from services.notification_service import NotificationService
from config import settings

logger = logging.getLogger(__name__)
logger.info("=== FILE_PROCESSOR LOADED: NO_OPENAI_NO_GEMINI_TEXT_ONLY_V3 ===")


def process_uploaded_file(file_id: int, file_path: str, file_type: str):
    """
    Background task to process uploaded file
    Saves text content FIRST, then attempts embeddings (optional)
    
    Args:
        file_id: Database file ID
        file_path: Path to uploaded file
        file_type: File extension
    """
    from database import SessionLocal
    db_session = SessionLocal()
    
    logger.info("="*80)
    logger.info("PROCESS_UPLOADED_FILE CALLED - VERSION V3 (NO OpenAI, NO Gemini)")
    logger.info("="*80)
    
    try:
        logger.info(f"{'='*60}")
        logger.info(f"Processing file {file_id}: {Path(file_path).name}")
        logger.info(f"{'='*60}")
        
        # Get file record
        file_record = db_session.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            logger.error(f"File record {file_id} not found in database")
            return
        
        # STEP 1: Parse file to extract text
        logger.info(f"[1/4] Parsing {file_type.upper()} file...")
        text = parser.parse(file_path)
        
        if not text or len(text.strip()) == 0:
            # Provide specific error message for image-based PDFs
            if file_type.lower() == 'pdf':
                error_msg = (
                    "This PDF appears to be image-based or scanned without a text layer. "
                    "Please convert to text-searchable format using OCR, or upload a different PDF with selectable text."
                )
            else:
                error_msg = f"Failed to extract text from {file_type.upper()} file. The file might be empty or corrupted."
            
            logger.error(f"No text extracted from file {file_id}")
            file_record.processed = 2
            file_record.error_message = error_msg
            db_session.commit()
            return
        
        logger.info(f"OK - Extracted {len(text):,} characters")
        
        # STEP 2: Create text chunks
        logger.info(f"[2/4] Creating text chunks...")
        chunks = split_text_into_chunks(
            text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        if not chunks or len(chunks) == 0:
            error_msg = "Failed to create text chunks. The extracted text may be too short."
            logger.error(error_msg)
            file_record.processed = 2
            file_record.error_message = error_msg
            db_session.commit()
            return
        
        logger.info(f"OK - Created {len(chunks)} chunks")
        
        # STEP 3: SAVE CHUNKS TO DATABASE (Critical - do this BEFORE embeddings!)
        logger.info(f"[3/5] Saving {len(chunks)} chunks to database...")
        
        for i, chunk_text in enumerate(chunks):
            chunk_record = DocumentChunk(
                file_id=file_id,
                chunk_text=chunk_text,
                chunk_index=i,
                embedding_id=None  # Will be updated if embeddings succeed
            )
            db_session.add(chunk_record)
        
        logger.info(f"OK - SAVED! File {file_id} chunks saved to database")
        
        # STEP 4: ANALYZE TEXT AND EXTRACT KEY INFORMATION
        logger.info(f"[4/6] Analyzing document to extract key information...")
        
        try:
            analysis = text_analyzer.analyze_document(text, str(file_record.filename))
            
            # Store analysis in database
            file_record.main_line = analysis['main_line']
            file_record.key_points = json.dumps(analysis['key_points'])  # type: ignore[assignment]
            file_record.main_message = analysis['main_message']
            
            logger.info(f"OK - Analysis complete:")
            logger.info(f"   Main line: {analysis['main_line'][:80]}...")
            logger.info(f"   Key points: {len(analysis['key_points'])} points extracted")
            logger.info(f"   Main message: {analysis['main_message'][:80]}...")
        except Exception as e:
            logger.warning(f"Analysis failed: {e} - Continuing without analysis")
            file_record.main_line = None  # type: ignore[assignment]
            file_record.key_points = None  # type: ignore[assignment]
            file_record.main_message = None  # type: ignore[assignment]
        
        # STEP 5: DETECT MEETING LINKS AND CREATE NOTIFICATIONS
        logger.info(f"[5/6] Detecting meeting links in document...")
        
        try:
            meeting_analysis = analyze_text_for_meetings(text, str(file_record.filename))
            
            if meeting_analysis['has_meetings']:
                logger.info(f"OK - Found {meeting_analysis['count']} meeting link(s)")
                
                # Create notification service
                notification_service = NotificationService(db_session)
                
                # Create notifications for each meeting
                for meeting in meeting_analysis['meetings']:
                    notification_service.create_meeting_notification(
                        user_id=file_record.user_id,
                        meeting_info=meeting
                    )
                    logger.info(f"   Meeting: {meeting['platform']} - {meeting['title']}")
            else:
                logger.info("OK - No meeting links detected")
        except Exception as e:
            logger.warning(f"Meeting detection failed: {e} - Continuing without meeting detection")
        
        # Mark file as successfully processed
        file_record.processed = 1  # type: ignore[assignment]
        file_record.error_message = None  # type: ignore[assignment]
        
        # Commit to database - file is now viewable!
        db_session.commit()
        
        # STEP 6: CREATE FILE PROCESSED NOTIFICATION
        try:
            notification_service = NotificationService(db_session)
            notification_service.create_file_processed_notification(
                user_id=file_record.user_id,
                filename=file_record.filename,
                analysis=analysis if 'analysis' in locals() else None
            )
            logger.info(f"OK - File processed notification created")
        except Exception as e:
            logger.warning(f"Notification creation failed: {e}")
        
        logger.info(f"OK - File {file_id} is now accessible with {len(chunks)} chunks")
        
        # STEP 7: Try to generate embeddings (OPTIONAL - skip for now)
        logger.info(f"[6/6] Skipping embeddings (not configured)")
        logger.info("INFO - File content is saved and viewable. Embeddings disabled.")
        
        logger.info(f"{'='*60}")
        logger.info(f"OK - File {file_id} processed successfully: {file_record.filename}")
        logger.info(f"   Chunks: {len(chunks)}, Status: Ready to view")
        logger.info(f"{'='*60}")
        
    except Exception as e:
        error_msg = f"Processing error: {str(e)}"
        logger.error(f"❌ Error processing file {file_id}: {error_msg}", exc_info=True)
        
        try:
            # Rollback any pending changes
            db_session.rollback()
            
            # Mark file as failed
            file_record = db_session.query(UploadedFile).filter(UploadedFile.id == file_id).first()
            if file_record:
                file_record.processed = 2  # type: ignore[assignment]
                file_record.error_message = error_msg  # type: ignore[assignment]
                db_session.commit()
        except Exception as inner_e:
            logger.error(f"Failed to mark file as failed: {inner_e}")
            db_session.rollback()
    
    finally:
        db_session.close()
