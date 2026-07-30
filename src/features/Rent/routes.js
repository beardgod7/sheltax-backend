const express = require("express");
const router = express.Router();
const rentalController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/", rentalController.searchRentalProperties);
router.get("/search", rentalController.searchRentalProperties);
router.get("/:id", rentalController.getRentalProperty);

// Protected routes (authentication required)
router.use(authenticate);

// PROPERTY MANAGEMENT ROUTES

// Create rental property (Owner/Agent only)
router.post(
  "/",
  authorize(["owner", "broker"]),
  rentalController.createRentalProperty
);

// Get user's rental properties (Owner/Agent only)
router.get(
  "/my/properties",
  authorize(["owner", "broker"]),
  rentalController.getMyRentalProperties
);

// Update rental property (Owner/Agent only)
router.put(
  "/:id",
  authorize(["owner", "broker"]),
  rentalController.updateRentalProperty
);

// Delete rental property (Owner/Agent only)
router.delete(
  "/:id",
  authorize(["owner", "broker"]),
  rentalController.deleteRentalProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorize(["seeker"]),
  rentalController.createRentalInquiry
);

// Get inquiries for a property (Owner/Agent only)
router.get(
  "/:id/inquiries",
  authorize(["owner", "broker"]),
  rentalController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorize(["seeker"]),
  rentalController.getMyInquiries
);

// Respond to inquiry (Owner/Agent only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorize(["owner", "broker"]),
  rentalController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorize(["seeker"]),
  rentalController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorize(["seeker"]),
  rentalController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorize(["seeker"]),
  rentalController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorize(["seeker"]),
  rentalController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify rental property (Admin only)
router.put(
  "/:id/verify",
  authorize(["admin"]),
  rentalController.verifyRentalProperty
);

// Update listing status (Admin only)
router.put(
  "/:id/listing-status",
  authorize(["admin"]),
  rentalController.updateListingStatus
);

module.exports = router;