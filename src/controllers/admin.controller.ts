import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  public static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const properties = await AdminService.getProperties(req.query);
      res.status(200).json({
        success: true,
        count: properties.length,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updatePropertyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { approvalStatus, rejectionReason } = req.body;

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
        res.status(400).json({
          success: false,
          message: 'Invalid approvalStatus value. Must be PENDING, APPROVED, or REJECTED',
        });
        return;
      }

      const updatedProperty = await AdminService.updatePropertyStatus(
        id,
        approvalStatus,
        rejectionReason
      );

      if (!updatedProperty) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Property approval status updated to ${approvalStatus}`,
        data: updatedProperty,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminService.getUsers(req.query);
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isVerified, rejectionReason } = req.body;

      const updatedUser = await AdminService.updateUserVerification(id, Boolean(isVerified), rejectionReason);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `User verification status updated to ${isVerified}`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
