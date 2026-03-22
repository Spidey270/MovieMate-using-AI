import requests
import urllib.parse
from pymongo import MongoClient

db = MongoClient('mongodb://localhost:27017')['moviemate']
session = requests.Session()
OMDB_API_KEY = 'trilogy'

fixes = {
    "Tyler Perry's Why Did I Get Married": "Why Did I Get Married",
    "Gnomeo and Juliet": "Gnomeo & Juliet",
    "(500) Days of Summer": "500 Days of Summer"
}

for title, alias in fixes.items():
    query = urllib.parse.quote(alias)
    url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={query}"
    res = session.get(url).json()
    if res.get("Response") == "True" and res.get("Poster") != "N/A":
        poster_url = res.get("Poster")
        backdrop_url = poster_url.replace("SX300", "SX1920") if "SX300" in poster_url else poster_url
        
        db.movies.update_one(
            {"title": title},
            {"$set": {"poster_url": poster_url, "backdrop_url": backdrop_url}}
        )
        print(f"Fixed {title}!")
    else:
        print(f"Failed to fix {title}")
