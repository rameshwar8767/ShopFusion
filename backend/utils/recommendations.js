const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

class RecommendationEngine {
  // Collaborative Filtering
  static async collaborativeFiltering(customerId, limit = 5) {
    try {
      // Find customer's purchase history
      const customerTransactions = await Transaction.find({ customerId });
      const customerProducts = new Set();
      
      customerTransactions.forEach(transaction => {
        transaction.items.forEach(item => customerProducts.add(item.productId));
      });

      // Find similar customers
      const allTransactions = await Transaction.find({
        customerId: { $ne: customerId }
      });

      const customerSimilarity = new Map();

      allTransactions.forEach(transaction => {
        const otherCustomer = transaction.customerId;
        let commonProducts = 0;

        transaction.items.forEach(item => {
          if (customerProducts.has(item.productId)) {
            commonProducts++;
          }
        });

        if (commonProducts > 0) {
          const similarity = customerSimilarity.get(otherCustomer) || 0;
          customerSimilarity.set(otherCustomer, similarity + commonProducts);
        }
      });

      // Get products from similar customers
      const recommendedProducts = new Map();
      const sortedSimilarCustomers = Array.from(customerSimilarity.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      for (let [similarCustomer, similarity] of sortedSimilarCustomers) {
        const transactions = await Transaction.find({ customerId: similarCustomer });
        transactions.forEach(transaction => {
          transaction.items.forEach(item => {
            if (!customerProducts.has(item.productId)) {
              const score = recommendedProducts.get(item.productId) || 0;
              recommendedProducts.set(item.productId, score + similarity);
            }
          });
        });
      }

      // Sort and get top recommendations
      const topRecommendations = Array.from(recommendedProducts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => productId);

      const products = await Product.find({ productId: { $in: topRecommendations } });
      return products;
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  // Content-Based Filtering
  static async contentBasedFiltering(productId, limit = 5) {
    try {
      const product = await Product.findOne({ productId });
      if (!product) return [];

      // Find similar products by category and features
      const similarProducts = await Product.aggregate([
        {
          $match: {
            productId: { $ne: productId },
            category: product.category
          }
        },
        {
          $addFields: {
            similarityScore: {
              $size: {
                $setIntersection: ['$features', product.features || []]
              }
            }
          }
        },
        {
          $sort: { similarityScore: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return similarProducts;
    } catch (error) {
      console.error('Content-based filtering error:', error);
      return [];
    }
  }

  // Product Bundling Suggestions
  static generateBundles(associationRules, topN = 10) {
    const bundles = associationRules
      .filter(rule => rule.lift > 2.0 && rule.confidence > 0.5)
      .slice(0, topN)
      .map(rule => ({
        products: [...rule.antecedent, ...rule.consequent],
        confidence: rule.confidence,
        lift: rule.lift,
        expectedUplift: ((rule.lift - 1) * 100).toFixed(2) + '%'
      }));

    return bundles;
  }

  // Cross-Selling Recommendations
  static generateCrossSelling(associationRules, productIds) {
    const recommendations = [];
    const productSet = new Set(productIds);

    associationRules.forEach(rule => {
      const hasAntecedent = rule.antecedent.some(item => productSet.has(item));
      const hasNoConsequent = rule.consequent.every(item => !productSet.has(item));

      if (hasAntecedent && hasNoConsequent) {
        recommendations.push({
          suggestedProducts: rule.consequent,
          basedOn: rule.antecedent,
          confidence: rule.confidence,
          lift: rule.lift
        });
      }
    });

    return recommendations.sort((a, b) => b.lift - a.lift).slice(0, 10);
  }

  // Inventory Optimization
  static optimizeInventory(associationRules, currentStock) {
    const recommendations = [];
    const stockMap = new Map(currentStock.map(item => [item.productId, item.stock]));

    associationRules.forEach(rule => {
      rule.antecedent.forEach(antItem => {
        rule.consequent.forEach(consItem => {
          const antStock = stockMap.get(antItem) || 0;
          const consStock = stockMap.get(consItem) || 0;
          const expectedRatio = rule.confidence;
          const recommendedConsStock = Math.ceil(antStock * expectedRatio);

          if (consStock < recommendedConsStock) {
            recommendations.push({
              productId: consItem,
              currentStock: consStock,
              recommendedStock: recommendedConsStock,
              reason: `Often bought with ${antItem} (confidence: ${(rule.confidence * 100).toFixed(1)}%)`,
              priority: rule.lift
            });
          }
        });
      });
    });

    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 20);
  }
}

module.exports = RecommendationEngine;
