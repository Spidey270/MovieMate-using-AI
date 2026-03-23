import csv
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

# Database configuration
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "moviemate"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def seed():
    # Clear existing movies and genres
    db.movies.delete_many({})
    db.genres.delete_many({})
    
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    import time
    import urllib.parse

    csv_path = r"e:\Movie\movies.csv"
    
    genres_map = {} # name -> id

    OMDB_API_KEY = "trilogy"
    
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=0.5)
    session.mount('http://', HTTPAdapter(max_retries=retries))

    def fetch_images(title):
        try:
            query = urllib.parse.quote(title)
            url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={query}"
            response = session.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get("Response") == "True" and data.get("Poster") != "N/A":
                poster_url = data.get("Poster")
                # Create a pseudo-backdrop by fetching a higher-res version of the OMDB poster
                backdrop_url = poster_url.replace("SX300", "SX1920") if "SX300" in poster_url else poster_url
                return poster_url, backdrop_url
            return None, None
        except Exception as e:
            print(f"Error fetching images for {title}: {e}")
            return None, None

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row['Film']
            genre_name = row['Genre'].strip().capitalize()
            if genre_name not in genres_map:
                res = db.genres.insert_one({"name": genre_name})
                genres_map[genre_name] = str(res.inserted_id)
            
            genre_id = genres_map[genre_name]
            
            print(f"Fetching images for: {title}...")
            poster_url, backdrop_url = fetch_images(title)
            
            # small delay
            time.sleep(1)

            movie = {
                "title": title,
                "overview": f"A {genre_name} film released in {row['Year']}. Lead Studio: {row['Lead Studio']}.",
                "release_date": f"{row['Year']}-01-01",
                "runtime": 100, # Placeholder
                "poster_url": poster_url,
                "backdrop_url": backdrop_url,
                "trailer_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", # Add placeholder trailer
                "imdb_rating": float(row['Audience score %']) / 10.0 if row['Audience score %'] else 0.0,
                "language": "English",
                "genre_ids": [genre_id]
            }
            db.movies.insert_one(movie)

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
