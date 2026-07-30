import { Property } from '../models';

export interface OwnerKpiData {
  activeListings: number;
  pendingClosings: number;
  newLeads: number;
}

export interface ActivityItem {
  id: string;
  type: 'OFFER' | 'VIEW' | 'PRICE_CHANGE' | 'INQUIRY';
  icon: string;
  title: string;
  time: string;
}

export interface OwnerDashboardData {
  kpi: OwnerKpiData;
  recentActivity: ActivityItem[];
}

export class OwnerService {
  public static async getOwnerDashboard(userId: string): Promise<OwnerDashboardData> {
    const activeListings = await Property.count({ where: { ownerId: userId, approvalStatus: 'APPROVED' } });
    const pendingClosings = await Property.count({ where: { ownerId: userId, approvalStatus: 'PENDING' } });
    const newLeads = 0;

    // Fetch recent properties added by this user for activity feed
    const recentProps = await Property.findAll({
      where: { ownerId: userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentActivity: ActivityItem[] = recentProps.map((p) => ({
      id: p.id,
      type: 'PRICE_CHANGE',
      icon: 'solar:pen-new-square-linear',
      title: `Property listing "${p.title}" was submitted (Status: ${p.approvalStatus}).`,
      time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently',
    }));

    return {
      kpi: {
        activeListings,
        pendingClosings,
        newLeads,
      },
      recentActivity,
    };
  }

  public static async getOwnerProperties(userId: string): Promise<Property[]> {
    return Property.findAll({
      where: { ownerId: userId },
      order: [['createdAt', 'DESC']],
    });
  }
}
