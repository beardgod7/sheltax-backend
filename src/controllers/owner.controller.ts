import { Response, NextFunction } from 'express';
import { OwnerService } from '../services/owner.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getOwnerDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const data = await OwnerService.getOwnerDashboard(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Owner dashboard statistics retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerProperties = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const data = await OwnerService.getOwnerProperties(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Owner properties retrieved successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
};
