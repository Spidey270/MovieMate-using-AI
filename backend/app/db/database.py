from pymongo import MongoClient
import os

# Default to local MongoDB if not specified in env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "moviemate"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
