const express = require("express");
const router = express.Router();
const paymentController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

router.use(authenticate);

router.post("/initiate", authorize(["seeker"]), paymentController.initiateCheckout);
router.post("/:reference/settle", authorize(["seeker"]), paymentController.settleCheckout);
router.get("/my", paymentController.getMyPayments);
router.get("/sales", authorize(["owner", "broker"]), paymentController.getMySales);
router.get("/listing/:listingId/state", paymentController.getPurchaseState);

module.exports = router;
