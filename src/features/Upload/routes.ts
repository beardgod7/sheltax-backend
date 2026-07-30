import express from 'express';
import uploadController from './controller';
import { upload } from '../../middleware/upload';
import { authenticate } from '../../middleware/authentication';

const router = express.Router();

router.post('/', authenticate, (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      uploadController.uploadImages(req, res, next);
    });
  }
  return uploadController.uploadImages(req, res, next);
});

export default router;
