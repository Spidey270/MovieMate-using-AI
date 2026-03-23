from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.chat import MessageCreate, MessageResponse
from app.routers.auth import get_current_user
import json

router = APIRouter(prefix="/chat", tags=["Chat"])


class ConnectionManager:
    def __init__(self):
        # Map user_id to a list of WebSocket connections
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if len(self.active_connections[user_id]) == 0:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

    async def broadcast(self, message: str):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.get("/global", response_model=List[MessageResponse])
async def get_global_chat_history(current_user: dict = Depends(get_current_user)):
    messages = list(
        db.messages.find({"receiver_id": "global"}).sort("timestamp", 1).limit(100)
    )
    for m in messages:
        m["id"] = str(m["_id"])
    return messages


@router.get("/{friend_id}", response_model=List[MessageResponse])
async def get_chat_history(
    friend_id: str, current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    messages = list(
        db.messages.find(
            {
                "$or": [
                    {"sender_id": user_id, "receiver_id": friend_id},
                    {"sender_id": friend_id, "receiver_id": user_id},
                ]
            }
        )
        .sort("timestamp", 1)
        .limit(100)
    )

    for m in messages:
        m["id"] = str(m["_id"])

    return messages


async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # Lookup username
    try:
        user = db.users.find_one({"_id": ObjectId(client_id)})
        username = user["username"] if user else "Unknown"
    except:
        username = "Unknown"

    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting primitive JSON: {"to": "userid", "content": "msg"}
            try:
                msg_data = json.loads(data)
                receiver_id = msg_data.get("to")
                content = msg_data.get("content")

                if receiver_id and content:
                    # Save to DB
                    msg_doc = {
                        "sender_id": client_id,
                        "sender_username": username,
                        "receiver_id": receiver_id,
                        "content": content,
                        "timestamp": datetime.utcnow(),
                        "is_read": False,
                    }
                    result = db.messages.insert_one(msg_doc)

                    response_payload = json.dumps(
                        {
                            "id": str(result.inserted_id),
                            "sender_id": client_id,
                            "sender_username": username,
                            "receiver_id": receiver_id,
                            "content": content,
                            "timestamp": str(datetime.utcnow()),
                        }
                    )

                    if receiver_id == "global":
                        await manager.broadcast(response_payload)
                    else:
                        await manager.send_personal_message(
                            response_payload, receiver_id
                        )
                        # Create notification for recipient
                        from app.routers.notifications import create_notification

                        create_notification(
                            receiver_id,
                            f"New message from {username}",
                            "message",
                            link=f"/chat/{client_id}",
                        )

            except Exception as e:
                print(f"WS Error: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
