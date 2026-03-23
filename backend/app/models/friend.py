from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from typing import Optional


class FriendRequestBase(BaseModel):
    receiver_id: str


class FriendRequestCreate(FriendRequestBase):
    pass


class FriendRequestResponse(FriendRequestBase):
    id: str | None = None
    sender_id: str
    status: str  # pending, accepted, rejected
    created_at: datetime
    sender_username: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}


class FriendResponse(BaseModel):
    user_id: str
    username: str
    friend_since: datetime

    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}
