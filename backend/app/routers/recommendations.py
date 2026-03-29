from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List
from app.models.movie import MovieResponse
from app.routers.auth import get_current_user_optional, get_current_user
from app.services.recommendation import generate_smart_recommendations, get_cached_recommendations
from app.db.database import db
from bson import ObjectId

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


async def _run_and_notify(user_id: str):
    """Background job: regenerate recommendations and notify the user."""
    from app.routers.notifications import create_notification
    await generate_smart_recommendations(user_id)
    create_notification(
        user_id=user_id,
        message="✨ Your AI recommendations have been refreshed with new picks!",
        type="recommendation",
        link="/recommendations",
    )


@router.post("/generate")
async def generate_recommendations(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Manually trigger a fresh Gemini recommendation run (runs in background)."""
    user_id = str(current_user["_id"])
    background_tasks.add_task(_run_and_notify, user_id)
    return {"message": "AI is generating your recommendations…", "status": "processing"}


@router.post("/auto-refresh")
async def auto_refresh(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Called silently on login — refreshes cache only if stale (>12 h)."""
    from datetime import datetime, timedelta
    user_id = str(current_user["_id"])
    cache = db.user_recommendations.find_one({"user_id": user_id})
    if cache:
        age = datetime.utcnow() - cache.get("generated_at", datetime.utcnow())
        if age < timedelta(hours=12):
            return {"status": "cache_fresh"}
    background_tasks.add_task(generate_smart_recommendations, user_id)
    return {"status": "refreshing"}


@router.get("/", response_model=List[MovieResponse])
async def get_recommendations(
    current_user: dict = Depends(get_current_user_optional),
):
    if not current_user:
        # Guest: top-rated movies
        movies = list(db.movies.find().sort("imdb_rating", -1).limit(20))
        for m in movies:
            m["id"] = str(m["_id"])
            m["genres"] = []
            for gid in m.get("genre_ids", []):
                try:
                    g = db.genres.find_one({"_id": ObjectId(gid)})
                    if g:
                        g["id"] = str(g["_id"])
                        m["genres"].append(g)
                except Exception:
                    pass
        return movies

    user_id = str(current_user["_id"])
    return await get_cached_recommendations(user_id)
