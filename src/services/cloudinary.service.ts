import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if env variables are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
}

export class CloudinaryService {
  public static async uploadImage(fileData: string, folder = 'shelta-x/properties'): Promise<string> {
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
        const result = await cloudinary.uploader.upload(fileData, {
          folder,
          resource_type: 'auto',
        });
        return result.secure_url;
      }
      
      // If direct base64 image or URL provided without Cloudinary credentials configured yet
      if (fileData.startsWith('data:image/') || fileData.startsWith('http://') || fileData.startsWith('https://')) {
        return fileData;
      }

      // Default high quality property image URL fallback
      return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop';
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      if (fileData.startsWith('data:image/') || fileData.startsWith('http://') || fileData.startsWith('https://')) {
        return fileData;
      }
      return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop';
    }
  }
}
