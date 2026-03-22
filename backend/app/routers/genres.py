from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.db.database import db
from app.models.movie import GenreCreate, GenreResponse
from app.routers.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/genres", tags=["Genres"])

@router.get("/", response_model=List[GenreResponse])
async def get_genres():
    genres = list(db.genres.find())
    for g in genres:
        g["id"] = str(g["_id"])
    return genres

@router.post("/", response_model=GenreResponse, dependencies=[Depends(get_current_user)])
async def create_genre(genre: GenreCreate):
    if db.genres.find_one({"name": genre.name}):
        raise HTTPException(status_code=400, detail="Genre already exists")
    
    result = db.genres.insert_one(genre.dict())
    new_genre = db.genres.find_one({"_id": result.inserted_id})
    new_genre["id"] = str(new_genre["_id"])
    return new_genre
