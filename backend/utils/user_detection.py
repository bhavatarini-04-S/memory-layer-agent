"""
User type detection utilities
"""
import re
from typing import Tuple

# Common educational domain patterns
EDUCATIONAL_DOMAINS = [
    '.edu', '.ac.', '.edu.', '.sch.', '.school', '.college', '.university'
]

# Common organizational domain patterns for professionals
CORPORATE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'
]

def detect_user_type_from_email(email: str) -> Tuple[str, str]:
    """
    Detect user type (student/professional) from email address
    
    Args:
        email: User's email address
        
    Returns:
        Tuple of (user_type, organization)
        - user_type: "student" or "professional"
        - organization: Organization/college name or None
    """
    email = email.lower()
    domain = email.split('@')[-1] if '@' in email else ''
    
    # Check if it's an educational domain
    for edu_pattern in EDUCATIONAL_DOMAINS:
        if edu_pattern in domain:
            # Extract organization name from domain
            # e.g., "student@mit.edu" -> "MIT"
            #       "john@cs.stanford.edu" -> "Stanford"
            org_name = extract_organization_name(domain)
            return ("student", org_name)
    
    # Check if it's a common personal email
    if any(domain == corporate_domain for corporate_domain in CORPORATE_DOMAINS):
        # Personal emails are considered students by default
        return ("student", None)
    
    # Organization/corporate email (non-educational, non-personal)
    org_name = extract_organization_name(domain)
    return ("professional", org_name)


def extract_organization_name(domain: str) -> str:
    """
    Extract organization name from domain
    
    Examples:
        mit.edu -> MIT
        stanford.edu -> Stanford  
        google.com -> Google
        amazon.co.in -> Amazon
    """
    # Remove common TLDs and subdomains
    domain = domain.replace('.edu', '').replace('.com', '').replace('.org', '')
    domain = domain.replace('.in', '').replace('.uk', '').replace('.au', '')
    domain = domain.replace('.ac', '').replace('.sch', '').replace('.school', '')
    
    # Get main domain part
    parts = domain.split('.')
    # Usually the main part is before the TLD
    main_part = parts[0] if parts else domain
    
    # Clean and capitalize
    org_name = main_part.strip().upper()
    
    # Handle common abbreviations
    if len(org_name) <= 4:
        return org_name  # Keep short names like MIT, UCLA as-is
    else:
        # Capitalize first letter only for longer names
        return org_name.capitalize()


def is_valid_email_domain(email: str) -> bool:
    """
    Validate email domain format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email has valid domain format
    """
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
