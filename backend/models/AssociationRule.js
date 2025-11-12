const mongoose = require('mongoose');

const associationRuleSchema = new mongoose.Schema({
  antecedent: [String], // Items that lead to consequent
  consequent: [String], // Items predicted
  support: {
    type: Number,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  lift: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, // Auto-delete after 7 days
  },
});

// Index for efficient retrieval
associationRuleSchema.index({ lift: -1 });
associationRuleSchema.index({ confidence: -1 });

module.exports = mongoose.model('AssociationRule', associationRuleSchema);
