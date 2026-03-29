import os
import json
import google.generativeai as genai
from app.db.database import db
from bson import ObjectId
from datetime import datetime

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# ─── Build a rich user profile from all available signals ────────────────────

def build_user_profile(user_id: str) -> dict:
    user_doc = db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        return {}

    profile = {
        "username": user_doc.get("username", ""),
        "explicit_genres": [],      # From preference settings
        "loved_genres": [],         # From high-rated reviews
        "disliked_genres": [],      # From low-rated reviews
        "wishlist_genres": [],      # From wishlist
        "watched_movie_ids": set(), # Already seen — exclude these
        "friend_loved_movies": [],  # Titles friends loved
        "preferred_language": user_doc.get("language_preference", ""),
        "review_count": 0,
    }

    # 1. Explicit genre preferences from profile
    fav_genre_ids = user_doc.get("favorite_genres", [])
    for gid in fav_genre_ids:
        try:
            g = db.genres.find_one({"_id": ObjectId(gid)})
            if g:
                profile["explicit_genres"].append(g["name"])
        except Exception:
            pass

    # 2. Reviews — split into loved vs disliked
    reviews = list(db.reviews.find({"user_id": user_id}))
    profile["review_count"] = len(reviews)
    for rev in reviews:
        try:
            mid = ObjectId(rev["movie_id"])
            profile["watched_movie_ids"].add(str(mid))
            movie = db.movies.find_one({"_id": mid})
            if not movie:
                continue
            genres = []
            for gid in movie.get("genre_ids", []):
                g = db.genres.find_one({"_id": ObjectId(gid)})
                if g:
                    genres.append(g["name"])
            rating = rev.get("rating", 3)
            if rating >= 4:
                profile["loved_genres"].extend(genres)
            elif rating <= 2:
                profile["disliked_genres"].extend(genres)
        except Exception:
            pass

    # 3. Wishlist
    wishlist = list(db.wishlist.find({"user_id": user_id}))
    for w in wishlist:
        try:
            mid = ObjectId(w["movie_id"])
            profile["watched_movie_ids"].add(str(mid))
            movie = db.movies.find_one({"_id": mid})
            if not movie:
                continue
            for gid in movie.get("genre_ids", []):
                g = db.genres.find_one({"_id": ObjectId(gid)})
                if g:
                    profile["wishlist_genres"].append(g["name"])
        except Exception:
            pass

    # 4. Friends' loved movies (following list)
    friend_ids = user_doc.get("following", [])
    for fid in friend_ids[:10]:  # limit to 10 friends
        try:
            friend_reviews = list(db.reviews.find({"user_id": fid, "rating": {"$gte": 4}}).limit(5))
            for rev in friend_reviews:
                movie = db.movies.find_one({"_id": ObjectId(rev["movie_id"])})
                if movie:
                    profile["friend_loved_movies"].append(movie["title"])
        except Exception:
            pass

    # Deduplicate genre lists
    profile["explicit_genres"]  = list(set(profile["explicit_genres"]))
    profile["loved_genres"]     = list(set(profile["loved_genres"]))
    profile["disliked_genres"]  = list(set(profile["disliked_genres"]))
    profile["wishlist_genres"]  = list(set(profile["wishlist_genres"]))
    profile["watched_movie_ids"] = list(profile["watched_movie_ids"])

    return profile


# ─── Fetch candidate movies for Gemini to rank ───────────────────────────────

def get_candidate_movies(exclude_ids: list, limit: int = 60) -> list:
    """Return a curated pool of movies for Gemini to choose from."""
    try:
        exclude_obj = [ObjectId(i) for i in exclude_ids if i]
    except Exception:
        exclude_obj = []

    # Get a diverse pool: top rated + some variety
    movies = list(
        db.movies.find({"_id": {"$nin": exclude_obj}})
        .sort("imdb_rating", -1)
        .limit(limit)
    )
    result = []
    for m in movies:
        genre_names = []
        for gid in m.get("genre_ids", []):
            try:
                g = db.genres.find_one({"_id": ObjectId(gid)})
                if g:
                    genre_names.append(g["name"])
            except Exception:
                pass
        result.append({
            "id": str(m["_id"]),
            "title": m.get("title", ""),
            "genres": genre_names,
            "rating": m.get("imdb_rating", 0),
            "language": m.get("language", ""),
            "year": (m.get("release_date") or "")[:4],
            "overview": (m.get("overview") or "")[:200],
        })
    return result


# ─── Gemini-powered ranking ───────────────────────────────────────────────────

