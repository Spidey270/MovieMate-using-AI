from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from bson import ObjectId


class CommentBase(BaseModel):
    content: str
    parent_id: Optional[str] = None  # For replies


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: str | None = None
    movie_id: str
    user_id: str
    username: str
    created_at: datetime
    replies: list = []

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
