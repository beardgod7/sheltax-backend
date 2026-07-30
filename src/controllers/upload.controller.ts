import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '../services/cloudinary.service';

export const uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { image, images, folder } = req.body;

    if (images && Array.isArray(images)) {
      const uploadedUrls = await Promise.all(
        images.map((img: string) => CloudinaryService.uploadImage(img, folder))
      );
      res.status(200).json({
        success: true,
        urls: uploadedUrls,
      });
      return;
    }

    if (image) {
      const url = await CloudinaryService.uploadImage(image, folder);
      res.status(200).json({
        success: true,
        url,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'No image or images provided in request body.',
    });
  } catch (error) {
    next(error);
  }
};
