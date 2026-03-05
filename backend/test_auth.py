from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)
try:
    response = client.post("/auth/register", json={"email": "test@example.com", "password": "pass"})
    print(response.status_code)
    print(response.json())
except Exception as e:
    traceback.print_exc()
