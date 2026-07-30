import { Request, Response } from 'express';
import { MainProperty as Listing } from './model';
import { getPagination, paginatedData } from '../../utils/pagination';

export class OwnerController {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.sub || user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const activeListings = await (Listing as any).count({
        where: { ownerId: userId, approvalStatus: 'APPROVED' },
      });

      const pendingListings = await (Listing as any).count({
        where: { ownerId: userId, approvalStatus: 'PENDING' },
      });

      res.status(200).json({
        success: true,
        message: 'Owner dashboard statistics retrieved successfully',
        data: {
          kpi: {
            activeListings,
            pendingClosings: pendingListings,
            newLeads: 0,
          },
          recentActivity: [],
        },
      });
    } catch (error: any) {
      console.error('Get Owner Dashboard Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch owner dashboard data',
        error: error.message,
      });
    }
  }

  async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.sub || user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const pagination = getPagination(req.query);
      const whereClause: any = { ownerId: userId };
      const requestedStatus = String(req.query.status || '').toUpperCase();
      if (requestedStatus && requestedStatus !== 'ALL') {
        whereClause.approvalStatus = requestedStatus === 'ACTIVE' ? 'APPROVED' : requestedStatus;
      }
      const { count, rows: properties }: any = await (Listing as any).findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const formatted = properties.map((p: any) => {
        const item = p.toJSON();
        return {
          ...item,
          listingStatus: (item.approvalStatus || 'PENDING').toLowerCase(),
          rentAmount: item.price,
        };
      });

      res.status(200).json({
        success: true,
        message: 'Owner properties retrieved successfully',
        data: paginatedData('properties', formatted, count, pagination),
      });
    } catch (error: any) {
      console.error('Get Owner Properties Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch owner properties',
        error: error.message,
      });
    }
  }
}

export default new OwnerController();
