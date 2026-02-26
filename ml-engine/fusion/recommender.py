from typing import List, Dict, Any
from datetime import datetime
from algorithms.scoring_utils import ScoringUtils

class ShopFusionRecommender:
    def __init__(self):
        self.utils = ScoringUtils()

    def _get_product_summary(self, pid: str, product_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Unified product summary fetcher with safety guards."""
        if not pid or pid == "None":
            return None
            
        p = product_map.get(str(pid))
        
        # Fallback if map is indexed by a different ID type (SKU vs OID)
        if not p:
            p = next((v for v in product_map.values() 
                     if str(v.get("productId")) == str(pid) or str(v.get("_id")) == str(pid)), None)
            
        if not p: return None

        # Handle MongoDB $date structure safely
        exp = p.get("expiryDate")
        if isinstance(exp, dict) and "$date" in exp:
            clean_exp = exp["$date"]
        else:
            clean_exp = str(exp) if exp else None

        return {
            "productId": p.get("productId") or str(p.get("_id")),
            "name": p.get("name", "Unknown Product"),
            "category": p.get("category", "General"),
            "price": p.get("price", 0),
            "image": p.get("image", ""),
            "expiryDate": clean_exp,
            "stock": p.get("stock", 0)
        }

    def generate_hybrid_recommendations(
        self,
        mba_rules: List[Dict[str, Any]],
        content_scores: Dict[str, float],
        collab_scores: Dict[str, float],
        expiry_weights: Dict[str, float],
        product_map: Dict[str, Dict[str, Any]],
        max_recommendations: int = 20
    ) -> Dict[str, Any]:
        """
        Single unified function to handle:
        1. Near Expiry Extraction
        2. Market Basket Analysis (Bundles)
        3. Hybrid User Recommendations
        """
        
        # --- 1. NEAR EXPIRY (For Dashboard 'Sell Now' Cards) ---
        near_expiry_products = []
        for pid, weight in expiry_weights.items():
            if weight > 1.0: # 1.0 se zyada matlab expiry boost active hai
                summary = self._get_product_summary(pid, product_map)
                if summary:
                    near_expiry_products.append(summary)

        # --- 2. HYBRID FEED INITIALIZATION ---
        final_feed = []
        norm_collab = self.utils.normalize_scores(collab_scores)
        norm_content = self.utils.normalize_scores(content_scores)

        # --- 3. SMART BUNDLES (MBA) ---
        for rule in mba_rules:
            # antecedents + consequents merge karke unique IDs nikalna
            bundle_ids = list(dict.fromkeys(rule.get("ants", []) + rule.get("cons", [])))
            bundle_products = [self._get_product_summary(pid, product_map) for pid in bundle_ids]
            bundle_products = [p for p in bundle_products if p] # Remove Nones

            if len(bundle_products) < 2: continue

            base_score = float(rule.get("confidence", 0) * rule.get("lift", 1))
            # Bundle ke kisi bhi item par boost hai toh bundle ko boost karo
            bundle_boost = max([expiry_weights.get(str(pid), 1.0) for pid in bundle_ids], default=1.0)
            
            final_feed.append({
                "type": "bundle",
                "items": bundle_products,
                "reason": "Frequently bought together",
                "score": round(base_score * bundle_boost, 4),
                "isUrgent": bundle_boost > 1.0,
                "metadata": {"lift": rule.get("lift"), "confidence": rule.get("confidence")}
            })

        # --- 4. INDIVIDUAL PERSONALIZED FEED ---
        all_pids = set(norm_collab.keys()) | set(norm_content.keys())
        category_counts = {}

        for pid in all_pids:
            p_meta = product_map.get(str(pid))
            if not p_meta: continue

            # Hybrid Formula: 60% Behavior, 40% Content
            h_score = (0.6 * norm_collab.get(pid, 0.0)) + (0.4 * norm_content.get(pid, 0.0))
            boost = expiry_weights.get(str(pid), 1.0)
            final_score = h_score * boost

            # Diversification: Ek category ke max 3 items
            cat = p_meta.get("category", "General")
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
            if final_score > 0.01 and category_counts[cat] <= 3:
                final_feed.append({
                    "type": "individual",
                    "product": self._get_product_summary(pid, product_map),
                    "reason": "Based on your interest",
                    "score": round(final_score, 4),
                    "isUrgent": boost > 1.0
                })

        # --- 5. SORT & RETURN ---
        final_feed.sort(key=lambda x: x["score"], reverse=True)

        return {
            "success": True,
            "feed": final_feed[:max_recommendations],
            "near_expiry": near_expiry_products, # React yahan se Paneer uthayega
            "timestamp": datetime.now().isoformat()
        }