def rank_with_gemini(profile: dict, candidates: list, limit: int = 15) -> list:
    """Send user profile + candidates to Gemini and get back ranked IDs."""
    candidate_text = "\n".join(
        f'  - id:{m["id"]} | {m["title"]} ({m["year"]}) | Genres: {", ".join(m["genres"])} | Rating: {m["rating"]} | Language: {m["language"]}'
        for m in candidates
    )

    prompt = f"""You are a world-class movie recommendation engine.

USER PROFILE:
- Username: {profile.get("username")}
- Preferred genres (explicit): {", ".join(profile.get("explicit_genres", [])) or "none set"}
- Genres from movies they LOVED (rated 4-5★): {", ".join(profile.get("loved_genres", [])) or "none yet"}
- Genres from movies they DISLIKED (rated 1-2★): {", ".join(profile.get("disliked_genres", [])) or "none"}  
- Genres from their wishlist: {", ".join(profile.get("wishlist_genres", [])) or "none"}
- Preferred language: {profile.get("preferred_language") or "any"}
- Number of reviews written: {profile.get("review_count", 0)}
- Movies loved by their friends: {", ".join(profile.get("friend_loved_movies", [])) or "none"}

INSTRUCTIONS:
1. Pick exactly {limit} movies from the candidates list below that this user would most enjoy.
2. Avoid movies with genres the user has disliked.
3. Prioritize genres the user has loved and their wishlist interest.
4. Mix in some social discovery from friends' loved movies.
5. Maintain variety — don't pick all the same genre.
6. Write a SHORT (1 sentence) reason for each pick.

CANDIDATE MOVIES:
{candidate_text}

Respond ONLY with valid JSON in this exact format — no markdown, no explanation outside the JSON:
{{
  "picks": [
    {{"id": "<movie_id>", "reason": "<one sentence why>"}},
    ...
  ]
}}"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text)
        return data.get("picks", [])
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return []


# ─── Main entry point ─────────────────────────────────────────────────────────

async def generate_smart_recommendations(user_id: str, limit: int = 15):
    """Full pipeline: profile → candidates → Gemini → cache → return."""
    profile = build_user_profile(user_id)
    if not profile:
        return []

    exclude_ids = profile.get("watched_movie_ids", [])
    candidates = get_candidate_movies(exclude_ids, limit=60)

    if not candidates:
        return []

    # Try Gemini ranking
    picks = rank_with_gemini(profile, candidates, limit=limit)

    # Map picks back to full movie docs
    pick_map = {c["id"]: c for c in candidates}
    results = []

    for pick in picks:
        pid = pick.get("id")
        if pid and pid in pick_map:
            movie = pick_map[pid].copy()
            movie["ai_reason"] = pick.get("reason", "")
            # Fetch full doc for response model compatibility
            try:
                full = db.movies.find_one({"_id": ObjectId(pid)})
                if full:
                    full["id"] = str(full["_id"])
                    full["ai_reason"] = pick.get("reason", "")
                    # Expand genres
                    full["genres"] = []
                    for gid in full.get("genre_ids", []):
                        try:
                            g = db.genres.find_one({"_id": ObjectId(gid)})
                            if g:
                                g["id"] = str(g["_id"])
                                full["genres"].append(g)
                        except Exception:
                            pass
                    results.append(full)
            except Exception:
                pass

    # Cache results with reasons
    db.user_recommendations.update_one(
        {"user_id": user_id},
        {"$set": {
            "movies": [{"movie_id": r["id"], "ai_reason": r.get("ai_reason", "")} for r in results],
            "generated_at": datetime.utcnow(),
        }},
        upsert=True,
    )

    return results


async def get_cached_recommendations(user_id: str):
    """Return cached recommendations or generate fresh ones."""
    from datetime import timedelta
    cache = db.user_recommendations.find_one({"user_id": user_id})

    if cache:
        # Cache valid for 12 hours
        age = datetime.utcnow() - cache.get("generated_at", datetime.utcnow())
        if age < timedelta(hours=12):
            # Hydrate from cache
            results = []
            for entry in cache.get("movies", []):
                try:
                    full = db.movies.find_one({"_id": ObjectId(entry["movie_id"])})
                    if full:
                        full["id"] = str(full["_id"])
                        full["ai_reason"] = entry.get("ai_reason", "")
                        full["genres"] = []
                        for gid in full.get("genre_ids", []):
                            try:
                                g = db.genres.find_one({"_id": ObjectId(gid)})
                                if g:
                                    g["id"] = str(g["_id"])
                                    full["genres"].append(g)
                            except Exception:
                                pass
                        results.append(full)
                except Exception:
                    pass
            if results:
                return results

    # Cache miss or stale — generate fresh
    return await generate_smart_recommendations(user_id)
