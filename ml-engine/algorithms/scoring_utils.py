import numpy as np
from typing import Dict, Any, List

class ScoringUtils:
    """
    Advanced Utility for Hybrid Recommendation Fusion.
    Balances ML relevance with Business KPIs (Expiry, Margin, Discounts).
    """

    @staticmethod
    def apply_business_boosts(
        base_scores: Dict[str, float],
        expiry_weights: Dict[str, float] = None,
        discount_weights: Dict[str, float] = None,
        margin_weights: Dict[str, float] = None,
        top_n: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Fuses similarity scores with weights. 
        Returns a sorted list of dictionaries ready for Node.js consumption.
        """
        if not base_scores:
            return []

        # Prepare weight maps with default 1.0
        e_weights = expiry_weights or {}
        d_weights = discount_weights or {}
        m_weights = margin_weights or {}

        final_recommendations = []

        for pid, score in base_scores.items():
            # Apply multiplicative boosts
            # If an item is not in a weight map, it stays at 1.0 (neutral)
            e_boost = e_weights.get(pid, 1.0)
            d_boost = d_weights.get(pid, 1.0)
            m_boost = m_weights.get(pid, 1.0)

            # Final Score Calculation
            boosted_score = score * e_boost * d_boost * m_boost

            # Only include items with a positive relevance
            if boosted_score > 0:
                final_recommendations.append({
                    "productId": pid,
                    "score": round(float(boosted_score), 4),
                    "meta": {
                        "relevance": round(float(score), 4),
                        "expiry_boost": e_boost,
                        "discount_boost": d_boost
                    }
                })

        # Sort and Slice: Desired Top N results
        return sorted(final_recommendations, key=lambda x: x['score'], reverse=True)[:top_n]

    @staticmethod
    def calculate_discount_boost(discount_percentage: float) -> float:
        """
        Uses a logarithmic scale to boost discounted items.
        Formula: 1 + log1p(discount/100) * factor
        """
        if not discount_percentage or discount_percentage <= 0:
            return 1.0
        
        # factor 0.4 keeps the boost within a reasonable 1.0x - 1.3x range
        boost = 1.0 + (np.log1p(discount_percentage / 100) * 0.4)
        return round(float(boost), 3)

    @staticmethod
    def normalize_scores(scores: Dict[str, float]) -> Dict[str, float]:
        """
        Min-Max Normalization to bring all algorithms into the [0, 1] range.
        Uses NumPy for O(N) speed.
        """
        if not scores:
            return {}
        
        # Convert values to numpy array for speed
        vals = np.array(list(scores.values()))
        keys = list(scores.keys())
        
        min_v, max_v = vals.min(), vals.max()
        denom = max_v - min_v

        if denom == 0:
            return {k: 1.0 for k in keys}

        # Vectorized calculation
        norm_vals = (vals - min_v) / denom
        return dict(zip(keys, norm_vals.astype(float)))