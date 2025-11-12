const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  bulkUploadProducts,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', protect, getCategories);

router
  .route('/')
  .get(protect, getProducts)
  .post(
    protect,
    [
      body('productId').notEmpty().withMessage('Product ID is required'),
      body('name').notEmpty().withMessage('Product name is required'),
      body('category').notEmpty().withMessage('Category is required'),
      body('price').isNumeric().withMessage('Price must be a number'),
    ],
    createProduct
  );

router.post('/bulk', protect, bulkUploadProducts);

router
  .route('/:id')
  .get(protect, getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
