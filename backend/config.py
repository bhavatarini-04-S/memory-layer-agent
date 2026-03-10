"""
Configuration management for InboxAI
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Gemini AI (optional - embeddings will be skipped if not provided)
    gemini_api_key: str = "none"
    
    # Database
    database_url: str = "sqlite:///./inboxai.db"
    
    # MongoDB (for user authentication)
    mongodb_uri: str = "mongodb+srv://divagarjagan44_db_user:<db_password>@cluster0.hxwzr0a.mongodb.net/?appName=Cluster0"
    mongodb_database: str = "inboxai_db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    
    # Storage
    upload_dir: str = "../storage/uploads"
    embeddings_dir: str = "../storage/embeddings"
    
    # AI Settings
    embedding_model: str = "models/embedding-001"  # Gemini embedding model
    chunk_size: int = 500
    chunk_overlap: int = 50
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env

# Create settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.embeddings_dir, exist_ok=True)
