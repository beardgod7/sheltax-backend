import { Request, Response } from 'express';
import propertyRequestRepository from './repository';
import {
  createPropertyRequestSchema,
  updatePropertyRequestSchema,
  createResponseSchema,
  updateResponseStatusSchema,
  searchPropertyRequestsSchema,
} from './schema';
import { paginatedData } from '../../utils/pagination';

function paginationFrom(result: any) {
  const page = result.pagination.currentPage;
  const limit = result.pagination.itemsPerPage;
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function strParam(param: any): string {
  return Array.isArray(param) ? param[0] : param || '';
}

export class PropertyRequestController {
  async createPropertyRequest(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createPropertyRequestSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const reqUser = (req as any).user;
      const request = await propertyRequestRepository.createPropertyRequest(
        value,
        reqUser.sub
      );

      res.status(201).json({
        success: true,
        message: 'Property request created successfully',
        data: request,
      });
    } catch (error: any) {
      console.error('Create property request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create property request',
        error: error.message,
      });
    }
  }

  async getPropertyRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
      const request = await propertyRequestRepository.getPropertyRequestById(id);

      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Property request not found',
        });
        return;
      }

      propertyRequestRepository.incrementViewCount(id).catch(console.error);

      res.json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error('Get property request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property request',
        error: error.message,
      });
    }
  }

  async searchPropertyRequests(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = searchPropertyRequestsSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await propertyRequestRepository.searchPropertyRequests(value);

      res.json({
        success: true,
        message: 'Property requests retrieved successfully',
        data: paginatedData(
          'requests',
          result.requests,
          result.pagination.totalItems,
          paginationFrom(result)
        ),
      });
    } catch (error: any) {
      console.error('Search property requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search property requests',
        error: error.message,
      });
    }
  }

  async getMyRequests(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query as any;
      const reqUser = (req as any).user;
      const result = await propertyRequestRepository.getSeekerRequests(
        reqUser.sub,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        message: 'Property requests retrieved successfully',
        data: paginatedData(
          'requests',
          result.requests,
          result.pagination.totalItems,
          paginationFrom(result)
        ),
      });
    } catch (error: any) {
      console.error('Get my requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your requests',
        error: error.message,
      });
    }
  }

  async updatePropertyRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = strParam(req.params.id);
      const { error, value } = updatePropertyRequestSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const reqUser = (req as any).user;
      const request = await propertyRequestRepository.updatePropertyRequest(
        id,
        value,
        reqUser.sub
      );

      if (!request) {
        res.status(404).json({
          success: false,
          message: "Property request not found or you don't have permission to update it",
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property request updated successfully',
        data: request,
      });
    } catch (error: any) {
      console.error('Update property request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update property request',
        error: error.message,
      });
    }
  }

  async deletePropertyRequest(req: Request, res: Response): Promise<void> {
    try {
      const id = strParam(req.params.id);
      const reqUser = (req as any).user;
      const deleted = await propertyRequestRepository.deletePropertyRequest(
        id,
        reqUser.sub
      );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Property request not found or you don't have permission to delete it",
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property request deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete property request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete property request',
        error: error.message,
      });
    }
  }

  async createResponse(req: Request, res: Response): Promise<void> {
    try {
      const requestId = strParam(req.params.id);
      const { error, value } = createResponseSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const request: any = await propertyRequestRepository.getPropertyRequestById(requestId, false);
      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Property request not found',
        });
        return;
      }

      if (request.status !== 'active') {
        res.status(400).json({
          success: false,
          message: 'This property request is no longer active',
        });
        return;
      }

      const reqUser = (req as any).user;
      const response = await propertyRequestRepository.createResponse(
        requestId,
        value,
        reqUser.sub
      );

      res.status(201).json({
        success: true,
        message: 'Response sent successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Create response error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send response',
        error: error.message,
      });
    }
  }

  async getRequestResponses(req: Request, res: Response): Promise<void> {
    try {
      const requestId = strParam(req.params.id);
      const { page = 1, limit = 20 } = req.query as any;

      const reqUser = (req as any).user;
      const result = await propertyRequestRepository.getResponsesForRequest(
        requestId,
        reqUser.sub,
        parseInt(page),
        parseInt(limit)
      );

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Request not found or you don't have permission to view responses",
        });
        return;
      }

      res.json({
        success: true,
        message: 'Property request responses retrieved successfully',
        data: paginatedData(
          'responses',
          result.responses,
          result.pagination.totalItems,
          paginationFrom(result)
        ),
      });
    } catch (error: any) {
      console.error('Get request responses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get responses',
        error: error.message,
      });
    }
  }

  async getMyResponses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query as any;
      const reqUser = (req as any).user;
      const result = await propertyRequestRepository.getResponderResponses(
        reqUser.sub,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        message: 'Property request responses retrieved successfully',
        data: paginatedData(
          'responses',
          result.responses,
          result.pagination.totalItems,
          paginationFrom(result)
        ),
      });
    } catch (error: any) {
      console.error('Get my responses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your responses',
        error: error.message,
      });
    }
  }

  async updateResponseStatus(req: Request, res: Response): Promise<void> {
    try {
      const responseId = strParam(req.params.responseId);
      const { error, value } = updateResponseStatusSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const reqUser = (req as any).user;
      const response = await propertyRequestRepository.updateResponseStatus(
        responseId,
        value,
        reqUser.sub
      );

      if (!response) {
        res.status(404).json({
          success: false,
          message: "Response not found or you don't have permission to update it",
        });
        return;
      }

      res.json({
        success: true,
        message: 'Response status updated successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Update response status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update response status',
        error: error.message,
      });
    }
  }

  async getResponse(req: Request, res: Response): Promise<void> {
    try {
      const responseId = strParam(req.params.responseId);
      const response = await propertyRequestRepository.getResponseById(responseId);

      const reqUser = (req as any).user;
      const currentUserId = reqUser?.sub || reqUser?.id;
      const currentRole = reqUser?.role;

      if (!response) {
        res.status(404).json({
          success: false,
          message: 'Response not found',
        });
        return;
      }

      const resObj = response as any;
      const isSeekerOwner = resObj.request && resObj.request.seekerId === currentUserId;
      const isResponder = resObj.responderId === currentUserId;
      const isAdmin = ['admin', 'super_admin'].includes(currentRole);

      if (!isSeekerOwner && !isResponder && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this response.',
        });
        return;
      }

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      console.error('Get response error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get response',
        error: error.message,
      });
    }
  }
}

export default new PropertyRequestController();
