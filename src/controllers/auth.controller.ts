import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.signup(req.body);
    res.status(201).json({
      success: true,
      message: result.message,
      email: result.email,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = req.params.code || req.body.code;
    const email = req.body.email || (req.query.email as string);

    if (!code) {
      res.status(400).json({ success: false, message: 'Verification code is required.' });
      return;
    }

    const result = await AuthService.verifyOtp(code, email);
    const { ProfileService } = await import('../services/profile.service');
    const profileInfo = await ProfileService.getProfile(result.id!);

    res.status(200).json({
      success: true,
      message: result.message,
      email: result.email,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      role: result.role,
      verification: result.verification,
      id: result.id,
      hasProfile: profileInfo.hasProfile,
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        firstName: profileInfo.user.firstName,
        surname: profileInfo.user.surname,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const result = await AuthService.resendVerification(email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const result = await AuthService.setPassword(email, password);
    res.status(200).json({
      success: true,
      message: result.message,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      role: result.role,
      verification: result.verification,
      id: result.id,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = identifier || email;

    if (!loginIdentifier) {
      res.status(400).json({ success: false, message: 'Email or identifier is required.' });
      return;
    }

    const result = await AuthService.login(loginIdentifier, password);
    res.status(200).json({
      success: true,
      message: result.message,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      role: result.role,
      verification: result.verification,
      id: result.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const completeOwnerProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.completeOwnerProfile(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reqAny = req as any;
    const body = req.body || {};
    const email = body.email;
    const profilePictureUrl = body.profilePictureUrl || (reqAny.files && reqAny.files.profilePicture ? reqAny.files.profilePicture[0]?.path : undefined);
    const governmentIdUrl = body.governmentIdUrl || (reqAny.files && reqAny.files.governmentId ? reqAny.files.governmentId[0]?.path : undefined);
    const ninCacDocumentUrl = body.ninCacDocumentUrl || (reqAny.files && reqAny.files.ninCacDocument ? reqAny.files.ninCacDocument[0]?.path : undefined);

    const result = await AuthService.verifyIdentity({
      email,
      profilePictureUrl,
      governmentIdUrl,
      ninCacDocumentUrl,
    });
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
