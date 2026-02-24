# algorithms/mba.py
from typing import List, Dict, Any
import math

import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

from algorithms.preprocess import preprocess_transactions  # make sure this file exists


def generate_rules(
    baskets: List[List[str]],
    min_support: float = 0.02,
    min_confidence: float = 0.3,
) -> List[Dict[str, Any]]:
    """
    Run Apriori + association_rules on baskets and return a list of rule dicts.
    """
    if not baskets:
        return []

    te = TransactionEncoder()
    te_array = te.fit(baskets).transform(baskets)
    df = pd.DataFrame(te_array, columns=te.columns_)

    frequent_itemsets = apriori(
        df,
        min_support=min_support,
        use_colnames=True,
    )

    if frequent_itemsets.empty:
        return []

    rules_df = association_rules(
        frequent_itemsets,
        metric="confidence",
        min_threshold=min_confidence,
    )

    # Keep only JSON‑safe, useful columns
    use_cols = [
        "antecedents",
        "consequents",
        "support",
        "confidence",
        "lift",
        "leverage",
        "jaccard",
    ]
    rules_df = rules_df[use_cols]

    # Convert frozensets to lists
    rules_df["antecedents"] = rules_df["antecedents"].apply(list)
    rules_df["consequents"] = rules_df["consequents"].apply(list)

    return rules_df.to_dict(orient="records")


def _sanitize_rule(rule: dict) -> dict:
    """
    Drop rarely used metrics and ensure no NaN/inf values (JSON‑safe).
    """
    clean = {}
    for k, v in rule.items():
        if k in ("certainty", "kulczynski", "zhangs_metric", "representativity"):
            continue

        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            clean[k] = 0.0
        else:
            clean[k] = v
    return clean


def run_mba(
    transactions,
    min_support: float = 0.02,
    min_confidence: float = 0.3,
    min_lift: float = 1.0,
):
    # Build baskets using productId
    baskets = preprocess_transactions(transactions, use_id=True)
    print("MBA baskets count:", len(baskets))
    print("Unique basket lengths:", sorted({len(b) for b in baskets}) or [0])

    rules = generate_rules(
        baskets,
        min_support=min_support,
        min_confidence=min_confidence,
    )

    if rules and min_lift is not None:
        rules = [r for r in rules if r.get("lift", 0) >= min_lift]

    rules = [_sanitize_rule(r) for r in rules]

    return rules