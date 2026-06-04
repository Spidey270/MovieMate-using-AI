from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from app.db.database import db
from bson import ObjectId
from datetime import datetime, timedelta
from collections import Counter

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/personal")
async def get_personal_stats(current_user: dict = Depends(get_current_user)):
    """Get personal viewing statistics."""
    user_id = str(current_user["_id"])

    # Calculate stats
    stats = {}

    # 1. Total movies watched
    watch_history = list(db.watch_history.find({"user_id": user_id}))
    watched_movie_ids = list(set([w["movie_id"] for w in watch_history]))
    stats["total_watched"] = len(watched_movie_ids)

    # 2. Total watch time (sum of movie runtimes)
    total_minutes = 0
    for movie_id in watched_movie_ids:
        try:
            movie = db.movies.find_one({"_id": ObjectId(movie_id)})
            if movie and movie.get("runtime"):
                total_minutes += movie["runtime"]
        except:
            pass
    stats["total_watch_time_minutes"] = total_minutes
    stats["total_watch_time_hours"] = round(total_minutes / 60, 1)

    # 3. Favorite genres (from watched movies)
    genre_counter = Counter()
    for movie_id in watched_movie_ids:
        try:
            movie = db.movies.find_one({"_id": ObjectId(movie_id)})
            if movie:
                for genre_id in movie.get("genre_ids", []):
                    genre = db.genres.find_one({"_id": ObjectId(genre_id)})
                    if genre:
                        genre_counter[genre["name"]] += 1
        except:
            pass

    top_genres = [{"name": name, "count": count} for name, count in genre_counter.most_common(5)]
    stats["favorite_genres"] = top_genres

    # 4. Rating distribution
    reviews = list(db.reviews.find({"user_id": user_id}))
    rating_dist = Counter([r["rating"] for r in reviews])
    stats["rating_distribution"] = {
        "1_star": rating_dist.get(1, 0),
        "2_star": rating_dist.get(2, 0),
        "3_star": rating_dist.get(3, 0),
        "4_star": rating_dist.get(4, 0),
        "5_star": rating_dist.get(5, 0),
    }
    stats["total_reviews"] = len(reviews)
    stats["average_rating"] = round(sum([r["rating"] for r in reviews]) / len(reviews), 1) if reviews else 0

    # 5. Watch streaks
    watch_dates = sorted([w["last_watched_at"] for w in watch_history if "last_watched_at" in w])
    current_streak = 0
    longest_streak = 0

    if watch_dates:
        streak = 1
        for i in range(1, len(watch_dates)):
            prev_date = watch_dates[i-1].date() if hasattr(watch_dates[i-1], 'date') else watch_dates[i-1]
            curr_date = watch_dates[i].date() if hasattr(watch_dates[i], 'date') else watch_dates[i]

            if (curr_date - prev_date).days == 1:
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1

        longest_streak = max(longest_streak, streak)

        # Check if current streak is active
        last_watch = watch_dates[-1].date() if hasattr(watch_dates[-1], 'date') else watch_dates[-1]
        today = datetime.utcnow().date()
        if (today - last_watch).days <= 1:
            current_streak = streak

    stats["current_streak"] = current_streak
    stats["longest_streak"] = longest_streak

    # 6. Monthly watch history
    monthly_watches = {}
    for watch in watch_history:
        watch_date = watch.get("last_watched_at", watch.get("started_at"))
        if watch_date:
            month_key = watch_date.strftime("%Y-%m") if hasattr(watch_date, 'strftime') else str(watch_date)[:7]
            monthly_watches[month_key] = monthly_watches.get(month_key, 0) + 1

    stats["monthly_watches"] = [{"month": k, "count": v} for k, v in sorted(monthly_watches.items())]

    # 7. Additional stats
    wishlist_count = db.wishlist.count_documents({"user_id": user_id})
    stats["wishlist_count"] = wishlist_count

    friends_count = db.friends.count_documents({"user_id": user_id, "status": "accepted"})
    stats["friends_count"] = friends_count

    return stats


@router.get("/year-in-review/{year}")
async def get_year_in_review(year: int, current_user: dict = Depends(get_current_user)):
    """Get year-in-review stats."""
    user_id = str(current_user["_id"])

    # Filter watch history by year
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31, 23, 59, 59)

    watch_history = list(db.watch_history.find({
        "user_id": user_id,
        "last_watched_at": {"$gte": start_date, "$lte": end_date}
    }))

    if not watch_history:
        return {"message": f"No activity in {year}"}

    watched_movie_ids = list(set([w["movie_id"] for w in watch_history]))

    # Calculate year stats
    stats = {
        "year": year,
        "total_movies": len(watched_movie_ids),
        "total_hours": 0,
        "top_genre": None,
        "most_watched_month": None,
        "favorite_movie": None,
    }

    # Total hours
    total_minutes = 0
    movies_data = []
    for movie_id in watched_movie_ids:
        try:
            movie = db.movies.find_one({"_id": ObjectId(movie_id)})
            if movie:
                movies_data.append(movie)
                if movie.get("runtime"):
                    total_minutes += movie["runtime"]
        except:
            pass

    stats["total_hours"] = round(total_minutes / 60, 1)

    # Top genre
    genre_counter = Counter()
    for movie in movies_data:
        for genre_id in movie.get("genre_ids", []):
            try:
                genre = db.genres.find_one({"_id": ObjectId(genre_id)})
                if genre:
                    genre_counter[genre["name"]] += 1
            except:
                pass

    if genre_counter:
        stats["top_genre"] = genre_counter.most_common(1)[0][0]

    # Most watched month
    monthly_counter = Counter()
    for watch in watch_history:
        watch_date = watch.get("last_watched_at")
        if watch_date:
            month_name = watch_date.strftime("%B") if hasattr(watch_date, 'strftime') else "Unknown"
            monthly_counter[month_name] += 1

    if monthly_counter:
        stats["most_watched_month"] = monthly_counter.most_common(1)[0][0]

    # Favorite movie (highest rated in that year)
    year_reviews = list(db.reviews.find({
        "user_id": user_id,
        "created_at": {"$gte": start_date, "$lte": end_date}
    }).sort("rating", -1).limit(1))

    if year_reviews:
        review = year_reviews[0]
        try:
            movie = db.movies.find_one({"_id": ObjectId(review["movie_id"])})
            if movie:
                stats["favorite_movie"] = {
                    "id": str(movie["_id"]),
                    "title": movie["title"],
                    "rating": review["rating"]
                }
        except:
            pass

    return stats
