const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    changeType: {
      type: String,
      enum: ["SALE", "RESTOCK", "RETURN", "EXPIRED", "ADJUSTMENT"],
      required: true,
    },
    quantityChanged: {
      type: Number, // Positive for restock, negative for sales/expired
      required: true,
    },
    stockAfter: {
      type: Number, // The snapshot of stock after this change
      required: true,
    },
    note: String, // e.g., "Batch #402 received" or "Damaged during transit"
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);