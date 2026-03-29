from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
from app.db.database import db
from app.routers.auth import get_current_admin_user
from app.models.user import UserResponse
from pydantic import BaseModel


class SystemNotificationRequest(BaseModel):
    message: str
    target_user_id: str
    link: Optional[str] = None


class AdminStats(BaseModel):
    total_users: int
    total_movies: int
    total_reviews: int
    total_messages: int


class MovieCreateRequest(BaseModel):
    title: str
    overview: str
    release_date: str
    runtime: int = 100
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    imdb_rating: float = 0.0
    language: str = "English"
    genre_ids: List[str] = []


router = APIRouter(
    prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)]
)


# ── Dashboard Stats ───────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
async def get_dashboard_stats():
    return AdminStats(
        total_users=db.users.count_documents({}),
        total_movies=db.movies.count_documents({}),
        total_reviews=db.reviews.count_documents({}),
        total_messages=db.messages.count_documents({}),
    )


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics():
    # Reviews per genre
    all_movies = list(db.movies.find({}, {"title": 1, "genre_ids": 1}))
    movie_genre_map = {str(m["_id"]): m.get("genre_ids", []) for m in all_movies}
    genre_name_map = {str(g["_id"]): g["name"] for g in db.genres.find()}

    genre_review_counts = {}
    for review in db.reviews.find({}, {"movie_id": 1}):
        for gid in movie_genre_map.get(review.get("movie_id", ""), []):
            gname = genre_name_map.get(gid, "Unknown")
            genre_review_counts[gname] = genre_review_counts.get(gname, 0) + 1

    reviews_by_genre = [
        {"genre": k, "reviews": v}
        for k, v in sorted(genre_review_counts.items(), key=lambda x: -x[1])
    ][:8]

    # Signups per week for last 8 weeks
    now = datetime.utcnow()
    signups_by_week = []
    for i in range(7, -1, -1):
        week_start = now - timedelta(weeks=i + 1)
        week_end = now - timedelta(weeks=i)
        count = db.users.count_documents({
            "_id": {
                "$gte": ObjectId.from_datetime(week_start),
                "$lt": ObjectId.from_datetime(week_end),
            }
        })
        signups_by_week.append({
            "week": f"W-{i}" if i > 0 else "This week",
            "signups": count,
        })

    return {"reviews_by_genre": reviews_by_genre, "signups_by_week": signups_by_week}


# ── User Management ───────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
async def get_all_users():
    users = list(db.users.find({}).sort("username", 1))
    for u in users:
        u["id"] = str(u["_id"])
    return users


@router.get("/users/{target_id}")
async def get_user_detail(target_id: str):
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")

    user = db.users.find_one({"_id": ObjectId(target_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Safely fetch and enrich reviews
    reviews = []
    try:
        raw_reviews = list(db.reviews.find({"user_id": target_id}))
        for r in raw_reviews:
            try:
                mid = r.get("movie_id", "")
                movie_title = "Unknown"
                if mid and ObjectId.is_valid(str(mid)):
                    movie = db.movies.find_one({"_id": ObjectId(str(mid))}, {"title": 1})
                    if movie:
                        movie_title = movie["title"]
                reviews.append({
                    "id": str(r["_id"]),
                    "movie_id": str(mid),
                    "movie_title": movie_title,
                    "rating": r.get("rating", 0),
                    "comment": r.get("comment") or r.get("text", ""),
                    "text": r.get("comment") or r.get("text", ""),
                    "created_at": str(r.get("created_at", "")),
                })
            except Exception:
                continue
    except Exception:
        pass

    # Friend count — check both friends collection formats
    friend_count = 0
    try:
        friend_count = db.friends.count_documents({
            "status": "accepted",
            "$or": [{"sender_id": target_id}, {"receiver_id": target_id}],
        })
    except Exception:
        pass

    return {
        "id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "is_admin": user.get("is_admin", False),
        "favorite_genres": user.get("favorite_genres", []),
        "reviews": reviews,
        "wishlist_count": db.wishlist.count_documents({"user_id": target_id}),
        "review_count": len(reviews),
        "friend_count": friend_count,
    }


@router.patch("/users/{target_id}/promote")
async def promote_user(target_id: str):
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    user = db.users.find_one({"_id": ObjectId(target_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_status = not user.get("is_admin", False)
    db.users.update_one({"_id": ObjectId(target_id)}, {"$set": {"is_admin": new_status}})
    return {"message": f"User {'promoted' if new_status else 'demoted'} successfully", "is_admin": new_status}


@router.delete("/users/{target_id}")
async def delete_user(target_id: str):
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=400, detail="Invalid User ID")
    result = db.users.delete_one({"_id": ObjectId(target_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    db.reviews.delete_many({"user_id": target_id})
    db.wishlist.delete_many({"user_id": target_id})
    return {"message": "User deleted successfully"}


# ── Movie Management ──────────────────────────────────────────────────────────

@router.post("/movies")
async def admin_create_movie(movie: MovieCreateRequest):
    result = db.movies.insert_one(movie.dict())
    return {"message": "Movie created", "id": str(result.inserted_id)}


@router.delete("/movies/{movie_id}")
async def admin_delete_movie(movie_id: str):
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(status_code=400, detail="Invalid Movie ID")
    result = db.movies.delete_one({"_id": ObjectId(movie_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")
    db.reviews.delete_many({"movie_id": movie_id})
    db.wishlist.delete_many({"movie_id": movie_id})
    return {"message": "Movie deleted successfully"}


@router.patch("/movies/{movie_id}")
async def admin_edit_movie(movie_id: str, movie: MovieCreateRequest):
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(status_code=400, detail="Invalid Movie ID")
    update_data = {k: v for k, v in movie.dict().items() if v is not None}
    result = db.movies.update_one({"_id": ObjectId(movie_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"message": "Movie updated successfully"}


# ── Review Moderation ─────────────────────────────────────────────────────────

@router.get("/reviews")
async def admin_list_reviews(skip: int = 0, limit: int = 50):
    reviews = list(db.reviews.find({}).sort("created_at", -1).skip(skip).limit(limit))
    for r in reviews:
        r["id"] = str(r["_id"])
        movie = db.movies.find_one({"_id": ObjectId(r["movie_id"])}, {"title": 1}) if ObjectId.is_valid(r.get("movie_id", "")) else None
        r["movie_title"] = movie["title"] if movie else "Unknown"
    return reviews


@router.delete("/reviews/{review_id}")
async def admin_delete_review(review_id: str):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid Review ID")
    result = db.reviews.delete_one({"_id": ObjectId(review_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}


# ── Notifications ─────────────────────────────────────────────────────────────

@router.post("/notifications")
async def send_manual_notification(payload: SystemNotificationRequest):
    from app.routers.notifications import create_notification

    if payload.target_user_id == "all":
        all_users = list(db.users.find({}, {"_id": 1}))
        for u in all_users:
            create_notification(str(u["_id"]), payload.message, "system", link=payload.link)
        return {"message": f"Broadcast sent to {len(all_users)} users."}
    else:
        if not ObjectId.is_valid(payload.target_user_id):
            raise HTTPException(status_code=400, detail="Invalid Target User ID")
        if not db.users.find_one({"_id": ObjectId(payload.target_user_id)}):
            raise HTTPException(status_code=404, detail="User not found")
        create_notification(payload.target_user_id, payload.message, "system", link=payload.link)
        return {"message": "Notification sent successfully"}
