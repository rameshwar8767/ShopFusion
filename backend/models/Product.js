const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The SKU or custom ID provided by the retailer
    productId: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
    },

    // Added to support the 'image' field expected by the ML Fusion layer
    image: {
      type: String,
      default: "https://via.placeholder.com/150", 
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    features: {
      type: [String],
      default: [],
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },

    // Added for business logic: discount tracking
    discount: {
      type: Number,
      default: 0, // e.g., 20 for 20%
      min: 0,
      max: 100
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: Check if product is currently discounted
productSchema.virtual('isDiscounted').get(function() {
  return this.discount > 0;
});

// Virtual: Days until expiry
productSchema.virtual('daysToExpiry').get(function() {
  if (!this.expiryDate) return null;
  const diffTime = this.expiryDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Compound Index: Ensures productId uniqueness per retailer
productSchema.index({ user: 1, productId: 1 }, { unique: true });

// Text Index: For internal MongoDB search (optional but helpful)
productSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);