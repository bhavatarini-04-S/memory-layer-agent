"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    user_type: Optional[str] = "student"  # Auto-detected from email, but can be overridden

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    user_type: str
    organization: Optional[str]
    theme: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# File Schemas
class FileUploadResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    upload_date: datetime
    processed: int
    error_message: Optional[str] = None
    main_line: Optional[str] = None
    main_message: Optional[str] = None
    
    class Config:
        from_attributes = True

class FileListResponse(BaseModel):
    files: List[FileUploadResponse]
    total: int

class DocumentChunkResponse(BaseModel):
    chunk_text: str
    chunk_index: int
    
    class Config:
        from_attributes = True

class FileDetailsResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    upload_date: datetime
    processed: int
    error_message: Optional[str] = None
    chunks: List[DocumentChunkResponse]
    full_content: str
    # Analysis fields
    main_line: Optional[str] = None
    key_points: Optional[List[str]] = None
    main_message: Optional[str] = None
    
    class Config:
        from_attributes = True

# Search Schemas
class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResult(BaseModel):
    source: str  # "file" or "message"
    filename: str
    content: str
    score: float
    file_type: Optional[str] = None
    upload_date: Optional[datetime] = None

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int

# Recent Activity
class RecentSearch(BaseModel):
    query: str
    results_count: int
    search_date: datetime
    
    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    total_files: int
    total_searches: int
    recent_uploads: List[FileUploadResponse]
    recent_searches: List[RecentSearch]
