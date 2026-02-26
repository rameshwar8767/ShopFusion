// utils/inventoryLogger.js
const InventoryLog = require("../models/InventoryLog.js");

const logMovement = async (userId, productObjectId, sku, type, change, newStock, note = "") => {
  try {
    // 1. Ensure all required fields from your Schema are present
    if (!userId || !productObjectId || !sku) {
      console.error("❌ Log Failed: Missing UserID, ProductID, or SKU");
      return;
    }

    // 2. Create the log
    const log = await InventoryLog.create({
      user: userId,             // ObjectId
      product: productObjectId, // ObjectId
      productId: sku,           // String (The field your ML engine needs)
      changeType: type,         // Must match Enum: SALE, RESTOCK, etc.
      quantityChanged: Number(change),
      stockAfter: Number(newStock),
      note: note
    });

    console.log(`✅ Log Generated: ${type} - ${sku}`);
    return log;
  } catch (error) {
    console.error("❌ Mongoose Log Error:", error.message);
  }
};

module.exports = logMovement;