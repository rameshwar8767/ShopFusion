const mongoose = require('mongoose');

const associationRuleSchema = new mongoose.Schema({
  // Aligning with Python output: antecedents (plural)
  antecedents: {
    type: [String],
    required: true,
    index: true
  },
  consequents: {
    type: [String],
    required: true,
    index: true
  },
  support: { 
    type: Number, 
    required: true 
  },
  confidence: { 
    type: Number, 
    required: true 
  },
  lift: { 
    type: Number, 
    required: true 
  },
  // The Retailer/Store ID
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // We use updatedAt to track the last time the ML engine refreshed these rules
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  // TTL Index: Rules expire after 30 days if not refreshed
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 60 * 60 * 24 * 30 
  },
});

// --- INDEXES ---
// Optimized for the Fusion Layer: Fetching the best bundles for a specific retailer
associationRuleSchema.index({ userId: 1, lift: -1, confidence: -1 });

module.exports = mongoose.model('AssociationRule', associationRuleSchema);