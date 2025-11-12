const express = require('express');
const {
  generateMBA,
  getAssociationRules,
  getCollaborativeRecommendations,
  getContentRecommendations,
  getProductBundles,
  getCrossSelling,
  getInventoryOptimization,
  getDashboard,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.post('/mba', protect, generateMBA);
router.get('/rules', protect, getAssociationRules);
router.get('/collaborative/:customerId', protect, getCollaborativeRecommendations);
router.get('/content/:productId', protect, getContentRecommendations);
router.get('/bundles', protect, getProductBundles);
router.post('/cross-sell', protect, getCrossSelling);
router.post('/inventory', protect, getInventoryOptimization);

module.exports = router;
