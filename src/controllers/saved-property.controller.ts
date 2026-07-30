import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SavedPropertyService } from '../services/saved-property.service';
import { CustomError } from '../middlewares/error.middleware';

export class SavedPropertyController {
  static async toggleSave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { propertyId } = req.params;

      if (!userId) {
        const err: CustomError = new Error('User not authenticated');
        err.statusCode = 401;
        throw err;
      }

      const result = await SavedPropertyService.toggleSaveProperty(userId, propertyId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.isSaved ? 'Property saved successfully' : 'Property removed from saved',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedProperties(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const err: CustomError = new Error('User not authenticated');
        err.statusCode = 401;
        throw err;
      }

      const properties = await SavedPropertyService.getSavedProperties(userId);

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedPropertyIds(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const err: CustomError = new Error('User not authenticated');
        err.statusCode = 401;
        throw err;
      }

      const savedIds = await SavedPropertyService.getSavedPropertyIds(userId);

      res.status(200).json({
        success: true,
        data: savedIds,
      });
    } catch (error) {
      next(error);
    }
  }
}
