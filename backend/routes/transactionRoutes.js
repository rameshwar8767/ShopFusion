// routes/transactionRoutes.js
const express = require("express");
const { body } = require("express-validator");

const {
  getTransactions,
  getTransaction,
  createTransaction,
  bulkUploadTransactions,
  deleteTransaction,
  getTransactionStats,
  getUniqueCustomers
} = require("../controllers/transactionController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// ======================================================
//   ALL TRANSACTION ROUTES REQUIRE AUTHENTICATION
// ======================================================
router.use(protect);

// ======================================================
//   TRANSACTION STATISTICS (Dashboard)
//   GET /api/transactions/stats
// ======================================================
router.get("/stats", protect, getTransactionStats);
router.get("/customers", getUniqueCustomers);

// ======================================================
//   GET ALL TRANSACTIONS / CREATE TRANSACTION
//   GET  /api/transactions
//   POST /api/transactions
// ======================================================
router
  .route("/")
  .get(getTransactions)
  .post(
    [
      body("shopperId")
        .notEmpty()
        .withMessage("Shopper ID is required"),
      body("items")
        .isArray({ min: 1 })
        .withMessage("Items must be a non-empty array"),
      body("totalAmount")
        .isNumeric()
        .withMessage("Total amount must be numeric"),
    ],
    createTransaction
  );

// ======================================================
//   BULK UPLOAD TRANSACTIONS
//   POST /api/transactions/bulk
// ======================================================
router.post("/bulk", bulkUploadTransactions);

// ======================================================
//   GET / DELETE SINGLE TRANSACTION
//   GET    /api/transactions/:id
//   DELETE /api/transactions/:id
// ======================================================
router
  .route("/:id")
  .get(getTransaction)
  .delete(deleteTransaction);

module.exports = router;