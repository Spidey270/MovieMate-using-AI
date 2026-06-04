from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Define all available achievements
ACHIEVEMENTS = [
    {
        "id": "first_watch",
        "name": "First Watch",
        "description": "Watch your first movie",
        "icon": "🎬",
        "requirement": 1,
        "type": "watch_count"
    },
    {
        "id": "movie_buff",
        "name": "Movie Buff",
        "description": "Watch 10 movies",
        "icon": "🍿",
        "requirement": 10,
        "type": "watch_count"
    },
    {
        "id": "cinema_enthusiast",
        "name": "Cinema Enthusiast",
        "description": "Watch 50 movies",
        "icon": "🎥",
        "requirement": 50,
        "type": "watch_count"
    },
    {
        "id": "film_fanatic",
        "name": "Film Fanatic",
        "description": "Watch 100 movies",
        "icon": "🏆",
        "requirement": 100,
        "type": "watch_count"
    },
    {
        "id": "first_review",
        "name": "First Review",
        "description": "Write your first review",
        "icon": "✍️",
        "requirement": 1,
        "type": "review_count"
    },
    {
        "id": "critic",
        "name": "Critic",
        "description": "Write 25 reviews",
        "icon": "📝",
        "requirement": 25,
        "type": "review_count"
    },
    {
        "id": "super_critic",
        "name": "Super Critic",
        "description": "Write 100 reviews",
        "icon": "🌟",
        "requirement": 100,
        "type": "review_count"
    },
    {
        "id": "social_butterfly",
        "name": "Social Butterfly",
        "description": "Add 10 friends",
        "icon": "👥",
        "requirement": 10,
        "type": "friend_count"
    },
    {
        "id": "genre_explorer",
        "name": "Genre Explorer",
        "description": "Watch movies from 5 different genres",
        "icon": "🎭",
        "requirement": 5,
        "type": "genre_variety"
    },
    {
        "id": "binge_watcher",
        "name": "Binge Watcher",
        "description": "Watch 3 movies in one day",
        "icon": "📺",
        "requirement": 3,
        "type": "daily_watch"
    },
    {
        "id": "consistent_viewer",
        "name": "Consistent Viewer",
        "description": "Watch movies 7 days in a row",
        "icon": "🔥",
        "requirement": 7,
        "type": "watch_streak"
    },
    {
        "id": "wishlist_builder",
        "name": "Wishlist Builder",
        "description": "Add 20 movies to your wishlist",
        "icon": "📋",
        "requirement": 20,
        "type": "wishlist_count"
    },
]


class UserAchievement(BaseModel):
    user_id: str
    achievement_id: str
    unlocked_at: datetime
    progress: int = 0
