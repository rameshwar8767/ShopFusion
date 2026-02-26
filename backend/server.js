const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan"); // Added for request logging

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// --- MIDDLEWARE ---

// Security headers
app.use(helmet());

// Logging for Development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser (Increased limits for large product/transaction syncs)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || true, // Defaults to true (allow all) in dev
    credentials: true,
  })
);

// --- ROUTES ---

// Feature Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/inventory", require("./routes/inventoryLogRoutes"));

// ML & Recommendation Routes
// Mapping recommendation logic (Bundles, Hybrid Feed)
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
// Mapping raw ML triggers (Training, MBA rules)
app.use("/api/ml", require("./routes/mlRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    engine: "ShopFusion Node Backend",
    ml_link: process.env.PYTHON_API_URL || "Not Configured"
  });
});

// --- ERROR HANDLING ---

// Error handler (MUST be after routes)
app.use(errorHandler);

// --- SERVER INITIALIZATION ---

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

// --- PROCESS HANDLERS ---

// Unhandled promise rejections (e.g. DB connection lost)
process.on("unhandledRejection", (err) => {
  console.error("Critical Unhandled Rejection:", err.message || err);
  // Give the server a second to finish current requests before crashing
  server.close(() => process.exit(1));
});

// Graceful shutdown (for Docker/Cloud deployments)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  server.close(() => {
    console.log("Process terminated.");
    process.exit(0);
  });
});

module.exports = app;