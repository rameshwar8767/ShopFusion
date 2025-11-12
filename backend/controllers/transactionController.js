const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        query.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    // Customer filtering
    if (req.query.customerId) {
      query.customerId = req.query.customerId;
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
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

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add user to req.body
    req.body.userId = req.user.id;

    // Generate transaction ID if not provided
    if (!req.body.transactionId) {
      req.body.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
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

// @desc    Bulk upload transactions
// @route   POST /api/transactions/bulk
// @access  Private
exports.bulkUploadTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transactions',
      });
    }

    // Add userId to all transactions
    const transactionsWithUser = transactions.map(transaction => ({
      ...transaction,
      userId: req.user.id,
      transactionId: transaction.transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    }));

    const insertedTransactions = await Transaction.insertMany(transactionsWithUser, {
      ordered: false, // Continue on error
    });

    res.status(201).json({
      success: true,
      count: insertedTransactions.length,
      data: insertedTransactions,
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(207).json({
        success: true,
        message: 'Some transactions were duplicates and skipped',
        inserted: error.insertedDocs ? error.insertedDocs.length : 0,
      });
    }
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageTransactionValue: { $avg: '$totalAmount' },
          uniqueCustomers: { $addToSet: '$customerId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalTransactions: 1,
          totalRevenue: 1,
          averageTransactionValue: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' },
        },
      },
    ]);

    // Revenue by date
    const revenueByDate = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          revenue: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    // Top products
    const topProducts = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTransactions: 0,
          totalRevenue: 0,
          averageTransactionValue: 0,
          uniqueCustomers: 0,
        },
        revenueByDate,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
