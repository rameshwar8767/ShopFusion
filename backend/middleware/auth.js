// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================
//      PROTECT ROUTE
// =========================
const protect = async (req, res, next) => {
  let token;

  // Read token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  // Token missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — token missing",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user not found",
      });
    }

    // ✅ normalize user object
    req.user = {
      ...user.toObject(),
      id: user._id.toString(),
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid or expired token",
    });
  }
};

// =========================
//      ROLE CHECK
// =========================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' not authorized`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};