import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'shelta_x_super_secret_jwt_access_key_2026';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: 'seeker' | 'owner' | 'broker';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err: CustomError = new Error('Authentication required. Missing authorization token.');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch {
    const err: CustomError = new Error('Invalid or expired authentication token.');
    err.statusCode = 401;
    return next(err);
  }
};
