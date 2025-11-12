const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  items: [{
    productId: {
      type: String,
      required: true,
    },
    productName: String,
    quantity: {
      type: Number,
      default: 1,
    },
    price: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Index for faster queries
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ customerId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
