const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    // Redundant but helpful for the Python ML Engine lookup speed
    productId: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      enum: ["SALE", "RESTOCK", "RETURN", "EXPIRED", "ADJUSTMENT"],
      required: true,
      index: true,
    },
    quantityChanged: {
      type: Number, 
      required: true,
    },
    stockAfter: {
      type: Number, 
      required: true,
      min: 0
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound Index: Great for generating "Stock History" reports for retailers
inventoryLogSchema.index({ product: 1, createdAt: -1 });

// Static method to easily log a sale from the Transaction Controller
inventoryLogSchema.statics.logSale = async function(userId, productObjectId, sku, quantity, currentStock) {
  return await this.create({
    user: userId,
    product: productObjectId,
    productId: sku,
    changeType: "SALE",
    quantityChanged: -quantity,
    stockAfter: currentStock - quantity,
    note: "Automated sale log from transaction"
  });
};

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);