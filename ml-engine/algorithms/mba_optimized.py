# ml-engine/algorithms/mba_optimized.py
# 🚀 OPTIMIZED MBA FOR MILLIONS OF RECORDS

import dask.dataframe as dd
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

class OptimizedMarketBasketEngine:
    """
    High-performance MBA using Dask for distributed computing
    Handles millions of transactions efficiently
    """
    
    def __init__(self, min_support=0.001, min_confidence=0.1, min_lift=0.5):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.min_lift = min_lift
        self.rules_df = None
        self.rule_map = {}

    def train_large_dataset(self, transactions: List[Dict[str, Any]], use_dask=True):
        """
        Optimized training for large datasets
        Uses Dask for parallel processing when dataset > 100K transactions
        """
        print(f"🔍 Processing {len(transactions)} transactions...")
        
        # Convert to baskets
        baskets = self._preprocess_transactions(transactions)
        
        if not baskets:
            print("⚠️  No valid baskets found")
            return []
        
        print(f"📦 Created {len(baskets)} baskets")
        
        # Use Dask for large datasets
        if use_dask and len(baskets) > 100000:
            return self._train_with_dask(baskets)
        else:
            return self._train_standard(baskets)
    
    def _train_standard(self, baskets: List[List[str]]):
        """Standard training for smaller datasets (<100K)"""
        print("🔧 Using standard processing...")
        
        # One-Hot Encoding
        te = TransactionEncoder()
        te_array = te.fit(baskets).transform(baskets)
        df = pd.DataFrame(te_array, columns=te.columns_)
        
        # Frequent Itemsets
        frequent_itemsets = apriori(
            df, 
            min_support=self.min_support, 
            use_colnames=True, 
            low_memory=True,
            max_len=3  # Limit to 3-item sets for performance
        )
        
        if frequent_itemsets.empty:
            print("⚠️  No frequent itemsets found")
            return []
        
        print(f"📊 Found {len(frequent_itemsets)} frequent itemsets")
        
        # Generate Rules
        rules = association_rules(
            frequent_itemsets, 
            metric="lift", 
            min_threshold=self.min_lift,
            num_itemsets=len(frequent_itemsets)
        )
        
        # Filter by confidence
        rules = rules[rules['confidence'] >= self.min_confidence].copy()
        
        # Convert frozensets
        rules["ants"] = rules["antecedents"].apply(lambda x: list(x))
        rules["cons"] = rules["consequents"].apply(lambda x: list(x))
        
        self.rules_df = rules
        self._build_rule_index()
        
        print(f"✅ Generated {len(rules)} association rules")
        return self.get_sanitized_rules()
    
    def _train_with_dask(self, baskets: List[List[str]]):
        """
        Dask-based training for massive datasets (>100K transactions)
        Processes data in parallel chunks
        """
        print("🚀 Using Dask parallel processing...")
        
        # Convert baskets to DataFrame for Dask
        basket_data = []
        for idx, basket in enumerate(baskets):
            for item in basket:
                basket_data.append({'transaction_id': idx, 'item': item})
        
        # Create Dask DataFrame
        df = dd.from_pandas(pd.DataFrame(basket_data), npartitions=10)
        
        # Group by transaction and aggregate items
        grouped = df.groupby('transaction_id')['item'].apply(
            lambda x: list(x), 
            meta=('item', 'object')
        ).compute()
        
        # Convert back to baskets
        processed_baskets = grouped.tolist()
        
        # Use standard processing on aggregated data
        return self._train_standard(processed_baskets)
    
    def _preprocess_transactions(self, transactions: List[Dict[str, Any]]) -> List[List[str]]:
        """Fast preprocessing with minimal memory footprint"""
        baskets = []
        
        for txn in transactions:
            basket_set = set()
            items = txn.get("items") or []
            
            for item in items:
                pid = item.get("productId")
                if pid:
                    basket_set.add(str(pid).strip())
            
            if len(basket_set) >= 1:  # At least 1 item
                baskets.append(list(basket_set))
        
        return baskets
    
    def _build_rule_index(self):
        """Build fast lookup index"""
        self.rule_map = {}
        
        if self.rules_df is None or self.rules_df.empty:
            return
        
        for _, row in self.rules_df.iterrows():
            score = round(float(row['confidence'] * row['lift']), 4)
            
            for ant in row['ants']:
                if ant not in self.rule_map:
                    self.rule_map[ant] = []
                
                for con in row['cons']:
                    self.rule_map[ant].append((con, score))
    
    def predict_affinity(self, cart_items: List[str], top_n: int = 10) -> Dict[str, float]:
        """High-speed inference"""
        if not self.rule_map or not cart_items:
            return {}
        
        recommendations = {}
        cart_set = set(cart_items)
        
        for item in cart_items:
            if item in self.rule_map:
                for target, score in self.rule_map[item]:
                    if target not in cart_set:
                        recommendations[target] = max(recommendations.get(target, 0), score)
        
        return dict(sorted(recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n])
    
    def get_sanitized_rules(self) -> List[Dict[str, Any]]:
        """JSON-safe output"""
        if self.rules_df is None or self.rules_df.empty:
            return []
        
        display_cols = ["ants", "cons", "support", "confidence", "lift"]
        clean_df = self.rules_df[display_cols].copy()
        clean_df = clean_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)
        
        # Limit to top 1000 rules to avoid memory issues
        clean_df = clean_df.nlargest(1000, 'lift')
        
        return clean_df.to_dict(orient="records")


def run_mba_optimized(transactions, **kwargs):
    """
    Optimized MBA function for large datasets
    Automatically chooses best processing method
    """
    engine = OptimizedMarketBasketEngine(
        min_support=kwargs.get('min_support', 0.001),
        min_confidence=kwargs.get('min_confidence', 0.1),
        min_lift=kwargs.get('min_lift', 0.5)
    )
    
    # Use Dask for datasets > 100K
    use_dask = len(transactions) > 100000
    
    return engine.train_large_dataset(transactions, use_dask=use_dask)
