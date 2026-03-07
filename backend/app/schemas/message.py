from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    receiver_id: int
    is_read: bool = False

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime

    class Config:
        from_attributes = True