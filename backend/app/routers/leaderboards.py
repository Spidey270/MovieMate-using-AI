from fastapi import APIRouter
from app.db.database import db
from bson import ObjectId
from collections import Counter

router = APIRouter(prefix="/leaderboards", tags=["Leaderboards"])


@router.get("/top-reviewers")
async def get_top_reviewers(limit: int = 10):
    """Get users with the most reviews."""
    pipeline = [
        {"$group": {"_id": "$user_id", "review_count": {"$sum": 1}}},
        {"$sort": {"review_count": -1}},
        {"$limit": limit},
    ]

    results = list(db.reviews.aggregate(pipeline))
    leaderboard = []

    for result in results:
        try:
            user = db.users.find_one({"_id": ObjectId(result["_id"])})
            if user:
                leaderboard.append({
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "review_count": result["review_count"],
                })
        except Exception:
            pass

    return leaderboard


@router.get("/most-active")
async def get_most_active(limit: int = 10):
    """Get users with the most watch history."""
    pipeline = [
        {"$group": {"_id": "$user_id", "watch_count": {"$sum": 1}}},
        {"$sort": {"watch_count": -1}},
        {"$limit": limit},
    ]

    results = list(db.watch_history.aggregate(pipeline))
    leaderboard = []

    for result in results:
        try:
            user = db.users.find_one({"_id": ObjectId(result["_id"])})
            if user:
                leaderboard.append({
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "watch_count": result["watch_count"],
                })
        except Exception:
            pass

    return leaderboard


@router.get("/highest-rated-reviewers")
async def get_highest_rated_reviewers(limit: int = 10):
    """Get users with highest average review ratings."""
    pipeline = [
        {"$match": {"rating": {"$exists": True}}},
        {"$group": {"_id": "$user_id", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 3}}},  # At least 3 reviews
        {"$sort": {"avg_rating": -1}},
        {"$limit": limit},
    ]

    results = list(db.reviews.aggregate(pipeline))
    leaderboard = []

    for result in results:
        try:
            user = db.users.find_one({"_id": ObjectId(result["_id"])})
            if user:
                leaderboard.append({
                    "user": {
                        "id": str(user["_id"]),
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                    },
                    "avg_rating": round(result["avg_rating"], 2),
                    "review_count": result["count"],
                })
        except Exception:
            pass

    return leaderboard
