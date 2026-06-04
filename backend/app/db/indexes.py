from app.db.database import db
from pymongo import ASCENDING, DESCENDING, TEXT


def create_indexes():
    """
    Create all necessary database indexes for performance optimization.
    Called on application startup.
    """

    # Users collection
    try:
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.users.create_index([("username", ASCENDING)])
        print("✓ Created indexes on users collection")
    except Exception as e:
        print(f"Note: Users indexes may already exist - {e}")

    # Movies collection
    try:
        db.movies.create_index([("imdb_id", ASCENDING)])
        db.movies.create_index([("title", TEXT)])
        db.movies.create_index([("release_date", DESCENDING)])
        db.movies.create_index([("imdb_rating", DESCENDING)])
        db.movies.create_index([("genre_ids", ASCENDING)])
        print("✓ Created indexes on movies collection")
    except Exception as e:
        print(f"Note: Movies indexes may already exist - {e}")

    # Reviews collection
    try:
        db.reviews.create_index([("movie_id", ASCENDING)])
        db.reviews.create_index([("user_id", ASCENDING)])
        db.reviews.create_index([("created_at", DESCENDING)])
        db.reviews.create_index([("movie_id", ASCENDING), ("user_id", ASCENDING)])
        print("✓ Created indexes on reviews collection")
    except Exception as e:
        print(f"Note: Reviews indexes may already exist - {e}")

    # Wishlist collection
    try:
        db.wishlist.create_index([("user_id", ASCENDING), ("movie_id", ASCENDING)], unique=True)
        db.wishlist.create_index([("added_at", DESCENDING)])
        print("✓ Created indexes on wishlist collection")
    except Exception as e:
        print(f"Note: Wishlist indexes may already exist - {e}")

    # Friends collection
    try:
        db.friends.create_index([("user_id", ASCENDING), ("friend_id", ASCENDING)])
        db.friends.create_index([("status", ASCENDING)])
        db.friends.create_index([("created_at", DESCENDING)])
        print("✓ Created indexes on friends collection")
    except Exception as e:
        print(f"Note: Friends indexes may already exist - {e}")

    # Notifications collection
    try:
        db.notifications.create_index([("user_id", ASCENDING), ("read", ASCENDING)])
        db.notifications.create_index([("created_at", DESCENDING)])
        print("✓ Created indexes on notifications collection")
    except Exception as e:
        print(f"Note: Notifications indexes may already exist - {e}")

    # Watch history collection
    try:
        db.watch_history.create_index([("user_id", ASCENDING), ("movie_id", ASCENDING)])
        db.watch_history.create_index([("last_watched_at", DESCENDING)])
        print("✓ Created indexes on watch_history collection")
    except Exception as e:
        print(f"Note: Watch history indexes may already exist - {e}")

    # Comments collection
    try:
        db.comments.create_index([("movie_id", ASCENDING)])
        db.comments.create_index([("user_id", ASCENDING)])
        db.comments.create_index([("parent_id", ASCENDING)])
        db.comments.create_index([("created_at", DESCENDING)])
        print("✓ Created indexes on comments collection")
    except Exception as e:
        print(f"Note: Comments indexes may already exist - {e}")

    # Genres collection
    try:
        db.genres.create_index([("name", ASCENDING)], unique=True)
        print("✓ Created indexes on genres collection")
    except Exception as e:
        print(f"Note: Genres indexes may already exist - {e}")

    # Chat messages collection
    try:
        db.chat_messages.create_index([("room_id", ASCENDING), ("timestamp", DESCENDING)])
        db.chat_messages.create_index([("sender_id", ASCENDING)])
        print("✓ Created indexes on chat_messages collection")
    except Exception as e:
        print(f"Note: Chat messages indexes may already exist - {e}")

    print("\n✅ Database indexes setup completed!")
