from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

class NotificationBase(BaseModel):
    message: str
    type: str # info, alert, message, friend_request, recommendation
    link: str | None = None

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationResponse(NotificationBase):
    id: str | None = None
    user_id: str
    is_read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
