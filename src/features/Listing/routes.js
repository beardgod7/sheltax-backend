const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");
const controller = require("./controller");
const { propertyScoped: reviewRoutes } = require("../PropertyReview/routes");

const router = express.Router();

// Mounted before GET /:id so the two-segment review paths are never swallowed
// by the single-segment listing lookup.
router.use("/:propertyId/reviews", reviewRoutes);

router.get("/", controller.list);
router.get("/locations", controller.locations);
router.get("/stats", controller.stats);
router.get("/:id", controller.getOne);
router.post("/", authenticate, authorize(["owner", "broker"]), controller.create);
router.put("/:id", authenticate, authorize(["owner", "broker"]), controller.update);
router.delete("/:id", authenticate, authorize(["owner", "broker"]), controller.remove);

module.exports = router;
