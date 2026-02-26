const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    trim: true
  },

  // Unique identifier for the customer (used for Collaborative Filtering)
  shopperId: {
    type: String,
    required: true,
    index: true
  },

  items: [
    {
      productId: { type: String, required: true }, // The string ID used by ML
      productRef: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product",
        required: true 
      },
      productName: String,
      quantity: { type: Number, default: 1, min: 1 },
      price: { type: Number, required: true },
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  // The Retailer who owns this transaction
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- INDEXES ---
// Optimized for ML: Fetching all transactions for a specific retailer
transactionSchema.index({ user: 1, timestamp: -1 });
transactionSchema.index({ shopperId: 1 });
// Prevent duplicate transaction entries
transactionSchema.index({ user: 1, transactionId: 1 }, { unique: true });

// --- MIDDLEWARE ---
// Auto-calculate totalAmount if not provided (Safety net)
transactionSchema.pre('validate', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);