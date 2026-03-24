"""
update_gallery.py
Extracts YouTube video IDs from existing trailer_urls and writes
multiple high-quality thumbnail URLs as gallery_images into MongoDB.
YouTube thumbnails are free and always match the movie trailer.
"""
import os
import re
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
db = MongoClient(os.getenv("MONGO_URI"))["moviemate"]

def extract_video_id(url):
    if not url:
        return None
    # youtu.be/VIDEO_ID
    m = re.search(r'youtu\.be/([a-zA-Z0-9_-]{11})', url)
    if m:
        return m.group(1)
    # youtube.com/watch?v=VIDEO_ID or /embed/VIDEO_ID
    m = re.search(r'(?:[?&]v=|/embed/)([a-zA-Z0-9_-]{11})', url)
    if m:
        return m.group(1)
    return None

def is_valid_thumbnail(url):
    """Check a thumbnail URL actually resolves to a real image (not a 404 placeholder)."""
    try:
        r = requests.head(url, timeout=5, allow_redirects=True)
        return r.status_code == 200 and int(r.headers.get("content-length", 0)) > 5000
    except Exception:
        return False

def get_gallery_images(video_id, poster_url=None, backdrop_url=None):
    """Build a list of verified image URLs for the gallery."""
    images = []

    # Always add poster and backdrop first if available
    if backdrop_url:
        images.append({"url": backdrop_url, "label": "Backdrop"})
    if poster_url:
        images.append({"url": poster_url, "label": "Poster"})

    if video_id:
        # YouTube thumbnail sizes in descending quality
        thumb_candidates = [
            (f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg", "Trailer Still"),
            (f"https://img.youtube.com/vi/{video_id}/sddefault.jpg",     "Trailer Still"),
            (f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",     "Trailer Still"),
            (f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg",     "Trailer Still"),
            (f"https://img.youtube.com/vi/{video_id}/1.jpg",             "Scene 1"),
            (f"https://img.youtube.com/vi/{video_id}/2.jpg",             "Scene 2"),
            (f"https://img.youtube.com/vi/{video_id}/3.jpg",             "Scene 3"),
        ]
        for url, label in thumb_candidates:
            if is_valid_thumbnail(url):
                images.append({"url": url, "label": label})

    return images

movies = list(db.movies.find({}, {"title": 1, "trailer_url": 1, "poster_url": 1, "backdrop_url": 1}))
print(f"Processing {len(movies)} movies...\n")

updated = 0
for i, movie in enumerate(movies):
    title = movie["title"]
    video_id = extract_video_id(movie.get("trailer_url"))
    print(f"[{i+1}/{len(movies)}] {title} (vid: {video_id or 'none'}) ...", end=" ", flush=True)

    gallery = get_gallery_images(
        video_id,
        poster_url=movie.get("poster_url"),
        backdrop_url=movie.get("backdrop_url"),
    )

    db.movies.update_one({"_id": movie["_id"]}, {"$set": {"gallery_images": gallery}})
    print(f"✓ {len(gallery)} images")
    updated += 1

print(f"\n✅ Done! Updated {updated} movies with gallery images.")
