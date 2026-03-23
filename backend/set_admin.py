from app.db.database import db

email = "user1@test.com"
result = db.users.update_one({"email": email}, {"$set": {"is_admin": True}})
if result.matched_count:
    print(f"Success! {email} is now an admin.")
else:
    print(f"Error: Could not find user with email {email}")
