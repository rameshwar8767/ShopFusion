import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class ContentBasedEngine:
    """
    Highly Optimized Content-Based Recommender.
    Uses Centroid-based User Profiling for fast multi-item inference.
    """
    
    def __init__(self):
        # Increased max_features to prevent memory bloat on massive catalogs
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = None
        self.product_ids = []
        self.product_map = {} 

    def fit(self, products: List[Dict[str, Any]]):
        """
        Builds the similarity matrix from product metadata.
        """
        if not products:
            return
            
        corpus = []
        self.product_ids = []
        
        for idx, p in enumerate(products):
            pid = str(p.get("productId") or p.get("_id", ""))
            name = str(p.get("name", ""))
            cat = str(p.get("category", ""))
            desc = str(p.get("description", ""))
            
            # Weighted content: Name > Category > Description
            combined_text = f"{name} {name} {cat} {desc}".lower()
            
            corpus.append(combined_text)
            self.product_ids.append(pid)
            self.product_map[pid] = idx

        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def get_similar_products(self, product_id: str, top_n: int = 10) -> Dict[str, float]:
        """
        Single product similarity lookup.
        """
        if product_id not in self.product_map or self.tfidf_matrix is None:
            return {}

        idx = self.product_map[product_id]
        
        # Vectorized similarity calculation
        sim_scores = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
        
        # Use argsort for faster top-N extraction than dictionary sorting
        related_indices = sim_scores.argsort()[-(top_n+1):][::-1]
        
        results = {}
        for i in related_indices:
            target_pid = self.product_ids[i]
            if target_pid != product_id and sim_scores[i] > 0.1:
                results[target_pid] = float(sim_scores[i])
        
        return results

    def predict_for_user(self, user_history_ids: List[str], top_n: int = 10) -> Dict[str, float]:
        """
        Optimized: Creates a 'User Profile Vector' by averaging history items.
        One matrix multiplication instead of N similarity calls.
        """
        if self.tfidf_matrix is None or not user_history_ids:
            return {}

        # 1. Get indices of products the user interacted with
        valid_indices = [self.product_map[pid] for pid in user_history_ids if pid in self.product_map]
        
        if not valid_indices:
            return {}

        # 2. Create User Profile Vector (Mean of all history item vectors)
        user_profile_vector = self.tfidf_matrix[valid_indices].mean(axis=0)
        
        # 3. Calculate similarity between User Profile and ALL products
        # result: (1 x total_products)
        sim_scores = cosine_similarity(user_profile_vector, self.tfidf_matrix).flatten()

        # 4. Filter products already in history
        history_set = set(user_history_ids)
        
        # 5. Extract top results efficiently
        # Get indices of top_n + history length to account for filtering
        top_indices = sim_scores.argsort()[-(top_n + len(history_set)):][::-1]
        
        user_scores = {}
        for i in top_indices:
            pid = self.product_ids[i]
            if pid not in history_set and sim_scores[i] > 0.05: # Lower threshold for aggregated profile
                user_scores[pid] = round(float(sim_scores[i]), 4)
                if len(user_scores) >= top_n:
                    break
                    
        return user_scores