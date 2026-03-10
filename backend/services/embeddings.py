"""
Embedding service for generating and storing text embeddings using Google Gemini
"""
import logging
from typing import List, Dict, Any
import google.generativeai as genai
from config import settings
import chromadb

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings and storing them in ChromaDB using Gemini"""
    
    def __init__(self):
        self.client = None
        self.chroma_client = None
        self.collection = None
        self.collection_name = "document_embeddings"
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization - only initialize when actually needed"""
        if self._initialized:
            return
        
        try:
            # Check if API key is configured
            if not settings.gemini_api_key or settings.gemini_api_key == "none" or "your_gemini_api_key_here" in settings.gemini_api_key:
                logger.warning("Gemini API key not configured - embeddings will be skipped")
                raise Exception("Gemini API key not configured")
            
            # Configure Gemini
            genai.configure(api_key=settings.gemini_api_key)
            
            self.chroma_client = chromadb.PersistentClient(path=settings.embeddings_dir)
            self.collection = self.chroma_client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Document chunks embeddings"}
            )
            self._initialized = True
            logger.info("EmbeddingService initialized successfully with Gemini")
        except Exception as e:
            logger.error(f"Failed to initialize EmbeddingService: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a batch of texts using Gemini
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors
            
        Raises:
            Exception: If Gemini API call fails
        """
        self._ensure_initialized()  # Initialize on first use
        
        try:
            embeddings = []
            for text in texts:
                result = genai.embed_content(
                    model=settings.embedding_model,
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def store_embeddings(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ):
        """
        Store embeddings in ChromaDB
        
        Args:
            texts: Original text chunks
            embeddings: Embedding vectors
            metadatas: Metadata for each chunk
            ids: Unique IDs for each chunk
        """
        self._ensure_initialized()  # Initialize on first use
        
        try:
            self.collection.add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Stored {len(embeddings)} embeddings in ChromaDB")
            
        except Exception as e:
            logger.error(f"Failed to store embeddings: {e}")
            raise
    
    def search_similar(
        self,
        query_text: str,
        n_results: int = 5,
        filter_dict: Dict[str, Any] = None
    ) -> Dict[str, List]:
        """
        Search for similar documents
        
        Args:
            query_text: Query string
            n_results: Number of results to return
            filter_dict: Optional metadata filters
            
        Returns:
            Dictionary with ids, documents, metadatas, distances
        """
        self._ensure_initialized()  # Initialize on first use
        
        try:
            # Generate embedding for query using Gemini
            result = genai.embed_content(
                model=settings.embedding_model,
                content=query_text,
                task_type="retrieval_query"
            )
            query_embedding = result['embedding']
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=filter_dict if filter_dict else None
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to search embeddings: {e}")
            raise


# Global instance
embedding_service = EmbeddingService()


def create_embedding(text):
    """Legacy function for compatibility"""
    return [ord(c) for c in text[:10]]