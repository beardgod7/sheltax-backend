import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface RoleAuthenticatedRequest extends Request {
  user?: any;
}

export function authorize(requiredRoles: string[] = []) {
  return (req: RoleAuthenticatedRequest, res: Response, next: NextFunction): void => {
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

      req.user = decoded;

      if (!decoded.role || !requiredRoles.includes(decoded.role)) {
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
