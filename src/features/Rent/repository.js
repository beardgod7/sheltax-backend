const { Op, Sequelize } = require("sequelize");
const { RentalProperty, RentalInquiry, RentalFavorite } = require("./model");
const { User } = require("../Authentication/model");

class RentalRepository {
  // Create rental property
  async createRentalProperty(propertyData, ownerId) {
    try {
      const property = await RentalProperty.create({
        ...propertyData,
        ownerId,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to create rental property: ${error.message}`);
    }
  }

  // Get rental property by ID with associations
  async getRentalPropertyById(id, includeOwner = true) {
    try {
      const includes = [];
      if (includeOwner) {
        includes.push({
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        });
      }

      const property = await RentalProperty.findByPk(id, {
        include: includes,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to get rental property: ${error.message}`);
    }
  }

  // Search and filter rental properties with pagination
  async searchRentalProperties(filters = {}) {
    try {
      const {
        query,
        propertyType,
        city,
        state,
        area,
        minRent,
        maxRent,
        rentPeriod,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        features,
        amenities,
        isAvailable,
        isVerified,
        isFeatured,
        status,
        availableFrom,
        tag,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = filters;

      // Build where conditions
      const whereConditions = {};

      // Text search in title and description
      if (query) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Property type filter
      if (propertyType) {
        whereConditions.propertyType = propertyType;
      }

      // Location filters
      if (city) {
        whereConditions.city = { [Op.iLike]: `%${city}%` };
      }
      if (state) {
        whereConditions.state = { [Op.iLike]: `%${state}%` };
      }
      if (area) {
        whereConditions.area = { [Op.iLike]: `%${area}%` };
      }

      // Price filters
      if (minRent || maxRent) {
        whereConditions.rentAmount = {};
        if (minRent) whereConditions.rentAmount[Op.gte] = minRent;
        if (maxRent) whereConditions.rentAmount[Op.lte] = maxRent;
      }
      if (rentPeriod) {
        whereConditions.rentPeriod = rentPeriod;
      }

      // Bedroom filters
      if (minBedrooms || maxBedrooms) {
        whereConditions.bedrooms = {};
        if (minBedrooms) whereConditions.bedrooms[Op.gte] = minBedrooms;
        if (maxBedrooms) whereConditions.bedrooms[Op.lte] = maxBedrooms;
      }

      // Bathroom filters
      if (minBathrooms || maxBathrooms) {
        whereConditions.bathrooms = {};
        if (minBathrooms) whereConditions.bathrooms[Op.gte] = minBathrooms;
        if (maxBathrooms) whereConditions.bathrooms[Op.lte] = maxBathrooms;
      }

      // Feature filters
      if (features && features.length > 0) {
        whereConditions.features = {
          [Op.contains]: features,
        };
      }

      // Amenity filters
      if (amenities && amenities.length > 0) {
        whereConditions.amenities = {
          [Op.contains]: amenities,
        };
      }

      // Status filters
      if (isAvailable !== undefined) {
        whereConditions.isAvailable = isAvailable;
      }
      if (isVerified !== undefined) {
        whereConditions.isVerified = isVerified;
      }
      if (isFeatured !== undefined) {
        whereConditions.isFeatured = isFeatured;
      }
      if (status) {
        whereConditions.status = status;
      }

      // Date filters
      if (availableFrom) {
        whereConditions.availableFrom = {
          [Op.lte]: availableFrom,
        };
      }

      // Tag filter
      if (tag) {
        whereConditions.tag = tag;
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build order clause
      const order = [[sortBy, sortOrder.toUpperCase()]];

      // Execute query
      const { count, rows } = await RentalProperty.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "owner",
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
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        properties: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };
    } catch (error) {
      throw new Error(`Failed to search rental properties: ${error.message}`);
    }
  }

  // Get rental properties by owner
  async getRentalPropertiesByOwner(ownerId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await RentalProperty.findAndCountAll({
        where: { ownerId },
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        properties: rows,
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
      throw new Error(`Failed to get owner properties: ${error.message}`);
    }
  }

  // Update rental property
  async updateRentalProperty(id, updateData, ownerId) {
    try {
      const property = await RentalProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.update(updateData);
      return property;
    } catch (error) {
      throw new Error(`Failed to update rental property: ${error.message}`);
    }
  }

  // Delete rental property
  async deleteRentalProperty(id, ownerId) {
    try {
      const property = await RentalProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete rental property: ${error.message}`);
    }
  }

  // Increment view count
  async incrementViewCount(id) {
    try {
      // View count functionality removed
      return true;
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  // Verify property (Admin only)
  async verifyRentalProperty(id, isVerified) {
    try {
      const property = await RentalProperty.findByPk(id);
      if (!property) {
        return null;
      }

      await property.update({
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      });

      return property;
    } catch (error) {
      throw new Error(`Failed to verify rental property: ${error.message}`);
    }
  }

  // INQUIRY METHODS

  // Create rental inquiry
  async createRentalInquiry(propertyId, inquiryData, inquirerId) {
    try {
      const inquiry = await RentalInquiry.create({
        ...inquiryData,
        propertyId,
        inquirerId,
      });

      return inquiry;
    } catch (error) {
      throw new Error(`Failed to create rental inquiry: ${error.message}`);
    }
  }

  // Get inquiries for a property (Owner only)
  async getInquiriesForProperty(propertyId, ownerId, page = 1, limit = 20) {
    try {
      // First verify the property belongs to the owner
      const property = await RentalProperty.findOne({
        where: { id: propertyId, ownerId },
      });

      if (!property) {
        return null;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await RentalInquiry.findAndCountAll({
        where: { propertyId },
        include: [
          {
            model: User,
            as: "inquirer",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        inquiries: rows,
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
      throw new Error(`Failed to get property inquiries: ${error.message}`);
    }
  }

  // Get user's inquiries
  async getUserInquiries(inquirerId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await RentalInquiry.findAndCountAll({
        where: { inquirerId },
        include: [
          {
            model: RentalProperty,
            as: "property",
            attributes: ["id", "title", "rentAmount", "currency", "images"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        inquiries: rows,
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
      throw new Error(`Failed to get user inquiries: ${error.message}`);
    }
  }

  // Respond to inquiry (Owner only)
  async respondToInquiry(inquiryId, responseData, ownerId) {
    try {
      const inquiry = await RentalInquiry.findOne({
        where: { id: inquiryId },
        include: [
          {
            model: RentalProperty,
            as: "property",
            where: { ownerId },
          },
        ],
      });

      if (!inquiry) {
        return null;
      }

      await inquiry.update({
        ...responseData,
        respondedAt: new Date(),
      });

      return inquiry;
    } catch (error) {
      throw new Error(`Failed to respond to inquiry: ${error.message}`);
    }
  }

  // FAVORITE METHODS

  // Add to favorites
  async addToFavorites(propertyId, userId) {
    try {
      const [favorite, created] = await RentalFavorite.findOrCreate({
        where: { propertyId, userId },
        defaults: { propertyId, userId },
      });

      return { favorite, created };
    } catch (error) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  // Remove from favorites
  async removeFromFavorites(propertyId, userId) {
    try {
      const deleted = await RentalFavorite.destroy({
        where: { propertyId, userId },
      });

      return deleted > 0;
    } catch (error) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  // Get user's favorite properties
  async getUserFavorites(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await RentalFavorite.findAndCountAll({
        where: { userId },
        include: [
          {
            model: RentalProperty,
            as: "property",
            include: [
              {
                model: User,
                as: "owner",
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
        favorites: rows,
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
      throw new Error(`Failed to get user favorites: ${error.message}`);
    }
  }

  // Check if property is favorited by user
  async isPropertyFavorited(propertyId, userId) {
    try {
      const favorite = await RentalFavorite.findOne({
        where: { propertyId, userId },
      });

      return !!favorite;
    } catch (error) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }
}

module.exports = new RentalRepository();