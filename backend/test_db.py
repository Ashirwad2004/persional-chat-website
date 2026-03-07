import sys
from app.core.database import SessionLocal, Base, engine
from app.models.message import Message
from app.models.user import User

db = SessionLocal()
msg = Message(sender_id=1, receiver_id=1, content="test python sqlite issue")
db.add(msg)
db.commit()
db.refresh(msg)
print("Type of timestamp:", type(msg.timestamp))
print("Timestamp:", msg.timestamp)
db.close()
