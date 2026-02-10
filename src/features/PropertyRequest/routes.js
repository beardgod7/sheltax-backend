const express = require("express");
const router = express.Router();
const propertyRequestController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// All routes require authentication
router.use(authenticate);

// PROPERTY REQUEST ROUTES

// Search property requests (Brokers/Owners view all active requests)
router.get(
  "/search",
  authorize(["broker", "owner"]),
  propertyRequestController.searchPropertyRequests
);

// Get specific property request by ID (All authenticated users can view)
router.get("/:id", propertyRequestController.getPropertyRequest);

// Create property request (Seeker only)
router.post(
  "/",
  authorize(["seeker"]),
  propertyRequestController.createPropertyRequest
);

// Get seeker's own requests (Seeker only)
router.get(
  "/my/requests",
  authorize(["seeker"]),
  propertyRequestController.getMyRequests
);

// Update property request (Seeker only - their own requests)
router.put(
  "/:id",
  authorize(["seeker"]),
  propertyRequestController.updatePropertyRequest
);

// Delete property request (Seeker only - their own requests)
router.delete(
  "/:id",
  authorize(["seeker"]),
  propertyRequestController.deletePropertyRequest
);

// RESPONSE ROUTES

// Create response to property request (Broker/Owner only)
router.post(
  "/:id/responses",
  authorize(["broker", "owner"]),
  propertyRequestController.createResponse
);

// Get responses for a request (Seeker views responses to their request)
router.get(
  "/:id/responses",
  authorize(["seeker"]),
  propertyRequestController.getRequestResponses
);

// Get broker/owner's own responses
router.get(
  "/my/responses",
  authorize(["broker", "owner"]),
  propertyRequestController.getMyResponses
);

// Get specific response by ID
router.get(
  "/responses/:responseId",
  propertyRequestController.getResponse
);

// Update response status (Seeker updates status of responses they received)
router.put(
  "/responses/:responseId/status",
  authorize(["seeker"]),
  propertyRequestController.updateResponseStatus
);

module.exports = router;