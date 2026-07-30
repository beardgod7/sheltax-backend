const express = require("express");
const router = express.Router();
const shortletController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/", shortletController.searchShortletProperties);
router.get("/search", shortletController.searchShortletProperties);
router.get("/:id", shortletController.getShortletProperty);

// Protected routes (authentication required)
router.use(authenticate);

// PROPERTY MANAGEMENT ROUTES

// Create shortlet property (Owner/Agent only)
router.post(
  "/",
  authorize(["owner", "broker"]),
  shortletController.createShortletProperty
);

// Get user's shortlet properties (Owner/Agent only)
router.get(
  "/my/properties",
  authorize(["owner", "broker"]),
  shortletController.getMyShortletProperties
);

// Update shortlet property (Owner/Agent only)
router.put(
  "/:id",
  authorize(["owner", "broker"]),
  shortletController.updateShortletProperty
);

// Delete shortlet property (Owner/Agent only)
router.delete(
  "/:id",
  authorize(["owner", "broker"]),
  shortletController.deleteShortletProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorize(["seeker"]),
  shortletController.createShortletInquiry
);

// Get inquiries for a property (Owner/Agent only)
router.get(
  "/:id/inquiries",
  authorize(["owner", "broker"]),
  shortletController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorize(["seeker"]),
  shortletController.getMyInquiries
);

// Respond to inquiry (Owner/Agent only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorize(["owner", "broker"]),
  shortletController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorize(["seeker"]),
  shortletController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorize(["seeker"]),
  shortletController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorize(["seeker"]),
  shortletController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorize(["seeker"]),
  shortletController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify shortlet property (Admin only)
router.put(
  "/:id/verify",
  authorize(["admin"]),
  shortletController.verifyShortletProperty
);

// Update listing status (Admin only)
router.put(
  "/:id/listing-status",
  authorize(["admin"]),
  shortletController.updateListingStatus
);

module.exports = router;