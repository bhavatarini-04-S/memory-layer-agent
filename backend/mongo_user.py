"""
MongoDB User Model and Authentication Service
"""
from datetime import datetime
from typing import Optional, Dict
from bson import ObjectId
from pymongo.collection import Collection
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class MongoUser:
    """MongoDB User Model"""
    
    def __init__(self, data: Dict):
        self._id = data.get("_id")
        self.id = str(data.get("_id"))  # String ID for compatibility
        self.name = data.get("name")
        self.email = data.get("email")
        self.phone = data.get("phone")
        self.hashed_password = data.get("hashed_password")
        self.user_type = data.get("user_type", "student")
        self.organization = data.get("organization")
        self.theme = data.get("theme", "light")
        self.preferences = data.get("preferences")
        self.created_at = data.get("created_at", datetime.utcnow())
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "hashed_password": self.hashed_password,
            "user_type": self.user_type,
            "organization": self.organization,
            "theme": self.theme,
            "preferences": self.preferences,
            "created_at": self.created_at
        }

class MongoUserService:
    """MongoDB User Authentication Service"""
    
    def __init__(self, collection: Collection):
        self.collection = collection
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for users collection"""
        try:
            self.collection.create_index("email", unique=True)
            self.collection.create_index("phone", unique=True, sparse=True)
            logger.info("✅ MongoDB indexes created")
        except Exception as e:
            logger.warning(f"Index creation: {e}")
    
    def create_user(
        self,
        name: str,
        email: str,
        password: str,
        phone: Optional[str] = None,
        user_type: str = "student",
        organization: Optional[str] = None
    ) -> MongoUser:
        """Create a new user"""
        # Hash password
        hashed_password = pwd_context.hash(password)
        
        # Create user document
        user_doc = {
            "name": name,
            "email": email.lower(),
            "phone": phone,
            "hashed_password": hashed_password,
            "user_type": user_type,
            "organization": organization,
            "theme": "light",
            "preferences": {},
            "created_at": datetime.utcnow()
        }
        
        try:
            result = self.collection.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            logger.info(f"✅ User created: {email}")
            return MongoUser(user_doc)
        except Exception as e:
            logger.error(f"❌ User creation failed: {e}")
            raise
    
    def get_user_by_email(self, email: str) -> Optional[MongoUser]:
        """Get user by email"""
        user_doc = self.collection.find_one({"email": email.lower()})
        if user_doc:
            return MongoUser(user_doc)
        return None
    
    def get_user_by_phone(self, phone: str) -> Optional[MongoUser]:
        """Get user by phone"""
        user_doc = self.collection.find_one({"phone": phone})
        if user_doc:
            return MongoUser(user_doc)
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[MongoUser]:
        """Get user by ID"""
        try:
            user_doc = self.collection.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                return MongoUser(user_doc)
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
        return None
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def authenticate_user(self, identifier: str, password: str) -> Optional[MongoUser]:
        """Authenticate user by email/phone and password"""
        # Try email first
        user = self.get_user_by_email(identifier)
        
        # If not found, try phone
        if not user and "@" not in identifier:
            user = self.get_user_by_phone(identifier)
        
        if not user:
            return None
        
        if not self.verify_password(password, user.hashed_password): # type: ignore
            return None
        
        return user
    
    def update_user(self, user_id: str, update_data: Dict) -> bool:
        """Update user data"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return False
