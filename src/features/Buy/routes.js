const express = require("express");
const router = express.Router();
const saleController = require("./controller");
const { authenticateToken } = require("../../middleware/authentication");
const { authorizeRoles } = require("../../middleware/rolemiddleware");

// Public routes (no authentication required)
router.get("/search", saleController.searchSaleProperties);
router.get("/:id", saleController.getSaleProperty);

// Protected routes (authentication required)
router.use(authenticateToken);

// PROPERTY MANAGEMENT ROUTES

// Create sale property (Owner/Broker only)
router.post(
  "/",
  authorizeRoles(["owner", "broker"]),
  saleController.createSaleProperty
);

// Get user's sale properties (Owner/Broker only)
router.get(
  "/my/properties",
  authorizeRoles(["owner", "broker"]),
  saleController.getMySaleProperties
);

// Update sale property (Owner/Broker only)
router.put(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  saleController.updateSaleProperty
);

// Delete sale property (Owner/Broker only)
router.delete(
  "/:id",
  authorizeRoles(["owner", "broker"]),
  saleController.deleteSaleProperty
);

// INQUIRY ROUTES

// Create inquiry for a property (Seeker only)
router.post(
  "/:id/inquiries",
  authorizeRoles(["seeker"]),
  saleController.createSaleInquiry
);

// Get inquiries for a property (Owner/Broker only)
router.get(
  "/:id/inquiries",
  authorizeRoles(["owner", "broker"]),
  saleController.getPropertyInquiries
);

// Get user's inquiries (Seeker only)
router.get(
  "/my/inquiries",
  authorizeRoles(["seeker"]),
  saleController.getMyInquiries
);

// Respond to inquiry (Owner/Broker only)
router.put(
  "/inquiries/:inquiryId/respond",
  authorizeRoles(["owner", "broker"]),
  saleController.respondToInquiry
);

// FAVORITE ROUTES

// Add property to favorites (Seeker only)
router.post(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  saleController.addToFavorites
);

// Remove property from favorites (Seeker only)
router.delete(
  "/:id/favorites",
  authorizeRoles(["seeker"]),
  saleController.removeFromFavorites
);

// Get user's favorite properties (Seeker only)
router.get(
  "/my/favorites",
  authorizeRoles(["seeker"]),
  saleController.getMyFavorites
);

// Check if property is favorited (Seeker only)
router.get(
  "/:id/favorites/status",
  authorizeRoles(["seeker"]),
  saleController.checkFavoriteStatus
);

// ADMIN ROUTES

// Verify sale property (Admin only)
router.put(
  "/:id/verify",
  authorizeRoles(["admin"]),
  saleController.verifySaleProperty
);

module.exports = router;