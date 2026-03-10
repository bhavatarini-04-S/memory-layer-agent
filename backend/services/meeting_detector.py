"""
Meeting Link Detection and Calendar Integration Service
"""
import re
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Meeting link patterns
MEETING_PATTERNS = {
    'google_meet': r'meet\.google\.com/[\w-]+',
    'zoom': r'zoom\.us/j/[\d]+',
    'microsoft_teams': r'teams\.microsoft\.com/l/meetup-join/[\w\d%]+',
    'webex': r'[\w-]+\.webex\.com/meet/[\w-]+',
}

# Date/time patterns
TIME_PATTERNS = [
    r'(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)',  # 2:30 PM
    r'(\d{1,2}):(\d{2})',  # 14:30
    r'at\s+(\d{1,2})\s*(AM|PM|am|pm)',  # at 2 PM
]

DATE_PATTERNS = [
    r'(\d{1,2})/(\d{1,2})/(\d{4})',  # MM/DD/YYYY
    r'(\d{4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
    r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)',  # Day names
    r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})',  # Month DD
]


def detect_meeting_links(text: str) -> List[Dict[str, str]]:
    """
    Detect meeting links in text
    
    Args:
        text: Text content to search for meeting links
        
    Returns:
        List of dictionaries with meeting platform and URLs
    """
    meetings = []
    
    for platform, pattern in MEETING_PATTERNS.items():
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            url = match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
                
            meetings.append({
                'platform': platform.replace('_', ' ').title(),
                'url': url,
                'full_match': match.group(0)
            })
    
    return meetings


def extract_meeting_time(text: str, context_window: int = 100) -> Optional[str]:
    """
    Extract meeting time from text
    
    Args:
        text: Text content
        context_window: Number of characters to search around meeting link
        
    Returns:
        Time string if found, None otherwise
    """
    # Search for time patterns
    for time_pattern in TIME_PATTERNS:
        match = re.search(time_pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return None


def extract_meeting_date(text: str) -> Optional[str]:
    """
    Extract meeting date from text
    
    Args:
        text: Text content
        
    Returns:
        Date string if found, None otherwise
    """
    # Search for date patterns
    for date_pattern in DATE_PATTERNS:
        match = re.search(date_pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return None


def extract_meeting_title(text: str, meeting_link: str) -> str:
    """
    Extract meeting title/subject from text near the meeting link
    
    Args:
        text: Full text content
        meeting_link: Detected meeting link
        
    Returns:
        Meeting title or default
    """
    # Find the position of the meeting link
    link_pos = text.find(meeting_link)
    if link_pos == -1:
        return "Meeting"
    
    # Look for meeting keywords before the link
    keywords = ['meeting', 'call', 'session', 'standup', 'sync', 'review', 'interview']
    
    # Extract context before the link (up to 200 characters)
    context_before = text[max(0, link_pos - 200):link_pos].strip()
    
    # Look for sentences with meeting keywords
    sentences = re.split(r'[.!?\n]', context_before)
    for sentence in reversed(sentences):
        for keyword in keywords:
            if keyword.lower() in sentence.lower():
                # Clean and return the sentence
                title = sentence.strip()
                if len(title) > 50:
                    title = title[:50] + '...'
                return title
    
    return "Meeting"


def analyze_text_for_meetings(text: str, filename: str = None) -> Dict:  # type: ignore[assignment]
    """
    Comprehensive analysis of text for meeting information
    
    Args:
        text: Text content to analyze
        filename: Optional filename for context
        
    Returns:
        Dictionary with meeting information
    """
    meetings = detect_meeting_links(text)
    
    if not meetings:
        return {
            'has_meetings': False,
            'meetings': [],
            'count': 0
        }
    
    # Enhance each meeting with additional info
    enhanced_meetings = []
    for meeting in meetings:
        meeting_info = {
            **meeting,
            'title': extract_meeting_title(text, meeting['full_match']),
            'date': extract_meeting_date(text),
            'time': extract_meeting_time(text),
            'source': filename or 'document'
        }
        enhanced_meetings.append(meeting_info)
        
        logger.info(f"Detected meeting: {meeting_info['platform']} - {meeting_info['title']}")
    
    return {
        'has_meetings': True,
        'meetings': enhanced_meetings,
        'count': len(enhanced_meetings)
    }


def generate_calendar_event_data(meeting_info: Dict) -> Dict:
    """
    Generate data structure for calendar event
    
    Args:
        meeting_info: Meeting information dictionary
        
    Returns:
        Calendar event data
    """
    return {
        'summary': meeting_info.get('title', 'Meeting'),
        'description': f"Join via {meeting_info['platform']}: {meeting_info['url']}",
        'location': meeting_info['url'],
        'platform': meeting_info['platform'],
        'date': meeting_info.get('date'),
        'time': meeting_info.get('time'),
        'url': meeting_info['url']
    }


def format_meeting_notification(meeting_info: Dict) -> str:
    """
    Format meeting information for notification
    
    Args:
        meeting_info: Meeting information
        
    Returns:
        Formatted notification string
    """
    notification = f"📅 {meeting_info.get('title', 'Meeting')}\n"
    notification += f"🔗 Platform: {meeting_info['platform']}\n"
    
    if meeting_info.get('date'):
        notification += f"📆 Date: {meeting_info['date']}\n"
    
    if meeting_info.get('time'):
        notification += f"⏰ Time: {meeting_info['time']}\n"
    
    notification += f"🌐 Join: {meeting_info['url']}"
    
    return notification
