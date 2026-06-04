from fastapi import APIRouter, Depends, Query
from app.routers.auth import get_current_user
from app.db.database import db
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/feed", tags=["Social Feed"])


@router.get("/")
async def get_activity_feed(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, le=100),
    skip: int = 0,
):
    """
    Get activity feed showing friends' activities: reviews, wishlist additions, and watches.
    Returns aggregated and sorted by timestamp.
    """
    user_id = str(current_user["_id"])

    # Get friends list
    friends_docs = list(
        db.friends.find(
            {"$or": [{"user_id": user_id}, {"friend_id": user_id}], "status": "accepted"}
        )
    )

    friend_ids = set()
    for f in friends_docs:
        if f["user_id"] == user_id:
            friend_ids.add(f["friend_id"])
        else:
            friend_ids.add(f["user_id"])

    if not friend_ids:
        return {"activities": [], "total": 0}

    activities = []

    # Fetch reviews by friends
    reviews = list(
        db.reviews.find({"user_id": {"$in": list(friend_ids)}})
        .sort("created_at", -1)
        .limit(limit)
    )
    for review in reviews:
        try:
            user = db.users.find_one({"_id": ObjectId(review["user_id"])})
            movie = db.movies.find_one({"_id": ObjectId(review["movie_id"])})
            if user and movie:
                activities.append({
                    "type": "review",
                    "timestamp": review["created_at"],
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "movie": {
                        "id": str(movie["_id"]),
                        "title": movie["title"],
                        "poster_url": movie.get("poster_url"),
                    },
                    "content": review.get("content", ""),
                    "rating": review.get("rating"),
                })
        except Exception:
            pass

    # Fetch wishlist additions by friends
    wishlist_items = list(
        db.wishlist.find({"user_id": {"$in": list(friend_ids)}})
        .sort("added_at", -1)
        .limit(limit)
    )
    for item in wishlist_items:
        try:
            user = db.users.find_one({"_id": ObjectId(item["user_id"])})
            movie = db.movies.find_one({"_id": ObjectId(item["movie_id"])})
            if user and movie:
                activities.append({
                    "type": "wishlist",
                    "timestamp": item["added_at"],
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "movie": {
                        "id": str(movie["_id"]),
                        "title": movie["title"],
                        "poster_url": movie.get("poster_url"),
                    },
                })
        except Exception:
            pass

    # Fetch watch history by friends
    watches = list(
        db.watch_history.find({"user_id": {"$in": list(friend_ids)}})
        .sort("last_watched_at", -1)
        .limit(limit)
    )
    for watch in watches:
        try:
            user = db.users.find_one({"_id": ObjectId(watch["user_id"])})
            movie = db.movies.find_one({"_id": ObjectId(watch["movie_id"])})
            if user and movie:
                activities.append({
                    "type": "watch",
                    "timestamp": watch["last_watched_at"],
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "movie": {
                        "id": str(movie["_id"]),
                        "title": movie["title"],
                        "poster_url": movie.get("poster_url"),
                    },
                })
        except Exception:
            pass

    # Sort all activities by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    # Paginate
    paginated = activities[skip : skip + limit]

    return {"activities": paginated, "total": len(activities)}
