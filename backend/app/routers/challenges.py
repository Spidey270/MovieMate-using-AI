from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from app.db.database import db
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/challenges", tags=["Challenges"])

# Define seasonal/monthly challenges
MONTHLY_CHALLENGES = [
    {
        "id": "watch_5_this_month",
        "title": "Watch 5 Movies This Month",
        "description": "Complete 5 movies before the month ends",
        "icon": "🎯",
        "target": 5,
        "type": "monthly_watch",
        "reward_xp": 100
    },
    {
        "id": "review_3_this_month",
        "title": "Review 3 Movies",
        "description": "Share your thoughts on 3 movies this month",
        "icon": "✍️",
        "target": 3,
        "type": "monthly_review",
        "reward_xp": 75
    },
    {
        "id": "classic_challenge",
        "title": "Watch a Classic",
        "description": "Watch a movie released before 1990",
        "icon": "🎞️",
        "target": 1,
        "type": "watch_classic",
        "reward_xp": 50
    },
    {
        "id": "new_genre",
        "title": "Try Something New",
        "description": "Watch a movie from a genre you haven't explored",
        "icon": "🌟",
        "target": 1,
        "type": "new_genre",
        "reward_xp": 60
    },
    {
        "id": "social_challenge",
        "title": "Social Viewer",
        "description": "Add a friend and watch the same movie",
        "icon": "👥",
        "target": 1,
        "type": "social",
        "reward_xp": 80
    }
]


def calculate_challenge_progress(user_id: str, challenge: dict):
    """Calculate progress for a specific challenge."""
    challenge_type = challenge["type"]
    target = challenge["target"]

    # Get current month date range
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    if now.month == 12:
        month_end = datetime(now.year + 1, 1, 1) - timedelta(seconds=1)
    else:
        month_end = datetime(now.year, now.month + 1, 1) - timedelta(seconds=1)

    current = 0
    completed = False

    if challenge_type == "monthly_watch":
        # Count movies watched this month
        watch_count = db.watch_history.count_documents({
            "user_id": user_id,
            "last_watched_at": {"$gte": month_start, "$lte": month_end}
        })
        current = watch_count
        completed = watch_count >= target

    elif challenge_type == "monthly_review":
        # Count reviews this month
        review_count = db.reviews.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lte": month_end}
        })
        current = review_count
        completed = review_count >= target

    elif challenge_type == "watch_classic":
        # Check if watched a movie from before 1990
        watch_history = list(db.watch_history.find({
            "user_id": user_id,
            "last_watched_at": {"$gte": month_start, "$lte": month_end}
        }))

        for watch in watch_history:
            try:
                movie = db.movies.find_one({"_id": ObjectId(watch["movie_id"])})
                if movie and movie.get("release_date"):
                    release_year = int(str(movie["release_date"])[:4])
                    if release_year < 1990:
                        current = 1
                        completed = True
                        break
            except:
                pass

    elif challenge_type == "new_genre":
        # Check if watched a movie from a new genre
        # Get all genres watched this month
        watch_history = list(db.watch_history.find({
            "user_id": user_id,
            "last_watched_at": {"$gte": month_start, "$lte": month_end}
        }))

        # Get all genres watched before this month
        old_watches = list(db.watch_history.find({
            "user_id": user_id,
            "last_watched_at": {"$lt": month_start}
        }))

        old_genres = set()
        for watch in old_watches:
            try:
                movie = db.movies.find_one({"_id": ObjectId(watch["movie_id"])})
                if movie:
                    old_genres.update(movie.get("genre_ids", []))
            except:
                pass

        # Check for new genres
        for watch in watch_history:
            try:
                movie = db.movies.find_one({"_id": ObjectId(watch["movie_id"])})
                if movie:
                    movie_genres = set(movie.get("genre_ids", []))
                    if movie_genres - old_genres:
                        current = 1
                        completed = True
                        break
            except:
                pass

    elif challenge_type == "social":
        # Simplified: just check if has at least 1 friend
        friend_count = db.friends.count_documents({
            "user_id": user_id,
            "status": "accepted"
        })
        current = 1 if friend_count > 0 else 0
        completed = friend_count > 0

    return {
        "current": current,
        "target": target,
        "completed": completed,
        "percentage": min(100, int((current / target) * 100))
    }


@router.get("/")
async def get_challenges(current_user: dict = Depends(get_current_user)):
    """Get all current challenges with progress."""
    user_id = str(current_user["_id"])

    challenges_with_progress = []
    for challenge in MONTHLY_CHALLENGES:
        progress = calculate_challenge_progress(user_id, challenge)
        challenge_data = {**challenge, "progress": progress}
        challenges_with_progress.append(challenge_data)

    return challenges_with_progress


@router.post("/{challenge_id}/claim")
async def claim_challenge_reward(
    challenge_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Claim reward for a completed challenge."""
    user_id = str(current_user["_id"])

    # Find the challenge
    challenge = next((c for c in MONTHLY_CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        return {"error": "Challenge not found"}

    # Check progress
    progress = calculate_challenge_progress(user_id, challenge)
    if not progress["completed"]:
        return {"error": "Challenge not completed yet"}

    # Check if already claimed this month
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    existing_claim = db.challenge_claims.find_one({
        "user_id": user_id,
        "challenge_id": challenge_id,
        "claimed_at": {"$gte": month_start}
    })

    if existing_claim:
        return {"error": "Reward already claimed this month"}

    # Award XP
    reward_xp = challenge["reward_xp"]
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"xp": reward_xp}}
    )

    # Record claim
    db.challenge_claims.insert_one({
        "user_id": user_id,
        "challenge_id": challenge_id,
        "claimed_at": datetime.utcnow(),
        "xp_awarded": reward_xp
    })

    return {
        "message": "Reward claimed successfully",
        "xp_awarded": reward_xp
    }
