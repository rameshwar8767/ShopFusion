# from pymongo import MongoClient
# from config import MONGO_URI, DB_NAME

# _client = None

# def get_db():
#     global _client
#     if _client is None:
#         if not MONGO_URI:
#             raise RuntimeError("MONGO_URI is not set in environment variables")
#         _client = MongoClient(MONGO_URI)
#     return _client[DB_NAME]
import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "shopfusion")

class Database:
    """
    Singleton class to manage MongoDB connection.
    Ensures only one connection pool is created.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            try:
                # Initialize MongoClient with connection pooling and timeouts
                cls._instance = MongoClient(
                    MONGO_URI,
                    serverSelectionTimeoutMS=5000,
                    maxPoolSize=50
                )
                # Force a connection check
                cls._instance.admin.command('ping')
                print(f"Successfully connected to MongoDB: {DB_NAME}")
            except ConnectionFailure as e:
                print(f"Could not connect to MongoDB: {e}")
                sys.exit(1)
        return cls._instance

def get_db():
    """Returns the database instance for the specified DB_NAME."""
    client = Database()
    return client[DB_NAME]