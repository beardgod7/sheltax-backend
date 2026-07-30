import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const result = await ProfileService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message,
      hasProfile: result.hasProfile,
      user: result.user,
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

export const createSeekerProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const result = await ProfileService.updateSeekerProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

export const createOwnerProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const result = await ProfileService.updateOwnerProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

export const createBrokerProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const result = await ProfileService.updateBrokerProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

export const submitKyc = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const result = await ProfileService.submitKyc(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      kycStatus: result.kycStatus,
    });
  } catch (error) {
    next(error);
  }
};
