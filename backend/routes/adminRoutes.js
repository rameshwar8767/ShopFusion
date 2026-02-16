// routes/adminRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const AssociationRule = require("../models/AssociationRule");

const router = express.Router();

// ======================================================
//   PROTECT ALL ROUTES + ADMIN ONLY
// ======================================================
router.use(protect);
router.use(authorize("admin"));

// ======================================================
//   GET ALL USERS (Paginated, No Password)
//   GET /api/admin/users
// ======================================================
router.get("/users", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: users.length,
      total,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// ======================================================
//   SYSTEM STATS
//   GET /api/admin/stats
// ======================================================
router.get("/stats", async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalProducts,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ======================================================
//   CHANGE USER ROLE
//   PUT /api/admin/users/:id/role
// ======================================================
router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!["admin", "retailer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // 🚫 Prevent self role change
    if (req.user.id === targetUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});


// ======================================================
//   ANALYTICS (Charts)
//   GET /api/admin/analytics
// ======================================================
router.get("/analytics", async (req, res, next) => {
  try {
    // Transactions per day
    const transactionsByDate = await Transaction.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User role distribution
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        transactionsByDate,
        usersByRole,
      },
    });
  } catch (err) {
    next(err);
  }
});
// ======================================================
//   DELETE USER + CLEANUP DATA
//   DELETE /api/admin/users/:id
// ======================================================
router.delete("/users/:id", async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // 🚫 Prevent self deletion
    if (req.user.id === targetUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Promise.all([
  User.findByIdAndDelete(targetUserId),
  Product.deleteMany({ user: targetUserId }),
  Transaction.deleteMany({ user: targetUserId }), // 🔄 was userId
  AssociationRule.deleteMany({ userId: targetUserId }),
]);


    res.json({
      success: true,
      message: "User and all related data deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;