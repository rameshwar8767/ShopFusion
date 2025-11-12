const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const revenueResult = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalProducts,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
