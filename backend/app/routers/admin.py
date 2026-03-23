from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.routers.auth import get_current_admin_user
from app.models.user import UserResponse
from pydantic import BaseModel

class SystemNotificationRequest(BaseModel):
    message: str
    target_user_id: str  # Can be a specific MongoDB ObjectId string, or "all"
    link: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    total_movies: int
    total_reviews: int
    total_messages: int

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)])

@router.get("/stats", response_model=AdminStats)
async def get_dashboard_stats():
    """Returns high-level platform statistics."""
    total_users = db.users.count_documents({})
    total_movies = db.movies.count_documents({})
    total_reviews = db.reviews.count_documents({})
    total_messages = db.messages.count_documents({})
    
    return AdminStats(
        total_users=total_users,
        total_movies=total_movies,
        total_reviews=total_reviews,
        total_messages=total_messages
    )

@router.get("/users", response_model=List[UserResponse])
async def get_all_users():
    """Returns all registered users on the platform."""
    users = list(db.users.find({}).sort("username", 1))
    for u in users:
        u["id"] = str(u["_id"])
    return users

@router.delete("/users/{target_id}")
async def delete_user(target_id: str):
    """Deletes a specific user account entirely."""
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
        
    result = db.users.delete_one({"_id": ObjectId(target_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Optional cleanup of user data
    db.reviews.delete_many({"user_id": target_id})
    db.wishlist.delete_many({"user_id": target_id})
    # Cannot easily delete chat messages due to string/global formatting without more logic, leaving them for now.
    
    return {"message": "User deleted successfully"}

@router.post("/notifications")
async def send_manual_notification(payload: SystemNotificationRequest):
    """Sends a system notification to a specific user, or broadcasts to everyone."""
    # We will import this locally to avoid circular dependencies
    from app.routers.notifications import create_notification
    
    if payload.target_user_id == "all":
        # Broadcast to all users
        all_users = list(db.users.find({}, {"_id": 1}))
        count = 0
        for u in all_users:
            create_notification(
                user_id=str(u["_id"]),
                message=payload.message,
                notification_type="system",
                link=payload.link
            )
            count += 1
        return {"message": f"Broadcast successfully sent to {count} users."}
    
    else:
        # Send to specific user
        if not ObjectId.is_valid(payload.target_user_id):
            raise HTTPException(status_code=400, detail="Invalid Target User ID")
            
        target = db.users.find_one({"_id": ObjectId(payload.target_user_id)})
        if not target:
             raise HTTPException(status_code=404, detail="User not found")
             
        create_notification(
            user_id=payload.target_user_id,
            message=payload.message,
            notification_type="system",
            link=payload.link
        )
        return {"message": "Notification sent successfully"}
