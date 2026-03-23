from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from app.models.user import PyObjectId


class GenreBase(BaseModel):
    name: str


class GenreCreate(GenreBase):
    pass


class GenreResponse(GenreBase):
    id: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}


class MovieBase(BaseModel):
    title: str = Field(..., min_length=1)
    overview: str
    release_date: Optional[str] = None  # YYYY-MM-DD
    runtime: Optional[int] = None  # in minutes
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    imdb_rating: Optional[float] = None
    language: str = "English"
    genre_ids: List[str] = []


class MovieCreate(MovieBase):
    pass


class MovieResponse(MovieBase):
    id: str | None = None
    genres: List[GenreResponse] = []  # Expanded genre details

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
