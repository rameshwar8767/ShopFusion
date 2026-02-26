const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * @desc    Protect routes - Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // Optional: Check cookies if you use them in the future
  // else if (req.cookies.token) { token = req.cookies.token; }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // 2. Verify Token
    if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      return res.status(500).json({ success: false, message: "Internal Server Configuration Error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user and exclude password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session expired. User no longer exists.",
      });
    }

    // 4. Normalize User Object for ML Engine usage
    // We convert _id to id as a string to avoid Mongoose ObjectId issues in Axios
    req.user = user.toObject();
    req.user.id = user._id.toString();

    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? "Token expired" : "Invalid token";
    return res.status(401).json({
      success: false,
      message: `Not authorized: ${message}`,
    });
  }
};

/**
 * @desc    Authorize specific roles (retailer, admin)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'none'}' does not have permission.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};