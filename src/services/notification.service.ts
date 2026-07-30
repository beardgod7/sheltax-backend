import { Notification, User } from '../models';

export class NotificationService {
  public static async getUserNotifications(userId: string) {
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return notifications;
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    const count = await Notification.count({
      where: { userId, isRead: false },
    });
    return count;
  }

  public static async markAsRead(userId: string, notificationId: string) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });
    if (notification) {
      notification.isRead = true;
      await notification.save();
    }
    return notification;
  }

  public static async markAllAsRead(userId: string) {
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    return { success: true };
  }

  public static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    metadata?: object;
  }) {
    const notification = await Notification.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'SYSTEM',
      isRead: false,
      link: data.link,
      metadata: data.metadata,
    });
    return notification;
  }

  public static async notifyAdmins(data: { title: string; message: string; type: string; link?: string; metadata?: object }) {
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    const notifications = await Promise.all(
      adminUsers.map((admin) =>
        NotificationService.createNotification({
          userId: admin.id,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link,
          metadata: data.metadata,
        })
      )
    );
    return notifications;
  }
}
