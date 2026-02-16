// controllers/productController.js

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
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    if (!req.body.productId) {
      req.body.productId = `PROD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;
    }

    const product = await Product.create({
      ...req.body,
      user: req.user.id, // 🔐 link retailer
    });

    res.status(201).json({
      success: true,
      data: product,
    });
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
      { productId: req.params.id, user: req.user.id }, // 🔐 ownership
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