"""Test ML Engine Training and Recommendations"""
import requests
import json

ML_ENGINE_URL = "http://localhost:8000"
USER_ID = "69d15ca3df28e7c9b5c55abb"  # From test_connection.py

def test_health():
    print("\n" + "="*60)
    print("Testing Root Endpoint")
    print("="*60)
    try:
        response = requests.get(f"{ML_ENGINE_URL}/", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

def test_training():
    print("\n" + "="*60)
    print("Testing Training Endpoint")
    print("="*60)
    try:
        response = requests.post(
            f"{ML_ENGINE_URL}/api/train/{USER_ID}",
            timeout=60
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

def test_recommendations():
    print("\n" + "="*60)
    print("Testing Recommendations Endpoint")
    print("="*60)
    try:
        response = requests.get(
            f"{ML_ENGINE_URL}/api/recommend/{USER_ID}",
            timeout=30
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Success: {data.get('success')}")
        print(f"Count: {data.get('count')}")
        
        if data.get('data'):
            print(f"\nSample recommendations (first 3):")
            for i, rec in enumerate(data['data'][:3], 1):
                print(f"\n{i}. Type: {rec.get('type')}")
                print(f"   Score: {rec.get('score')}")
                print(f"   Reason: {rec.get('reason')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ML Engine End-to-End Test")
    print("="*60)
    
    # Test 1: Health Check
    health_ok = test_health()
    
    if not health_ok:
        print("\n[FAILED] ML Engine is not healthy. Please check if it's running.")
        exit(1)
    
    # Test 2: Training
    training_ok = test_training()
    
    if not training_ok:
        print("\n[FAILED] Training failed. Check ML engine logs.")
        exit(1)
    
    # Test 3: Recommendations
    rec_ok = test_recommendations()
    
    if not rec_ok:
        print("\n[FAILED] Recommendations failed. Check ML engine logs.")
        exit(1)
    
    print("\n" + "="*60)
    print("[SUCCESS] All tests passed!")
    print("="*60)
