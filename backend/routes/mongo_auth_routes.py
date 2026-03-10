"""
MongoDB Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from mongodb import get_users_collection
from mongo_user import MongoUserService, MongoUser
from models.schemas import UserCreate, UserLogin, Token, UserResponse
from utils.auth import create_access_token, decode_access_token
from utils.user_detection import detect_user_type_from_email
from datetime import timedelta
from config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

def get_mongo_user_service() -> MongoUserService:
    """Get MongoDB user service instance"""
    collection = get_users_collection()
    return MongoUserService(collection)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate):
    """Register a new user in MongoDB"""
    user_service = get_mongo_user_service()
    
    try:
        # Check if user already exists
        existing_user = user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        if user_data.phone:
            existing_phone = user_service.get_user_by_phone(user_data.phone)
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this phone already exists"
                )
        
        # Detect user type from email domain
        user_type, organization = detect_user_type_from_email(user_data.email)
        
        # Allow override if explicitly provided
        if user_data.user_type and user_data.user_type in ["student", "professional"]:
            user_type = user_data.user_type
        
        # Create new user in MongoDB
        new_user = user_service.create_user(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password,
            phone=user_data.phone,
            user_type=user_type,
            organization=organization
        )
        
        logger.info(f"✅ User signed up: {new_user.email}")
        
        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "user_type": new_user.user_type,
            "organization": new_user.organization,
            "theme": new_user.theme
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    """Authenticate user with MongoDB and return token"""
    user_service = get_mongo_user_service()
    
    try:
        # Get identifier (email or phone)
        identifier = credentials.email or credentials.phone
        if not identifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or phone required"
            )
        
        # Authenticate user
        user = user_service.authenticate_user(identifier, credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )
        
        logger.info(f"✅ User logged in: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "user_type": user.user_type,
                "organization": user.organization,
                "theme": user.theme
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

def get_current_user_mongo(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> MongoUser:
    """Dependency to get current authenticated user from MongoDB"""
    user_service = get_mongo_user_service()
    
    try:
        # Decode token
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user from MongoDB
        user = user_service.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: MongoUser = Depends(get_current_user_mongo)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "user_type": current_user.user_type,
        "organization": current_user.organization,
        "theme": current_user.theme
    }
