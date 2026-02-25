// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose')
const logMovement = require("../middleware/logInventory.js");
const InventoryLog = require("../models/InventoryLog.js");
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, startDate, endDate, minAmount, maxAmount } = req.query;

    const query = { user: req.user.id };

    // Search Logic
    if (search?.trim()) {
      const keyword = search.trim();
      query.$or = [
        { transactionId: { $regex: keyword, $options: "i" } },
        { shopperId: { $regex: keyword, $options: "i" } },
      ];
    }

    // Date Logic
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        query.timestamp.$lte = end.setHours(23, 59, 59, 999);
      }
    }

    // Amount Logic - Added check for non-empty values
    if (minAmount !== undefined && minAmount !== "") {
      query.totalAmount = { ...query.totalAmount, $gte: Number(minAmount) };
    }
    if (maxAmount !== undefined && maxAmount !== "") {
      query.totalAmount = { ...query.totalAmount, $lte: Number(maxAmount) };
    }

    const numericPage = Math.max(1, Number(page)); // Ensure page is at least 1
    const numericLimit = Math.min(100, Number(limit)); // Cap limit to 100 for safety

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .sort({ timestamp: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUniqueCustomers = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you filter by the logged-in merchant/user

    const customers = await Transaction.aggregate([
      // 1. Filter transactions belonging to the current user/merchant
      { $match: { user: new mongoose.Types.ObjectId(userId) } },

      // 2. Group by shopperId (the unique identifier for the customer)
      {
        $group: {
          _id: "$shopperId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderDate: { $max: "$timestamp" },
          // If you store names/emails in the transaction items or shopperId is an email
          // we grab the first instance found
          customerName: { $first: "$shopperId" }, 
        },
      },

      // 3. Sort by most recent activity
      { $sort: { lastOrderDate: -1 } },

      // 4. Project the final shape for your ActiveClient frontend page
{
  $project: {
    _id: 0,
    shopperId: "$_id",
    name: "$customerName",
    orderCount: 1,
    totalSpent: 1,
    lastOrderDate: 1,
    avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] }, // Useful for marketing stats
    email: "$_id", 
  },
},
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unique customers",
      error: error.message,
    });
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate({
      path: 'items.productRef',
      select: 'name sku category image price' // Only get what you need
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
    // Check if the error is a Malformed ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: "Invalid Transaction ID format" });
    }
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    req.body.user = req.user.id;

    if (!req.body.transactionId) {
      req.body.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }

    // Process items and log movements
    for (const item of req.body.items) {
      const product = await Product.findOne({
        productId: item.productId,
        user: req.user.id,
      });

      if (product) {
        // 1. Fill transaction item details
        item.productRef = product._id;
        item.productName = product.name;
        item.price = product.price;

        // 2. Update the actual Product stock in DB
        product.countInStock -= item.quantity;
        await product.save();

        // 3. Create the Inventory Log (Warehouse Audit Trail)
        await InventoryLog.create({
          user: req.user.id,
          product: product._id,
          changeType: "SALE",
          quantityChanged: -item.quantity,
          stockAfter: product.countInStock,
          note: `Sold via Transaction: ${req.body.transactionId}`
        });
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
      return res.status(400).json({ success: false, message: "Invalid transactions array" });
    }

    const preparedTransactions = [];
    const logEntries = [];
    const productUpdates = [];

    for (const t of transactions) {
      const transactionId = t.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const processedItems = [];

      for (const item of t.items) {
        const product = await Product.findOne({ productId: item.productId, user: userId });
        
        if (product) {
          // --- 🛡️ THE FIX: DEFENSIVE MATH ---
          // Use Number() and || 0 to ensure we never get NaN
          const currentStock = Number(product.countInStock) || 0;
          const soldQty = Number(item.quantity) || 0;
          const stockAfterCalc = currentStock - soldQty;

          // 1. Add productRef (Crucial for Frontend table to show names)
          processedItems.push({
            ...item,
            productRef: product._id,
            quantity: soldQty 
          });

          // 2. Prepare Stock Update
          productUpdates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $inc: { countInStock: -soldQty } }
            }
          });

          // 3. Prepare Inventory Log Entry (Guaranteed Number now)
          logEntries.push({
            user: userId,
            product: product._id,
            changeType: "SALE",
            quantityChanged: -soldQty,
            stockAfter: stockAfterCalc, 
            note: `Bulk Upload: ${transactionId}`
          });
        }
      }

      if (processedItems.length > 0) {
        preparedTransactions.push({ 
          ...t, 
          items: processedItems,
          user: userId, 
          transactionId 
        });
      }
    }

    // --- 🚀 DATABASE OPERATIONS ---
    let result = [];
    if (preparedTransactions.length > 0) {
      result = await Transaction.insertMany(preparedTransactions, { ordered: false });
    }
    
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }
    
    if (logEntries.length > 0) {
      await InventoryLog.insertMany(logEntries);
    }

    res.status(201).json({ 
      success: true, 
      count: result.length, 
      data: result 
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(207).json({ success: true, message: "Skipped duplicates" });
    }
    next(error);
  }
};


exports.deleteTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user.id });

    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });

    // Reverse Stock for each item
    for (const item of txn.items) {
      const product = await Product.findById(item.productRef);
      if (product) {
        product.countInStock += item.quantity; // Add back the stock
        await product.save();

        // Log the deletion as a "RETURN" or "ADJUSTMENT"
        await InventoryLog.create({
          user: req.user.id,
          product: product._id,
          changeType: "RETURN",
          quantityChanged: item.quantity,
          stockAfter: product.countInStock,
          note: `Reversed: Transaction ${txn.transactionId} deleted`
        });
      }
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
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1) Overview & Unique Shoppers (Optimized)
    const overviewAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageValue: { $avg: "$totalAmount" },
          // Using $addToSet is fine for moderate data, 
          // but for massive data, consider a separate cardinality aggregation.
          shoppers: { $addToSet: "$shopperId" }, 
        },
      },
    ]);

    const o = overviewAgg[0] || { 
      totalTransactions: 0, totalRevenue: 0, averageValue: 0, shoppers: [] 
    };

    // 2) Revenue Trend (Time Series)
    const revenueByDate = await Transaction.aggregate([
      { $match: { user: userId, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3) Product Performance (Top 10)
    // We add productRef here so the frontend can link directly to the product page
    const topProducts = await Transaction.aggregate([
      { $match: { user: userId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productRef: { $first: "$items.productRef" },
          name: { $first: "$items.productName" },
          totalQty: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTransactions: o.totalTransactions,
          totalRevenue: o.totalRevenue,
          averageTransactionValue: Math.round(o.averageValue * 100) / 100,
          uniqueCustomers: o.shoppers.length,
        },
        revenueByDate,
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
};
