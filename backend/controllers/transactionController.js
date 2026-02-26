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
const sendLowStockAlert = async (userId, product) => {
  // In a real app, you'd send an Email or Socket.io notification here
  console.log(`⚠️ ALERT: ${product.name} (SKU: ${product.productId}) is low on stock! Current: ${product.stock}`);
  
  // You can also create a 'Notification' model entry here
  // await Notification.create({ user: userId, message: `Restock needed for ${product.name}` });
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

    for (const item of req.body.items) {
      const product = await Product.findOne({
        productId: item.productId,
        user: req.user.id,
      });

      if (product) {
        item.productRef = product._id;
        item.productName = product.name;
        item.price = product.price;

        // Update Product stock
        product.stock -= item.quantity; // Note: Use .stock to match Product schema
        await product.save();
        if (product.stock < 5) {
  await sendLowStockAlert(req.user.id, product);
}
        // --- FIX: Added productId and ensured stockAfter isn't negative ---
        await InventoryLog.create({
          user: req.user.id,
          product: product._id,
          productId: product.productId, // Added missing required field
          changeType: "SALE",
          quantityChanged: -item.quantity,
          stockAfter: Math.max(0, product.stock), // Prevents -2 error
          note: `Sold via Transaction: ${req.body.transactionId}`
        });
      }
    }

    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
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
          const currentStock = Number(product.stock) || 0; // Use .stock
          const soldQty = Number(item.quantity) || 0;
          const stockAfterCalc = Math.max(0, currentStock - soldQty); // Fix: Prevent negative

          processedItems.push({
            ...item,
            productRef: product._id,
            productName: product.name,
            price: product.price,
            quantity: soldQty 
          });

          productUpdates.push({
            updateOne: {
              filter: { _id: product._id },
              update: { $inc: { stock: -soldQty } } // Use .stock
            }
          });

          // --- FIX: Added productId here ---
          logEntries.push({
            user: userId,
            product: product._id,
            productId: product.productId, // Added missing required field
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

    // Database operations remain the same...
    if (preparedTransactions.length > 0) await Transaction.insertMany(preparedTransactions, { ordered: false });
    if (productUpdates.length > 0) await Product.bulkWrite(productUpdates);
    if (logEntries.length > 0) await InventoryLog.insertMany(logEntries);

    res.status(201).json({ success: true, count: preparedTransactions.length });
  } catch (error) {
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

    // 1) Overview & Unique Shoppers
    const overviewAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageValue: { $avg: "$totalAmount" },
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

    // 3) Product Performance (Top 10) - KEY ALIGNMENT FIXED HERE
    const topProducts = await Transaction.aggregate([
      { $match: { user: userId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productRef: { $first: "$items.productRef" },
          productName: { $first: "$items.productName" }, // Changed from 'name' to 'productName'
          totalQuantity: { $sum: "$items.quantity" },   // Changed from 'totalQty' to 'totalQuantity'
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } // Added for revenue analysis
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
          averageTransactionValue: Math.round(o.averageValue * 100) / 100,
          uniqueCustomers: o.shoppers.length,
        },
        revenueByDate, // Matches frontend revenueData
        topProducts,   // Matches frontend topProductsData
      },
    });
  } catch (err) {
    next(err);
  }
};
