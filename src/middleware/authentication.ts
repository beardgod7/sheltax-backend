import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { getJwtSecret } from '../utils/generatetoken';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Access denied' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, getJwtSecret());
    if (decoded.accountStatus && decoded.accountStatus !== 'ACTIVE') {
      res.status(403).json({ message: 'Account is suspended or restricted.' });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
