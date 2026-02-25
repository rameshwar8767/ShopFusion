const express = require("express");
const router = express.Router();
const { getInventoryLogs, getWarehouseStats } = require("../controllers/inventoryLogController.js");
const { protect } = require("../middleware/auth.js"); // Adjust path based on your setup

// All routes are protected as they belong to the specific user/business
router.use(protect);

router.get("/logs", getInventoryLogs);
router.get("/stats", getWarehouseStats);

module.exports = router;