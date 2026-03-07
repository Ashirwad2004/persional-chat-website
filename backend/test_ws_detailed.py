import asyncio
import websockets
import json
import urllib.request
import urllib.parse
from app.core.database import SessionLocal
from app.models.user import User

def get_token():
    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    if not user:
        return None
    from app.core.security import create_access_token
    return create_access_token(data={"sub": user.email})

async def test():
    token = get_token()
    uri = f"ws://localhost:8000/ws/chat?token={token}"
    async with websockets.connect(uri) as websocket:
        print("Connected.")
        
        # Send message to self
        db = SessionLocal()
        user = db.query(User).first()
        db.close()
        
        msg = {
            "type": "chat_message",
            "receiver_id": 99999,
            "content": "Self test!"
        }
        await websocket.send(json.dumps(msg))
        print("Sent:", msg)
        
        try:
            while True:
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print("Received:", response)
        except asyncio.TimeoutError:
            print("Finished waiting.")

if __name__ == "__main__":
    asyncio.run(test())