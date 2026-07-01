const axios = require("axios");
const mongoose = require("mongoose");
const AssociationRule = require("../models/AssociationRule");
const Product = require("../models/Product.js");
const Transaction = require("../models/Transaction");

const ML_ENGINE_URL = "http://127.0.0.1:8000";

// Helper to safely convert string → ObjectId
const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

/**
 * @desc    Triggers the Python Training Pipeline
 * @route   POST /api/recommendations/mba
 */
exports.generateMBA = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("Starting MBA generation for user:", userId);

    const transactionCount = await Transaction.countDocuments({ user: userId });
    console.log("Transaction count:", transactionCount);

    if (transactionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No transactions found. Please import transaction data first.",
      });
    }

    try {
      const mlRes = await axios.post(
        `${ML_ENGINE_URL}/api/train/${userId}`,
        {},
        { timeout: 30000 }
      );
      console.log("ML Engine response:", mlRes.data);
      res.json({
        success: true,
        message: "ML Engine training successful",
        data: mlRes.data,
      });
    } catch (mlError) {
      console.error("ML Engine Error:", mlError.message);
      if (mlError.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message: "ML Engine is not running. Please start the Python ML engine on port 8000.",
          error: "Connection refused to ML engine",
        });
      }
      throw mlError;
    }
  } catch (err) {
    console.error("MBA Generation Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: err.message,
    });
  }
};

/**
 * @desc    Fetch Hybrid Recommendations from Python Fusion Engine
 * @route   GET /api/recommendations/hybrid
 */
exports.getHybridRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mlRes = await axios.get(`${ML_ENGINE_URL}/api/recommend/${userId}`);
    res.json({ success: true, count: mlRes.data.length, data: mlRes.data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Fetch Bundles (Pre-calculated MBA rules mapped to Product Pairs)
 * @route   GET /api/recommendations/bundles
 */
exports.getProductBundles = async (req, res, next) => {
  try {
    const userId = toObjectId(req.user.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // ✅ Query with ObjectId
    const rules = await AssociationRule.find({ userId })
      .sort({ lift: -1 })
      .limit(20)
      .lean();

    console.log(`[Bundles] Found ${rules.length} rules for user ${req.user.id}`);

    if (!rules.length) {
      return res.json({
        success: true,
        message: "No bundles found. Train ML first.",
        data: [],
      });
    }

    const products = await Product.find({ user: req.user.id }).lean();
    const productMap = {};
    products.forEach((p) => {
      productMap[p.productId] = p;
    });

    const bundles = rules.map((rule) => {
      const antecedentList = rule.antecedents || [];
      const consequentList = rule.consequents || [];

      const formatProduct = (pid) => ({
        productId: pid,
        name: productMap[pid]?.name || `Product ${pid}`,
        image: productMap[pid]?.image || null,
        price: productMap[pid]?.price || null,
      });

      return {
        bundleId: rule._id,
        primaryItems: antecedentList.map(formatProduct),
        recommendedItems: consequentList.map(formatProduct),
        confidence: rule.confidence,
        lift: rule.lift,
        support: rule.support,
        expectedUplift:
          rule.lift > 3 ? "Very High" : rule.lift > 1.5 ? "High" : "Medium",
      };
    });

    res.json({ success: true, count: bundles.length, data: bundles });
  } catch (err) {
    console.error("[Bundles] Error:", err.message);
    next(err);
  }
};

/**
 * @desc    Get Inventory Optimization Suggestions
 * @route   GET /api/recommendations/inventory
 */
exports.getInventoryOptimization = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.id }).lean();

    const suggestions = products.map((p) => ({
      productId: p.productId,
      name: p.name,
      currentStock: p.stock,
      needsRestock: p.stock < 10,
      priority: p.stock < 3 ? "CRITICAL" : p.stock < 10 ? "WARNING" : "OK",
      suggestion: p.stock < 10 ? "Restock Now" : "Sufficient",
    }));

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Dashboard Summary
 * @route   GET /api/recommendations/dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = toObjectId(req.user?.id || req.user?._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const ruleCount = await AssociationRule.countDocuments({ userId });
    const productCount = await Product.countDocuments({ user: req.user.id });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const nearExpiry = await Product.find({
      user: req.user.id,
      expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() },
    })
      .limit(5)
      .lean();

    // ✅ Query with ObjectId, no broken populate
    const bundles = await AssociationRule.find({ userId })
      .sort({ lift: -1, confidence: -1 })
      .limit(3)
      .lean();

    res.json({
      success: true,
      data: {
        totalRules: ruleCount,
        totalProducts: productCount,
        engineStatus: "Active",
        near_expiry: nearExpiry,
        bundles: bundles,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Raw Association Rules for Table View
 * @route   GET /api/recommendations/rules
 */
exports.getAssociationRules = async (req, res, next) => {
  try {
    const userId = toObjectId(req.user.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // ✅ Query with ObjectId
    const rules = await AssociationRule.find({ userId }).sort({ lift: -1 }).lean();
    console.log(`[Rules] Found ${rules.length} rules for user ${req.user.id}`);

    res.json({ success: true, data: rules });
  } catch (err) {
    console.error("[Rules] Error:", err.message);
    next(err);
  }
};