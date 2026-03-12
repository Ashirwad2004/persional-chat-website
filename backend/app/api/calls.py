from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.call import Call

router = APIRouter()

@router.get("/")
def get_call_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch all calls where the current user is either the caller or receiver.
    Returns them ordered by start_time descending.
    """
    calls = db.query(Call)\
        .filter(or_(Call.caller_id == current_user.id, Call.receiver_id == current_user.id))\
        .order_by(Call.start_time.desc())\
        .all()
    
    result = []
    for call in calls:
        # Include basic profile info of the "other" person in the call
        other_user = call.receiver if call.caller_id == current_user.id else call.caller
        
        call_dict = {
            "id": call.id,
            "caller_id": call.caller_id,
            "receiver_id": call.receiver_id,
            "start_time": call.start_time,
            "end_time": call.end_time,
            "status": call.status,
            "is_video": call.is_video,
            "other_user": {
                "id": other_user.id,
                "email": other_user.email,
                "profile_picture_url": other_user.profile_picture_url
            }
        }
        result.append(call_dict)
        
    return result
