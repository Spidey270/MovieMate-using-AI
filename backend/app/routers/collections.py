from fastapi import APIRouter, HTTPException, Depends
from app.routers.auth import get_current_user
from app.db.database import db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/collections", tags=["Collections"])


class CollectionCreate(BaseModel):
    name: str
    description: str = ""


class CollectionUpdate(BaseModel):
    name: str = None
    description: str = None


@router.post("/")
async def create_collection(
    collection: CollectionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new movie collection."""
    user_id = str(current_user["_id"])

    collection_data = {
        "user_id": user_id,
        "name": collection.name,
        "description": collection.description,
        "movie_ids": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = db.collections.insert_one(collection_data)
    collection_data["id"] = str(result.inserted_id)
    return collection_data


@router.get("/")
async def get_user_collections(current_user: dict = Depends(get_current_user)):
    """Get all collections for the current user."""
    user_id = str(current_user["_id"])

    collections = list(db.collections.find({"user_id": user_id}).sort("created_at", -1))

    for collection in collections:
        collection["id"] = str(collection["_id"])
        collection["movie_count"] = len(collection.get("movie_ids", []))

    return collections


@router.get("/{collection_id}")
async def get_collection(
    collection_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific collection with movies."""
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    user_id = str(current_user["_id"])
    if collection["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this collection")

    collection["id"] = str(collection["_id"])

    # Fetch movies in collection
    movies = []
    for movie_id in collection.get("movie_ids", []):
        try:
            movie = db.movies.find_one({"_id": ObjectId(movie_id)})
            if movie:
                movie["id"] = str(movie["_id"])
                # Fetch genres
                movie["genres"] = []
                for gid in movie.get("genre_ids", []):
                    try:
                        g = db.genres.find_one({"_id": ObjectId(gid)})
                        if g:
                            g["id"] = str(g["_id"])
                            movie["genres"].append(g)
                    except:
                        pass
                movies.append(movie)
        except:
            pass

    collection["movies"] = movies
    return collection


@router.put("/{collection_id}")
async def update_collection(
    collection_id: str,
    collection_update: CollectionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update collection name or description."""
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    user_id = str(current_user["_id"])
    if collection["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {"updated_at": datetime.utcnow()}
    if collection_update.name is not None:
        update_data["name"] = collection_update.name
    if collection_update.description is not None:
        update_data["description"] = collection_update.description

    db.collections.update_one(
        {"_id": ObjectId(collection_id)},
        {"$set": update_data}
    )

    updated_collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    updated_collection["id"] = str(updated_collection["_id"])
    return updated_collection


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a collection."""
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    user_id = str(current_user["_id"])
    if collection["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.collections.delete_one({"_id": ObjectId(collection_id)})
    return {"message": "Collection deleted successfully"}


@router.post("/{collection_id}/movies/{movie_id}")
async def add_movie_to_collection(
    collection_id: str,
    movie_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Add a movie to a collection."""
    if not ObjectId.is_valid(collection_id) or not ObjectId.is_valid(movie_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    user_id = str(current_user["_id"])
    if collection["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if movie exists
    movie = db.movies.find_one({"_id": ObjectId(movie_id)})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Add movie if not already in collection
    if movie_id not in collection.get("movie_ids", []):
        db.collections.update_one(
            {"_id": ObjectId(collection_id)},
            {
                "$push": {"movie_ids": movie_id},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

    return {"message": "Movie added to collection"}


@router.delete("/{collection_id}/movies/{movie_id}")
async def remove_movie_from_collection(
    collection_id: str,
    movie_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a movie from a collection."""
    if not ObjectId.is_valid(collection_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    collection = db.collections.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    user_id = str(current_user["_id"])
    if collection["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.collections.update_one(
        {"_id": ObjectId(collection_id)},
        {
            "$pull": {"movie_ids": movie_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    return {"message": "Movie removed from collection"}
