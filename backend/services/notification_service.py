"""
Notification Service for User Preferences and Alerts
"""
from sqlalchemy.orm import Session
from models.database_models import User, Notification
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = 'info',
        data: dict = None # type: ignore
    ) -> Notification:
        """
        Create a notification for a user
        
        Args:
            user_id: User ID
            title: Notification title
            message: Notification message
            notification_type: Type (info, success, warning, error, meeting, upload)
            data: Additional data (JSON)
            
        Returns:
            Created notification
        """
        # Convert data dict to JSON string for SQLite storage
        data_json = json.dumps(data) if data else None
        
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            data=data_json,
            read=False
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        logger.info(f"Created notification for user {user_id}: {title}")
        return notification
    
    def get_unread_notifications(self, user_id: int, limit: int = 50):
        """Get unread notifications for a user"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).order_by(Notification.created_at.desc()).limit(limit).all()
    
    def get_all_notifications(self, user_id: int, limit: int = 100):
        """Get all notifications for a user"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).limit(limit).all()
    
    def mark_as_read(self, notification_id: int, user_id: int):
        """Mark a notification as read"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.read = True  # type: ignore[assignment]
            self.db.commit()
            return True
        return False
    
    def mark_all_as_read(self, user_id: int):
        """Mark all notifications as read for a user"""
        self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).update({'read': True})
        self.db.commit()
    
    def delete_notification(self, notification_id: int, user_id: int):
        """Delete a notification"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        return False
    
    def create_meeting_notification(self, user_id: int, meeting_info: dict):
        """Create a notification for detected meeting"""
        title = f"Meeting Detected: {meeting_info.get('title', 'Meeting')}"
        message = f"Platform: {meeting_info['platform']}"
        
        if meeting_info.get('date') and meeting_info.get('time'):
            message += f"\nScheduled: {meeting_info['date']} at {meeting_info['time']}"
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type='meeting',
            data=meeting_info
        )
    
    def create_file_processed_notification(self, user_id: int, filename: str, analysis: dict = None):  # type: ignore[assignment]
        """Create notification for file processing completion"""
        title = f"File Processed: {filename}"
        message = "Your file has been successfully processed and analyzed."
        
        if analysis and analysis.get('key_points'):
            message += f"\n{len(analysis['key_points'])} key points extracted."
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type='success',
            data={'filename': filename, 'analysis': analysis}
        )
    
    def track_user_activity(self, user_id: int, activity_type: str):
        """
        Track user activity for personalization
        
        Args:
            user_id: User ID
            activity_type: Type of activity (upload, search, chat, etc.)
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            # Update activity preferences
            if not user.preferences:
                user.preferences = {}
            
            if 'activity_count' not in user.preferences:
                user.preferences['activity_count'] = {}
            
            activity_count = user.preferences['activity_count']
            activity_count[activity_type] = activity_count.get(activity_type, 0) + 1
            user.preferences['activity_count'] = activity_count
            
            self.db.commit()
    
    def get_most_used_feature(self, user_id: int) -> str:
        """Get the most frequently used feature by user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if user and user.preferences and 'activity_count' in user.preferences:
            activity_count = user.preferences['activity_count']
            if activity_count:
                return max(activity_count, key=activity_count.get)
        
        return None
    
    def send_personalized_notification(self, user_id: int):
        """Send personalized notification based on user behavior"""
        most_used = self.get_most_used_feature(user_id)
        
        if most_used:
            messages = {
                'upload': "💡 Tip: You upload files frequently! Try using voice commands for faster uploads.",
                'search': "🔍 You search often! Did you know you can use natural language queries?",
                'chat': "💬 You use chat a lot! Enable notifications to never miss important updates.",
            }
            
            message = messages.get(most_used, "Keep using InboxAI to boost your productivity!")
            
            return self.create_notification(
                user_id=user_id,
                title="Personalized Tip",
                message=message,
                notification_type='info'
            )
