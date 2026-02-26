import pandas as pd
import numpy as np
import math
from typing import List, Dict, Any
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from algorithms.preprocess import preprocess_transactions

class MarketBasketEngine:
    """
    Optimized Market Basket Analysis.
    Uses Pre-indexed Rule Maps for real-time inference speed.
    """
    
    def __init__(self, min_support=0.01, min_confidence=0.2, min_lift=1.2):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.min_lift = min_lift
        self.rules_df = None
        self.rule_map = {} # Optimized lookup: {antecedent_item: [(consequent, score), ...]}

    def train(self, transactions: List[Any]):
        """
        Generates association rules and builds a high-speed lookup index.
        """
        baskets = preprocess_transactions(transactions, use_id=True)
        if not baskets:
            return []

        # 1. One-Hot Encoding
        te = TransactionEncoder()
        te_array = te.fit(baskets).transform(baskets)
        df = pd.DataFrame(te_array, columns=te.columns_)

        # 2. Frequent Itemsets (low_memory=True is crucial for production)
        frequent_itemsets = apriori(
            df, 
            min_support=self.min_support, 
            use_colnames=True, 
            low_memory=True
        )

        if frequent_itemsets.empty:
            return []

        # 3. Rule Generation
        rules = association_rules(
            frequent_itemsets, 
            metric="lift", 
            min_threshold=self.min_lift
        )

        # 4. Refine Rules
        rules = rules[rules['confidence'] >= self.min_confidence].copy()
        
        # Convert frozensets for JSON and Indexing
        rules["ants"] = rules["antecedents"].apply(lambda x: list(x))
        rules["cons"] = rules["consequents"].apply(lambda x: list(x))
        
        self.rules_df = rules
        self._build_rule_index() # Build the fast lookup map
        
        return self.get_sanitized_rules()

    def _build_rule_index(self):
        """
        Indexes rules into a dictionary for O(1) lookup during prediction.
        """
        self.rule_map = {}
        for _, row in self.rules_df.iterrows():
            # Scoring: confidence * lift provides a balance of probability and relevance
            score = round(float(row['confidence'] * row['lift']), 4)
            
            for ant in row['ants']:
                if ant not in self.rule_map:
                    self.rule_map[ant] = []
                
                for con in row['cons']:
                    self.rule_map[ant].append((con, score))

    def predict_affinity(self, cart_items: List[str], top_n: int = 10) -> Dict[str, float]:
        """
        High-speed inference using the pre-built index.
        """
        if not self.rule_map or not cart_items:
            return {}

        recommendations = {}
        cart_set = set(cart_items)

        for item in cart_items:
            if item in self.rule_map:
                for target, score in self.rule_map[item]:
                    if target not in cart_set:
                        # Keep the highest score found across all cart triggers
                        recommendations[target] = max(recommendations.get(target, 0), score)

        # Sort and return top N
        return dict(sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n])

    def get_sanitized_rules(self) -> List[Dict[str, Any]]:
        """JSON-safe output for Node.js API."""
        if self.rules_df is None or self.rules_df.empty:
            return []
            
        display_cols = ["ants", "cons", "support", "confidence", "lift"]
        clean_df = self.rules_df[display_cols].copy()
        clean_df = clean_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)
        
        return clean_df.to_dict(orient="records")

def run_mba(transactions, **kwargs):
    engine = MarketBasketEngine(
        min_support=kwargs.get('min_support', 0.02),
        min_confidence=kwargs.get('min_confidence', 0.3),
        min_lift=kwargs.get('min_lift', 1.0)
    )
    return engine.train(transactions)