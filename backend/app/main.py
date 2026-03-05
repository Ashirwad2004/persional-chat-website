from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from jose import jwt, JWTError

from app.core.security import SECRET_KEY, ALGORITHM
from app.core.database import engine, Base, SessionLocal
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.messages import router as messages_router
from app.models.user import User
from app.models.message import Message
import app.models.user 
import app.models.message 

# Create all tables in the database (SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusChat API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(messages_router, prefix="/messages", tags=["messages"])

class ConnectionManager:
    def __init__(self):
        # Maps user_id to active WebSocket connection
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Welcome to NexusChat API"}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return
    
    db = SessionLocal()
    try:
        # Authenticate the WebSocket connection using the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            await websocket.close(code=1008)
            return
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            await websocket.close(code=1008)
            return
            
        await manager.connect(websocket, user.id)
        
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                receiver_id = message_data.get("receiver_id")
                content = message_data.get("content")
                
                if receiver_id and content:
                    # 1. Save message to database
                    new_msg = Message(sender_id=user.id, receiver_id=receiver_id, content=content)
                    db.add(new_msg)
                    db.commit()
                    db.refresh(new_msg)
                    
                    response_payload = {
                        "id": new_msg.id,
                        "sender_id": user.id,
                        "receiver_id": receiver_id,
                        "content": content,
                        "timestamp": new_msg.timestamp.isoformat() if new_msg.timestamp else None
                    }
                    response_str = json.dumps(response_payload)
                    
                    # 2. Route message to receiver (if online)
                    await manager.send_personal_message(response_str, receiver_id)
                    
                    # 3. Echo message back to sender (for UI confirmation)
                    # We only echo if receiver != sender, or we'd double send.
                    if user.id != receiver_id:
                        await manager.send_personal_message(response_str, user.id)
            except json.JSONDecodeError:
                pass # Ignore malformed JSON messages
                
    except WebSocketDisconnect:
        if 'user' in locals():
            manager.disconnect(user.id)
    except JWTError:
        await websocket.close(code=1008)
    finally:
        db.close()