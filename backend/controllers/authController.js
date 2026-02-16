// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ========================================================
// @desc    Register Retailer
// @route   POST /api/auth/register
// @access  Public
// ========================================================
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let { name, email, password } = req.body;

    email = email.toLowerCase().trim();

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Always create retailer by default
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: "retailer",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================
// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
// ========================================================
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================
// @desc    Get Logged-in User Info
// @route   GET /api/auth/me
// @access  Private
// ========================================================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================
// @desc    Update User Details
// @route   PUT /api/auth/updatedetails
// @access  Private
// ========================================================
exports.updateDetails = async (req, res, next) => {
  try {
    const newData = {};

    if (req.body.name) newData.name = req.body.name.trim();
    if (req.body.email) newData.email = req.body.email.toLowerCase().trim();

    if (newData.email) {
      const existing = await User.findOne({
        email: newData.email,
        _id: { $ne: req.user.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already taken",
        });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      newData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================
// @desc    Update Password
// @route   PUT /api/auth/updatepassword
// @access  Private
// ========================================================
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name || user.name;
  user.email = email || user.email;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: req.user.token, // keep same token
      createdAt: user.createdAt,
    },
  });
};