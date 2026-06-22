"""Quick test for ML engine recommendations"""
import requests
import json

ML_URL = "http://localhost:8000"

def test_recommendations():
    print("="*60)
    print("Testing ML Engine Recommendations")
    print("="*60)
    
    # Get user ID from database
    USER_ID = "6a396ecbdde97b2ef410a1b9"
    
    # Test 1: Check if ML engine is running
    print("\n[1/3] Checking ML engine status...")
    try:
        response = requests.get(f"{ML_URL}/")
        print(f"[OK] ML Engine Status: {response.json()}")
    except Exception as e:
        print(f"[ERROR] ML Engine not running: {e}")
        return False
    
    # Test 2: Train models
    print("\n[2/3] Training models...")
    try:
        response = requests.post(f"{ML_URL}/api/train/{USER_ID}", timeout=60)
        result = response.json()
        print(f"[OK] Training Result:")
        print(f"  - Products: {result.get('products_count')}")
        print(f"  - Transactions: {result.get('transactions_count')}")
        print(f"  - Rules Generated: {result.get('rules_generated')}")
    except Exception as e:
        print(f"[ERROR] Training failed: {e}")
        return False
    
    # Test 3: Get recommendations
    print("\n[3/3] Getting recommendations...")
    try:
        response = requests.get(f"{ML_URL}/api/recommend/{USER_ID}", timeout=30)
        result = response.json()
        
        if response.status_code == 200:
            print(f"[OK] Recommendations Generated:")
            print(f"  - Success: {result.get('success')}")
            print(f"  - Feed Items: {len(result.get('feed', []))}")
            print(f"  - Near Expiry: {len(result.get('near_expiry', []))}")
            
            if result.get('feed'):
                print(f"\n  Sample Recommendation:")
                sample = result['feed'][0]
                print(f"    Type: {sample.get('type')}")
                print(f"    Score: {sample.get('score')}")
                print(f"    Reason: {sample.get('reason')}")
            
            print("\n" + "="*60)
            print("[OK] ALL TESTS PASSED!")
            print("="*60)
            return True
        else:
            print(f"[ERROR] Failed with status {response.status_code}")
            print(f"  Response: {result}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Recommendations failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_recommendations()
    exit(0 if success else 1)
