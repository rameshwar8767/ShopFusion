from datetime import datetime, timezone, timedelta
from typing import List, Tuple, Dict, Any

NEAR_EXPIRY_DAYS = 7  # configurable window


def _parse_expiry(expiry_value):
    """
    Handles Mongo ISO string or datetime objects.
    """
    if expiry_value is None:
        return None

    if isinstance(expiry_value, datetime):
        return expiry_value

    # Expect ISO strings like "2026-02-09T00:00:00.000Z"
    try:
        # Remove Z if present to make it ISO compatible
        if isinstance(expiry_value, str) and expiry_value.endswith("Z"):
            expiry_value = expiry_value[:-1]
        return datetime.fromisoformat(expiry_value)
    except Exception:
        return None


def apply_expiry_logic(
    products: List[Dict[str, Any]]
) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Split products into:
      - expired_ids: productId list for products already expired
      - near_expiry: product dicts for products expiring soon (within NEAR_EXPIRY_DAYS)
    """
    now = datetime.now(timezone.utc)
    expired_ids: List[str] = []
    near_expiry: List[Dict[str, Any]] = []

    for p in products:
        expiry_raw = p.get("expiryDate")
        expiry = _parse_expiry(expiry_raw)

        # If no expiry date, we skip it for expiry-based logic
        if not expiry:
            continue

        # Normalize to aware datetime if naive
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        delta_days = (expiry.date() - now.date()).days

        # Already expired
        if delta_days < 0:
            pid = p.get("productId")
            if pid:
                expired_ids.append(pid)
            continue

        # Near expiry window
        if 0 <= delta_days <= NEAR_EXPIRY_DAYS:
            near_expiry.append(p)

    return expired_ids, near_expiry
