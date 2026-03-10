"""
File upload utilities
"""
import os
import uuid
from typing import Tuple
from fastapi import UploadFile
from config import settings
import logging

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt', 'csv', 'xlsx', 'xls', 'json', 'xml', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def get_file_extension(filename: str) -> str:
    """Get file extension without dot"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def is_allowed_file(filename: str) -> bool:
    """Check if file type is allowed"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS

async def save_upload_file(file: UploadFile, user_id: int) -> Tuple[str, str, int]:
    """
    Save uploaded file to disk
    
    Args:
        file: Upload file object
        user_id: User ID for organizing files
        
    Returns:
        Tuple of (file_path, file_type, file_size)
        
    Raises:
        ValueError: If file is invalid
    """
    # Validate file
    if not is_allowed_file(file.filename): # type: ignore
        raise ValueError(f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Create user directory
    user_dir = os.path.join(settings.upload_dir, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = get_file_extension(file.filename) # type: ignore
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(user_dir, unique_filename)
    
    # Save file
    try:
        content = await file.read()
        file_size = len(content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB")
        
        with open(file_path, 'wb') as f:
            f.write(content)
        
        logger.info(f"Saved file: {file_path} ({file_size} bytes)")
        return file_path, file_ext, file_size
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

def delete_file(file_path: str) -> bool:
    """
    Delete file from disk
    
    Args:
        file_path: Path to file
        
    Returns:
        True if deleted, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file {file_path}: {e}")
        return False
