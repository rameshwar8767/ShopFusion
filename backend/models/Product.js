const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productId: {
      type: String,
      required: true,
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
    },

    price: {
      type: Number,
      required: true,
    },

    description: String,

    stock: {
      type: Number,
      default: 0,
    },

    features: {
      type: [String],
      default: [],
    },

    expiryDate: Date,

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ user: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);