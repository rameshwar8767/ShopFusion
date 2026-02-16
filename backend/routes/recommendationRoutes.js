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
const { protect } = require("../middleware/auth");

router.post("/mba", protect, generateMBA);
router.get("/rules", protect, getAssociationRules);
router.get("/bundles", protect, getProductBundles);
router.post("/inventory", protect, getInventoryOptimization);
router.get("/dashboard", protect, getDashboard);
router.get("/hybrid", protect, getHybridRecommendations);

module.exports = router;
