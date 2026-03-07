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
        print("No user found")
        return None
        
    data = urllib.parse.urlencode({'username': user.email, 'password': 'password123'}).encode()
    req = urllib.request.Request('http://localhost:8000/auth/login', data=data)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())['access_token']
    except Exception as e:
        print("Login failed, you might need correct password:", e)
        # fallback generating a token directly if login fails
        from app.core.security import create_access_token
        return create_access_token(data={"sub": user.email})

async def test():
    token = get_token()
    if not token:
        return
        
    uri = f"ws://localhost:8000/ws/chat?token={token}"
    print(f"Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            
            # Send message
            msg = {
                "type": "chat_message",
                "receiver_id": 1,
                "content": "test message from python WS client!"
            }
            await websocket.send(json.dumps(msg))
            print("Sent:", msg)
            
            # Wait for response
            while True:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print("Received:", response)
    except asyncio.TimeoutError:
        print("No more messages")
    except Exception as e:
        print("Error:", type(e), e)

if __name__ == "__main__":
    asyncio.run(test())
