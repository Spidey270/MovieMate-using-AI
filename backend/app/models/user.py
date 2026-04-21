from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    favorite_genres: List[str] = []
    favorite_languages: List[str] = []
    is_admin: bool = False
    profile_picture: str | None = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    hashed_password: str


class UserResponse(UserBase):
    id: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
