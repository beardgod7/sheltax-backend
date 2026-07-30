import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomAuthRequest extends Request {
  accessToken?: string;
  userId?: string;
  role?: string;
  user?: any;
}

export const authenticate = () => async (req: CustomAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    res.status(401).json({
      success: false,
      message: 'Access token required!',
    });
    return;
  }

  jwt.verify(accessToken, process.env.JWT_SECRET || 'secret', (err, payload: any) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Unauthorized access. Please log in.',
      });
      return;
    }

    req.accessToken = accessToken;
    req.userId = payload?.sub;
    req.role = payload?.role;
    next();
  });
};

export function authorize(requiredRoles: string[] = []) {
  return (req: CustomAuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization'];

    if (!token) {
      res.status(403).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    try {
      const decoded: any = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET || 'secret'
      );

      req.user = decoded.sub;

      if (!req.user?.role || !requiredRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to perform this action.',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Invalid token.',
      });
    }
  };
}
