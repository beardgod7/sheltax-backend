const express = require("express");
const router = express.Router();
const shortletController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorizeRoles } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/search", shortletController.searchShortletProperties);
router.get("/:id", shortletController.getShortletProperty);

// Protected routes (authentication required)
router.use(authenticate);

// PROPERTY MANAGEMENT ROUTES

// Create shortlet property (Owner/Broker only)
router.post(
  "/",
  authorizeRoles(["owner", "broker"]),
  shortletController.createShortletProperty
);

// Get user's shortlet properties (Owner/Broker only)
router.get(
  "/my/properties",
  authorizeRoles(["owner", "broker"]),
  shortletController.getMyShortletProperties
);

// Update shortlet property (Owner/Broker only)
router.put(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  shortletController.updateShortletProperty
);

// Delete shortlet property (Owner/Broker only)
router.delete(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  shortletController.deleteShortletProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorizeRoles(["seeker"]),
  shortletController.createShortletInquiry
);

// Get inquiries for a property (Owner/Broker only)
router.get(
  "/:id/inquiries",
  authorizeRoles(["owner", "broker"]),
  shortletController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorizeRoles(["seeker"]),
  shortletController.getMyInquiries
);

// Respond to inquiry (Owner/Broker only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorizeRoles(["owner", "broker"]),
  shortletController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  shortletController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  shortletController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorizeRoles(["seeker"]),
  shortletController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorizeRoles(["seeker"]),
  shortletController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify shortlet property (Admin only)
router.put(
  "/:id/verify",
  authorizeRoles(["admin"]),
  shortletController.verifyShortletProperty
);

module.exports = router;