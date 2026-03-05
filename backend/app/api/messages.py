from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from app.core.database import get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/{other_user_id}", response_model=List[MessageResponse])
def get_messages(other_user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch all messages between the current user and the specified other user
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp.asc()).all()
    return messages