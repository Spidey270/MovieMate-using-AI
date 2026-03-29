"""
update_gallery_web.py
Scrapes Bing Images for real movie stills and updates gallery_images in MongoDB.
No API key needed — uses public Bing image search HTML parsing.
"""
import os
import re
import time
import json
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
db = MongoClient(os.getenv("MONGO_URI"))["moviemate"]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

def search_bing_images(query, max_results=6):
    """Scrape Bing image search for the given query and return image URLs."""
    url = "https://www.bing.com/images/search"
    params = {"q": query, "form": "HDRSC2", "first": 1, "tsc": "ImageHoverTitle"}
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=10)
        # Bing embeds image metadata as JSON strings in the page
        # Pattern: "murl":"https://..."
        urls = re.findall(r'"murl":"(https?://[^"]+\.(?:jpg|jpeg|png|webp))"', resp.text)
        return list(dict.fromkeys(urls))[:max_results]  # deduplicate, cap
    except Exception as e:
        print(f"\n  ⚠ Bing search error: {e}")
        return []

def is_valid_image(url):
    try:
        r = requests.head(url, timeout=5, allow_redirects=True, headers=HEADERS)
        ct = r.headers.get("content-type", "")
        size = int(r.headers.get("content-length", 0))
        return r.status_code == 200 and "image" in ct and size > 8000
    except Exception:
        return False

movies = list(db.movies.find({}, {"title": 1, "release_date": 1, "poster_url": 1, "backdrop_url": 1}))
print(f"Processing {len(movies)} movies...\n")

for i, movie in enumerate(movies):
    title = movie["title"]
    year = (movie.get("release_date") or "")[:4] or ""
    print(f"[{i+1}/{len(movies)}] {title} ({year}) ...", end=" ", flush=True)

    # Always start with existing owned images
    gallery = []
    if movie.get("backdrop_url"):
        gallery.append({"url": movie["backdrop_url"], "label": "Backdrop"})
    if movie.get("poster_url"):
        gallery.append({"url": movie["poster_url"], "label": "Poster"})

    # Try two Bing queries for variety
    raw_urls = []
    for query in [
        f"{title} {year} movie stills scene",
        f"{title} {year} film promotional photo",
    ]:
        raw_urls += search_bing_images(query, max_results=5)
        if len(raw_urls) >= 8:
            break
        time.sleep(0.8)

    # Validate each URL and add to gallery
    seen = set(x["url"] for x in gallery)
    web_count = 0
    for url in raw_urls:
        if url in seen:
            continue
        if is_valid_image(url):
            gallery.append({"url": url, "label": "Movie Still"})
            seen.add(url)
            web_count += 1
        if web_count >= 6:
            break

    db.movies.update_one({"_id": movie["_id"]}, {"$set": {"gallery_images": gallery}})
    print(f"✓ {len(gallery)} total ({web_count} web stills)")
    time.sleep(1.2)

print("\n✅ All done!")
