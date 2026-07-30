const express = require("express");

// Import feature routes
const authRoutes = require("../features/Authentication/routes");
const profileRoutes = require("../features/Profile/routes");
const propertyRequestRoutes = require("../features/PropertyRequest/routes");
const adminRoutes = require("../features/Admin/routes");
const uploadRoutes = require("../features/Upload/routes");
const ownerRoutes = require("../features/Owner/routes");
const inspectionRoutes = require("../features/Inspection/routes");
const listingRoutes = require("../features/Listing/routes");
const notificationRoutes = require("../features/Notification/routes");
const savedListingRoutes = require("../features/SavedListing/routes");
const paymentRoutes = require("../features/Payment/routes");
const { seekerScoped: reviewRoutes } = require("../features/PropertyReview/routes");

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
// Listing reads and mutations intentionally have one canonical entry point.
// Keeping the legacy Rent/Buy/Shortlet routers mounted allowed callers to
// bypass KYC and moderation and wrote duplicate property records.
router.use("/properties", listingRoutes);
router.use("/property-requests", propertyRequestRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/owner", ownerRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/saved-properties", savedListingRoutes);
router.use("/payments", paymentRoutes);
// A listing's reviews live under /properties/:propertyId/reviews. This router
// is the seeker's own cross-listing view of what they have written.
router.use("/reviews", reviewRoutes);

// Catch-all for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

module.exports = router;
