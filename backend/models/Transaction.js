const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },

  shopperId: {
    type: String,
    required: true,
  },

  items: {
    type: [
      {
        productId: { type: String, required: true },
        productRef: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: { type: Number, default: 1 },
        price: Number,
      },
    ],
    default: [],
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  // 🔄 rename userId -> user to match ML engine and Product schema
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Indexes
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ shopperId: 1 });
transactionSchema.index({ user: 1, transactionId: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", transactionSchema);
