import { Op } from 'sequelize';
import { PropertyRequest, PropertyRequestResponse } from './model';
import { User } from '../Authentication/model';

export class PropertyRequestRepository {
  async createPropertyRequest(requestData: any, seekerId: string) {
    try {
      const request = await PropertyRequest.create({
        ...requestData,
        seekerId,
      });
      return request;
    } catch (error: any) {
      throw new Error(`Failed to create property request: ${error.message}`);
    }
  }

  async getPropertyRequestById(id: string, includeSeeker = true) {
    try {
      const includes: any[] = [];
      if (includeSeeker) {
        includes.push({
          model: User,
          as: 'seeker',
          attributes: ['id', 'username', 'email'],
        });
      }

      const request = await PropertyRequest.findByPk(id, {
        include: includes,
      });
      return request;
    } catch (error: any) {
      throw new Error(`Failed to get property request: ${error.message}`);
    }
  }

  async searchPropertyRequests(filters: any = {}) {
    try {
      const {
        query,
        category,
        state,
        locality,
        status = 'active',
        urgency,
        minBudget,
        maxBudget,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        propertyType,
        createdAfter,
        createdBefore,
        expiringBefore,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = filters;

      const whereConditions: any = {};

      if (query) {
        whereConditions[Op.or] = [
          { state: { [Op.iLike]: `%${query}%` } },
          { locality: { [Op.iLike]: `%${query}%` } },
          { otherInformation: { [Op.iLike]: `%${query}%` } },
        ];
      }

      if (category) whereConditions.category = category;
      if (state) whereConditions.state = { [Op.iLike]: `%${state}%` };
      if (locality) whereConditions.locality = { [Op.iLike]: `%${locality}%` };
      if (status) whereConditions.status = status;
      if (urgency) whereConditions.urgency = urgency;

      if (minBudget || maxBudget) {
        whereConditions.maxBudget = {};
        if (minBudget) whereConditions.maxBudget[Op.gte] = minBudget;
        if (maxBudget) whereConditions.maxBudget[Op.lte] = maxBudget;
      }

      if (minBedrooms) whereConditions.numberOfBedrooms = { [Op.gte]: minBedrooms };
      if (maxBedrooms) {
        whereConditions.numberOfBedrooms = {
          ...whereConditions.numberOfBedrooms,
          [Op.lte]: maxBedrooms,
        };
      }

      if (minBathrooms) whereConditions.numberOfBathrooms = { [Op.gte]: minBathrooms };
      if (maxBathrooms) {
        whereConditions.numberOfBathrooms = {
          ...whereConditions.numberOfBathrooms,
          [Op.lte]: maxBathrooms,
        };
      }

      if (propertyType) whereConditions.propertyType = { [Op.iLike]: `%${propertyType}%` };
      if (createdAfter) whereConditions.createdAt = { [Op.gte]: createdAfter };
      if (createdBefore) {
        whereConditions.createdAt = {
          ...whereConditions.createdAt,
          [Op.lte]: createdBefore,
        };
      }
      if (expiringBefore) whereConditions.expiresAt = { [Op.lte]: expiringBefore };

      const offset = (page - 1) * limit;
      const order: any = [[sortBy, sortOrder.toUpperCase()]];

      const { count, rows } = await PropertyRequest.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'seeker',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order,
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        requests: rows,
        pagination: {
          currentPage: parseInt(page as any),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit as any),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to search property requests: ${error.message}`);
    }
  }

  async getSeekerRequests(seekerId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequest.findAndCountAll({
        where: { seekerId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        requests: rows,
        pagination: {
          currentPage: parseInt(page as any),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit as any),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get seeker requests: ${error.message}`);
    }
  }

  async updatePropertyRequest(id: string, updateData: any, seekerId: string) {
    try {
      const request = await PropertyRequest.findOne({ where: { id, seekerId } });
      if (!request) return null;

      await request.update(updateData);
      return request;
    } catch (error: any) {
      throw new Error(`Failed to update property request: ${error.message}`);
    }
  }

  async deletePropertyRequest(id: string, seekerId: string) {
    try {
      const request = await PropertyRequest.findOne({ where: { id, seekerId } });
      if (!request) return null;

      await request.destroy();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete property request: ${error.message}`);
    }
  }

  async incrementViewCount(id: string) {
    try {
      await PropertyRequest.increment('viewCount', { where: { id } });
    } catch (error: any) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  async createResponse(requestId: string, responseData: any, responderId: string) {
    try {
      const response = await PropertyRequestResponse.create({
        ...responseData,
        requestId,
        responderId,
      });

      await PropertyRequest.increment('responseCount', { where: { id: requestId } });

      return response;
    } catch (error: any) {
      throw new Error(`Failed to create response: ${error.message}`);
    }
  }

  async getResponsesForRequest(requestId: string, seekerId: string, page = 1, limit = 20) {
    try {
      const request = await PropertyRequest.findOne({ where: { id: requestId, seekerId } });
      if (!request) return null;

      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequestResponse.findAndCountAll({
        where: { requestId },
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'username', 'email', 'role'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        responses: rows,
        pagination: {
          currentPage: parseInt(page as any),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit as any),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get responses: ${error.message}`);
    }
  }

  async getResponderResponses(responderId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequestResponse.findAndCountAll({
        where: { responderId },
        include: [
          {
            model: PropertyRequest,
            as: 'request',
            include: [
              {
                model: User,
                as: 'seeker',
                attributes: ['id', 'username', 'email'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        responses: rows,
        pagination: {
          currentPage: parseInt(page as any),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit as any),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get responder responses: ${error.message}`);
    }
  }

  async updateResponseStatus(responseId: string, statusData: any, seekerId: string) {
    try {
      const response = await PropertyRequestResponse.findOne({
        where: { id: responseId },
        include: [
          {
            model: PropertyRequest,
            as: 'request',
            where: { seekerId },
          },
        ],
      });

      if (!response) return null;

      await response.update(statusData);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to update response status: ${error.message}`);
    }
  }

  async getResponseById(id: string) {
    try {
      const response = await PropertyRequestResponse.findByPk(id, {
        include: [
          {
            model: PropertyRequest,
            as: 'request',
          },
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'username', 'email', 'role'],
          },
        ],
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }
}

export default new PropertyRequestRepository();
