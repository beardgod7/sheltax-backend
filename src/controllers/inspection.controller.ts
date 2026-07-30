import { Request, Response, NextFunction } from 'express';
import { InspectionService } from '../services/inspection.service';

export class InspectionController {
  public static async createInspection(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const inspection = await InspectionService.createInspection(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Inspection request submitted successfully. The owner has been notified.',
        data: inspection,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUserInspections(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const inspections = await InspectionService.getUserInspections(req.user.id);
      res.status(200).json({
        success: true,
        data: inspections,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateInspectionStatus(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      const inspection = await InspectionService.updateInspectionStatus(id, req.user.id, status, notes);
      res.status(200).json({
        success: true,
        message: `Inspection request updated to ${status}.`,
        data: inspection,
      });
    } catch (error) {
      next(error);
    }
  }
}
