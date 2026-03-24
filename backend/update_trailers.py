"""
update_trailers.py
Automatically finds YouTube trailers for all movies missing a trailer_url
and updates the MongoDB database.
"""
import os
import re
import time
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

db = MongoClient(os.getenv("MONGO_URI"))["moviemate"]

def find_youtube_trailer(title, year=None):
    """Search YouTube for the official trailer of a movie."""
    query = f"{title} {year} official trailer" if year else f"{title} official trailer"
    search_url = "https://www.youtube.com/results"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        )
    }
    try:
        resp = requests.get(search_url, params={"search_query": query}, headers=headers, timeout=10)
        # Extract all video IDs from the HTML
        video_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', resp.text)
        if video_ids:
            vid_id = video_ids[0]
            return f"https://www.youtube.com/watch?v={vid_id}"
    except Exception as e:
        print(f"  ⚠ Search failed: {e}")
    return None

# Get ALL movies (overwrite existing placeholder/wrong trailers)
movies = list(db.movies.find({}, {"title": 1, "release_date": 1}))

print(f"Found {len(movies)} movies without trailers.\n")

updated = 0
failed = 0

for i, movie in enumerate(movies):
    title = movie["title"]
    year = movie.get("release_date", "")[:4] if movie.get("release_date") else None
    print(f"[{i+1}/{len(movies)}] {title} ({year or '?'}) ...", end=" ", flush=True)
    
    trailer_url = find_youtube_trailer(title, year)
    
    if trailer_url:
        db.movies.update_one({"_id": movie["_id"]}, {"$set": {"trailer_url": trailer_url}})
        print(f"✓ {trailer_url}")
        updated += 1
    else:
        print("✗ not found")
        failed += 1
    
    # Be polite to YouTube — avoid rate limiting
    time.sleep(1.2)

print(f"\n✅ Done! Updated: {updated} | Failed: {failed}")
