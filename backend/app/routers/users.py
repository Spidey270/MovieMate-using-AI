from fastapi import APIRouter, HTTPException
from app.db.database import db
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}")
async def get_public_profile(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
        
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Public info only
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "favorite_genres": user.get("favorite_genres", []),
        "favorite_languages": user.get("favorite_languages", []),
        # Maybe show some stats?
        "wishlist_count": db.wishlist.count_documents({"user_id": user_id}),
        "review_count": db.reviews.count_documents({"user_id": user_id})
    }

@router.get("/", response_model=List[dict])
async def search_users(q: str):
    # Simple search by username
    users = list(db.users.find({"username": {"$regex": q, "$options": "i"}}).limit(10))
    return [{"id": str(u["_id"]), "username": u["username"]} for u in users]
