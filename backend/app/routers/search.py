from fastapi import APIRouter, Query
from app.db.database import db
from bson import ObjectId
from typing import Optional, List
import re

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/movies")
async def search_movies(
    query: Optional[str] = None,
    genres: Optional[str] = None,  # Comma-separated genre names or IDs
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    rating_min: Optional[float] = None,
    language: Optional[str] = None,
    sort_by: str = Query("rating", regex="^(rating|year|title|popularity)$"),
    limit: int = Query(20, le=100),
    skip: int = 0,
):
    """
    Advanced movie search with filtering and sorting.

    - **query**: Search text for movie title
    - **genres**: Comma-separated genre names (e.g., "Action,Comedy")
    - **year_min**, **year_max**: Year range filter
    - **rating_min**: Minimum IMDb rating
    - **language**: Movie language
    - **sort_by**: Sort field (rating, year, title, popularity)
    - **limit**: Max results (default 20, max 100)
    - **skip**: Pagination offset
    """

    # Build filter criteria
    filter_criteria = {}

    # Text search on title
    if query:
        filter_criteria["title"] = {"$regex": re.escape(query), "$options": "i"}

    # Genre filtering
    if genres:
        genre_names = [g.strip() for g in genres.split(",")]
        # Find genre IDs by names
        genre_docs = list(db.genres.find({"name": {"$in": genre_names}}))
        if genre_docs:
            genre_ids = [str(g["_id"]) for g in genre_docs]
            # Match movies with ALL specified genres (AND logic)
            filter_criteria["genre_ids"] = {"$all": genre_ids}

    # Year range
    if year_min or year_max:
        year_filter = {}
        if year_min:
            year_filter["$gte"] = f"{year_min}-01-01"
        if year_max:
            year_filter["$lte"] = f"{year_max}-12-31"
        if year_filter:
            filter_criteria["release_date"] = year_filter

    # Rating filter
    if rating_min is not None:
        filter_criteria["imdb_rating"] = {"$gte": rating_min}

    # Language filter
    if language:
        filter_criteria["language"] = {"$regex": re.escape(language), "$options": "i"}

    # Sorting
    sort_map = {
        "rating": [("imdb_rating", -1)],
        "year": [("release_date", -1)],
        "title": [("title", 1)],
        "popularity": [("imdb_rating", -1), ("release_date", -1)],  # High rating + recent
    }
    sort_criteria = sort_map.get(sort_by, [("imdb_rating", -1)])

    # Execute query
    cursor = db.movies.find(filter_criteria).sort(sort_criteria).skip(skip).limit(limit)
    movies = list(cursor)

    # Expand genres for each movie
    results = []
    for movie in movies:
        movie["id"] = str(movie["_id"])
        movie["genres"] = []
        for gid in movie.get("genre_ids", []):
            try:
                g = db.genres.find_one({"_id": ObjectId(gid)})
                if g:
                    g["id"] = str(g["_id"])
                    movie["genres"].append(g)
            except Exception:
                pass
        results.append(movie)

    # Count total results
    total = db.movies.count_documents(filter_criteria)

    return {
        "results": results,
        "total": total,
        "limit": limit,
        "skip": skip,
    }
