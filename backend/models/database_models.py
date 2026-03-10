"""
Database models for InboxAI
"""
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    user_type = Column(String, default="student")  # "student" or "professional"
    organization = Column(String, nullable=True)  # Organization/College name extracted from email
    theme = Column(String, default="light")  # "light" or "dark"
    preferences = Column(Text, nullable=True)  # JSON string for user preferences and activity tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    files = relationship("UploadedFile", back_populates="user")
    searches = relationship("SearchHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class UploadedFile(Base):
    """Uploaded file model"""
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, csv, txt
    file_size = Column(Integer, nullable=False)  # bytes
    upload_date = Column(DateTime, default=datetime.utcnow)
    processed = Column(Integer, default=0)  # 0=pending, 1=processed, 2=failed
    error_message = Column(Text, nullable=True)  # Error details if processing failed
    
    # Analysis fields (generated after processing)
    main_line = Column(Text, nullable=True)  # Most important line from document
    key_points = Column(Text, nullable=True)  # JSON array of 5 key points
    main_message = Column(Text, nullable=True)  # Summary of what document conveys
    
    # Relationships
    user = relationship("User", back_populates="files")
    chunks = relationship("DocumentChunk", back_populates="file")

class DocumentChunk(Base):
    """Document chunk with embeddings"""
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_id = Column(String, nullable=True)  # ChromaDB ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    file = relationship("UploadedFile", back_populates="chunks")

class SearchHistory(Base):
    """Search history model"""
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query = Column(Text, nullable=False)
    results_count = Column(Integer, default=0)
    search_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="searches")

class Notification(Base):
    """Notification model for user alerts"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, success, warning, error, meeting, upload
    read = Column(Integer, default=0)  # 0=unread, 1=read
    data = Column(Text, nullable=True)  # JSON string for additional data (meeting links, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
