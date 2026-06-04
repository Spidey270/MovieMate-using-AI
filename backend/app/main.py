from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import (
    auth,
    movies,
    genres,
    reviews,
    wishlist,
    friends,
    chat,
    notifications,
    recommendations,
    users,
    admin,
    streaming,
    comments,
    search,
)
from app.routers import social_feed, leaderboards, analytics, collections, achievements, challenges
from app.db.indexes import create_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database indexes
    print("🚀 Starting MovieMate API...")
    create_indexes()
    yield
    # Shutdown
    print("👋 Shutting down MovieMate API...")


app = FastAPI(title="MovieMate API", version="1.0.0", lifespan=lifespan)


# Health check endpoint for deployment
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "healthy", "service": "MovieMate API", "version": "1.0.0"}

import os

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://movie-mate-using-ai.vercel.app",
    "https://movie-mate-using-ai.vercel.app/"
]

# Add production URL if provided
prod_origin = os.getenv("FRONTEND_URL")
if prod_origin:
    # Aggressively strip trailing slashes to prevent arbitrary CORS mismatches
    origins.append(prod_origin.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(genres.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(friends.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(recommendations.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(streaming.router)
app.include_router(comments.router)
app.include_router(search.router)
app.include_router(social_feed.router)
app.include_router(leaderboards.router)
app.include_router(analytics.router)
app.include_router(collections.router)
app.include_router(achievements.router)
app.include_router(challenges.router)

# Register websocket explicitly on app to avoid APIRouter prefix bugs/conflicts
app.websocket("/chat/ws/{client_id}")(chat.websocket_endpoint)


@app.get("/")
def root():
    return {"status": "MovieMate API is running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
