const express = require("express");
const router = express.Router();
const uploadController = require("./controller");
const { upload } = require("../../middleware/upload");
const { authenticate } = require("../../middleware/authentication");

// Support both base64 JSON body and multipart file upload
router.post("/", authenticate, (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      uploadController.uploadImages(req, res, next);
    });
  }
  return uploadController.uploadImages(req, res, next);
});

module.exports = router;
