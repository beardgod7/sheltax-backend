const express = require("express");

// Import feature routes
const authRoutes = require("../features/Authentication/routes");
const profileRoutes = require("../features/Profile/routes");

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Sheltax Backend API is running",
    timestamp: new Date().toISOString()
  });
});

// Feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

// Catch-all for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

module.exports = router;