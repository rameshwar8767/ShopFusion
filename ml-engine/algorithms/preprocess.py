import re
from typing import List, Dict, Any

def preprocess_transactions(
    transactions: List[Dict[str, Any]],
    use_id: bool = True,
    min_basket_size: int = 1
) -> List[List[str]]:
    """
    Optimized conversion of transaction documents into unique item baskets.
    """
    baskets: List[List[str]] = []
    
    # Pre-select the key to avoid 'if' logic inside the loop
    target_key = "productId" if use_id else "productName"

    for txn in transactions:
        # Use a set to handle duplicates within the same transaction
        basket_set = set()
        items = txn.get("items") or []
        
        for item in items:
            val = item.get(target_key)
            if val:
                # Force string, remove whitespace, and normalize case for names
                clean_val = str(val).strip()
                if not use_id:
                    clean_val = clean_val.lower()
                
                if clean_val:
                    basket_set.add(clean_val)

        # Filter by size (MBA specifically benefits from size >= 2)
        if len(basket_set) >= min_basket_size:
            baskets.append(list(basket_set))

    return baskets

def preprocess_product_metadata(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Cleans and prepares product text for Content-Based TF-IDF vectorization.
    Removes special characters to ensure keywords match accurately.
    """
    processed_metadata = []
    
    for p in products:
        # Support MongoDB _id or productId
        pid = str(p.get("productId") or p.get("_id", ""))
        if not pid:
            continue
            
        # Get raw fields with empty string defaults
        name = str(p.get("name", ""))
        cat = str(p.get("category", ""))
        desc = str(p.get("description", ""))
        
        # Combine fields: Give Name and Category more weight by repeating them
        # This is a common trick in content-based filtering
        text_blob = f"{name} {name} {cat} {cat} {desc}"
        
        # Clean the text: Remove special characters, keep only alphanumeric
        clean_text = re.sub(r'[^a-zA-Z0-9\s]', '', text_blob).lower().strip()
        
        processed_metadata.append({
            "productId": pid,
            "content_string": clean_text
        })
        
    return processed_metadata