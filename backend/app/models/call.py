from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class CallStatus(str, enum.Enum):
    MISSED = 'missed'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    REJECTED = 'rejected'

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey("users.id"), index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), index=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default=CallStatus.MISSED.value)
    is_video = Column(Boolean, default=True)

    caller = relationship("User", foreign_keys=[caller_id], backref="started_calls")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="received_calls")
