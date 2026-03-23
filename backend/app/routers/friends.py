from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.friend import FriendRequestCreate, FriendRequestResponse, FriendResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/friends", tags=["Friends"])


@router.post("/request/{receiver_id}", response_model=FriendRequestResponse)
async def send_friend_request(
    receiver_id: str, current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(receiver_id):
        raise HTTPException(status_code=400, detail="Invalid target user ID")

    sender_id = str(current_user["_id"])

    if sender_id == receiver_id:
        raise HTTPException(status_code=400, detail="Cannot request self")

    # Check if target exists
    if not db.users.find_one({"_id": ObjectId(receiver_id)}):
        raise HTTPException(status_code=404, detail="User not found")

    # Check if request already exists or already friends
    existing = db.friends.find_one(
        {
            "$or": [
                {"sender_id": sender_id, "receiver_id": receiver_id},
                {"sender_id": receiver_id, "receiver_id": sender_id},
            ]
        }
    )

    if existing:
        if existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Request already pending")
        if existing["status"] == "accepted":
            raise HTTPException(status_code=400, detail="Already friends")

    request_data = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }

    result = db.friends.insert_one(request_data)
    new_request = db.friends.find_one({"_id": result.inserted_id})
    new_request["id"] = str(new_request["_id"])
    new_request["sender_username"] = current_user["username"]
    return new_request


@router.post("/accept/{request_id}", response_model=FriendRequestResponse)
async def accept_friend_request(
    request_id: str, current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    req = db.friends.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req["receiver_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to accept this request"
        )

    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Request is {req['status']}")

    db.friends.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "accepted", "updated_at": datetime.utcnow()}},
    )

    updated_req = db.friends.find_one({"_id": ObjectId(request_id)})
    updated_req["id"] = str(updated_req["_id"])
    return updated_req


@router.get("/requests", response_model=List[FriendRequestResponse])
async def get_pending_requests(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    requests = list(db.friends.find({"receiver_id": user_id, "status": "pending"}))

    # Enrich with sender username
    for r in requests:
        r["id"] = str(r["_id"])
        sender = db.users.find_one({"_id": ObjectId(r["sender_id"])})
        if sender:
            r["sender_username"] = sender["username"]

    return requests


@router.get("/", response_model=List[FriendResponse])
async def get_friends(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    # Find accepted records where user is either sender or receiver
    connections = list(
        db.friends.find(
            {
                "status": "accepted",
                "$or": [{"sender_id": user_id}, {"receiver_id": user_id}],
            }
        )
    )

    friends = []
    for c in connections:
        friend_id = c["receiver_id"] if c["sender_id"] == user_id else c["sender_id"]
        friend_user = db.users.find_one({"_id": ObjectId(friend_id)})
        if friend_user:
            friends.append(
                {
                    "user_id": friend_id,
                    "username": friend_user["username"],
                    "friend_since": c.get("updated_at", c["created_at"]),
                }
            )

    return friends
