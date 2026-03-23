from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
)

app = FastAPI(title="MovieMate API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
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

# Register websocket explicitly on app to avoid APIRouter prefix bugs/conflicts
app.websocket("/chat/ws/{client_id}")(chat.websocket_endpoint)


@app.get("/")
def root():
    return {"status": "MovieMate API is running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
