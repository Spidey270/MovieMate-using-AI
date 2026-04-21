from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.notification import NotificationCreate, NotificationResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    notifs = list(db.notifications.find({"user_id": user_id}).sort("created_at", -1))
    for n in notifs:
        n["id"] = str(n["_id"])
    return notifs


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str, current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    result = db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": user_id},
        {"$set": {"is_read": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "marked as read"}


@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}},
    )
    return {"status": "all marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str, current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    result = db.notifications.delete_one(
        {"_id": ObjectId(notification_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "deleted"}


# Internal helper to create notification
def create_notification(
    user_id: str, message: str, type: str = "info", link: str = None
):
    db.notifications.insert_one(
        {
            "user_id": user_id,
            "message": message,
            "type": type,
            "link": link,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
    )
