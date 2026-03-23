import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["moviemate"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

demo_users = [
    {"username": "moviebuff99", "email": "moviebuff99@example.com", "is_admin": False},
    {"username": "critic_cindy", "email": "cindy@example.com", "is_admin": False},
    {"username": "popcorn_pete", "email": "pete@example.com", "is_admin": False},
    {"username": "admin_demo", "email": "admin@example.com", "is_admin": True},
]

print("Seeding Demo Users...")
inserted_users = []
for u in demo_users:
    existing = db.users.find_one({"username": u["username"]})
    if not existing:
        u["hashed_password"] = pwd_context.hash("password123")
        u["favorite_genres"] = []
        u["language_preference"] = "English"
        res = db.users.insert_one(u)
        u["_id"] = res.inserted_id
        inserted_users.append(u)
    else:
        inserted_users.append(existing)

print("Seeding Reviews & Wishlists...")
movies = list(db.movies.find().limit(30))

if not movies:
    print("Wait! Your database has no movies. Please run seed_db.py first!")
    exit()

reviews_pool = [
    "Absolutely blew my mind! A cinematic masterpiece.",
    "Great visuals, but the pacing was a bit slow in the second act.",
    "One of my all-time favorites. The soundtrack is incredible.",
    "A bit overrated, to be honest. But still worth a watch.",
    "Fantastic performances across the board. Highly recommended!",
    "I was on the edge of my seat the entire time!",
    "Beautiful storytelling and breathtaking cinematography.",
    "A fun, popcorn flick. Perfect for a Friday night.",
    "The plot twist at the end was completely unexpected!",
    "I've seen it five times and it never gets old."
]

# Wipe old fake data so multiple runs don't stack thousands of reviews
db.reviews.delete_many({"username": {"$in": [u["username"] for u in demo_users]}})

for u in inserted_users:
    # 5 random reviews per user
    sampled_movies = random.sample(movies, 5)
    for m in sampled_movies:
        db.reviews.insert_one({
            "movie_id": str(m["_id"]),
            "user_id": str(u["_id"]),
            "username": u["username"],
            "rating": random.choice([4, 4.5, 5]),
            "text": random.choice(reviews_pool),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30))
        })

    # 3 random wishlists per user
    wishlist_movies = random.sample(movies, 3)
    for w in wishlist_movies:
        if not db.wishlist.find_one({"user_id": str(u["_id"]), "movie_id": str(w["_id"])}):
            db.wishlist.insert_one({
                "user_id": str(u["_id"]),
                "movie_id": str(w["_id"]),
                "added_at": datetime.utcnow()
            })

print("Demo data successfully deployed!")
