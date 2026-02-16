const express = require("express");
const router = express.Router();

const { getRecommendations } = require("../controllers/mlController");
const { protect } = require("../middleware/auth");

// GET /api/ml/recommendations
router.get("/recommendations", protect, getRecommendations);

module.exports = router;
