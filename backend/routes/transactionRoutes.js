const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  bulkUploadTransactions,
  deleteTransaction,
  getTransactionStats,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, getTransactionStats);

router
  .route('/')
  .get(protect, getTransactions)
  .post(
    protect,
    [
      body('transactionId').optional(),
      body('customerId').notEmpty().withMessage('Customer ID is required'),
      body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
      body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    ],
    createTransaction
  );

router.post('/bulk', protect, bulkUploadTransactions);

router
  .route('/:id')
  .get(protect, getTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
