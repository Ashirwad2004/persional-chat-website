from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from typing import List

from app.core.database import get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageResponse
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ConversationSummary(BaseModel):
    user_id: int
    last_message: str
    timestamp: str
    unread_count: int

@router.get("/summary", response_model=List[ConversationSummary])
def get_conversations_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Find all users the current user has chatted with and the last message
    # This involves a subquery to find the max timestamp per conversation pair
    
    # We do a simpler approach here: get all messages, group by the "other" user
    messages = db.query(Message).filter(
        or_(
            Message.sender_id == current_user.id,
            Message.receiver_id == current_user.id
        )
    ).order_by(Message.timestamp.desc()).all()
    
    summaries = {}
    for msg in messages:
        other_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if other_id not in summaries:
            summaries[other_id] = {
                "user_id": other_id,
                "last_message": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else "",
                "unread_count": 0
            }
        
        # If the other person sent it, and it's not read, increment unread count
        if msg.sender_id == other_id and not msg.is_read:
            summaries[other_id]["unread_count"] += 1
            
    return list(summaries.values())

from typing import List, Optional

@router.get("/{other_user_id}", response_model=List[MessageResponse])
def get_messages(
    other_user_id: int, 
    cursor: Optional[int] = None,
    limit: int = 20,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    )
    
    if cursor:
        query = query.filter(Message.id < cursor)
        
    messages = query.order_by(Message.id.desc()).limit(limit).all()
    
    # Reverse to return in chronological order for the frontend
    messages.reverse()
    return messages

@router.put("/{other_user_id}/read")
def mark_messages_read(other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Mark all messages sent by `other_user_id` to `current_user` as read
    db.query(Message).filter(
        and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id, Message.is_read == False)
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "Messages marked as read"}

@router.delete("/{other_user_id}")
def delete_chat(other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted_count = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).delete(synchronize_session=False)

    db.commit()
    return {"message": f"Successfully deleted {deleted_count} messages."}