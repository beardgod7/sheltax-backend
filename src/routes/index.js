const express = require("express");

// Import feature routes
const authRoutes = require("../features/Authentication/routes");
const profileRoutes = require("../features/Profile/routes");
const rentRoutes = require("../features/Rent/routes");
const buyRoutes = require("../features/Buy/routes");
const shortletRoutes = require("../features/Shortlet/routes");
const propertyRequestRoutes = require("../features/PropertyRequest/routes");

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
router.use("/rent", rentRoutes);
router.use("/buy", buyRoutes);
router.use("/shortlet", shortletRoutes);
router.use("/property-requests", propertyRequestRoutes);

// Catch-all for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

module.exports = router;