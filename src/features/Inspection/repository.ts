import { Op } from 'sequelize';
import { Inspection } from './model';
import { Listing } from '../Listing/model';
import { User } from '../Authentication/model';
import { Notification } from '../Listing/model';
import { assertStatusTransition, assertOutcome } from './state';

export class InspectionRepository {
  async createInspection(seekerId: string, data: any) {
    const { propertyId, inspectionType, preferredDate, preferredTime, contactPhone, notes } = data;

    const property: any = await Listing.findOne({ where: { id: propertyId, approvalStatus: 'APPROVED' } });
    if (!property) {
      throw new Error('Property not found.');
    }

    if (property.availabilityStatus === 'SOLD') {
      const error = new Error('This property has already been taken.') as any;
      error.statusCode = 409;
      error.code = 'LISTING_SOLD';
      throw error;
    }

    const existingRequest: any = await Inspection.findOne({
      where: {
        propertyId,
        seekerId,
        status: { [Op.in]: ['PENDING', 'RESCHEDULED'] },
      },
    });
    if (existingRequest) {
      const error = new Error(
        'You already have an unresolved tour request for this property. Wait for the owner to confirm or cancel it before requesting another.'
      ) as any;
      error.statusCode = 409;
      error.code = 'ACTIVE_INSPECTION_EXISTS';
      error.inspectionId = existingRequest.id;
      throw error;
    }

    let inspection: any;
    try {
      inspection = await Inspection.create({
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
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const conflict = new Error(
          'You already have an unresolved tour request for this property. Wait for the owner to confirm or cancel it before requesting another.'
        ) as any;
        conflict.statusCode = 409;
        conflict.code = 'ACTIVE_INSPECTION_EXISTS';
        throw conflict;
      }
      throw error;
    }

    await Notification.create({
      userId: property.ownerId,
      title: 'New inspection request',
      message: `A seeker requested a ${inspection.inspectionType.toLowerCase()} inspection for "${property.title}".`,
      type: 'INSPECTION_REQUESTED',
      link: '/owner/inquiries',
      metadata: { inspectionId: inspection.id, listingId: property.id },
    });

    return inspection;
  }

  async getUserInspections(userId: string, pagination: any, status?: string, scope?: string) {
    const where: any = scope === 'OWNER'
      ? { ownerId: userId }
      : scope === 'SEEKER'
        ? { seekerId: userId }
        : { [Op.or]: [{ seekerId: userId }, { ownerId: userId }] };
    if (status) where.status = status;

    return Inspection.findAndCountAll({
      where,
      include: [
        {
          model: Listing,
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
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  }

  async findParticipantInspection(id: string, userId: string) {
    const inspection: any = await Inspection.findByPk(id, {
      include: [{ model: Listing, as: 'property' }],
    });

    if (!inspection) {
      const error = new Error('Inspection request not found.') as any;
      error.statusCode = 404;
      throw error;
    }

    if (inspection.ownerId !== userId && inspection.seekerId !== userId) {
      const error = new Error('Unauthorized to modify this inspection.') as any;
      error.statusCode = 403;
      throw error;
    }

    return {
      inspection,
      role: inspection.ownerId === userId ? 'OWNER' : 'SEEKER',
    };
  }

  async updateInspectionStatus(id: string, userId: string, status: string, notes?: string, outcome?: string) {
    const { inspection, role } = await this.findParticipantInspection(id, userId);

    const changes = assertStatusTransition({
      role,
      from: inspection.status,
      to: status,
      outcome,
    });

    inspection.set(changes);
    if (notes) inspection.notes = notes;
    await inspection.save();

    const recipientId = role === 'OWNER' ? inspection.seekerId : inspection.ownerId;
    const propertyTitle = inspection.property?.title || 'the property';

    const awaitingSeekerVerdict = status === 'COMPLETED' && !inspection.outcome;
    const notification = awaitingSeekerVerdict
      ? {
          title: 'How did the inspection go?',
          message: `Your inspection for "${propertyTitle}" is complete. Let the owner know if you are still interested.`,
        }
      : status === 'COMPLETED'
        ? {
            title: 'Inspection closed',
            message: `The owner marked the inspection for "${propertyTitle}" as a no-show.`,
          }
        : {
            title: 'Inspection updated',
            message: `The inspection request is now ${status.toLowerCase()}.`,
          };

    await Notification.create({
      userId: recipientId,
      ...notification,
      type: `INSPECTION_${status}`,
      link: recipientId === inspection.ownerId ? '/owner/inquiries' : '/profile/inquiries',
      metadata: {
        inspectionId: inspection.id,
        listingId: inspection.propertyId,
        outcome: inspection.outcome || null,
      },
    });

    return inspection;
  }

  async recordInspectionOutcome(id: string, userId: string, outcome: string) {
    const { inspection, role }: { inspection: any; role: string } = await this.findParticipantInspection(id, userId);

    const changes = assertOutcome({
      role,
      status: inspection.status,
      currentOutcome: inspection.outcome,
      outcome,
    });

    inspection.set(changes);
    await inspection.save();

    const propertyTitle = inspection.property?.title || 'your property';
    await Notification.create({
      userId: inspection.ownerId,
      title: outcome === 'INTERESTED' ? 'Seeker is interested' : 'Seeker passed on the property',
      message:
        outcome === 'INTERESTED'
          ? `A seeker who inspected "${propertyTitle}" wants to move forward.`
          : `A seeker who inspected "${propertyTitle}" is not moving forward.`,
      type: `INSPECTION_OUTCOME_${outcome}`,
      link: '/owner/inquiries',
      metadata: {
        inspectionId: inspection.id,
        listingId: inspection.propertyId,
        outcome,
      },
    });

    return inspection;
  }
}

export default new InspectionRepository();
