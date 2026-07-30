const express = require("express");
const router = express.Router();
const adminController = require("./controller");
const { authenticate } = require("../../middleware/authentication");
const { authorize } = require("../../middleware/rolemiddleware");

// Protected routes (require authentication and admin role)
router.use(authenticate);
router.use(authorize(["admin", "super_admin"]));

router.get("/stats", adminController.getStats);
router.get("/properties", adminController.getProperties);
router.patch("/properties/:id/status", adminController.updatePropertyStatus);
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.get("/kyc", adminController.getKycSubmissions);
router.get("/sales", adminController.getSales);
router.patch("/users/:id/verify", adminController.updateUserVerification);
router.patch("/users/:userId/verify", adminController.updateUserVerification);

module.exports = router;
