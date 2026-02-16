from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

_client = None

def get_db():
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI is not set in environment variables")
        _client = MongoClient(MONGO_URI)
    return _client[DB_NAME]
