# algorithms/preprocess.py
from typing import List, Dict, Any


def preprocess_transactions(
    transactions: List[Dict[str, Any]],
    use_id: bool = True,
) -> List[List[str]]:
    """
    Convert transaction docs into a list of baskets (lists of item identifiers).
    """
    baskets: List[List[str]] = []

    for txn in transactions:
        items = txn.get("items") or []
        basket: List[str] = []

        for item in items:
            if use_id:
                pid = item.get("productId")
                if pid:
                    basket.append(str(pid))
            else:
                pname = item.get("productName")
                if pname:
                    basket.append(str(pname))

        if basket:
            baskets.append(basket)

    return baskets
