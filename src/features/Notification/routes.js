const express = require("express");
const { authenticate } = require("../../middleware/authentication");
const controller = require("./controller");

const router = express.Router();
router.use(authenticate);
router.get("/", controller.list);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
