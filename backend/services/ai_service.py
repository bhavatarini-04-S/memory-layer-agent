"""
AI Embedding Service - Disabled (no Gemini/OpenAI)
"""
from config import settings
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating and managing embeddings - DISABLED"""
    
    def __init__(self):
        """Initialize with embeddings disabled"""
        self.client = None
        self.model = None
        self.chroma_client = None
        self.collection = None
        self._initialized = False
        logger.info("EmbeddingService initialized (embeddings disabled)")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding - DISABLED"""
        logger.warning("Embeddings disabled - returning empty vector")
        return []
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate batch embeddings - DISABLED"""
        logger.warning("Embeddings disabled - returning empty vectors")
        return [[] for _ in texts]
    
    def store_embeddings(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ) -> None:
        """Store embeddings - DISABLED"""
        logger.warning("Embeddings disabled - skipping storage")
        return
    
    def search_similar(
        self,
        query: str,
        limit: int = 10,
        filter_metadata: Dict[str, Any] = None # type: ignore
    ) -> Dict[str, Any]:
        """Search for similar documents - DISABLED
        
        Args:
            query: Search query
            limit: Maximum number of results
            filter_metadata: Optional metadata filter
            
        Returns:
            Dictionary with empty search results
        """
        logger.warning("Embeddings disabled - returning empty search results")
        return {
            "ids": [],
            "documents": [],
            "metadatas": [],
            "distances": []
        }
    
    def delete_embeddings(self, ids: List[str]) -> None:
        """Delete embeddings - DISABLED"""
        logger.warning("Embeddings disabled - skipping deletion")
        return

# Create singleton instance
embedding_service = EmbeddingService()
