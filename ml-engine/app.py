import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

# Import your database and logic modules
from db import get_db
from data.loader import (
    load_products, 
    load_transactions, 
    get_product_map, 
    save_association_rules, 
    mark_products_expired,
    ASSOCIATION_RULES_COL
)
from algorithms.expiry import apply_expiry_logic
from algorithms.mba import run_mba
from algorithms.content_based import ContentBasedEngine
from algorithms.collaborative_based import CollaborativeBasedEngine
from fusion.recommender import ShopFusionRecommender

app = FastAPI(title="ShopFusion ML Engine")
db = get_db()

# Enable CORS for your Node.js frontend/backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine Singletons
hybrid_recommender = ShopFusionRecommender()
content_engine = ContentBasedEngine()
collab_engine = CollaborativeBasedEngine()

@app.get("/")
async def root():
    return {"status": "online", "engine": "ShopFusion Hybrid ML", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.command('ping')
        return {
            "status": "healthy",
            "engine": "ShopFusion ML Engine",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/api/train/{user_id}")
async def train_models(user_id: str):
    """
    Triggers the training pipeline synchronously for debugging.
    """
    try:
        print(f"\n🚀 Starting training for user: {user_id}")
        
        # 1. Fetch data from Mongo
        products = load_products(user_id)
        transactions = load_transactions(user_id)
        
        print(f"📊 Loaded {len(products)} products and {len(transactions)} transactions")
        
        if not products or not transactions:
            return {"error": "Insufficient data", "products": len(products), "transactions": len(transactions)}

        # 2. Run Expiry Logic (Business Boosts)
        expired_ids, _, _ = apply_expiry_logic(products)
        mark_products_expired(expired_ids)
        print(f"⏰ Marked {len(expired_ids)} products as expired")

        # 3. Market Basket Analysis (MBA)
        print("🔍 Running Market Basket Analysis...")
        rules = run_mba(transactions, min_support=0.001, min_confidence=0.1, min_lift=0.5)
        print(f"📈 Generated {len(rules)} association rules")
        
        if len(rules) > 0:
            save_association_rules(user_id, rules)
            print(f"💾 Saved {len(rules)} rules to database")
        else:
            print("⚠️  No rules generated - try lowering thresholds")

        # 4. Update In-Memory ML Models
        content_engine.fit(products)
        collab_engine.fit(transactions)
        
        print(f"✅ Training complete for retailer: {user_id}")
        
        return {
            "message": "Training completed",
            "user_id": user_id,
            "products_count": len(products),
            "transactions_count": len(transactions),
            "rules_generated": len(rules)
        }
    except Exception as e:
        print(f"❌ Training Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommend/{user_id}")
async def get_recommendations(user_id: str, cart_items: str = ""):
    """
    Fetches the Hybrid Feed.
    Node.js can pass current cart items as a comma-separated string.
    """
    try:
        print(f"\n🎯 Generating recommendations for user: {user_id}")
        
        # 1. Prepare Product Context
        product_map = get_product_map(user_id)
        if not product_map:
            print("⚠️  Product map is empty")
            return {
                "success": True,
                "count": 0,
                "data": {"feed": [], "near_expiry": []}
            }
        
        print(f"📦 Loaded {len(product_map)} products")
        products = list(product_map.values())
        _, _, expiry_weights = apply_expiry_logic(products)
        print(f"⏰ Calculated expiry weights for {len(expiry_weights)} products")

        # 2. Get User History
        user_tx = load_transactions(user_id)
        history_ids = []
        for tx in user_tx:
            for item in tx.get('items', []):
                pid = str(item.get('productId'))
                if pid:
                    history_ids.append(pid)
        
        print(f"📊 User history: {len(history_ids)} items from {len(user_tx)} transactions")
        
        # 3. Get Scores (Hybrid) - with error handling
        content_scores = {}
        collab_scores = {}
        
        try:
            if history_ids:
                content_scores = content_engine.predict_for_user(list(set(history_ids)))
                print(f"🎨 Content scores: {len(content_scores)} products")
        except Exception as e:
            print(f"⚠️  Content engine error: {str(e)}")
        
        try:
            collab_scores = collab_engine.get_recommendations(user_id)
            print(f"🤝 Collaborative scores: {len(collab_scores)} products")
        except Exception as e:
            print(f"⚠️  Collaborative engine error: {str(e)}")
        
        # 4. Fetch Pre-computed MBA Rules (Fast Lookup)
        from bson import ObjectId
        try:
            user_oid = ObjectId(user_id)
        except:
            user_oid = user_id
            
        rules_cursor = db[ASSOCIATION_RULES_COL].find({"userId": user_oid})
        rules = list(rules_cursor)
        print(f"📈 Found {len(rules)} MBA rules")
        
        # Convert rules to expected format
        formatted_rules = []
        for rule in rules:
            formatted_rules.append({
                "ants": rule.get("antecedents", []),
                "cons": rule.get("consequents", []),
                "confidence": rule.get("confidence", 0),
                "lift": rule.get("lift", 0),
                "support": rule.get("support", 0)
            })

        # 5. Fusion Layer Logic
        result = hybrid_recommender.generate_hybrid_recommendations(
            mba_rules=formatted_rules,
            content_scores=content_scores,
            collab_scores=collab_scores,
            expiry_weights=expiry_weights,
            product_map=product_map
        )
        
        print(f"✅ Generated {len(result.get('feed', []))} recommendations")

        return result

    except Exception as e:
        print(f"❌ Recommendation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    # Run using: python app.py
    uvicorn.run(app, host="0.0.0.0", port=8000)