// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose')
// ✅ Retailer-scoped, searchable list
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const query = { user: req.user.id }; // 🔐 scope to retailer

    if (search) {
      const keyword = search.trim();
      query.$or = [
        { transactionId: { $regex: keyword, $options: "i" } },
        { shopperId: { $regex: keyword, $options: "i" } }, // was customerId
      ];
    }

    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id, // 🔄 was userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, errors: errors.array() });
    }

    req.body.user = req.user.id; // 🔄 was userId

    if (!req.body.transactionId) {
      req.body.transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)}`;
    }

    // Attach productRef + productName + price
    for (const item of req.body.items) {
      const product = await Product.findOne({
        productId: item.productId,
        user: req.user.id,
      });

      if (product) {
        item.productRef = product._id;
        item.productName = product.name;
        item.price = product.price;
      }
    }

    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// controllers/transactionController.js
exports.bulkUploadTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(transactions) || !transactions.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid transactions array",
      });
    }

    const withUser = transactions.map((t) => ({
      ...t,
      user: userId,
      transactionId:
        t.transactionId ||
        `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    }));

    const inserted = await Transaction.insertMany(withUser, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(207).json({
        success: true,
        message: "Some duplicate transactions were skipped",
      });
    }
    next(error);
  }
};


exports.deleteTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id, // 🔄 was userId
    });

    if (!txn) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    await txn.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Dashboard stats
// controllers/transactionController.js


// controllers/transactionController.js

exports.getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1) Overview
    const overviewAgg = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageTransactionValue: { $avg: "$totalAmount" },
          uniqueShoppers: { $addToSet: "$shopperId" },   // 👈 matches schema
        },
      },
    ]);

    const o = overviewAgg[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      averageTransactionValue: 0,
      uniqueShoppers: [],
    };

    // 2) Revenue by date (last 30 days)
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const revenueByDate = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: from },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3) Top products by quantity
    const topProducts = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTransactions: o.totalTransactions,
          totalRevenue: o.totalRevenue,
          averageTransactionValue: o.averageTransactionValue,
          uniqueCustomers: o.uniqueShoppers.length, // field name for frontend
        },
        revenueByDate,
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
};
