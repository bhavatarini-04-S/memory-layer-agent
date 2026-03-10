"""
Text Processing Utilities
"""
from typing import List
import re

def split_text_into_chunks(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> List[str]:
    """
    Split text into overlapping chunks
    
    Args:
        text: Text to split
        chunk_size: Maximum characters per chunk
        chunk_overlap: Number of overlapping characters
        
    Returns:
        List of text chunks
    """
    if not text:
        return []
    
    # Clean text
    text = clean_text(text)
    
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        
        # If not the last chunk, try to break at sentence boundary
        if end < text_length:
            # Look for sentence endings within next 100 chars
            chunk = text[start:end + 100]
            sentence_end = max(
                chunk.rfind('. '),
                chunk.rfind('! '),
                chunk.rfind('? '),
                chunk.rfind('\n')
            )
            
            if sentence_end > chunk_size - 100:
                end = start + sentence_end + 1
        
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append(chunk_text)
        
        # Move start position with overlap
        start = end - chunk_overlap
    
    return chunks

def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Raw text
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s.,!?;:\-\'"()]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text

def extract_keywords(text: str, num_keywords: int = 5) -> List[str]:
    """
    Extract important keywords from text (simple implementation)
    
    Args:
        text: Text to analyze
        num_keywords: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    # Convert to lowercase and split
    words = text.lower().split()
    
    # Common stop words to filter
    stop_words = {
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this'
    }
    
    # Count word frequency
    word_freq = {}
    for word in words:
        word = re.sub(r'[^\w]', '', word)
        if word and word not in stop_words and len(word) > 3:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    return [word for word, _ in sorted_words[:num_keywords]]
