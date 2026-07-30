import { Request, Response, NextFunction } from 'express';
import cloudinary from '../../config/cloudinary';

export class UploadController {
  async uploadImages(req: Request, res: Response, next?: NextFunction): Promise<void> {
    try {
      const { image, images, folder = 'shelta-x/properties' } = req.body || {};

      const uploadSingle = async (fileData?: string): Promise<string | null> => {
        if (!fileData) return null;

        if (
          process.env.CLOUDINARY_CLOUD_NAME ||
          process.env.CLOUDINARY_URL
        ) {
          try {
            const result = await cloudinary.uploader.upload(fileData, {
              folder,
              resource_type: 'auto',
            });
            return result.secure_url;
          } catch (err: any) {
            console.error('Cloudinary upload failed, using base64 fallback:', err.message);
          }
        }

        if (
          fileData.startsWith('data:image/') ||
          fileData.startsWith('data:application/') ||
          fileData.startsWith('http://') ||
          fileData.startsWith('https://')
        ) {
          return fileData;
        }

        return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop';
      };

      if (images && Array.isArray(images)) {
        const uploadedUrls = await Promise.all(images.map(uploadSingle));
        res.status(200).json({
          success: true,
          urls: uploadedUrls.filter(Boolean),
        });
        return;
      }

      if (image) {
        const url = await uploadSingle(image);
        res.status(200).json({
          success: true,
          url,
          urls: [url],
        });
        return;
      }

      const reqFiles = (req as any).files;
      if (reqFiles && Array.isArray(reqFiles) && reqFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          reqFiles.map((file: any) => {
            const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return uploadSingle(base64);
          })
        );
        res.status(200).json({
          success: true,
          urls: uploadedUrls.filter(Boolean),
        });
        return;
      }

      const reqFile = (req as any).file;
      if (reqFile) {
        const base64 = `data:${reqFile.mimetype};base64,${reqFile.buffer.toString('base64')}`;
        const url = await uploadSingle(base64);
        res.status(200).json({
          success: true,
          url,
          urls: [url],
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: 'No image, images, or file provided in request.',
      });
    } catch (error: any) {
      console.error('Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file(s)',
        error: error.message,
      });
    }
  }
}

export default new UploadController();
