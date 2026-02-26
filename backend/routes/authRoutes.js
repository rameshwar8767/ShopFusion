// routes/authRoutes.js
const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// ======================================================
//                 PUBLIC ROUTES
// ======================================================

// Register Retailer
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);

// Login
router.post("/login", login);

// ======================================================
//                 PRIVATE ROUTES
// ======================================================

// Get logged-in user
router.get("/me", protect, getMe);

// Update name/email
router.put("/update-profile", protect, updateDetails);

// Update password
router.put("/updatepassword", protect, updatePassword);

module.exports = router;