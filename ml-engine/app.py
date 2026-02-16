# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from algorithms.mba import run_mba
from data.loader import load_transactions, save_association_rules


app = FastAPI(title="Shop Fusion ML Engine")


class MBAParams(BaseModel):
    minSupport: float = 0.02
    minConfidence: float = 0.3
    minLift: float = 1.0


class MBARequest(BaseModel):
    userId: str
    transactions: Optional[List[Dict[str, Any]]] = None
    params: Optional[MBAParams] = None


class MBAResponse(BaseModel):
    success: bool
    rules: List[Dict[str, Any]]


@app.post("/ml/mba", response_model=MBAResponse)
def run_mba_for_node(body: MBARequest):
    params = body.params or MBAParams()

    # Prefer transactions passed from Node; fallback to Mongo if missing
    if body.transactions is not None:
        transactions = body.transactions
    else:
        transactions = load_transactions(body.userId)

    if not transactions:
        return MBAResponse(success=True, rules=[])

    try:
        rules = run_mba(
            transactions=transactions,
            min_support=params.minSupport,
            min_confidence=params.minConfidence,
            min_lift=params.minLift,
        )
        save_association_rules(body.userId, rules)
    except Exception as e:
        print("MBA error:", e)
        raise HTTPException(status_code=500, detail="MBA computation failed")

    return MBAResponse(success=True, rules=rules)
