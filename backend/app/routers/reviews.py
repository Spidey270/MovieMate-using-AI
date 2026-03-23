from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.social import ReviewCreate, ReviewResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse)
async def add_review(
    review: ReviewCreate, current_user: dict = Depends(get_current_user)
):
    # Validate movie exists
    if not ObjectId.is_valid(review.movie_id):
        raise HTTPException(status_code=400, detail="Invalid Movie ID")

    movie = db.movies.find_one({"_id": ObjectId(review.movie_id)})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    review_dict = review.dict()
    review_dict["user_id"] = str(current_user["_id"])
    review_dict["username"] = current_user["username"]
    review_dict["created_at"] = datetime.utcnow()

    result = db.reviews.insert_one(review_dict)
    new_review = db.reviews.find_one({"_id": result.inserted_id})
    new_review["id"] = str(new_review["_id"])
    return new_review


@router.get("/{movie_id}", response_model=List[ReviewResponse])
async def get_movie_reviews(movie_id: str):
    reviews = list(db.reviews.find({"movie_id": movie_id}))
    for r in reviews:
        r["id"] = str(r["_id"])
    return reviews
