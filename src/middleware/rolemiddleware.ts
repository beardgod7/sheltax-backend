import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/generatetoken';
import { AdminPermission } from '../features/Admin/permissionModel';

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
        getJwtSecret()
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

export function requirePermission(permissionName: string) {
  return async (req: RoleAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (user.role === 'super_admin') {
        next();
        return;
      }

      if (user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: Administrative privilege required.' });
        return;
      }

      const adminId = user.sub || user.id;
      const perm = await AdminPermission.findOne({
        where: {
          adminId,
          permission: permissionName,
        },
      });

      if (!perm) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Missing required admin permission '${permissionName}'.`,
        });
        return;
      }

      next();
    } catch (error: any) {
      console.error('Error checking admin permission:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  };
}
