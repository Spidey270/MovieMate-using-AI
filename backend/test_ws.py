import asyncio
import websockets
import json
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['moviemate']

users = list(db.users.find().limit(2))
if len(users) < 2:
    print("Need at least 2 users in the database to test.")
    exit(1)

user1_id = str(users[0]['_id'])
user2_id = str(users[1]['_id'])

async def test_chat():
    print(f"User1 ID: {user1_id} ({users[0].get('username')})")
    print(f"User2 ID: {user2_id} ({users[1].get('username')})")

    async with websockets.connect(f"ws://127.0.0.1:8000/chat/ws/{user2_id}") as ws2:
        print("User 2 connected")
        
        async with websockets.connect(f"ws://127.0.0.1:8000/chat/ws/{user1_id}") as ws1:
            print("User 1 connected")
            payload = json.dumps({"to": user2_id, "content": "Hello from user 1!"})
            await ws1.send(payload)
            print("User 1 sent message")
            
        try:
            msg = await asyncio.wait_for(ws2.recv(), timeout=2.0)
            print(f"User 2 received: {msg}")
        except asyncio.TimeoutError:
            print("User 2 DID NOT receive the message :(")

try:
    asyncio.run(test_chat())
except Exception as e:
    print("Error:", e)
