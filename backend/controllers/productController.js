// controllers/productController.js
const InventoryLog = require("../models/InventoryLog");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");

/**
 * ========================================================
 * @desc    Get all products (search + filter + pagination)
 * @route   GET /api/products
 * @access  Private (Retailer)
 * ========================================================
 */
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // 🔐 Retailer-specific query
    const query = { user: req.user.id };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      const keyword = req.query.search.trim();
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { productId: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      count: products.length,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
exports.restockProduct = async (req, res, next) => {
  try {
    const { productId, amount } = req.body;

    // 1. Find product and verify ownership
    const product = await Product.findOne({ 
      productId: productId, 
      user: req.user.id 
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Update the Product Stock
    const oldStock = product.stock;
    product.stock += Number(amount);
    await product.save();

    // 3. Create the Audit Log (All required fields included)
    await InventoryLog.create({
      user: req.user.id,        // The person performing the restock
      product: product._id,     // The MongoDB ObjectId
      productId: product.sku || product.productId, // <--- REQUIRED BY YOUR SCHEMA
      changeType: "RESTOCK",    // Must be uppercase to match your Enum
      quantityChanged: Number(amount),
      stockAfter: product.stock,
      note: req.body.note || "Manual warehouse restock"
    });

    res.status(200).json({ 
      success: true, 
      message: "Stock updated and logged",
      newStock: product.stock 
    });
  } catch (error) {
    console.error("Restock Error:", error);
    next(error);
  }
};
/**
 * ========================================================
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Private
 * ========================================================
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      productId: req.params.id,
      user: req.user.id, // 🔐 ownership check
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ========================================================
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 * ========================================================
 */
// exports.createProduct = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     if (!req.body.productId) {
//       req.body.productId = `PROD-${Date.now()}-${Math.random()
//         .toString(36)
//         .substr(2, 5)}`;
//     }

//     const product = await Product.create({
//       ...req.body,
//       user: req.user.id, // 🔐 link retailer
//     });

//     res.status(201).json({
//       success: true,
//       data: product,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      user: req.user.id,
    });

    // Log the initial stock as an ADJUSTMENT
    if (product.stock > 0) {
      await InventoryLog.create({
        user: req.user.id,
        product: product._id,
        productId: product.productId,
        changeType: "ADJUSTMENT",
        quantityChanged: product.stock,
        stockAfter: product.stock,
        note: "Initial stock entry on product creation"
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
// controllers/productController.js
exports.bulkUploadProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid products array",
      });
    }

    const withUser = products.map((p) => ({
      ...p,
      user: userId,
    }));

    const inserted = await Product.insertMany(withUser, { ordered: false });

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(207).json({
        success: true,
        message: "Some duplicate products were skipped",
      });
    }
    next(err);
  }
};

/**
 * ========================================================
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private
 * ========================================================
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // ✅ Use MongoDB _id
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * ========================================================
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private
 * ========================================================
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      productId: req.params.id,
      user: req.user.id, // 🔐 ownership
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ========================================================
 * @desc    Get all categories (for filters/dashboard)
 * @route   GET /api/products/categories
 * @access  Private
 * ========================================================
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category", {
      user: req.user.id, // 🔐 retailer filter
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.restockProduct = async (req, res) => {
  const { productId, amount } = req.body;

  const product = await Product.findOne({ productId });
  
  // 1. Update the Product Stock
  product.stock += amount;
  await product.save();

  // 2. Create the Audit Log
  await InventoryLog.create({
    user: req.user._id, // The person performing the restock
    product: product._id,
    changeType: "RESTOCK",
    quantityChanged: amount,
    stockAfter: product.stock,
    note: "Manual warehouse restock"
  });

  res.status(200).json({ message: "Stock updated and logged" });
};