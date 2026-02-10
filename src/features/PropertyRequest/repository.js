const { Op, Sequelize } = require("sequelize");
const { PropertyRequest, PropertyRequestResponse } = require("./model");
const { User } = require("../Authentication/model");

class PropertyRequestRepository {
  // Create property request (Seeker only)
  async createPropertyRequest(requestData, seekerId) {
    try {
      const request = await PropertyRequest.create({
        ...requestData,
        seekerId,
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to create property request: ${error.message}`);
    }
  }

  // Get property request by ID
  async getPropertyRequestById(id, includeSeeker = true) {
    try {
      const includes = [];
      if (includeSeeker) {
        includes.push({
          model: User,
          as: "seeker",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        });
      }

      const request = await PropertyRequest.findByPk(id, {
        include: includes,
      });
      return request;
    } catch (error) {
      throw new Error(`Failed to get property request: ${error.message}`);
    }
  }

  // Search property requests with filters (Brokers/Owners view)
  async searchPropertyRequests(filters = {}) {
    try {
      const {
        query,
        category,
        state,
        locality,
        status = "active",
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
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = filters;

      // Build where conditions
      const whereConditions = {};

      // Text search
      if (query) {
        whereConditions[Op.or] = [
          { state: { [Op.iLike]: `%${query}%` } },
          { locality: { [Op.iLike]: `%${query}%` } },
          { otherInformation: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Category filter
      if (category) {
        whereConditions.category = category;
      }

      // Location filters
      if (state) {
        whereConditions.state = { [Op.iLike]: `%${state}%` };
      }
      if (locality) {
        whereConditions.locality = { [Op.iLike]: `%${locality}%` };
      }

      // Status filter
      if (status) {
        whereConditions.status = status;
      }

      // Urgency filter
      if (urgency) {
        whereConditions.urgency = urgency;
      }

      // Budget filters
      if (minBudget || maxBudget) {
        whereConditions[Op.and] = whereConditions[Op.and] || [];
        if (minBudget) {
          whereConditions[Op.and].push({
            maximumBudget: { [Op.gte]: minBudget }
          });
        }
        if (maxBudget) {
          whereConditions[Op.and].push({
            minimumBudget: { [Op.lte]: maxBudget }
          });
        }
      }

      // Bedroom filters
      if (minBedrooms) {
        whereConditions.numberOfBedrooms = { [Op.gte]: minBedrooms };
      }
      if (maxBedrooms) {
        whereConditions.numberOfBedrooms = {
          ...whereConditions.numberOfBedrooms,
          [Op.lte]: maxBedrooms
        };
      }

      // Bathroom filters
      if (minBathrooms) {
        whereConditions.numberOfBathrooms = { [Op.gte]: minBathrooms };
      }
      if (maxBathrooms) {
        whereConditions.numberOfBathrooms = {
          ...whereConditions.numberOfBathrooms,
          [Op.lte]: maxBathrooms
        };
      }

      // Property type filter
      if (propertyType) {
        whereConditions.propertyType = { [Op.iLike]: `%${propertyType}%` };
      }

      // Date filters
      if (createdAfter) {
        whereConditions.createdAt = { [Op.gte]: createdAfter };
      }
      if (createdBefore) {
        whereConditions.createdAt = {
          ...whereConditions.createdAt,
          [Op.lte]: createdBefore
        };
      }
      if (expiringBefore) {
        whereConditions.expiresAt = { [Op.lte]: expiringBefore };
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build order clause
      const order = [[sortBy, sortOrder.toUpperCase()]];

      // Execute query
      const { count, rows } = await PropertyRequest.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "seeker",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
        ],
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);

      return {
        requests: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to search property requests: ${error.message}`);
    }
  }

  // Get seeker's own requests
  async getSeekerRequests(seekerId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequest.findAndCountAll({
        where: { seekerId },
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        requests: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get seeker requests: ${error.message}`);
    }
  }

  // Update property request
  async updatePropertyRequest(id, updateData, seekerId) {
    try {
      const request = await PropertyRequest.findOne({
        where: { id, seekerId },
      });

      if (!request) {
        return null;
      }

      await request.update(updateData);
      return request;
    } catch (error) {
      throw new Error(`Failed to update property request: ${error.message}`);
    }
  }

  // Delete property request
  async deletePropertyRequest(id, seekerId) {
    try {
      const request = await PropertyRequest.findOne({
        where: { id, seekerId },
      });

      if (!request) {
        return null;
      }

      await request.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete property request: ${error.message}`);
    }
  }

  // Increment view count
  async incrementViewCount(id) {
    try {
      await PropertyRequest.increment("viewCount", { where: { id } });
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  // RESPONSE METHODS

  // Create response to property request (Broker/Owner)
  async createResponse(requestId, responseData, responderId) {
    try {
      const response = await PropertyRequestResponse.create({
        ...responseData,
        requestId,
        responderId,
      });

      // Increment response count
      await PropertyRequest.increment("responseCount", { where: { id: requestId } });

      return response;
    } catch (error) {
      throw new Error(`Failed to create response: ${error.message}`);
    }
  }

  // Get responses for a request (Seeker views responses to their request)
  async getResponsesForRequest(requestId, seekerId, page = 1, limit = 20) {
    try {
      // Verify the request belongs to the seeker
      const request = await PropertyRequest.findOne({
        where: { id: requestId, seekerId },
      });

      if (!request) {
        return null;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequestResponse.findAndCountAll({
        where: { requestId },
        include: [
          {
            model: User,
            as: "responder",
            attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        responses: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get responses: ${error.message}`);
    }
  }

  // Get broker/owner's own responses
  async getResponderResponses(responderId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await PropertyRequestResponse.findAndCountAll({
        where: { responderId },
        include: [
          {
            model: PropertyRequest,
            as: "request",
            include: [
              {
                model: User,
                as: "seeker",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        responses: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get responder responses: ${error.message}`);
    }
  }

  // Update response status (Seeker updates status of responses they received)
  async updateResponseStatus(responseId, statusData, seekerId) {
    try {
      const response = await PropertyRequestResponse.findOne({
        where: { id: responseId },
        include: [
          {
            model: PropertyRequest,
            as: "request",
            where: { seekerId },
          },
        ],
      });

      if (!response) {
        return null;
      }

      await response.update(statusData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update response status: ${error.message}`);
    }
  }

  // Get response by ID
  async getResponseById(id) {
    try {
      const response = await PropertyRequestResponse.findByPk(id, {
        include: [
          {
            model: PropertyRequest,
            as: "request",
          },
          {
            model: User,
            as: "responder",
            attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
          },
        ],
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }
}

module.exports = new PropertyRequestRepository();