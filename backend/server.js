import "./config/env.js";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import workOrderRoutes from "./routes/workOrderRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();

// ==================== CORS ====================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://citifix-frontend-400808476961.asia-south1.run.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as curl, Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow known frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Also allow CLIENT_URL from environment variable
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed`)
      );
    },

    credentials: true,
  })
);

// ==================== MIDDLEWARE ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

app.use("/api/auth", authRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/work-orders", workOrderRoutes);

// Keep both routes if your frontend uses either spelling
app.use("/api/workorders", workOrderRoutes);

// ==================== BASE ROUTE ====================

app.get("/", (req, res) => {
  res.status(200).send("CitiFix Backend Service is active.");
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "CitiFix Backend",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack:
      process.env.NODE_ENV === "production"
        ? null
        : err.stack,
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `CitiFix Backend running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});