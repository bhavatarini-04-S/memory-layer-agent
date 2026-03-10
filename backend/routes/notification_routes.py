"""
API routes for notifications
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from database import get_db
from models.database_models import User, Notification
from dependencies import get_current_user
from services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/")
async def get_notifications(
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for current user"""
    notification_service = NotificationService(db)
    
    if unread_only:
        notifications = notification_service.get_unread_notifications(current_user.id, limit)
    else:
        notifications = notification_service.get_all_notifications(current_user.id, limit)
    
    # Format notifications
    result = []
    for notif in notifications:
        notif_dict = {
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'type': notif.type,
            'read': bool(notif.read),
            'created_at': notif.created_at.isoformat() if notif.created_at else None,
            'data': json.loads(notif.data) if notif.data else None
        }
        result.append(notif_dict)
    
    return {
        'success': True,
        'notifications': result,
        'count': len(result)
    }


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    notification_service = NotificationService(db)
    unread = notification_service.get_unread_notifications(current_user.id)
    
    return {
        'success': True,
        'count': len(unread)
    }


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification_service = NotificationService(db)
    success = notification_service.mark_as_read(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {
        'success': True,
        'message': 'Notification marked as read'
    }


@router.put("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    notification_service = NotificationService(db)
    notification_service.mark_all_as_read(current_user.id)
    
    return {
        'success': True,
        'message': 'All notifications marked as read'
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification_service = NotificationService(db)
    success = notification_service.delete_notification(notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {
        'success': True,
        'message': 'Notification deleted'
    }


@router.post("/test")
async def create_test_notification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a test notification (for testing)"""
    notification_service = NotificationService(db)
    
    notification = notification_service.create_notification(
        user_id=current_user.id,
        title="Test Notification",
        message=f"This is a test notification created at {datetime.now().strftime('%H:%M:%S')}",
        notification_type="info"
    )
    
    return {
        'success': True,
        'message': 'Test notification created',
        'notification': {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message
        }
    }
