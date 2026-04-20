from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.db.database import db
from app.models.user import UserCreate, UserResponse, UserLogin
from app.core import security, config
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if token is None:
            raise credentials_exception
        payload = jwt.decode(
            token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception

    # Convert ObjectId to str for response compatibility if needed,
    # but strictly we usually return a model.
    # For now, just return the dict, ensuring _id is handled if used.
    return user


async def get_current_user_optional(token: str = Depends(oauth2_scheme)):
    try:
        if not token:
            return None
        payload = jwt.decode(
            token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = db.users.find_one({"_id": ObjectId(user_id)})
    return user


async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges"
        )
    return current_user


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user exists
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = security.get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]

    result = db.users.insert_one(user_dict)

    # Return created user
    new_user = db.users.find_one({"_id": result.inserted_id})
    # Map _id to id for response
    new_user["id"] = str(new_user["_id"])
    return new_user


@router.post("/login")
async def login(user_credentials: UserLogin):
    user = db.users.find_one({"email": user_credentials.email})
    if not user or not security.verify_password(
        user_credentials.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    current_user["id"] = str(current_user["_id"])
    return current_user


@router.put("/preferences", response_model=UserResponse)
async def update_preferences(
    prefs: dict,  # Expecting {"genres": [], "languages": []}
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
    update_data = {}
    if "genres" in prefs:
        update_data["favorite_genres"] = prefs["genres"]
    if "languages" in prefs:
        update_data["favorite_languages"] = prefs["languages"]

    if not update_data:
        raise HTTPException(status_code=400, detail="No preferences provided")

    db.users.update_one({"_id": user_id}, {"$set": update_data})

    updated_user = db.users.find_one({"_id": user_id})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user


@router.put("/profile-picture", response_model=UserResponse)
async def update_profile_picture(
    data: dict,  # Expecting {"profile_picture": "url or base64"}
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
    profile_picture = data.get("profile_picture")

    if not profile_picture:
        raise HTTPException(status_code=400, detail="No profile picture provided")

    db.users.update_one({"_id": user_id}, {"$set": {"profile_picture": profile_picture}})

    updated_user = db.users.find_one({"_id": user_id})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user
