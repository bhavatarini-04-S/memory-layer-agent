"""
InboxAI - AI-Powered Information Retrieval Platform
"""
from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from database import init_db
from routes import file_routes, search_routes
from routes import notification_routes
from routes import mongo_auth_routes  # MongoDB authentication
from routes.mongo_auth_routes import get_current_user_mongo
from mongo_user import MongoUser
from config import settings
import logging
import os

# Import middleware for production
try:
    from middleware.rate_limit import RateLimitMiddleware, SecurityHeadersMiddleware
    MIDDLEWARE_AVAILABLE = True
except ImportError:
    MIDDLEWARE_AVAILABLE = False
    logging.warning("Rate limit middleware not available")

# Configure logging based on environment
log_level = logging.DEBUG if os.getenv("DEBUG", "false").lower() == "true" else logging.INFO
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('inboxai.log') if os.getenv("LOG_TO_FILE", "false").lower() == "true" else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="InboxAI",
    description="AI-powered information retrieval platform",
    version="1.0.0",
    docs_url="/docs" if os.getenv("DEBUG", "false").lower() == "true" else None,
    redoc_url="/redoc" if os.getenv("DEBUG", "false").lower() == "true" else None,
)

# Configure CORS - supports both development and production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add production middleware
if MIDDLEWARE_AVAILABLE and os.getenv("DEBUG", "false").lower() != "true":
    # Security headers
    app.add_middleware(SecurityHeadersMiddleware) # type: ignore
    # Rate limiting: 100 requests per minute per IP
    app.add_middleware(RateLimitMiddleware, calls=100, period=60) # type: ignore
    logger.info("Production middleware enabled: Rate limiting and security headers")

# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "status": "error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.exception(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "status": "error"}
    )

# Include routers
app.include_router(mongo_auth_routes.router)  # MongoDB authentication
app.include_router(file_routes.router)
app.include_router(search_routes.router)
app.include_router(notification_routes.router)

@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        logger.info("InboxAI backend started successfully")
        logger.info(f"Environment: {'Development' if os.getenv('DEBUG', 'false').lower() == 'true' else 'Production'}")
        logger.info(f"Allowed origins: {allowed_origins}")
    except Exception as e:
        logger.error(f"Failed to initialize application: {e}")
        raise

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("InboxAI backend shutting down")

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "InboxAI Backend Running",
        "version": "1.0.0",
        "status": "healthy",
        "environment": "production" if os.getenv("DEBUG", "false").lower() != "true" else "development"
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    try:
        # Add more health checks here
        return {
            "status": "healthy",
            "database": "connected",
            "ai_service": "ready",
            "storage": "available" if os.path.exists(settings.upload_dir) else "unavailable"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.get("/test-auth")
def test_auth(current_user: MongoUser = Depends(get_current_user_mongo)):
    """Test authentication with MongoDB"""
    return {
        "message": "Auth working with MongoDB",
        "user_id": current_user.id,
        "user_name": current_user.name,
        "user_email": current_user.email
    }
