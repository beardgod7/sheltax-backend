import { Request, Response } from 'express';
import inspectionRepository from './repository';
import { getPagination, paginatedData } from '../../utils/pagination';

export class InspectionController {
  async createInspection(req: Request, res: Response): Promise<void> {
    try {
      const reqUser = (req as any).user;
      const seekerId = reqUser?.sub || reqUser?.id || reqUser?.userId;
      const { propertyId, preferredDate, preferredTime, contactPhone } = req.body;

      if (!propertyId || !preferredDate || !preferredTime || !contactPhone) {
        res.status(400).json({
          success: false,
          message: 'Missing required inspection booking details (propertyId, preferredDate, preferredTime, contactPhone).',
        });
        return;
      }

      const inspection = await inspectionRepository.createInspection(seekerId, req.body);

      res.status(201).json({
        success: true,
        message: 'Inspection request submitted successfully. The property host has been notified.',
        data: inspection,
      });
    } catch (error: any) {
      console.error('Create Inspection Error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to submit inspection request.',
        ...(error.code ? { code: error.code } : {}),
        ...(error.inspectionId ? { inspectionId: error.inspectionId } : {}),
      });
    }
  }

  async getUserInspections(req: Request, res: Response): Promise<void> {
    try {
      const reqUser = (req as any).user;
      const userId = reqUser?.sub || reqUser?.id || reqUser?.userId;
      const pagination = getPagination(req.query);
      const status = req.query.status && req.query.status !== 'ALL'
        ? String(req.query.status).toUpperCase()
        : undefined;
      const scope = ['OWNER', 'SEEKER'].includes(String(req.query.scope || '').toUpperCase())
        ? String(req.query.scope).toUpperCase()
        : undefined;
      const { count, rows: inspections } =
        await inspectionRepository.getUserInspections(userId, pagination, status, scope);

      res.status(200).json({
        success: true,
        message: 'Inspection requests retrieved successfully',
        data: paginatedData('inspections', inspections, count, pagination),
      });
    } catch (error: any) {
      console.error('Get User Inspections Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user inspection requests.',
      });
    }
  }

  async updateInspectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const reqUser = (req as any).user;
      const userId = reqUser?.sub || reqUser?.id || reqUser?.userId;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status, notes, outcome } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required (CONFIRMED, RESCHEDULED, CANCELLED, COMPLETED).',
        });
        return;
      }

      const inspection: any = await inspectionRepository.updateInspectionStatus(
        id,
        userId,
        String(status).toUpperCase(),
        notes,
        outcome ? String(outcome).toUpperCase() : undefined
      );

      res.status(200).json({
        success: true,
        message: `Inspection request updated to ${inspection.status}.`,
        data: inspection,
      });
    } catch (error: any) {
      console.error('Update Inspection Status Error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update inspection request status.',
        ...(error.code ? { code: error.code } : {}),
      });
    }
  }

  async recordInspectionOutcome(req: Request, res: Response): Promise<void> {
    try {
      const reqUser = (req as any).user;
      const userId = reqUser?.sub || reqUser?.id || reqUser?.userId;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { outcome } = req.body;

      if (!outcome) {
        res.status(400).json({
          success: false,
          message: 'Outcome is required (INTERESTED, NOT_INTERESTED).',
        });
        return;
      }

      const inspection = await inspectionRepository.recordInspectionOutcome(
        id,
        userId,
        String(outcome).toUpperCase()
      );

      res.status(200).json({
        success: true,
        message: 'Thanks — your feedback has been shared with the owner.',
        data: inspection,
      });
    } catch (error: any) {
      console.error('Record Inspection Outcome Error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to record inspection outcome.',
        ...(error.code ? { code: error.code } : {}),
      });
    }
  }
}

export default new InspectionController();
