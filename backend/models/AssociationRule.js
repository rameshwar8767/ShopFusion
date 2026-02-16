// models/AssociationRule.js
const mongoose = require('mongoose');

const associationRuleSchema = new mongoose.Schema({
  antecedent: [String],
  consequent: [String],
  support: { type: Number, required: true },
  confidence: { type: Number, required: true },
  lift: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // retailer
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // optional expiry (30 days)
});

// helpful indexes
associationRuleSchema.index({ userId: 1, lift: -1 });
associationRuleSchema.index({ userId: 1, confidence: -1 });

module.exports = mongoose.model('AssociationRule', associationRuleSchema);
