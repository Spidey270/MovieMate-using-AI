from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.db.database import db
from app.models.user import UserCreate, UserResponse, UserLogin
from app.core import security, config
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

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


@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    data: dict,  # Expecting {"username": ?, "email": ?, "current_password": ?, "new_password": ?}
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["_id"]
    update_data = {}
    
    username = data.get("username")
    email = data.get("email")
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    # Verify current password if changing email or password
    if email or new_password:
        if not current_password:
            raise HTTPException(status_code=400, detail="Current password required to change email or password")
        if not security.verify_password(current_password, current_user.get("hashed_password", "")):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Check username availability
    if username and username != current_user.get("username"):
        if db.users.find_one({"username": username}):
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data["username"] = username
    
    # Check email availability
    if email and email != current_user.get("email"):
        if db.users.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        update_data["email"] = email
    
    # Update password
    if new_password:
        update_data["hashed_password"] = security.get_password_hash(new_password)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No changes provided")
    
    db.users.update_one({"_id": user_id}, {"$set": update_data})

    updated_user = db.users.find_one({"_id": user_id})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user


def send_verification_email(to_email: str, token: str):
    """Send verification email"""
    verify_url = f"{config.settings.FRONTEND_URL}/verify-email?token={token}"
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e50914, #b20710); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">MovieMate</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
            <h2>Verify Your Email</h2>
            <p>Welcome to MovieMate! Please verify your email address to get started.</p>
            <a href="{verify_url}" style="display: inline-block; background: #e50914; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Verify Email
            </a>
            <p style="color: #666; font-size: 14px;">Or copy this link: {verify_url}</p>
        </div>
    </body>
    </html>
    """
    
    if os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"):
        try:
            msg = MIMEMultipart()
            msg["From"] = config.settings.FROM_EMAIL
            msg["To"] = to_email
            msg["Subject"] = "Verify your MovieMate account"
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(config.settings.SMTP_HOST, config.settings.SMTP_PORT) as server:
                server.starttls()
                server.login(config.settings.SMTP_USER, config.settings.SMTP_PASSWORD)
                server.sendmail(config.settings.FROM_EMAIL, to_email, msg.as_string())
        except Exception as e:
            print(f"Email send failed: {e}")
    else:
        print(f"[DEV] Verification link: {verify_url}")


@router.post("/resend-verification")
async def resend_verification_email(current_user: dict = Depends(get_current_user)):
    """Resend verification email"""
    if current_user.get("is_verified", False):
        return {"message": "Email already verified"}
    
    email = current_user.get("email")
    token = security.create_email_verification_token(email)
    send_verification_email(email, token)
    return {"message": "Verification email sent"}


@router.post("/verify-email")
async def verify_email_endpoint(token: str):
    """Verify email with token"""
    email = security.verify_email_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    result = db.users.update_one(
        {"email": email}, 
        {"$set": {"is_verified": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="User not found or already verified")
    
    return {"message": "Email verified successfully!"}
