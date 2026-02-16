from typing import List, Dict, Any
from bson import ObjectId
from db import get_db

db = get_db()

# Collection names – keep in sync with your Node backend
PRODUCTS_COL = "products"
TRANSACTIONS_COL = "transactions"
ASSOCIATION_RULES_COL = "associationrules"  # <-- matches Mongoose model


def _to_object_id(user_id: str):
    try:
        return ObjectId(user_id)
    except Exception:
        return user_id


def load_transactions(user_id: str) -> List[Dict[str, Any]]:
    uid = _to_object_id(user_id)
    cursor = db[TRANSACTIONS_COL].find({"user": uid})
    transactions = list(cursor)
    for tx in transactions:
        tx["_id"] = str(tx["_id"])
    return transactions


def load_products(user_id: str) -> List[Dict[str, Any]]:
    uid = _to_object_id(user_id)
    cursor = db[PRODUCTS_COL].find({"user": uid})
    products = list(cursor)
    for p in products:
        p["_id"] = str(p["_id"])
    return products


def save_association_rules(user_id: str, rules: List[Dict[str, Any]]) -> None:
    """
    Store MBA rules in flat docs compatible with models/AssociationRule.js:
      - antecedent: [String]
      - consequent: [String]
      - support, confidence, lift
      - userId: ObjectId
    """
    uid = _to_object_id(user_id)
    col = db[ASSOCIATION_RULES_COL]

    # Remove old rules for this retailer
    col.delete_many({"userId": uid})

    if not rules:
        return

    docs = []
    for rule in rules:
        docs.append(
            {
                "antecedent": list(rule.get("antecedents", [])),
                "consequent": list(rule.get("consequents", [])),
                "support": float(rule.get("support", 0.0)),
                "confidence": float(rule.get("confidence", 0.0)),
                "lift": float(rule.get("lift", 0.0)),
                "userId": uid,
            }
        )

    col.insert_many(docs)


def mark_products_expired(expired_ids: List[str]) -> None:
    if not expired_ids:
        return

    db[PRODUCTS_COL].update_many(
        {"productId": {"$in": expired_ids}},
        {"$set": {"status": "EXPIRED"}},
    )
