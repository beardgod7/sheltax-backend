import { Inspection, Property, User } from '../models';
import { NotificationService } from './notification.service';

export class InspectionService {
  public static async createInspection(seekerId: string, input: any) {
    const { propertyId, inspectionType, preferredDate, preferredTime, contactPhone, notes } = input;

    if (!propertyId || !preferredDate || !preferredTime || !contactPhone) {
      const err = new Error('Missing required inspection booking details.');
      (err as any).statusCode = 400;
      throw err;
    }

    const property = await Property.findByPk(propertyId, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'firstName', 'surname', 'email'] }],
    });

    if (!property) {
      const err = new Error('Property not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const seeker = await User.findByPk(seekerId);

    const inspection = await Inspection.create({
      propertyId,
      seekerId,
      ownerId: property.ownerId,
      inspectionType: inspectionType === 'VIRTUAL' ? 'VIRTUAL' : 'PHYSICAL',
      preferredDate,
      preferredTime,
      contactPhone,
      notes: notes || null,
      status: 'PENDING',
    });

    // Notify Owner
    NotificationService.createNotification({
      userId: property.ownerId,
      title: 'New Tour Inspection Request 📅',
      message: `${seeker?.firstName || 'A seeker'} requested a ${inspectionType || 'physical'} inspection for "${property.title}" on ${preferredDate} (${preferredTime}).`,
      type: 'INSPECTION_REQUEST',
      link: '/owner/inquiries',
    }).catch((e) => console.error('Inspection notification error:', e));

    return inspection;
  }

  public static async getUserInspections(userId: string) {
    const inspections = await Inspection.findAll({
      where: {
        [require('sequelize').Op.or]: [{ seekerId: userId }, { ownerId: userId }],
      },
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'state', 'images', 'price', 'currency'],
        },
        {
          model: User,
          as: 'seeker',
          attributes: ['id', 'firstName', 'surname', 'email', 'phoneNumber'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'surname', 'email', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return inspections;
  }

  public static async updateInspectionStatus(inspectionId: string, userId: string, status: string, notes?: string) {
    const inspection = await Inspection.findByPk(inspectionId, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!inspection) {
      const err = new Error('Inspection request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (inspection.ownerId !== userId && inspection.seekerId !== userId) {
      const err = new Error('Unauthorized to modify this inspection.');
      (err as any).statusCode = 403;
      throw err;
    }

    inspection.status = status as any;
    if (notes) inspection.notes = notes;
    await inspection.save();

    // Notify Seeker
    const targetUserId = userId === inspection.ownerId ? inspection.seekerId : inspection.ownerId;
    NotificationService.createNotification({
      userId: targetUserId,
      title: `Tour Inspection ${status}! 📅`,
      message: `Your inspection for "${(inspection as any).property?.title || 'property'}" was updated to ${status}.`,
      type: 'INSPECTION_UPDATE',
      link: '/profile/inquiries',
    }).catch((e) => console.error('Inspection update notification error:', e));

    return inspection;
  }
}
