from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user, get_current_user_optional
from app.db.database import db
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/streaming", tags=["Streaming"])


class WatchHistoryEntry(BaseModel):
    movie_id: str
    progress_seconds: Optional[int] = 0


# ── Log a watch event ─────────────────────────────────────────────────────────

@router.post("/watch/{movie_id}")
async def log_watch(movie_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    db.watch_history.update_one(
        {"user_id": user_id, "movie_id": movie_id},
        {"$set": {"last_watched_at": now}, "$setOnInsert": {"started_at": now, "progress_seconds": 0}},
        upsert=True,
    )
    return {"status": "logged"}


@router.put("/watch/{movie_id}/progress")
async def update_progress(movie_id: str, entry: WatchHistoryEntry, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db.watch_history.update_one(
        {"user_id": user_id, "movie_id": movie_id},
        {"$set": {"progress_seconds": entry.progress_seconds, "last_watched_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"status": "updated"}


# ── Get watch history ─────────────────────────────────────────────────────────

@router.get("/history")
async def get_watch_history(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    history = list(
        db.watch_history.find({"user_id": user_id})
        .sort("last_watched_at", -1)
        .limit(20)
    )
    results = []
    for h in history:
        try:
            movie = db.movies.find_one({"_id": ObjectId(h["movie_id"])})
            if not movie:
                continue
            movie["id"] = str(movie["_id"])
            # Expand genres
            movie["genres"] = []
            for gid in movie.get("genre_ids", []):
                try:
                    g = db.genres.find_one({"_id": ObjectId(gid)})
                    if g:
                        g["id"] = str(g["_id"])
                        movie["genres"].append(g)
                except Exception:
                    pass
            movie["progress_seconds"] = h.get("progress_seconds", 0)
            results.append(movie)
        except Exception:
            continue
    return results


# ── Get streaming availability info for a movie ───────────────────────────────

@router.get("/links/{movie_id}")
async def get_streaming_links(movie_id: str):
    if not ObjectId.is_valid(movie_id):
        return {}
    movie = db.movies.find_one({"_id": ObjectId(movie_id)}, {"title": 1, "archive_url": 1})
    if not movie:
        return {}

    title = movie.get("title", "")
    encoded = title.replace(" ", "%20")
    encoded_plus = title.replace(" ", "+")

    return {
        "archive_url": movie.get("archive_url"),
        "platforms": [
            {"name": "Netflix",   "url": f"https://www.netflix.com/search?q={encoded}",                           "color": "#E50914", "logo": "N"},
            {"name": "Prime",     "url": f"https://www.amazon.com/s?k={encoded_plus}&i=instant-video",            "color": "#00A8E0", "logo": "P"},
            {"name": "Disney+",   "url": f"https://www.disneyplus.com/en-gb/search?q={encoded}",                  "color": "#0063E5", "logo": "D+"},
            {"name": "Apple TV+", "url": f"https://tv.apple.com/search?term={encoded}",                           "color": "#555555", "logo": "🍎"},
            {"name": "HBO Max",   "url": f"https://play.max.com/search?q={encoded}",                              "color": "#5822B4", "logo": "M"},
            {"name": "Hulu",     "url": f"https://www.hulu.com/search?q={encoded}",                              "color": "#1CE783", "logo": "H"},
            {"name": "Peacock",   "url": f"https://www.peacocktv.com/search?q={encoded}",                        "color": "#000000", "logo": "P"},
        ],
        "mirrors": [
            {"name": "StreamFlix", "url": f"https://vidsrc.to/embed/movie/{movie.get('imdb_id', '')}"},
            {"name": "MovieHub", "url": f"https://vidsrc.xyz/embed/movie/{movie.get('imdb_id', '')}"},
            {"name": "CinemaStream", "url": f"https://player.vidsrc.nl/embed/{movie.get('imdb_id', '')}"},
            {"name": "FilmFlix", "url": f"https://v2.vidsrc.ml/embed/{movie.get('imdb_id', '')}"},
        ],
    }
