const { Op, Sequelize } = require("sequelize");
const { ShortletProperty, ShortletInquiry, ShortletFavorite } = require("./model");
const { User } = require("../Authentication/model");

class ShortletRepository {
  // Create shortlet property
  async createShortletProperty(propertyData, ownerId) {
    try {
      const property = await ShortletProperty.create({
        ...propertyData,
        ownerId,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to create shortlet property: ${error.message}`);
    }
  }

  // Get shortlet property by ID with associations
  async getShortletPropertyById(id, includeOwner = true) {
    try {
      const includes = [];
      if (includeOwner) {
        includes.push({
          model: User,
          as: "owner",
          attributes: ["id", "username", "email"],
        });
      }

      const property = await ShortletProperty.findByPk(id, {
        include: includes,
      });
      return property;
    } catch (error) {
      throw new Error(`Failed to get shortlet property: ${error.message}`);
    }
  }

  // Search and filter shortlet properties with pagination
  async searchShortletProperties(filters = {}) {
    try {
      const {
        query,
        propertyType,
        city,
        state,
        area,
        minPricePerNight,
        maxPricePerNight,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        minGuests,
        maxGuests,
        checkInDate,
        checkOutDate,
        minimumStay,
        maximumStay,
        instantBooking,
        features,
        amenities,
        isAvailable,
        isVerified,
        isFeatured,
        status,
        listingStatus,
        tag,
        availableFrom,
        availableTo,
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
      if (minPricePerNight || maxPricePerNight) {
        whereConditions.pricePerNight = {};
        if (minPricePerNight) whereConditions.pricePerNight[Op.gte] = minPricePerNight;
        if (maxPricePerNight) whereConditions.pricePerNight[Op.lte] = maxPricePerNight;
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

      // Guest capacity filters
      if (minGuests || maxGuests) {
        whereConditions.maxGuests = {};
        if (minGuests) whereConditions.maxGuests[Op.gte] = minGuests;
        if (maxGuests) whereConditions.maxGuests[Op.lte] = maxGuests;
      }

      // Booking rule filters
      if (minimumStay) {
        whereConditions.minimumStay = { [Op.lte]: minimumStay };
      }
      if (maximumStay) {
        whereConditions[Op.or] = [
          { maximumStay: { [Op.gte]: maximumStay } },
          { maximumStay: null }
        ];
      }
      if (instantBooking !== undefined) {
        whereConditions.instantBooking = instantBooking;
      }

      // Availability date filters
      if (checkInDate && checkOutDate) {
        whereConditions[Op.and] = [
          {
            [Op.or]: [
              { availableFrom: { [Op.lte]: checkInDate } },
              { availableFrom: null }
            ]
          },
          {
            [Op.or]: [
              { availableTo: { [Op.gte]: checkOutDate } },
              { availableTo: null }
            ]
          }
        ];
      } else if (availableFrom) {
        whereConditions.availableFrom = {
          [Op.lte]: availableFrom,
        };
      } else if (availableTo) {
        whereConditions.availableTo = {
          [Op.gte]: availableTo,
        };
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
      if (listingStatus) {
        whereConditions.listingStatus = listingStatus;
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
      const { count, rows } = await ShortletProperty.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "username", "email"],
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
      throw new Error(`Failed to search shortlet properties: ${error.message}`);
    }
  }

  // Get shortlet properties by owner
  async getShortletPropertiesByOwner(ownerId, page = 1, limit = 20, listingStatus = null) {
    try {
      const offset = (page - 1) * limit;
      
      const whereConditions = { ownerId };
      if (listingStatus) {
        whereConditions.listingStatus = listingStatus;
      }

      const { count, rows } = await ShortletProperty.findAndCountAll({
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

  // Update shortlet property
  async updateShortletProperty(id, updateData, ownerId) {
    try {
      const property = await ShortletProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.update(updateData);
      return property;
    } catch (error) {
      throw new Error(`Failed to update shortlet property: ${error.message}`);
    }
  }

  // Delete shortlet property
  async deleteShortletProperty(id, ownerId) {
    try {
      const property = await ShortletProperty.findOne({
        where: { id, ownerId },
      });

      if (!property) {
        return null;
      }

      await property.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete shortlet property: ${error.message}`);
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
  async verifyShortletProperty(id, isVerified) {
    try {
      const property = await ShortletProperty.findByPk(id);
      if (!property) {
        return null;
      }

      await property.update({
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      });

      return property;
    } catch (error) {
      throw new Error(`Failed to verify shortlet property: ${error.message}`);
    }
  }

  // Update listing status (Admin only)
  async updateListingStatus(id, listingStatus, rejectionReason = null) {
    try {
      const property = await ShortletProperty.findByPk(id);
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

  // Create shortlet inquiry
  async createShortletInquiry(propertyId, inquiryData, inquirerId) {
    try {
      const inquiry = await ShortletInquiry.create({
        ...inquiryData,
        propertyId,
        inquirerId,
      });

      return inquiry;
    } catch (error) {
      throw new Error(`Failed to create shortlet inquiry: ${error.message}`);
    }
  }

  // Get inquiries for a property (Owner only)
  async getInquiriesForProperty(propertyId, ownerId, page = 1, limit = 20) {
    try {
      // First verify the property belongs to the owner
      const property = await ShortletProperty.findOne({
        where: { id: propertyId, ownerId },
      });

      if (!property) {
        return null;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await ShortletInquiry.findAndCountAll({
        where: { propertyId },
        include: [
          {
            model: User,
            as: "inquirer",
            attributes: ["id", "username", "email"],
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

      const { count, rows } = await ShortletInquiry.findAndCountAll({
        where: { inquirerId },
        include: [
          {
            model: ShortletProperty,
            as: "property",
            attributes: ["id", "title", "pricePerNight", "currency", "images"],
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
      const inquiry = await ShortletInquiry.findOne({
        where: { id: inquiryId },
        include: [
          {
            model: ShortletProperty,
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
      const [favorite, created] = await ShortletFavorite.findOrCreate({
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
      const deleted = await ShortletFavorite.destroy({
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

      const { count, rows } = await ShortletFavorite.findAndCountAll({
        where: { userId },
        include: [
          {
            model: ShortletProperty,
            as: "property",
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "username", "email"],
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
      const favorite = await ShortletFavorite.findOne({
        where: { propertyId, userId },
      });

      return !!favorite;
    } catch (error) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }
}

module.exports = new ShortletRepository();
