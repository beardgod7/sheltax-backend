import { Request, Response, NextFunction } from 'express';
import { sequelize } from '../config/database';

export const getHealthStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let dbStatus = 'disconnected';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    res.status(200).json({
      success: true,
      service: 'shelta-x-backend',
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    next(error);
  }
};
