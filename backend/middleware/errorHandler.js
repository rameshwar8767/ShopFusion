// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Log error (dev-friendly)
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // =========================
  // Mongoose bad ObjectId
  // =========================
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // =========================
  // Mongoose duplicate key
  // =========================
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // =========================
  // Mongoose validation error
  // =========================
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // =========================
  // JWT errors
  // =========================
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;