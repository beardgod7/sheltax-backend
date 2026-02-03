const express = require("express");
const router = express.Router();
const rentalController = require("./controller");
const { authenticateToken } = require("../../middleware/authentication");
const { authorizeRoles } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/search", rentalController.searchRentalProperties);
router.get("/:id", rentalController.getRentalProperty);

// Protected routes (authentication required)
router.use(authenticateToken);

// PROPERTY MANAGEMENT ROUTES

// Create rental property (Owner/Broker only)
router.post(
  "/",
  authorizeRoles(["owner", "broker"]),
  rentalController.createRentalProperty
);

// Get user's rental properties (Owner/Broker only)
router.get(
  "/my/properties",
  authorizeRoles(["owner", "broker"]),
  rentalController.getMyRentalProperties
);

// Update rental property (Owner/Broker only)
router.put(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  rentalController.updateRentalProperty
);

// Delete rental property (Owner/Broker only)
router.delete(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  rentalController.deleteRentalProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorizeRoles(["seeker"]),
  rentalController.createRentalInquiry
);

// Get inquiries for a property (Owner/Broker only)
router.get(
  "/:id/inquiries",
  authorizeRoles(["owner", "broker"]),
  rentalController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorizeRoles(["seeker"]),
  rentalController.getMyInquiries
);

// Respond to inquiry (Owner/Broker only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorizeRoles(["owner", "broker"]),
  rentalController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  rentalController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  rentalController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorizeRoles(["seeker"]),
  rentalController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorizeRoles(["seeker"]),
  rentalController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify rental property (Admin only)
router.put(
  "/:id/verify",
  authorizeRoles(["admin"]),
  rentalController.verifyRentalProperty
);

module.exports = router;