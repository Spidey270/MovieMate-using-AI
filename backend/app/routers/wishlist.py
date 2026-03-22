from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.social import WishlistCreate, WishlistResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/", response_model=WishlistResponse)
async def add_to_wishlist(item: WishlistCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Check if already exists
    if db.wishlist.find_one({"user_id": user_id, "movie_id": item.movie_id}):
         raise HTTPException(status_code=400, detail="Movie already in wishlist")

    # Verify movie exists
    movie = db.movies.find_one({"_id": ObjectId(item.movie_id)})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    wish_dict = item.dict()
    wish_dict["user_id"] = user_id
    wish_dict["added_at"] = datetime.utcnow()
    wish_dict["movie_title"] = movie.get("title") # Denormalize for easy display
    
    result = db.wishlist.insert_one(wish_dict)
    new_item = db.wishlist.find_one({"_id": result.inserted_id})
    new_item["id"] = str(new_item["_id"])
    return new_item

@router.get("/", response_model=List[WishlistResponse])
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    items = list(db.wishlist.find({"user_id": user_id}))
    for i in items:
        i["id"] = str(i["_id"])
        if "movie_title" not in i:
             # Fallback if not stored
             m = db.movies.find_one({"_id": ObjectId(i["movie_id"])})
             i["movie_title"] = m["title"] if m else "Unknown"
    return items

@router.delete("/{movie_id}")
async def remove_from_wishlist(movie_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    result = db.wishlist.delete_one({"user_id": user_id, "movie_id": movie_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    return {"status": "removed"}
