import os
import requests
import time
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
db = MongoClient(MONGO_URI)["moviemate"]

OMDB_API_KEY = "trilogy"

def fetch_imdb_id(title, year=None):
    url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={title}"
    if year:
        url += f"&y={year}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("Response") == "True" and data.get("imdbID"):
            return data.get("imdbID")
        return None
    except Exception as e:
        print(f"Error for {title}: {e}")
        return None

def update_movies():
    movies = list(db.movies.find({"imdb_id": {"$exists": False}}))
    print(f"Found {len(movies)} movies without imdb_id. Updating...")
    
    count = 0
    for m in movies:
        title = m.get("title")
        year = None
        if m.get("release_date"):
            year = m.get("release_date")[:4]
            
        print(f"Fetching IMDB ID for {title}...")
        imdb_id = fetch_imdb_id(title, year)
        
        if imdb_id:
            db.movies.update_one({"_id": m["_id"]}, {"$set": {"imdb_id": imdb_id}})
            print(f"  -> Saved {imdb_id}")
            count += 1
        else:
            print(f"  -> Not found")
            
        time.sleep(0.5)
        
    print(f"Done! Updated {count} movies with IMDb IDs.")

if __name__ == "__main__":
    update_movies()
