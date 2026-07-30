const cloudinary = require("../../config/cloudinary");

class UploadController {
  async uploadImages(req, res) {
    try {
      const { image, images, folder = "shelta-x/properties" } = req.body || {};

      const uploadSingle = async (fileData) => {
        if (!fileData) return null;

        // Check if cloudinary is configured
        if (
          process.env.CLOUDINARY_CLOUD_NAME ||
          process.env.CLOUDINARY_URL
        ) {
          try {
            const result = await cloudinary.uploader.upload(fileData, {
              folder,
              resource_type: "auto",
            });
            return result.secure_url;
          } catch (err) {
            console.error("Cloudinary upload failed, using base64 fallback:", err.message);
          }
        }

        // Fallback for base64 or URL
        if (
          fileData.startsWith("data:image/") ||
          fileData.startsWith("data:application/") ||
          fileData.startsWith("http://") ||
          fileData.startsWith("https://")
        ) {
          return fileData;
        }

        return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop";
      };

      if (images && Array.isArray(images)) {
        const uploadedUrls = await Promise.all(images.map(uploadSingle));
        return res.status(200).json({
          success: true,
          urls: uploadedUrls.filter(Boolean),
        });
      }

      if (image) {
        const url = await uploadSingle(image);
        return res.status(200).json({
          success: true,
          url,
          urls: [url],
        });
      }

      // If multipart files uploaded via multer
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadedUrls = await Promise.all(
          req.files.map((file) => {
            const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
            return uploadSingle(base64);
          })
        );
        return res.status(200).json({
          success: true,
          urls: uploadedUrls.filter(Boolean),
        });
      }

      if (req.file) {
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        const url = await uploadSingle(base64);
        return res.status(200).json({
          success: true,
          url,
          urls: [url],
        });
      }

      return res.status(400).json({
        success: false,
        message: "No image, images, or file provided in request.",
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload file(s)",
        error: error.message,
      });
    }
  }
}

module.exports = new UploadController();
