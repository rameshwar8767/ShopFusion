const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const AssociationRule = require('../models/AssociationRule');
const AprioriAlgorithm = require('../utils/apriori');
const RecommendationEngine = require('../utils/recommendations');

// @desc    Generate MBA recommendations
// @route   POST /api/recommendations/mba
// @access  Private
exports.generateMBA = async (req, res, next) => {
  try {
    const minSupport = parseFloat(req.body.minSupport) || parseFloat(process.env.MIN_SUPPORT);
    const minConfidence = parseFloat(req.body.minConfidence) || parseFloat(process.env.MIN_CONFIDENCE);
    const minLift = parseFloat(req.body.minLift) || parseFloat(process.env.MIN_LIFT);

    // Fetch transactions
    const transactions = await Transaction.find({ userId: req.user.id });

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No transactions found. Please upload transaction data first.',
      });
    }

    // Run Apriori algorithm
    const apriori = new AprioriAlgorithm(minSupport, minConfidence, minLift);
    const { rules } = apriori.execute(transactions);

    // Save rules to database
    await AssociationRule.deleteMany({ userId: req.user.id }); // Clear old rules

    const rulesToSave = rules.map(rule => ({
      ...rule,
      userId: req.user.id,
    }));

    if (rulesToSave.length > 0) {
      await AssociationRule.insertMany(rulesToSave);
    }

    res.status(200).json({
      success: true,
      count: rules.length,
      data: {
        rules: rules.slice(0, 50), // Return top 50 rules
        statistics: {
          totalRules: rules.length,
          totalTransactions: transactions.length,
          parameters: { minSupport, minConfidence, minLift },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get association rules
// @route   GET /api/recommendations/rules
// @access  Private
exports.getAssociationRules = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    // Filtering
    const sort = {};
    if (req.query.sortBy === 'confidence') {
      sort.confidence = -1;
    } else if (req.query.sortBy === 'support') {
      sort.support = -1;
    } else {
      sort.lift = -1; // Default sort by lift
    }

    const rules = await AssociationRule.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await AssociationRule.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rules.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get collaborative filtering recommendations
// @route   GET /api/recommendations/collaborative/:customerId
// @access  Private
exports.getCollaborativeRecommendations = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await RecommendationEngine.collaborativeFiltering(
      customerId,
      limit
    );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content-based recommendations
// @route   GET /api/recommendations/content/:productId
// @access  Private
exports.getContentRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await RecommendationEngine.contentBasedFiltering(
      productId,
      limit
    );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate product bundles
// @route   GET /api/recommendations/bundles
// @access  Private
exports.getProductBundles = async (req, res, next) => {
  try {
    const rules = await AssociationRule.find({ userId: req.user.id })
      .sort({ lift: -1 })
      .limit(100);

    const bundles = RecommendationEngine.generateBundles(rules, 10);

    res.status(200).json({
      success: true,
      count: bundles.length,
      data: bundles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cross-selling recommendations
// @route   POST /api/recommendations/cross-sell
// @access  Private
exports.getCrossSelling = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs',
      });
    }

    const rules = await AssociationRule.find({ userId: req.user.id })
      .sort({ lift: -1 })
      .limit(100);

    const recommendations = RecommendationEngine.generateCrossSelling(rules, productIds);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory optimization recommendations
// @route   POST /api/recommendations/inventory
// @access  Private
exports.getInventoryOptimization = async (req, res, next) => {
  try {
    const rules = await AssociationRule.find({ userId: req.user.id })
      .sort({ lift: -1 })
      .limit(100);

    // Get current stock levels
    const products = await Product.find({});
    const currentStock = products.map(p => ({
      productId: p.productId,
      stock: p.stock,
    }));

    const recommendations = RecommendationEngine.optimizeInventory(rules, currentStock);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendation dashboard data
// @route   GET /api/recommendations/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const rules = await AssociationRule.find({ userId: req.user.id })
      .sort({ lift: -1 })
      .limit(50);

    const transactions = await Transaction.countDocuments({ userId: req.user.id });
    const products = await Product.countDocuments({});

    // Top rules by category
    const topRulesByLift = rules.slice(0, 10);
    const topRulesByConfidence = [...rules].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

    // Product bundles
    const bundles = RecommendationEngine.generateBundles(rules, 5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRules: rules.length,
          totalTransactions: transactions,
          totalProducts: products,
        },
        topRulesByLift,
        topRulesByConfidence,
        bundles,
      },
    });
  } catch (error) {
    next(error);
  }
};
