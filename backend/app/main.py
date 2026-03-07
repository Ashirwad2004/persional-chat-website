from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import os
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

# Mount static files folder dynamically
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/audio", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

class ConnectionManager:
    def __init__(self):
        # Maps user_id to active WebSocket connection
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.broadcast_presence(user_id, True)

    async def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            await self.broadcast_presence(user_id, False)

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast_presence(self, user_id: int, is_online: bool):
        message = json.dumps({
            "type": "presence",
            "user_id": user_id,
            "is_online": is_online
        })
        for uid, connection in self.active_connections.items():
            if uid != user_id:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

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
                msg_type = message_data.get("type", "chat_message")
                receiver_id = message_data.get("receiver_id")
                client_id = message_data.get("client_id")
                
                if not receiver_id:
                    continue
                
                if msg_type == "chat_message":
                    content = message_data.get("content")
                    if content:
                        # 1. Save message to database
                        new_msg = Message(sender_id=user.id, receiver_id=receiver_id, content=content)
                        db.add(new_msg)
                        db.commit()
                        db.refresh(new_msg)
                        
                        
                        timestamp_val = new_msg.timestamp
                        if hasattr(timestamp_val, 'isoformat'):
                            timestamp_iso = timestamp_val.isoformat()
                        elif timestamp_val:
                            timestamp_iso = str(timestamp_val)
                        else:
                            timestamp_iso = None

                        response_payload = {
                            "type": "chat_message",
                            "client_id": client_id,
                            "message": {
                                "id": new_msg.id,
                                "sender_id": user.id,
                                "receiver_id": receiver_id,
                                "content": content,
                                "timestamp": timestamp_iso,
                                "is_read": False
                            }
                        }
                        response_str = json.dumps(response_payload)
                        
                        # 2. Route message to receiver (if online)
                        await manager.send_personal_message(response_str, receiver_id)
                        
                        # 3. Echo message back to sender (for UI confirmation)
                        if user.id != receiver_id:
                            await manager.send_personal_message(response_str, user.id)

                elif msg_type == "typing":
                    response_payload = {
                        "type": "typing",
                        "sender_id": user.id,
                        "receiver_id": receiver_id
                    }
                    await manager.send_personal_message(json.dumps(response_payload), receiver_id)

                elif msg_type == "read_receipt":
                    message_ids = message_data.get("message_ids", [])
                    if message_ids:
                        db.query(Message).filter(Message.id.in_(message_ids)).update({"is_read": True}, synchronize_session=False)
                        db.commit()
                        
                        response_payload = {
                            "type": "read_receipt",
                            "sender_id": user.id,
                            "receiver_id": receiver_id,
                            "message_ids": message_ids
                        }
                        await manager.send_personal_message(json.dumps(response_payload), receiver_id)
                        
            except json.JSONDecodeError:
                pass # Ignore malformed JSON messages
            except Exception as e:
                import traceback
                error_str = traceback.format_exc()
                with open("exception.log", "a") as f:
                    f.write(error_str + "\n")
                print(f"WS Handling Error: {e}")
    except WebSocketDisconnect:
        if 'user' in locals():
            await manager.disconnect(user.id)
    except JWTError:
        await websocket.close(code=1008)
    finally:
        db.close()