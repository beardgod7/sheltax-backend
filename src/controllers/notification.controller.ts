import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  public static async getNotifications(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.id);
      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        unreadCount,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(req.user.id, id);

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      await NotificationService.markAllAsRead(req.user.id);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }
}
