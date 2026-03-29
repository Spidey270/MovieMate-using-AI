"""
find_archive_movies.py
Searches Internet Archive for full public-domain films matching our movie titles
and stores the embed identifier in archive_url for each match.
"""
import os, time, requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
db = MongoClient(os.getenv("MONGO_URI"))["moviemate"]

IA_SEARCH = "https://archive.org/advancedsearch.php"

def search_archive(title: str, year: str = "") -> str | None:
    """Return archive.org embed URL if a matching free film is found."""
    params = {
        "q": f'title:({title}) AND mediatype:movies',
        "fl": "identifier,title,year",
        "rows": 5,
        "output": "json",
    }
    try:
        r = requests.get(IA_SEARCH, params=params, timeout=8)
        docs = r.json().get("response", {}).get("docs", [])
        if not docs:
            return None
        # Prefer exact year match, else take first result
        if year:
            for d in docs:
                if str(d.get("year", "")) == year:
                    return f"https://archive.org/embed/{d['identifier']}"
        return f"https://archive.org/embed/{docs[0]['identifier']}"
    except Exception as e:
        print(f"  ⚠ Archive search error: {e}")
        return None

movies = list(db.movies.find({}, {"title": 1, "release_date": 1}))
print(f"Searching Internet Archive for {len(movies)} movies...\n")

found = 0
for i, movie in enumerate(movies):
    title = movie["title"]
    year  = (movie.get("release_date") or "")[:4]
    print(f"[{i+1}/{len(movies)}] {title} ({year}) ...", end=" ", flush=True)

    archive_url = search_archive(title, year)
    if archive_url:
        db.movies.update_one({"_id": movie["_id"]}, {"$set": {"archive_url": archive_url}})
        print(f"✓ {archive_url}")
        found += 1
    else:
        print("– not found (public domain)")

    time.sleep(0.5)  # polite rate limiting

print(f"\n✅ Done. Found {found}/{len(movies)} on Internet Archive.")
