from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId


class MessageBase(BaseModel):
    receiver_id: str
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str | None = None
    sender_id: str
    sender_username: str | None = None
    timestamp: datetime
    is_read: bool = False

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
