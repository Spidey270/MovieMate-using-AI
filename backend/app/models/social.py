from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class ReviewBase(BaseModel):
    movie_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1)

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str | None = None
    user_id: str
    username: str # Denormalized for display
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}

class WishlistBase(BaseModel):
    movie_id: str

class WishlistCreate(WishlistBase):
    pass

class WishlistResponse(WishlistBase):
    id: str | None = None
    user_id: str
    movie_title: Optional[str] = None # Expanded for convenience
    added_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
