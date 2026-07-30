const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const controller = require("./controller");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.list);
router.get("/ids", controller.ids);
router.post("/:propertyId/toggle", controller.toggle);

module.exports = router;
