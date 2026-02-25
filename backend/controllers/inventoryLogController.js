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
    // 1. Ensure we have a user
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // 2. We MUST convert the string ID to a Mongoose ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id || req.user._id);

    const stats = await InventoryLog.aggregate([
      { 
        $match: { user: userId } 
      },
      {
        $group: {
          _id: "$changeType",
          totalQuantity: { $sum: { $abs: "$quantityChanged" } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Aggregation Error:", error); // This will show in your terminal
    res.status(500).json({ success: false, message: error.message });
  }
};