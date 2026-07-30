import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';

export class PropertyController {
  public static async getProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const properties = await PropertyService.getProperties(req.query);
      res.status(200).json({
        success: true,
        count: properties.length,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPropertyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const property = await PropertyService.getPropertyById(id, (req as any).user);

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const locations = await PropertyService.getLocations();
      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createProperty(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const property = await PropertyService.createProperty(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Property listing created successfully. It is pending admin approval.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { approvalStatus, rejectionReason } = req.body;

      if (!approvalStatus || !['APPROVED', 'REJECTED'].includes(approvalStatus)) {
        res.status(400).json({ success: false, message: 'Invalid approval status.' });
        return;
      }

      const property = await PropertyService.updatePropertyApproval(id, approvalStatus, rejectionReason);
      res.status(200).json({
        success: true,
        message: `Property approval status updated to ${approvalStatus}.`,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProperty(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const property = await PropertyService.updateProperty(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: 'Property listing updated successfully.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteProperty(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const result = await PropertyService.deleteProperty(id, req.user);
      res.status(200).json({
        success: true,
        message: 'Property listing deleted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
