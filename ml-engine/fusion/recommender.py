from typing import List, Dict, Any
from datetime import datetime


def _build_near_expiry_set(near_expiry_products: List[Dict[str, Any]]):
    """
    Create a quick lookup set of near-expiry productIds.
    """
    return {p.get("productId") for p in near_expiry_products if p.get("productId")}


def _score_item(
    product: Dict[str, Any],
    rule: Dict[str, Any],
    is_near_expiry: bool,
) -> float:
    """
    Simple hybrid score combining:
      - MBA confidence and lift
      - product price (proxy for profit)
      - near-expiry boost
    """
    price = float(product.get("price", 0.0))
    confidence = float(rule.get("confidence", 0.0))
    lift = float(rule.get("lift", 1.0))

    # Base score from MBA rule quality
    score = confidence * lift

    # Weight by price (you can switch to margin later)
    score *= (1.0 + price / 100.0)  # normalize price impact

    # Boost for near-expiry products to push urgent selling
    if is_near_expiry:
        score *= 1.5

    return score


def generate_recommendations(
    rules: List[Dict[str, Any]],
    near_expiry_products: List[Dict[str, Any]],
    product_map: Dict[str, Dict[str, Any]],
    max_recommendations: int = 20,
) -> List[Dict[str, Any]]:
    """
    Create a ranked list of recommended bundles/items.

    Input:
      rules: list of MBA rules (dicts with antecedents, consequents, support, confidence, lift)
      near_expiry_products: list of product dicts flagged as near expiry
      product_map: { productId: product_dict }
    Output:
      List of recommendation dicts like:
        {
          "bundle": [
            { "productId": "...", "name": "...", "category": "...", "price": 100, ... },
            ...
          ],
          "reason": "Frequently bought together",
          "score": 12.34,
          "metadata": {
            "support": 0.12,
            "confidence": 0.6,
            "lift": 1.8,
            "nearExpiryInBundle": true
          }
        }
    """
    recommendations: List[Dict[str, Any]] = []

    if not rules:
        return recommendations

    near_expiry_set = _build_near_expiry_set(near_expiry_products)

    for rule in rules:
        antecedents = rule.get("antecedents", [])
        consequents = rule.get("consequents", [])

        # Convert to simple lists of productIds (you may be using names; keep them consistent)
        if isinstance(antecedents, set):
            antecedents = list(antecedents)
        if isinstance(consequents, set):
            consequents = list(consequents)

        # Build full bundle: antecedent + consequent items
        bundle_ids = list(dict.fromkeys(antecedents + consequents))  # unique, keep order

        bundle_products = []
        has_near_expiry = False
        total_score = 0.0

        for pid in bundle_ids:
            product = product_map.get(pid)
            if not product:
                # If you used productName in MBA instead of productId, you’ll need
                # a reverse map here; for now we skip missing ids.
                continue

            is_near = pid in near_expiry_set
            item_score = _score_item(product, rule, is_near)
            total_score += item_score

            if is_near:
                has_near_expiry = True

            bundle_products.append(
                {
                    "productId": product.get("productId"),
                    "name": product.get("name"),
                    "category": product.get("category"),
                    "price": product.get("price"),
                    "stock": product.get("stock"),
                    "expiryDate": product.get("expiryDate"),
                    "status": product.get("status"),
                }
            )

        if not bundle_products:
            continue

        recommendations.append(
            {
                "bundle": bundle_products,
                "reason": "Frequently bought together with profit and expiry awareness",
                "score": round(total_score, 4),
                "metadata": {
                    "support": rule.get("support"),
                    "confidence": rule.get("confidence"),
                    "lift": rule.get("lift"),
                    "nearExpiryInBundle": has_near_expiry,
                    "ruleId": str(rule.get("_id", "")),
                },
            }
        )

    # Sort by score descending and limit
    recommendations.sort(key=lambda r: r["score"], reverse=True)

    return recommendations[:max_recommendations]
