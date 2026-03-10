from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session
from pathlib import Path
import logging
import json

from database import get_db
from models.database_models import User, UploadedFile, DocumentChunk
from models.schemas import FileUploadResponse, FileListResponse, FileDetailsResponse, DocumentChunkResponse
from dependencies import get_current_user
from utils.file_utils import save_upload_file
from services.file_processor import process_uploaded_file # pyright: ignore[reportMissingImports]
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/files", tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file and start background processing
    """

    try:
        # Save file
        file_path, file_type, file_size = await save_upload_file(file, current_user.id) # type: ignore

        # Save metadata in DB
        file_record = UploadedFile(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            processed=0
        )

        db.add(file_record)
        db.commit()
        db.refresh(file_record)

        # Start background processing
        # After refresh, file_record.id is populated
        background_tasks.add_task(
            process_uploaded_file,
            file_record.id,  # type: ignore[arg-type]
            file_path,
            file_type
        )

        return file_record

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail="File upload failed"
        )


@router.get("/", response_model=FileListResponse)
def get_user_files(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all files uploaded by the current user
    """
    try:
        # Get total count
        total = db.query(UploadedFile).filter(
            UploadedFile.user_id == current_user.id
        ).count()
        
        # Get files with pagination
        files = db.query(UploadedFile).filter(
            UploadedFile.user_id == current_user.id
        ).order_by(UploadedFile.upload_date.desc()).offset(skip).limit(limit).all()
        
        return {
            "files": files,
            "total": total
        }
    
    except Exception as e:
        logger.error(f"Error fetching files: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch files"
        )


@router.get("/{file_id}", response_model=FileDetailsResponse)
def get_file_details(
    file_id: int,
    include_chunks: bool = False,
    chunk_limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific file
    - include_chunks: Whether to include chunk details (default: False for performance)
    - chunk_limit: Maximum number of chunks to return (default: 10)
    """
    try:
        # Get file record
        file_record = db.query(UploadedFile).filter(
            UploadedFile.id == file_id,
            UploadedFile.user_id == current_user.id
        ).first()
        
        if not file_record:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        # Only get chunks if explicitly requested (for performance)
        chunks = []
        full_content = ""
        
        if include_chunks:
            # Limit chunks for performance
            chunk_records = db.query(DocumentChunk).filter(
                DocumentChunk.file_id == file_id
            ).order_by(DocumentChunk.chunk_index).limit(chunk_limit).all()
            
            chunks = [{"chunk_text": c.chunk_text, "chunk_index": c.chunk_index} for c in chunk_records]
            full_content = " ".join([str(chunk.chunk_text) for chunk in chunk_records])
        else:
            # Just get chunk count for quick response
            chunk_count = db.query(DocumentChunk).filter(
                DocumentChunk.file_id == file_id
            ).count()
        
        # Parse key_points from JSON if available
        key_points = None
        if file_record.key_points:  # type: ignore[truthy-bool]
            try:
                key_points = json.loads(str(file_record.key_points))
            except:
                key_points = None
        
        response_data = {
            "id": file_record.id,
            "filename": file_record.filename,
            "file_type": file_record.file_type,
            "file_size": file_record.file_size,
            "upload_date": file_record.upload_date,
            "processed": file_record.processed,
            "error_message": file_record.error_message,
            "main_line": file_record.main_line,
            "key_points": key_points,
            "main_message": file_record.main_message
        }
        
        if include_chunks:
            response_data["chunks"] = chunks
            response_data["full_content"] = full_content
        else:
            response_data["chunks"] = []
            response_data["full_content"] = f"Content available ({len(chunk_records)} chunks). Add ?include_chunks=true to view." # type: ignore
        
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching file details: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch file details"
        )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file and its associated chunks
    """
    try:
        # Get file record
        file_record = db.query(UploadedFile).filter(
            UploadedFile.id == file_id,
            UploadedFile.user_id == current_user.id
        ).first()
        
        if not file_record:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        # Delete chunks first (foreign key constraint)
        db.query(DocumentChunk).filter(DocumentChunk.file_id == file_id).delete()
        
        # Delete file from filesystem if it exists
        try:
            from pathlib import Path
            file_path = Path(str(file_record.file_path))
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            logger.warning(f"Failed to delete file from filesystem: {e}")
        
        # Delete file record
        db.delete(file_record)
        db.commit()
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete file"
        )