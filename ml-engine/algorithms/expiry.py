from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any

# Configuration
NEAR_EXPIRY_DAYS = 7 
MAX_EXPIRY_BOOST = 2.0 

def _parse_expiry(expiry_value: Any) -> datetime:
    if not expiry_value:
        return None

    # Handle MongoDB nested format: {"$date": "..."}
    if isinstance(expiry_value, dict) and "$date" in expiry_value:
        expiry_value = expiry_value["$date"]

    if isinstance(expiry_value, datetime):
        return expiry_value if expiry_value.tzinfo else expiry_value.replace(tzinfo=timezone.utc)

    try:
        if isinstance(expiry_value, str):
            # Standardize 'Z' to '+00:00' for ISO compatibility
            return datetime.fromisoformat(expiry_value.replace("Z", "+00:00"))
    except Exception:
        return None
    return None

def apply_expiry_logic(
    products: List[Dict[str, Any]]
) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, float]]:
    today = datetime.now(timezone.utc).date()
    
    expired_ids = []
    near_expiry_products = []
    expiry_weights = {}

    for p in products:
        # CRITICAL FIX: Ensure PID matches how your product_map is indexed
        raw_id = p.get("_id")
        oid = raw_id.get("$oid") if isinstance(raw_id, dict) else str(raw_id)
        pid = str(p.get("productId") or oid)
        
        if not pid: continue

        expiry_dt = _parse_expiry(p.get("expiryDate"))
        
        if not expiry_dt:
            expiry_weights[pid] = 1.0
            continue

        delta_days = (expiry_dt.date() - today).days

        if delta_days < 0:
            expired_ids.append(pid)
            expiry_weights[pid] = 0.0
        elif delta_days <= NEAR_EXPIRY_DAYS:
            near_expiry_products.append(p)
            # Linear boost: 0 days -> 2.0x, 7 days -> 1.0x
            boost = 1.0 + (MAX_EXPIRY_BOOST - 1.0) * (1 - (max(0, delta_days) / NEAR_EXPIRY_DAYS))
            expiry_weights[pid] = round(float(boost), 3)
        else:
            expiry_weights[pid] = 1.0

    return expired_ids, near_expiry_products, expiry_weights