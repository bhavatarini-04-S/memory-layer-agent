"""
Text Analysis Service - Extract key information without AI APIs
Uses rule-based algorithms to identify important content
"""
import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class TextAnalyzer:
    """Analyzes text to extract key information"""
    
    def __init__(self):
        # Keywords that indicate importance
        self.important_keywords = [
            'important', 'key', 'main', 'significant', 'critical', 'essential',
            'objective', 'purpose', 'goal', 'conclusion', 'summary', 'result',
            'exam', 'question', 'answer', 'subject', 'topic', 'chapter',
            'definition', 'explain', 'describe', 'list', 'note', 'remember'
        ]
    
    def analyze_document(self, text: str, filename: str = "") -> Dict[str, Any]:
        """
        Analyze document and extract key information
        
        Returns:
            {
                'main_line': str - One important line from the document
                'key_points': List[str] - 5 important points
                'main_message': str - What the document conveys
            }
        """
        if not text or len(text.strip()) == 0:
            return {
                'main_line': 'No content available',
                'key_points': [],
                'main_message': 'Document appears to be empty'
            }
        
        # Clean and split into sentences
        sentences = self._split_into_sentences(text)
        
        # Extract main line (most important sentence)
        main_line = self._extract_main_line(sentences, filename)
        
        # Extract key points
        key_points = self._extract_key_points(text, sentences)
        
        # Generate main message
        main_message = self._generate_main_message(text, filename)
        
        return {
            'main_line': main_line,
            'key_points': key_points,
            'main_message': main_message
        }
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        # Filter out very short sentences and clean
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        return sentences[:100]  # Limit to first 100 sentences for performance
    
    def _extract_main_line(self, sentences: List[str], filename: str) -> str:
        """Extract the most important line from the document"""
        if not sentences:
            return "No main content identified"
        
        # Score sentences based on importance indicators
        scored_sentences = []
        for sentence in sentences:
            score = 0
            sentence_lower = sentence.lower()
            
            # Higher score for sentences with important keywords
            for keyword in self.important_keywords:
                if keyword in sentence_lower:
                    score += 2
            
            # Higher score for sentences at the beginning
            if sentences.index(sentence) < 5:
                score += 3
            
            # Higher score for sentences with title-like formatting
            if sentence.isupper() or sentence.istitle():
                score += 2
            
            # Prefer moderate length sentences
            word_count = len(sentence.split())
            if 10 < word_count < 30:
                score += 2
            
            # Boost score if contains document-related terms
            doc_terms = ['subject', 'title', 'topic', 'about', 'exam', 'course', 'document']
            if any(term in sentence_lower for term in doc_terms):
                score += 3
            
            scored_sentences.append((score, sentence))
        
        # Sort by score and return the highest
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        
        if scored_sentences:
            main_line = scored_sentences[0][1]
            # Limit length
            if len(main_line) > 200:
                main_line = main_line[:197] + "..."
            return main_line
        
        return sentences[0][:200] if sentences else "No main content identified"
    
    def _extract_key_points(self, text: str, sentences: List[str]) -> List[str]:
        """Extract 5 key points from the document"""
        key_points = []
        
        # Method 1: Look for numbered or bulleted lists
        list_patterns = [
            r'^\d+[\.)]\s+(.+)$',  # 1. or 1)
            r'^[•\-\*]\s+(.+)$',    # • or - or *
            r'^[a-z][\.)]\s+(.+)$'  # a. or a)
        ]
        
        for line in text.split('\n'):
            line = line.strip()
            for pattern in list_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match and len(match.group(1)) > 15:
                    point = match.group(1).strip()
                    if len(point) > 200:
                        point = point[:197] + "..."
                    if point not in key_points:
                        key_points.append(point)
                    if len(key_points) >= 5:
                        return key_points
        
        # Method 2: Extract sentences with important keywords
        scored_points = []
        for sentence in sentences:
            if sentence in [kp for kp in key_points]:
                continue
                
            score = 0
            sentence_lower = sentence.lower()
            
            # Score based on keywords
            for keyword in self.important_keywords:
                if keyword in sentence_lower:
                    score += 1
            
            # Prefer sentences with questions
            if '?' in sentence:
                score += 2
            
            # Prefer sentences that start with action words
            action_words = ['explain', 'describe', 'list', 'define', 'state', 'write', 'discuss', 'compare']
            if any(sentence_lower.startswith(word) for word in action_words):
                score += 2
            
            if score > 0:
                scored_points.append((score, sentence))
        
        # Sort and add top scored sentences
        scored_points.sort(reverse=True, key=lambda x: x[0])
        for score, sentence in scored_points:
            if len(sentence) > 200:
                sentence = sentence[:197] + "..."
            if sentence not in key_points:
                key_points.append(sentence)
            if len(key_points) >= 5:
                break
        
        # Method 3: If still not enough, take first few meaningful sentences
        if len(key_points) < 5:
            for sentence in sentences:
                if sentence not in key_points and len(sentence.split()) > 8:
                    point = sentence[:200] if len(sentence) > 200 else sentence
                    key_points.append(point)
                    if len(key_points) >= 5:
                        break
        
        # If still not enough, add placeholders
        while len(key_points) < 5 and sentences:
            idx = len(key_points)
            if idx < len(sentences):
                point = sentences[idx][:200]
                if point not in key_points:
                    key_points.append(point)
            else:
                break
        
        return key_points[:5]
    
    def _generate_main_message(self, text: str, filename: str) -> str:
        """Generate a summary of what the document conveys"""
        text_lower = text.lower()
        
        # Detect document type
        doc_type = "document"
        
        if any(term in text_lower for term in ['exam', 'question', 'test', 'quiz', 'assessment']):
            doc_type = "examination or assessment"
        elif any(term in text_lower for term in ['resume', 'cv', 'experience', 'education', 'skills']):
            doc_type = "resume or curriculum vitae"
        elif any(term in text_lower for term in ['report', 'analysis', 'findings', 'research']):
            doc_type = "report or analysis"
        elif any(term in text_lower for term in ['invoice', 'payment', 'bill', 'amount', 'total']):
            doc_type = "invoice or financial document"
        elif any(term in text_lower for term in ['proposal', 'project', 'plan', 'implementation']):
            doc_type = "project proposal or plan"
        elif any(term in text_lower for term in ['manual', 'guide', 'instructions', 'how to']):
            doc_type = "manual or guide"
        elif any(term in text_lower for term in ['lecture', 'notes', 'chapter', 'course', 'subject']):
            doc_type = "educational content or lecture notes"
        
        # Extract subject/topic if possible
        subject_match = re.search(r'(?:subject|topic|title|course)[:\s]+([^\n.]+)', text_lower)
        subject = ""
        if subject_match:
            subject = subject_match.group(1).strip().title()
            subject = subject[:100]  # Limit length
        
        # Count important metrics
        word_count = len(text.split())
        
        # Build message
        message = f"This {doc_type}"
        
        if subject:
            message += f" about '{subject}'"
        
        message += f" contains approximately {word_count:,} words"
        
        # Add specific insights based on content
        if 'question' in text_lower and 'answer' in text_lower:
            q_count = text_lower.count('question')
            message += f" with {q_count} question(s) and their answers"
        
        if doc_type == "examination or assessment":
            message += ". It appears to be an academic assessment with questions covering various topics"
        elif doc_type == "educational content or lecture notes":
            message += " providing learning material and explanatory content"
        elif doc_type == "resume or curriculum vitae":
            message += " detailing professional background and qualifications"
        
        message += "."
        
        return message


# Create singleton instance
text_analyzer = TextAnalyzer()
