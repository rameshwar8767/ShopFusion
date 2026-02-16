// routes/productRoutes.js
const express = require("express");
const { body } = require("express-validator");

const {
  getProducts,
  getProduct,
  createProduct,
  bulkUploadProducts,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// ======================================================
//   ALL PRODUCT ROUTES REQUIRE AUTHENTICATION
// ======================================================
router.use(protect);

// ======================================================
//   GET ALL PRODUCT CATEGORIES
//   GET /api/products/categories
// ======================================================
router.get("/categories", getCategories);

// ======================================================
//   GET ALL PRODUCTS / CREATE PRODUCT
//   GET  /api/products
//   POST /api/products
// ======================================================
router
  .route("/")
  .get(getProducts)
  .post(
    [
      body("name").notEmpty().withMessage("Product name is required"),
      body("category").notEmpty().withMessage("Category is required"),
      body("price")
        .isNumeric()
        .withMessage("Price must be a valid number"),
    ],
    createProduct
  );

// ======================================================
//   BULK UPLOAD PRODUCTS
//   POST /api/products/bulk
// ======================================================
// routes/productRoutes.js
router.post("/bulk", protect, bulkUploadProducts);


// ======================================================
//   GET / UPDATE / DELETE SINGLE PRODUCT
//   GET    /api/products/:id
//   PUT    /api/products/:id
//   DELETE /api/products/:id
// ======================================================
router
  .route("/:id")
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;