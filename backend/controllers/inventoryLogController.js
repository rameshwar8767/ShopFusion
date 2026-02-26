const InventoryLog = require("../models/InventoryLog.js");
const mongoose = require("mongoose");
// @desc    Get all inventory movement logs
// @route   GET /api/inventory/logs
// @access  Private


// controllers/inventoryController.js
exports.getInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Must filter by req.user.id
    const query = { user: req.user.id };

    // 2. MUST .populate('product') to get name and SKU for the frontend table
    const logs = await InventoryLog.find(query)
      .populate("product", "name sku price") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryLog.countDocuments(query);

res.status(200).json({
  success: true,
  data: logs,
  pagination: {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  }
});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get stats for the Warehouse cards (Turnover, disposals, etc)
// @route   GET /api/inventory/stats
exports.getWarehouseStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Optional: Filter for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const statsArray = await InventoryLog.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: thirtyDaysAgo } // Only recent logs
        } 
      },
      {
        $group: {
          _id: "$changeType",
          totalQuantity: { $sum: { $abs: "$quantityChanged" } },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Your existing formatting logic remains the same...
    const formattedStats = {
       // ... (rest of your object)
    };

    res.status(200).json({ success: true, data: formattedStats, timeframe: "30d" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};