from db import get_db
from bson import ObjectId

db = get_db()
users = ['6a396937f0a20846c20de989', '6a396b57f0a20846c20e3219', '6a396ecbdde97b2ef410a1b9']

for u in users:
    p = db.products.count_documents({'user': ObjectId(u)})
    t = db.transactions.count_documents({'user': ObjectId(u)})
    print(f'User {u}: {p} products, {t} transactions')
