from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from pymongo import UpdateOne
from db import get_db  # ✅ Absolute import

db = get_db()

# Collection names
PRODUCTS_COL = "products"
TRANSACTIONS_COL = "transactions"
ASSOCIATION_RULES_COL = "associationrules"
# data/loader.py

def get_product_map(user_id):
    """
    Fetches all products for a retailer and returns a dict {productId: product_doc}
    """
    products = load_products(user_id)
    # Create a mapping for quick lookup: {'PROD123': {...product data...}}
    return {p.get("productId"): p for p in products if p.get("productId")}

def _to_object_id(uid: Any) -> Optional[ObjectId]:
    """Safely converts string to BSON ObjectId."""
    if not uid: return None
    try:
        return ObjectId(uid) if isinstance(uid, str) else uid
    except Exception:
        return None

def load_transactions(user_id: str = None) -> List[Dict[str, Any]]:
    """
    Loads transactions with memory-efficient projection.
    """
    query = {"user": _to_object_id(user_id)} if user_id else {}
    
    # Only fetch fields required for Collaborative Filtering and MBA
    projection = {"items": 1, "user": 1, "createdAt": 1}
    
    try:
        cursor = db[TRANSACTIONS_COL].find(query, projection)
        
        transactions = []
        for tx in cursor:
            tx["_id"] = str(tx["_id"])
            if "user" in tx:
                tx["user"] = str(tx["user"])
            transactions.append(tx)
        return transactions
    except Exception as e:
        print(f"Error loading transactions: {e}")
        return []

def load_products(user_id: str) -> List[Dict[str, Any]]:
    """Loads all products for a specific retailer."""
    uid = _to_object_id(user_id)
    if not uid: return []

    try:
        cursor = db[PRODUCTS_COL].find({"user": uid})
        products = []
        for p in cursor:
            p["_id"] = str(p["_id"])
            # Fallback logic: Ensure every product has a unique productId string
            if "productId" not in p:
                p["productId"] = p["_id"]
            products.append(p)
        return products
    except Exception as e:
        print(f"Error loading products: {e}")
        return []

def save_association_rules(user_id: str, rules: List[Dict[str, Any]]) -> None:
    """Stores MBA rules using a clean clear-and-insert strategy."""
    uid = _to_object_id(user_id)
    if not uid: return

    # 1. Clean up old rules
    db[ASSOCIATION_RULES_COL].delete_many({"userId": uid})

    if not rules:
        return

    # 2. Format for Storage
    docs = []
    for rule in rules:
        # Use consistent naming: 'antecedents' and 'consequents'
        docs.append({
            "userId": uid,
            "antecedents": rule.get("ants") or rule.get("antecedents", []),
            "consequents": rule.get("cons") or rule.get("consequents", []),
            "support": float(rule.get("support", 0.0)),
            "confidence": float(rule.get("confidence", 0.0)),
            "lift": float(rule.get("lift", 0.0)),
            "updatedAt": datetime.now(timezone.utc)
        })

    # 3. Bulk Insert
    if docs:
        db[ASSOCIATION_RULES_COL].insert_many(docs)

def mark_products_expired(expired_ids: List[str]) -> None:
    """Updates product status in bulk. Uses productId index."""
    if not expired_ids:
        return

    # Using $set with isVisible: False ensures they don't appear in the Node.js API results
    db[PRODUCTS_COL].update_many(
        {"productId": {"$in": expired_ids}},
        {"$set": {
            "status": "EXPIRED", 
            "isVisible": False,
            "updatedAt": datetime.now(timezone.utc)
        }}
    )