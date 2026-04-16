"""Quick test script to verify ML engine database connection and data availability"""
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')

from db import get_db
from data.loader import load_products, load_transactions

def test_connection():
    print("=" * 60)
    print("ML Engine Connection Test")
    print("=" * 60)
    
    try:
        # Test database connection
        db = get_db()
        print("[OK] Database connection successful")
        
        # List collections
        collections = db.list_collection_names()
        print(f"\n[OK] Available collections: {collections}")
        
        # Count documents
        products_count = db['products'].count_documents({})
        transactions_count = db['transactions'].count_documents({})
        users_count = db['users'].count_documents({})
        
        print(f"\n[OK] Products: {products_count}")
        print(f"[OK] Transactions: {transactions_count}")
        print(f"[OK] Users: {users_count}")
        
        # Get a sample user ID
        if users_count > 0:
            sample_user = db['users'].find_one({})
            user_id = str(sample_user['_id'])
            print(f"\n[OK] Sample User ID: {user_id}")
            
            # Test data loading
            products = load_products(user_id)
            transactions = load_transactions(user_id)
            
            print(f"\n[OK] Loaded {len(products)} products for user")
            print(f"[OK] Loaded {len(transactions)} transactions for user")
            
            if transactions:
                print(f"\n[OK] Sample transaction structure:")
                sample_tx = transactions[0]
                print(f"  Keys: {list(sample_tx.keys())}")
                if 'items' in sample_tx:
                    print(f"  Items count: {len(sample_tx['items'])}")
                    if sample_tx['items']:
                        print(f"  Sample item: {sample_tx['items'][0]}")
        
        print("\n" + "=" * 60)
        print("[SUCCESS] All tests passed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
