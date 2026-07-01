import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

hybrid_recommender = ShopFusionRecommender()
content_engine = ContentBasedEngine()
collab_engine = CollaborativeBasedEngine()


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health_check():
    try:
        db.command("ping")
        return {
            "status": "healthy",
            "engine": "ShopFusion ML Engine",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/api/train/{user_id}")
async def train_models(user_id: str):
    """Triggers the full training pipeline."""
    try:
        print(f"\n[START] Starting training for user: {user_id}")

        # 1. Load data
        products = load_products(user_id)
        transactions = load_transactions(user_id)
        print(f"[DATA] Loaded {len(products)} products and {len(transactions)} transactions")

        if not products or not transactions:
            return {
                "error": "Insufficient data",
                "products": len(products),
                "transactions": len(transactions)
            }

        # 2. Expiry logic
        expired_ids, _, _ = apply_expiry_logic(products)
        mark_products_expired(expired_ids)
        print(f"[EXPIRY] Marked {len(expired_ids)} products as expired")

        # 3. Market Basket Analysis
        print("[MBA] Running Market Basket Analysis...")
        rules = []
        try:
            rules = run_mba(
                transactions,
                min_support=0.0005,
                min_confidence=0.05,
                min_lift=0.3
            )
            print(f"[MBA] Generated {len(rules)} association rules")

            # Cap to top 500 by lift to avoid insert timeout
            if len(rules) > 500:
                rules = sorted(rules, key=lambda x: x.get("lift", 0), reverse=True)[:500]
                print(f"[MBA] Trimmed to top 500 rules by lift score")

        except Exception as mba_error:
            print(f"[MBA] Error: {str(mba_error)}")
            import traceback
            traceback.print_exc()

        if rules:
            save_association_rules(user_id, rules)
            print(f"[SAVE] Saved {len(rules)} rules to database")
        else:
            print("[WARN] No rules generated - data may be too sparse")

        # 4. Fit ML models
        content_engine.fit(products)
        collab_engine.fit(transactions)
        print(f"[OK] Training complete for retailer: {user_id}")

        return {
            "message": "Training completed",
            "user_id": user_id,
            "products_count": len(products),
            "transactions_count": len(transactions),
            "rules_generated": len(rules)
        }

    except Exception as e:
        print(f"[ERROR] Training Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommend/{user_id}")
async def get_recommendations(user_id: str, cart_items: str = ""):
    """Fetches the Hybrid Feed."""
    try:
        print(f"\n[RECOMMEND] Generating recommendations for user: {user_id}")

        product_map = get_product_map(user_id)
        if not product_map:
            print("[WARN] Product map is empty")
            return {"success": True, "count": 0, "data": {"feed": [], "near_expiry": []}}

        print(f"[DATA] Loaded {len(product_map)} products")
        products = list(product_map.values())
        _, _, expiry_weights = apply_expiry_logic(products)
        print(f"[EXPIRY] Calculated expiry weights for {len(expiry_weights)} products")

        user_tx = load_transactions(user_id)
        history_ids = []
        for tx in user_tx:
            for item in tx.get("items", []):
                pid = str(item.get("productId"))
                if pid:
                    history_ids.append(pid)
        print(f"[HISTORY] {len(history_ids)} items from {len(user_tx)} transactions")

        content_scores = {}
        collab_scores = {}

        try:
            if history_ids:
                content_scores = content_engine.predict_for_user(list(set(history_ids)))
                print(f"[CONTENT] {len(content_scores)} products")
        except Exception as e:
            print(f"[WARN] Content engine error: {str(e)}")

        try:
            collab_scores = collab_engine.get_recommendations(user_id)
            print(f"[COLLAB] {len(collab_scores)} products")
        except Exception as e:
            print(f"[WARN] Collaborative engine error: {str(e)}")

        from bson import ObjectId
        try:
            user_oid = ObjectId(user_id)
        except Exception:
            user_oid = user_id

        rules = list(db[ASSOCIATION_RULES_COL].find({"userId": user_oid}))
        print(f"[MBA] Found {len(rules)} MBA rules")

        formatted_rules = [
            {
                "ants": r.get("antecedents", []),
                "cons": r.get("consequents", []),
                "confidence": r.get("confidence", 0),
                "lift": r.get("lift", 0),
                "support": r.get("support", 0)
            }
            for r in rules
        ]

        result = hybrid_recommender.generate_hybrid_recommendations(
            mba_rules=formatted_rules,
            content_scores=content_scores,
            collab_scores=collab_scores,
            expiry_weights=expiry_weights,
            product_map=product_map
        )

        print(f"[OK] Generated {len(result.get('feed', []))} recommendations")
        return result

    except Exception as e:
        print(f"[ERROR] Recommendation error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)