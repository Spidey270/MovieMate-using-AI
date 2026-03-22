from fastapi import APIRouter, Depends, BackgroundTasks
import asyncio
from typing import List
from app.models.movie import MovieResponse, GenreResponse
from app.routers.auth import get_current_user_optional, get_current_user
from app.services.recommendation import recommend_movies_content_based
from app.db.database import db
from bson import ObjectId

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

async def simulate_ai_recommendation(user_id: str):
    # Simulate thinking delay
    await asyncio.sleep(3)
    
    # Notify user that recommendations are ready
    from app.routers.notifications import create_notification
    create_notification(
        user_id=user_id,
        message="Your personalized AI movie recommendations are ready to view!",
        type="recommendation",
        link="/recommendations"
    )

@router.post("/generate")
async def generate_recommendations(background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    background_tasks.add_task(simulate_ai_recommendation, user_id)
    return {"message": "AI is generating recommendations...", "status": "processing"}

@router.get("/", response_model=List[MovieResponse])
async def get_recommendations(current_user: dict = Depends(get_current_user_optional)):
    if current_user:
        user_id = str(current_user["_id"])
        rec_movies = await recommend_movies_content_based(user_id)
    else:
        # Guest: Return top rated or random movies as recommendations
        # For simplicity, just return top 20 movies sorted by rating
        # Note: In a real app we might cache this or have a 'trending' logic
        movies_cursor = db.movies.find().sort("imdb_rating", -1).limit(20)
        rec_movies = list(movies_cursor)
        for m in rec_movies:
            m["id"] = str(m["_id"])

    # Expand genres for response model
    # (Reuse logic from movies.py or make a helper - repeating for speed now)
    for m in rec_movies:
        m_genres = []
        for gid in m.get("genre_ids", []):
            try:
                g = db.genres.find_one({"_id": ObjectId(gid)})
                if g:
                    g["id"] = str(g["_id"])
                    m_genres.append(g)
            except:
                pass
        m["genres"] = m_genres
        
    return rec_movies
