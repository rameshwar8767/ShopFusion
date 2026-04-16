// routes/unlimitedImportRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  unlimitedProductImport,
  unlimitedTransactionImport,
  streamFileImport
} = require('../controllers/unlimitedImportController');

/**
 * @route   POST /api/import/products/unlimited
 * @desc    Import unlimited products with streaming response
 * @access  Private
 */
router.post('/products/unlimited', protect, unlimitedProductImport);

/**
 * @route   POST /api/import/transactions/unlimited
 * @desc    Import unlimited transactions with streaming response
 * @access  Private
 */
router.post('/transactions/unlimited', protect, unlimitedTransactionImport);

/**
 * @route   POST /api/import/file/stream
 * @desc    Stream import from file (CSV/Excel)
 * @access  Private
 */
router.post('/file/stream', protect, streamFileImport);

module.exports = router;
