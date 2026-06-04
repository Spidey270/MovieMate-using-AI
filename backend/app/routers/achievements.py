from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from app.db.database import db
from app.models.achievement import ACHIEVEMENTS
from bson import ObjectId
from datetime import datetime, timedelta
from collections import Counter

router = APIRouter(prefix="/achievements", tags=["Achievements"])


def calculate_user_achievements(user_id: str):
    """Calculate which achievements a user has unlocked."""
    unlocked = []
    progress = {}

    # Get user stats
    watch_history = list(db.watch_history.find({"user_id": user_id}))
    watched_movie_ids = list(set([w["movie_id"] for w in watch_history]))
    watch_count = len(watched_movie_ids)

    reviews = list(db.reviews.find({"user_id": user_id}))
    review_count = len(reviews)

    friends = list(db.friends.find({"user_id": user_id, "status": "accepted"}))
    friend_count = len(friends)

    wishlist = list(db.wishlist.find({"user_id": user_id}))
    wishlist_count = len(wishlist)

    # Genre variety
    genres_watched = set()
    for movie_id in watched_movie_ids:
        try:
            movie = db.movies.find_one({"_id": ObjectId(movie_id)})
            if movie:
                for genre_id in movie.get("genre_ids", []):
                    genres_watched.add(genre_id)
        except:
            pass
    genre_variety_count = len(genres_watched)

    # Watch streak
    watch_dates = sorted([w["last_watched_at"] for w in watch_history if "last_watched_at" in w])
    longest_streak = 0
    if watch_dates:
        streak = 1
        for i in range(1, len(watch_dates)):
            prev_date = watch_dates[i-1].date() if hasattr(watch_dates[i-1], 'date') else watch_dates[i-1]
            curr_date = watch_dates[i].date() if hasattr(watch_dates[i], 'date') else watch_dates[i]
            if (curr_date - prev_date).days == 1:
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak)

    # Daily watch count
    daily_watches = {}
    for watch in watch_history:
        watch_date = watch.get("last_watched_at")
        if watch_date:
            date_key = watch_date.date() if hasattr(watch_date, 'date') else watch_date
            daily_watches[date_key] = daily_watches.get(date_key, 0) + 1
    max_daily_watches = max(daily_watches.values()) if daily_watches else 0

    # Check each achievement
    for achievement in ACHIEVEMENTS:
        ach_id = achievement["id"]
        ach_type = achievement["type"]
        requirement = achievement["requirement"]

        current_progress = 0
        is_unlocked = False

        if ach_type == "watch_count":
            current_progress = watch_count
            is_unlocked = watch_count >= requirement
        elif ach_type == "review_count":
            current_progress = review_count
            is_unlocked = review_count >= requirement
        elif ach_type == "friend_count":
            current_progress = friend_count
            is_unlocked = friend_count >= requirement
        elif ach_type == "wishlist_count":
            current_progress = wishlist_count
            is_unlocked = wishlist_count >= requirement
        elif ach_type == "genre_variety":
            current_progress = genre_variety_count
            is_unlocked = genre_variety_count >= requirement
        elif ach_type == "watch_streak":
            current_progress = longest_streak
            is_unlocked = longest_streak >= requirement
        elif ach_type == "daily_watch":
            current_progress = max_daily_watches
            is_unlocked = max_daily_watches >= requirement

        progress[ach_id] = {
            "current": current_progress,
            "required": requirement,
            "percentage": min(100, int((current_progress / requirement) * 100))
        }

        if is_unlocked:
            # Check if already recorded
            existing = db.user_achievements.find_one({
                "user_id": user_id,
                "achievement_id": ach_id
            })
            if not existing:
                # Award achievement
                db.user_achievements.insert_one({
                    "user_id": user_id,
                    "achievement_id": ach_id,
                    "unlocked_at": datetime.utcnow()
                })
            unlocked.append(achievement)

    return {
        "unlocked": unlocked,
        "progress": progress,
        "total_unlocked": len(unlocked),
        "total_available": len(ACHIEVEMENTS)
    }


@router.get("/")
async def get_all_achievements():
    """Get all available achievements."""
    return ACHIEVEMENTS


@router.get("/my")
async def get_my_achievements(current_user: dict = Depends(get_current_user)):
    """Get current user's achievements."""
    user_id = str(current_user["_id"])
    return calculate_user_achievements(user_id)


@router.get("/user/{user_id}")
async def get_user_achievements_by_id(user_id: str):
    """Get achievements for a specific user (public)."""
    return calculate_user_achievements(user_id)
