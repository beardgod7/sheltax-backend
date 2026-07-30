const express = require("express");
const router = express.Router();
const inspectionController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Protected routes (authentication required)
router.use(authenticate);

router.post("/", authorize(["seeker"]), inspectionController.createInspection);
router.get("/my-requests", inspectionController.getUserInspections);
router.patch("/:id/status", inspectionController.updateInspectionStatus);
router.patch("/:id/outcome", authorize(["seeker"]), inspectionController.recordInspectionOutcome);

module.exports = router;
