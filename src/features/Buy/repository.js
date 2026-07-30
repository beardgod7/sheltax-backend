const { Op, Sequelize } = require("sequelize");
const { SaleProperty, SaleInquiry, SaleFavorite } = require("./model");
const { User } = require("../Authentication/model");

class SaleRepository {
  // Create sale property
  async createSaleProperty(propertyData, ownerId) {
    try {
      const property = await SaleProperty.create({
        ...propertyData,
        ownerId,
        listingStatus: "pending",
        status: "under_review",
        isVerified: false,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to create sale property: ${error.message}`);
    }
  }

  // Get sale property by ID with associations
  async getSalePropertyById(id, includeOwner = true) {
    try {
      const includes = [];
      if (includeOwner) {
        includes.push({
          model: User,
          as: "owner",
          attributes: ["id", "username", "email", "firstName", "surname", "profilePicture", "role", "verified"],
        });
      }

      const property = await SaleProperty.findByPk(id, {
        include: includes,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to get sale property: ${error.message}`);
    }
  }

  // Search and filter sale properties with pagination
  async searchSaleProperties(filters = {}) {
    try {
      const {
        query,
        propertyType,
        city,
        state,
        area,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        minPropertyAge,
        maxPropertyAge,
        minLandSize,
        maxLandSize,
        minBuiltUpArea,
        maxBuiltUpArea,
        titleDocument,
        features,
        amenities,
        isVerified,
        isFeatured,
        status,
        listingStatus,
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
      if (minPrice || maxPrice) {
        whereConditions.salePrice = {};
        if (minPrice) whereConditions.salePrice[Op.gte] = minPrice;
        if (maxPrice) whereConditions.salePrice[Op.lte] = maxPrice;
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

      // Property age filters
      if (minPropertyAge || maxPropertyAge) {
        whereConditions.propertyAge = {};
        if (minPropertyAge) whereConditions.propertyAge[Op.gte] = minPropertyAge;
        if (maxPropertyAge) whereConditions.propertyAge[Op.lte] = maxPropertyAge;
      }

      // Land size filters
      if (minLandSize || maxLandSize) {
        whereConditions.landSize = {};
        if (minLandSize) whereConditions.landSize[Op.gte] = minLandSize;
        if (maxLandSize) whereConditions.landSize[Op.lte] = maxLandSize;
      }

      // Built-up area filters
      if (minBuiltUpArea || maxBuiltUpArea) {
        whereConditions.builtUpArea = {};
        if (minBuiltUpArea) whereConditions.builtUpArea[Op.gte] = minBuiltUpArea;
        if (maxBuiltUpArea) whereConditions.builtUpArea[Op.lte] = maxBuiltUpArea;
      }

      // Title document filter
      if (titleDocument) {
        whereConditions.titleDocument = titleDocument;
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
      if (isVerified !== undefined) {
        whereConditions.isVerified = isVerified;
      }
      if (isFeatured !== undefined) {
        whereConditions.isFeatured = isFeatured;
      }
      if (status) {
        whereConditions.status = status;
      }
      if (listingStatus) {
        whereConditions.listingStatus = listingStatus;
      } else if (!filters.allStatuses) {
        whereConditions.listingStatus = "active";
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
      const { count, rows } = await SaleProperty.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username", "email", "firstName", "surname", "profilePicture", "role", "verified"],
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
      throw new Error(`Failed to search sale properties: ${error.message}`);
    }
  }

  // Get sale properties by owner
  async getSalePropertiesByOwner(ownerId, page = 1, limit = 20, listingStatus = null) {
    try {
      const offset = (page - 1) * limit;
      
      const whereConditions = { ownerId };
      if (listingStatus) {
        whereConditions.listingStatus = listingStatus;
      }

      const { count, rows } = await SaleProperty.findAndCountAll({
        where: whereConditions,
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

  // Update sale property
  async updateSaleProperty(id, updateData, ownerId) {
    try {
      const property = await SaleProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.update(updateData);
      return property;
    } catch (error) {
      throw new Error(`Failed to update sale property: ${error.message}`);
    }
  }

  // Delete sale property
  async deleteSaleProperty(id, ownerId) {
    try {
      const property = await SaleProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete sale property: ${error.message}`);
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
  async verifySaleProperty(id, isVerified) {
    try {
      const property = await SaleProperty.findByPk(id);
      if (!property) {
        return null;
      }

      await property.update({
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      });

      return property;
    } catch (error) {
      throw new Error(`Failed to verify sale property: ${error.message}`);
    }
  }

  // Update listing status (Admin only)
  async updateListingStatus(id, listingStatus, rejectionReason = null) {
    try {
      const property = await SaleProperty.findByPk(id);
      if (!property) {
        return null;
      }

      const updateData = { listingStatus };
      if (listingStatus === "rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      } else if (listingStatus !== "rejected") {
        updateData.rejectionReason = null;
      }

      await property.update(updateData);
      return property;
    } catch (error) {
      throw new Error(`Failed to update listing status: ${error.message}`);
    }
  }

  // INQUIRY METHODS

  // Create sale inquiry
  async createSaleInquiry(propertyId, inquiryData, inquirerId) {
    try {
      const inquiry = await SaleInquiry.create({
        ...inquiryData,
        propertyId,
        inquirerId,
      });

      return inquiry;
    } catch (error) {
      throw new Error(`Failed to create sale inquiry: ${error.message}`);
    }
  }

  // Get inquiries for a property (Owner only)
  async getInquiriesForProperty(propertyId, ownerId, page = 1, limit = 20) {
    try {
      // First verify the property belongs to the owner
      const property = await SaleProperty.findOne({
        where: { id: propertyId, ownerId },
      });

      if (!property) {
        return null;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await SaleInquiry.findAndCountAll({
        where: { propertyId },
        include: [
          {
            model: User,
            as: "inquirer",
            attributes: ["id", "username", "email", "firstName", "surname", "profilePicture", "role", "verified"],
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

      const { count, rows } = await SaleInquiry.findAndCountAll({
        where: { inquirerId },
        include: [
          {
            model: SaleProperty,
            as: "property",
            attributes: ["id", "title", "salePrice", "currency", "images"],
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
      const inquiry = await SaleInquiry.findOne({
        where: { id: inquiryId },
        include: [
          {
            model: SaleProperty,
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
      const [favorite, created] = await SaleFavorite.findOrCreate({
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
      const deleted = await SaleFavorite.destroy({
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

      const { count, rows } = await SaleFavorite.findAndCountAll({
        where: { userId },
        include: [
          {
            model: SaleProperty,
            as: "property",
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "username", "email", "firstName", "surname", "profilePicture", "role", "verified"],
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
      const favorite = await SaleFavorite.findOne({
        where: { propertyId, userId },
      });

      return !!favorite;
    } catch (error) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }
}

module.exports = new SaleRepository();
