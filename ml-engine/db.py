import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
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
                if not MONGO_URI:
                    print("="*60)
                    print("[ERROR] MONGO_URI not found in .env file")
                    print("="*60)
                    print("\nPlease create ml-engine/.env with:")
                    print("MONGO_URI=your_mongodb_connection_string")
                    print("DB_NAME=shopfusion")
                    print("="*60 + "\n")
                    sys.exit(1)
                
                print(f"[*] Connecting to MongoDB...")
                
                # Initialize MongoClient with connection pooling and timeouts
                cls._instance = MongoClient(
                    MONGO_URI,
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=10000,
                    maxPoolSize=50
                )
                
                # Force a connection check
                cls._instance.admin.command('ping')
                print(f"[OK] Successfully connected to MongoDB: {DB_NAME}\n")
                
            except OperationFailure as e:
                print("="*60)
                print("[ERROR] MongoDB Authentication Failed!")
                print("="*60)
                print(f"\nError: {e}")
                print("\nPlease check:")
                print("1. Username and password are correct in .env")
                print("2. MongoDB Atlas credentials haven't expired")
                print("3. Database user has proper permissions")
                print("\nCurrent MONGO_URI (masked):")
                if MONGO_URI:
                    masked = MONGO_URI[:20] + "***" + MONGO_URI[-20:]
                    print(f"   {masked}")
                print("="*60 + "\n")
                sys.exit(1)
                
            except ConnectionFailure as e:
                print("="*60)
                print("[ERROR] Could not connect to MongoDB!")
                print("="*60)
                print(f"\nError: {e}")
                print("\nPlease check:")
                print("1. MongoDB Atlas cluster is running")
                print("2. Your IP is whitelisted in MongoDB Atlas")
                print("3. Internet connection is stable")
                print("4. MONGO_URI is correct in ml-engine/.env")
                print("="*60 + "\n")
                sys.exit(1)
                
            except Exception as e:
                print("="*60)
                print("[ERROR] Unexpected MongoDB Error!")
                print("="*60)
                print(f"\nError: {e}")
                print("\nPlease check your MongoDB configuration.")
                print("="*60 + "\n")
                sys.exit(1)
                
        return cls._instance

def get_db():
    """Returns the database instance for the specified DB_NAME."""
    client = Database()
    return client[DB_NAME]
