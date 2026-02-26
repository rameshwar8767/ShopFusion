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

@app.post("/api/train/{user_id}")
async def train_models(user_id: str, background_tasks: BackgroundTasks):
    """
    Triggers the training pipeline. 
    Uses BackgroundTasks so the Node.js API doesn't timeout.
    """
    def training_process():
        try:
            # 1. Fetch data from Mongo
            products = load_products(user_id)
            transactions = load_transactions(user_id)
            
            if not products or not transactions:
                print(f"Insufficient data for user {user_id}")
                return

            # 2. Run Expiry Logic (Business Boosts)
            expired_ids, _, _ = apply_expiry_logic(products)
            mark_products_expired(expired_ids)

            # 3. Market Basket Analysis (MBA)
            # We save rules to DB so /recommend can stay fast
            rules = run_mba(transactions)
            save_association_rules(user_id, rules)

            # 4. Update In-Memory ML Models
            content_engine.fit(products)
            collab_engine.fit(transactions)
            
            print(f"✅ Training complete for retailer: {user_id}")
        except Exception as e:
            print(f"❌ Training Error: {e}")

    background_tasks.add_task(training_process)
    return {"message": "Training started", "user_id": user_id}

@app.get("/api/recommend/{user_id}")
async def get_recommendations(user_id: str, cart_items: str = ""):
    """
    Fetches the Hybrid Feed.
    Node.js can pass current cart items as a comma-separated string.
    """
    try:
        # 1. Prepare Product Context
        product_map = get_product_map(user_id)
        if not product_map:
            raise HTTPException(status_code=404, detail="Product map empty")
        
        products = list(product_map.values())
        _, _, expiry_weights = apply_expiry_logic(products)

        # 2. Get User History
        user_tx = load_transactions(user_id)
        history_ids = []
        for tx in user_tx:
            for item in tx.get('items', []):
                history_ids.append(str(item.get('productId')))
        
        # 3. Get Scores (Hybrid)
        content_scores = content_engine.predict_for_user(list(set(history_ids)))
        collab_scores = collab_engine.get_recommendations(user_id)
        
        # 4. Fetch Pre-computed MBA Rules (Fast Lookup)
        rules_cursor = db[ASSOCIATION_RULES_COL].find({"userId": user_id})
        rules = list(rules_cursor)

        # 5. Fusion Layer Logic
        recommendations = hybrid_recommender.generate_hybrid_recommendations(
            mba_rules=rules,
            content_scores=content_scores,
            collab_scores=collab_scores,
            expiry_weights=expiry_weights,
            product_map=product_map
        )

        return {
            "success": True,
            "count": len(recommendations),
            "data": recommendations
        }

    except Exception as e:
        print(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

if __name__ == '__main__':
    # Run using: python app.py
    uvicorn.run(app, host="0.0.0.0", port=8000)