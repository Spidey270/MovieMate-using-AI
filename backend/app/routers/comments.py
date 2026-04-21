from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.models.comment import CommentCreate, CommentResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/movie/{movie_id}", response_model=List[CommentResponse])
async def get_movie_comments(movie_id: str):
    comments = list(
        db.comments.find({"movie_id": movie_id, "parent_id": None})
        .sort("created_at", -1)
    )
    
    for comment in comments:
        comment["id"] = str(comment["_id"])
        # Get replies for each comment
        replies = list(
            db.comments.find({"parent_id": comment["id"]})
            .sort("created_at", 1)
        )
        for reply in replies:
            reply["id"] = str(reply["_id"])
        comment["replies"] = replies
    
    return comments


@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    comment_doc = {
        "movie_id": comment_data.movie_id,
        "user_id": str(current_user["_id"]),
        "username": current_user.get("username", "Anonymous"),
        "content": comment_data.content,
        "parent_id": comment_data.parent_id,
        "created_at": datetime.utcnow(),
    }
    
    result = db.comments.insert_one(comment_doc)
    comment_doc["_id"] = result.inserted_id
    comment_doc["id"] = str(result.inserted_id)
    comment_doc["replies"] = []
    
    return comment_doc


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    comment = db.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["user_id"] != user_id and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Delete comment and its replies
    db.comments.delete_many({"$or": [{"_id": ObjectId(comment_id)}, {"parent_id": comment_id}]})
    
    return {"message": "Comment deleted"}
