// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const mlRoutes = require("./routes/mlRoutes");

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ml", mlRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Error handler (ALWAYS LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message || err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  server.close(() => process.exit(0));
});

module.exports = app;