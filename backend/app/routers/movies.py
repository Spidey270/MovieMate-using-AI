from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.db.database import db
from app.models.movie import MovieCreate, MovieResponse, GenreResponse
from app.routers.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/movies", tags=["Movies"])


@router.get("/", response_model=List[MovieResponse])
async def get_movies(
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    sort_by: Optional[str] = None,
    order: str = "desc",
):
    query = {}
    if genre:
        query["genre_ids"] = genre
    if language:
        # Assuming exact match for language for now. Case-insensitive ideally.
        query["language"] = {"$regex": f"^{language}$", "$options": "i"}

    # Determine sort criteria
    sort_criteria = []
    sort_direction = -1 if order.lower() == "desc" else 1

    if sort_by == "title":
        sort_criteria = [("title", sort_direction)]
    elif sort_by == "release_date":
        sort_criteria = [("release_date", sort_direction)]
    elif sort_by == "imdb_rating":
        sort_criteria = [("imdb_rating", sort_direction)]
    else:
        # Default sort (e.g., newest added or id)
        sort_criteria = [("_id", -1)]

    movies_cursor = db.movies.find(query).sort(sort_criteria).skip(skip).limit(limit)
    movies = list(movies_cursor)

    # Expand genres
    # Optimization: Fetch all needed genres in one query instead of N+1
    all_genre_ids = set()
    for m in movies:
        all_genre_ids.update(m.get("genre_ids", []))

    # Convert string IDs to ObjectIds if stored as such, but our model has them as strings.
    # We should ensure consistency. For now, assuming they are stored as strings in movie doc.

    genres_map = {}
    if all_genre_ids:
        # Convert str ids back to ObjectId for query if needed, or keeping as is.
        # Let's assume we store them as strings in the DB for simplicity or ObjectIds.
        # Ideally, store as ObjectIds.
        obj_ids = []
        for gid in all_genre_ids:
            try:
                obj_ids.append(ObjectId(gid))
            except:
                pass

        genres_docs = db.genres.find({"_id": {"$in": obj_ids}})
        for g in genres_docs:
            genres_map[str(g["_id"])] = g

    result_movies = []
    for m in movies:
        m["id"] = str(m["_id"])
        m_genres = []
        for gid in m.get("genre_ids", []):
            if gid in genres_map:
                g_data = genres_map[gid]
                g_data["id"] = str(g_data["_id"])
                m_genres.append(g_data)
        m["genres"] = m_genres
        result_movies.append(m)

    return result_movies


@router.post(
    "/", response_model=MovieResponse, dependencies=[Depends(get_current_user)]
)
async def create_movie(movie: MovieCreate):
    movie_dict = movie.dict()
    result = db.movies.insert_one(movie_dict)
    new_movie = db.movies.find_one({"_id": result.inserted_id})
    new_movie["id"] = str(new_movie["_id"])

    # Fetch genres for response
    m_genres = []
    for gid in new_movie.get("genre_ids", []):
        try:
            g = db.genres.find_one({"_id": ObjectId(gid)})
            if g:
                g["id"] = str(g["_id"])
                m_genres.append(g)
        except:
            pass
    new_movie["genres"] = m_genres

    return new_movie


@router.get("/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: str):
    if not ObjectId.is_valid(movie_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    movie = db.movies.find_one({"_id": ObjectId(movie_id)})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie["id"] = str(movie["_id"])

    m_genres = []
    for gid in movie.get("genre_ids", []):
        try:
            g = db.genres.find_one({"_id": ObjectId(gid)})
            if g:
                g["id"] = str(g["_id"])
                m_genres.append(g)
        except:
            pass
    movie["genres"] = m_genres
    return movie
