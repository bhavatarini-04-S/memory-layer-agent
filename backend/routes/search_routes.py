"""
Search Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.database_models import User, SearchHistory, UploadedFile
from models.schemas import SearchRequest, SearchResponse, SearchResult, DashboardResponse, RecentSearch
from dependencies import get_current_user
from services.ai_service import embedding_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.post("/", response_model=SearchResponse)
def search(
    search_request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform semantic search across user's uploaded documents
    
    Args:
        search_request: Search query and parameters
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Search results with relevance scores
    """
    
    try:
        # Perform semantic search with user filter
        search_results = embedding_service.search_similar(
            query=search_request.query,
            limit=search_request.limit, # type: ignore
            filter_metadata={"user_id": current_user.id}
        )
        
        # Process results
        results = []
        for i, (doc_id, document, metadata, distance) in enumerate(zip(
            search_results["ids"],
            search_results["documents"],
            search_results["metadatas"],
            search_results["distances"]
        )):
            # Convert distance to similarity score (0-1)
            # Lower distance = higher similarity
            score = max(0, 1 - (distance / 2))  # Normalize
            
            # Get file info
            file_record = db.query(UploadedFile).filter(
                UploadedFile.id == metadata.get("file_id")
            ).first()
            
            result = SearchResult(
                source="file",
                filename=metadata.get("filename", "Unknown"),
                content=document,
                score=round(score, 3),
                file_type=metadata.get("file_type"),
                upload_date=file_record.upload_date if file_record else None # type: ignore
            )
            results.append(result)
        
        # Save search history
        search_history = SearchHistory(
            user_id=current_user.id,
            query=search_request.query,
            results_count=len(results)
        )
        db.add(search_history)
        db.commit()
        
        return {
            "query": search_request.query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed"
        )

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard data with stats and recent activity"""
    
    # Count total files
    total_files = db.query(UploadedFile).filter(
        UploadedFile.user_id == current_user.id
    ).count()
    
    # Count total searches
    total_searches = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.id
    ).count()
    
    # Get recent uploads (last 5)
    recent_uploads = db.query(UploadedFile).filter(
        UploadedFile.user_id == current_user.id
    ).order_by(UploadedFile.upload_date.desc()).limit(5).all()
    
    # Get recent searches (last 5)
    recent_searches = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.id
    ).order_by(SearchHistory.search_date.desc()).limit(5).all()
    
    return {
        "total_files": total_files,
        "total_searches": total_searches,
        "recent_uploads": recent_uploads,
        "recent_searches": [
            RecentSearch(
                query=search.query, # type: ignore
                results_count=search.results_count, # type: ignore
                search_date=search.search_date # type: ignore
            )
            for search in recent_searches
        ]
    }
