const express = require("express");
const router = express.Router();
const saleController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/search", saleController.searchSaleProperties);
router.get("/:id", saleController.getSaleProperty);

// Protected routes (authentication required)
router.use(authenticate);

// PROPERTY MANAGEMENT ROUTES

// Create sale property (Owner/Broker only)
router.post(
  "/",
  authorize(["owner", "broker"]),
  saleController.createSaleProperty
);

// Get user's sale properties (Owner/Broker only)
router.get(
  "/my/properties",
  authorize(["owner", "broker"]),
  saleController.getMySaleProperties
);

// Update sale property (Owner/Broker only)
router.put(
  "/:id",
  authorize(["owner", "broker"]),
  saleController.updateSaleProperty
);

// Delete sale property (Owner/Broker only)
router.delete(
  "/:id",
  authorize(["owner", "broker"]),
  saleController.deleteSaleProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorize(["seeker"]),
  saleController.createSaleInquiry
);

// Get inquiries for a property (Owner/Broker only)
router.get(
  "/:id/inquiries",
  authorize(["owner", "broker"]),
  saleController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorize(["seeker"]),
  saleController.getMyInquiries
);

// Respond to inquiry (Owner/Broker only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorize(["owner", "broker"]),
  saleController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorize(["seeker"]),
  saleController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorize(["seeker"]),
  saleController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorize(["seeker"]),
  saleController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorize(["seeker"]),
  saleController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify sale property (Admin only)
router.put(
  "/:id/verify",
  authorize(["admin"]),
  saleController.verifySaleProperty
);

// Update listing status (Admin only)
router.put(
  "/:id/listing-status",
  authorize(["admin"]),
  saleController.updateListingStatus
);

module.exports = router;