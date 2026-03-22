import json
from bson import ObjectId
from app.db.database import db
from datetime import datetime

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId): return str(o)
        if isinstance(o, datetime): return str(o)
        return json.JSONEncoder.default(self, o)

data = list(db.messages.find({}).limit(10))
with open('test_msgs.json', 'w') as f:
    json.dump(data, f, cls=JSONEncoder, indent=2)
print("Done")
