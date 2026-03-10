"""
MongoDB connection and configuration
"""
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from config import settings
import logging

logger = logging.getLogger(__name__)

# MongoDB client (singleton)
_mongo_client = None
_mongo_db = None

def get_mongo_client() -> MongoClient:
    """Get MongoDB client instance"""
    global _mongo_client
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(settings.mongodb_uri)
            # Test connection
            _mongo_client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise
    return _mongo_client

def get_mongo_db() -> Database:
    """Get MongoDB database instance"""
    global _mongo_db
    if _mongo_db is None:
        client = get_mongo_client()
        _mongo_db = client[settings.mongodb_database]
    return _mongo_db

def get_users_collection() -> Collection:
    """Get users collection"""
    db = get_mongo_db()
    return db["users"]

def close_mongo_connection():
    """Close MongoDB connection"""
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB connection closed")
