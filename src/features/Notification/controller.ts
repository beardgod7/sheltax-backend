import { Request, Response } from 'express';
import { Notification } from '../Listing/model';
import { getPagination, paginatedData } from '../../utils/pagination';

function userIdFrom(req: Request): string {
  const user = (req as any).user;
  return user?.sub || user?.id || user?.userId;
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const userId = userIdFrom(req);
    const pagination = getPagination(req.query);
    const [{ count, rows }, unreadCount] = await Promise.all([
      Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: pagination.limit,
        offset: pagination.offset,
      }),
      Notification.count({ where: { userId, isRead: false } }),
    ]);
    res.json({
      success: true,
      unreadCount,
      message: 'Notifications retrieved successfully',
      data: paginatedData('notifications', rows, count, pagination),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
}

export async function markRead(req: Request, res: Response): Promise<void> {
  try {
    const [count] = await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: userIdFrom(req) } }
    );
    if (!count) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    await Notification.update({ isRead: true }, { where: { userId: userIdFrom(req), isRead: false } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
}

export default { list, markRead, markAllRead };
