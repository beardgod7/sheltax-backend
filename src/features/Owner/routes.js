const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const ownerController = require("./controller");
const { authorize } = require("../../middleware/rolemiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize(["owner", "broker"]));

router.get("/dashboard", (req, res) => ownerController.getDashboard(req, res));
router.get("/properties", (req, res) => ownerController.getProperties(req, res));

module.exports = router;
