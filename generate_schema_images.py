import pandas as pd
import matplotlib.pyplot as plt

def save_table_as_png(table_name, columns, data):
    # Adjusting figure size based on table row count
    fig, ax = plt.subplots(figsize=(10, len(data) * 0.5 + 1))
    ax.axis('off')
    
    df = pd.DataFrame(data, columns=columns)
    
    # Create the table on the matplotlib axis
    tbl = ax.table(cellText=df.values, colLabels=df.columns, loc='center', cellLoc='left')
    
    # Styling
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(11)
    tbl.scale(1.2, 1.8) # Adjust column width and row height
    
    # Custom colored styling mapping
    for k, cell in tbl._cells.items():
        cell.set_edgecolor('#dddddd')
        
        if k[0] == 0: # Header properties
            cell.set_text_props(weight='bold', color='white')
            cell.set_facecolor('#1e293b') # Dark slate blue header
        else: # Alternating row colors
            cell.set_facecolor('#f8fafc' if k[0] % 2 == 0 else 'white')
            
    plt.title(f"{table_name.capitalize()} Collection Schema", pad=20, fontsize=16, fontweight='bold', color="#0f172a")
    
    # Generate image and save
    filename = f"{table_name}_schema.png"
    plt.tight_layout()
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()

# Structured Collection Data
tables = {
    "users": [
        ["_id", "ObjectId", "Primary Key, Auto-generated"],
        ["email", "String", "User's email address"],
        ["username", "String", "Unique display name"],
        ["hashed_password", "String", "Bcrypt hashed password"],
        ["favorite_genres", "Array[String]", "Selected taste profile genres"],
        ["favorite_languages", "Array[String]", "Selected taste profile languages"],
        ["is_admin", "Boolean", "Administrator privilege flag"]
    ],
    "movies": [
        ["_id", "ObjectId", "Primary Key"],
        ["title", "String", "Full title of the movie"],
        ["overview", "String", "Synopsis or plot description"],
        ["release_date", "String", "YYYY-MM-DD release date"],
        ["runtime", "Integer", "Total runtime in minutes"],
        ["poster_url", "String", "URL to the movie poster"],
        ["backdrop_url", "String", "URL to the background art"],
        ["trailer_url", "String", "YouTube or embed trailer link"],
        ["archive_url", "String", "Legacy streaming embed link"],
        ["imdb_id", "String", "Global IMDb reference ID"],
        ["imdb_rating", "Float", "Rating aggregate"],
        ["language", "String", "Spoken language"],
        ["genre_ids", "Array[String]", "Linked genre identifiers"],
        ["gallery_images", "Array[Object]", "Cast & scene images"]
    ],
    "wishlist": [
        ["_id", "ObjectId", "Primary Key"],
        ["user_id", "String", "Foreign key reference to Users"],
        ["movie_id", "String", "Foreign key reference to Movies"],
        ["movie_title", "String", "Denormalized title for fast render"],
        ["added_at", "Datetime", "Timestamp of insertion"]
    ],
    "reviews": [
        ["_id", "ObjectId", "Primary Key"],
        ["movie_id", "String", "Foreign key reference to Movies"],
        ["user_id", "String", "Foreign key reference to Users"],
        ["username", "String", "Denormalized author display name"],
        ["rating", "Integer", "Value 1 through 5"],
        ["comment", "String", "Written review text"],
        ["created_at", "Datetime", "Timestamp of submission"]
    ],
    "notifications": [
        ["_id", "ObjectId", "Primary Key"],
        ["user_id", "String", "Target user to receive the alert"],
        ["message", "String", "Core notification text"],
        ["type", "String", "Categorization (e.g., info, recommendation)"],
        ["link", "String", "Optional deep-link to redirect user"],
        ["is_read", "Boolean", "Unread status toggle (True/False)"],
        ["created_at", "Datetime", "Timestamp of dispatch"]
    ],
    "chat_messages": [
        ["_id", "ObjectId", "Primary Key"],
        ["sender_id", "String", "Foreign key to author"],
        ["sender_username", "String", "Denormalized author name"],
        ["receiver_id", "String", "Target recipient or 'global'"],
        ["content", "String", "The raw chat payload text"],
        ["is_read", "Boolean", "True if DM is opened"],
        ["timestamp", "Datetime", "Real-time payload timestamp"]
    ],
    "watch_history": [
        ["_id", "ObjectId", "Primary Key"],
        ["user_id", "String", "Foreign key reference to Users"],
        ["movie_id", "String", "Foreign key reference to Movies"],
        ["started_at", "Datetime", "Initial play timestamp"],
        ["last_watched_at", "Datetime", "Last update timestamp"],
        ["progress_seconds", "Integer", "Progress length tracked"]
    ]
}

columns = ["Field Name", "Data Type", "Description"]

if __name__ == "__main__":
    print(f"Generating {len(tables)} schema image(s)...")
    for name, data in tables.items():
        save_table_as_png(name, columns, data)
        print(f" - Successfully generated {name}_schema.png")
    print("Done! The PNG files are saved in the current directory.")
