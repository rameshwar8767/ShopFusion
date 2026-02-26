import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class CollaborativeBasedEngine:
    """
    Highly Optimized User-Based Collaborative Filtering.
    Uses Vectorized Matrix Multiplication for speed and scalability.
    """

    def __init__(self):
        self.user_item_matrix = None
        self.user_similarity_df = None
        self.product_columns = []
        self.user_ids = []

    def fit(self, transactions: List[Dict[str, Any]]):
        """
        Builds a User-Product interaction matrix and calculates similarity.
        """
        if not transactions:
            return

        # 1. Flatten transactions efficiently
        data = []
        for txn in transactions:
            u_id = str(txn.get("userId") or txn.get("user", ""))
            items = txn.get("items") or []
            
            for item in items:
                p_id = str(item.get("productId", ""))
                if u_id and p_id:
                    # Logic: 1 for purchase, but could be qty-based
                    data.append({"userId": u_id, "productId": p_id, "score": 1})

        if not data:
            return

        # 2. Create User-Item Pivot Table
        df = pd.DataFrame(data)
        
        # Use 'sum' to handle multiple purchases of the same item
        # Fillna(0) is necessary for cosine_similarity to work
        self.user_item_matrix = df.pivot_table(
            index='userId', 
            columns='productId', 
            values='score', 
            aggfunc='sum'
        ).fillna(0)

        self.product_columns = self.user_item_matrix.columns.tolist()
        self.user_ids = self.user_item_matrix.index.tolist()

        # 3. Calculate User-User Similarity Matrix
        # Cosine similarity handles the magnitude of purchases automatically
        user_sim = cosine_similarity(self.user_item_matrix)
        self.user_similarity_df = pd.DataFrame(
            user_sim, 
            index=self.user_ids, 
            columns=self.user_ids
        )

    def get_recommendations(self, target_user_id: str, top_n: int = 10) -> Dict[str, float]:
        """
        Vectorized recommendation logic:
        Score = (Similarity Vector) dot (User-Item Matrix)
        """
        # Safety Check
        if self.user_similarity_df is None or target_user_id not in self.user_ids:
            return {}

        # 1. Get the similarity scores for the target user (shape: 1 x Users)
        user_sim_scores = self.user_similarity_df.loc[target_user_id].values
        
        # 2. Calculate raw scores for ALL products (Vectorized)
        # result shape: (1 x Products)
        # This replaces the nested loops and is much faster
        raw_recom_scores = user_sim_scores.dot(self.user_item_matrix.values)
        
        # 3. Create a Series for easy manipulation
        recom_series = pd.Series(raw_recom_scores, index=self.product_columns)

        # 4. Filter: Remove products the user has already bought
        target_user_history = self.user_item_matrix.loc[target_user_id]
        already_bought = target_user_history[target_user_history > 0].index
        
        # Set scores of already bought items to 0
        recom_series.drop(already_bought, inplace=True, errors='ignore')

        # 5. Get top N and convert to dictionary
        # We round for cleaner output in the JSON API
        top_recs = recom_series.sort_values(ascending=False).head(top_n)
        
        return {str(k): round(float(v), 4) for k, v in top_recs.to_dict().items() if v > 0}