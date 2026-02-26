const express = require("express");
const router = express.Router();
const {
  generateMBA,
  getAssociationRules,
  getProductBundles,
  getInventoryOptimization,
  getDashboard,
  getHybridRecommendations,
} = require("../controllers/recommendationController");

// Authentication and Authorization Middleware
const { protect, authorize } = require("../middleware/auth");

// --- ML TRAINING & DATA ---
// Only retailers should be able to trigger the ML training pipeline
router.post("/mba", protect, authorize('retailer'), generateMBA);

// --- ANALYTICS & DASHBOARD ---
router.get("/dashboard", protect, getDashboard);
router.get("/rules", protect, getAssociationRules);
router.get("/inventory", protect, getInventoryOptimization);

// --- FRONTEND RECOMMENDATIONS ---
router.get("/bundles", protect, getProductBundles);
router.get("/hybrid", protect, getHybridRecommendations);

module.exports = router;