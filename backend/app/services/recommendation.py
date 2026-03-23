from app.db.database import db
from bson import ObjectId


def calculate_match_score(movie_genres, user_genres):
    # Simple overlap score
    if not user_genres:
        return 0
    overlap = set(movie_genres) & set(user_genres)
    return len(overlap)


async def recommend_movies_content_based(user_id: str, limit: int = 10):
    # 1. Get User Preferences (Wishlist + High Rated Reviews)
    user_genres = []

    # From Wishlist
    wishlist_items = list(db.wishlist.find({"user_id": user_id}))
    wishlist_movie_ids = [ObjectId(w["movie_id"]) for w in wishlist_items]

    # From Reviews (Rating >= 4)
    reviews = list(db.reviews.find({"user_id": user_id, "rating": {"$gte": 4}}))
    reviewed_movie_ids = [ObjectId(r["movie_id"]) for r in reviews]

    # Combine Seed Movies
    seed_movie_ids = list(set(wishlist_movie_ids + reviewed_movie_ids))

    # IDs to exclude (already seen/wishlisted)
    exclude_ids = seed_movie_ids

    # Fetch Seed Movies to extract genres
    seed_movies = list(db.movies.find({"_id": {"$in": seed_movie_ids}}))

    for m in seed_movies:
        user_genres.extend(m.get("genre_ids", []))

    # Also fetch user's explicit favorites from profile
    user_doc = db.users.find_one({"_id": ObjectId(user_id)})
    if user_doc:
        user_genres.extend(user_doc.get("favorite_genres", []))

    if not user_genres:
        # Cold start: Return popular or random high rated
        return list(db.movies.find().sort("imdb_rating", -1).limit(limit))

    # 2. Find Candidates (not in exclude list)
    # We look for movies that have at least one of the user's preferred genres
    candidates = list(
        db.movies.find(
            {"_id": {"$nin": exclude_ids}, "genre_ids": {"$in": user_genres}}
        )
    )

    # 3. Score Candidates
    scored_candidates = []
    for m in candidates:
        score = calculate_match_score(m.get("genre_ids", []), user_genres)
        # Add slight boost for IMDb rating
        rating_boost = (m.get("imdb_rating", 0) or 0) * 0.1
        final_score = score + rating_boost
        scored_candidates.append((m, final_score))

    # 4. Sort and Return
    scored_candidates.sort(key=lambda x: x[1], reverse=True)

    recommendations = [item[0] for item in scored_candidates[:limit]]

    # Format IDs
    for r in recommendations:
        r["id"] = str(r["_id"])

    return recommendations
