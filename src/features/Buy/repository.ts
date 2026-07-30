import { Op } from 'sequelize';
import { SaleProperty, SaleInquiry, SaleFavorite } from './model';
import { User } from '../Authentication/model';

export class SaleRepository {
  async createSaleProperty(propertyData: any, ownerId: string) {
    try {
      const property = await SaleProperty.create({
        ...propertyData,
        ownerId,
        listingStatus: 'pending',
        status: 'under_review',
        isVerified: false,
      });
      return property;
    } catch (error: any) {
      throw new Error(`Failed to create sale property: ${error.message}`);
    }
  }

  async getSalePropertyById(id: string, includeOwner = true) {
    try {
      const includes: any[] = [];
      if (includeOwner) {
        includes.push({
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email', 'firstName', 'surname', 'profilePicture', 'role', 'verified'],
        });
      }

      const property = await SaleProperty.findByPk(id, {
        include: includes,
      });
      return property;
    } catch (error: any) {
      throw new Error(`Failed to get sale property: ${error.message}`);
    }
  }

  async searchSaleProperties(filters: any = {}) {
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
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = filters;

      const whereConditions: any = {};

      if (query) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
        ];
      }

      if (propertyType) whereConditions.propertyType = propertyType;
      if (city) whereConditions.city = { [Op.iLike]: `%${city}%` };
      if (state) whereConditions.state = { [Op.iLike]: `%${state}%` };
      if (area) whereConditions.area = { [Op.iLike]: `%${area}%` };

      if (minPrice || maxPrice) {
        whereConditions.salePrice = {};
        if (minPrice) whereConditions.salePrice[Op.gte] = minPrice;
        if (maxPrice) whereConditions.salePrice[Op.lte] = maxPrice;
      }

      if (minBedrooms || maxBedrooms) {
        whereConditions.bedrooms = {};
        if (minBedrooms) whereConditions.bedrooms[Op.gte] = minBedrooms;
        if (maxBedrooms) whereConditions.bedrooms[Op.lte] = maxBedrooms;
      }

      if (minBathrooms || maxBathrooms) {
        whereConditions.bathrooms = {};
        if (minBathrooms) whereConditions.bathrooms[Op.gte] = minBathrooms;
        if (maxBathrooms) whereConditions.bathrooms[Op.lte] = maxBathrooms;
      }

      if (minPropertyAge || maxPropertyAge) {
        whereConditions.propertyAge = {};
        if (minPropertyAge) whereConditions.propertyAge[Op.gte] = minPropertyAge;
        if (maxPropertyAge) whereConditions.propertyAge[Op.lte] = maxPropertyAge;
      }

      if (minLandSize || maxLandSize) {
        whereConditions.landSize = {};
        if (minLandSize) whereConditions.landSize[Op.gte] = minLandSize;
        if (maxLandSize) whereConditions.landSize[Op.lte] = maxLandSize;
      }

      if (minBuiltUpArea || maxBuiltUpArea) {
        whereConditions.builtUpArea = {};
        if (minBuiltUpArea) whereConditions.builtUpArea[Op.gte] = minBuiltUpArea;
        if (maxBuiltUpArea) whereConditions.builtUpArea[Op.lte] = maxBuiltUpArea;
      }

      if (titleDocument) whereConditions.titleDocument = titleDocument;

      if (features && features.length > 0) {
        whereConditions.features = { [Op.contains]: features };
      }

      if (amenities && amenities.length > 0) {
        whereConditions.amenities = { [Op.contains]: amenities };
      }

      if (isVerified !== undefined) whereConditions.isVerified = isVerified;
      if (isFeatured !== undefined) whereConditions.isFeatured = isFeatured;
      if (status) whereConditions.status = status;
      if (listingStatus) {
        whereConditions.listingStatus = listingStatus;
      } else if (!filters.allStatuses) {
        whereConditions.listingStatus = 'active';
      }

      if (tag) whereConditions.tag = tag;

      const offset = (page - 1) * limit;
      const order: any = [[sortBy, sortOrder.toUpperCase()]];

      const { count, rows } = await SaleProperty.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email', 'firstName', 'surname', 'profilePicture', 'role', 'verified'],
          },
        ],
        order,
        limit: parseInt(limit),
        offset: parseInt(offset as any),
        distinct: true,
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
    } catch (error: any) {
      throw new Error(`Failed to search sale properties: ${error.message}`);
    }
  }

  async getSalePropertiesByOwner(ownerId: string, page = 1, limit = 20, listingStatus: string | null = null) {
    try {
      const offset = (page - 1) * limit;
      const whereConditions: any = { ownerId };
      if (listingStatus) whereConditions.listingStatus = listingStatus;

      const { count, rows } = await SaleProperty.findAndCountAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        properties: rows,
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
      throw new Error(`Failed to get owner properties: ${error.message}`);
    }
  }

  async updateSaleProperty(id: string, updateData: any, ownerId: string) {
    try {
      const property = await SaleProperty.findOne({ where: { id, ownerId } });
      if (!property) return null;

      await property.update(updateData);
      return property;
    } catch (error: any) {
      throw new Error(`Failed to update sale property: ${error.message}`);
    }
  }

  async deleteSaleProperty(id: string, ownerId: string) {
    try {
      const property = await SaleProperty.findOne({ where: { id, ownerId } });
      if (!property) return null;

      await property.destroy();
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete sale property: ${error.message}`);
    }
  }

  async incrementViewCount(id: string) {
    return true;
  }

  async verifySaleProperty(id: string, isVerified: boolean) {
    try {
      const property = await SaleProperty.findByPk(id);
      if (!property) return null;

      await property.update({
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      });

      return property;
    } catch (error: any) {
      throw new Error(`Failed to verify sale property: ${error.message}`);
    }
  }

  async updateListingStatus(id: string, listingStatus: string, rejectionReason: string | null = null) {
    try {
      const property = await SaleProperty.findByPk(id);
      if (!property) return null;

      const updateData: any = { listingStatus };
      if (listingStatus === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      } else if (listingStatus !== 'rejected') {
        updateData.rejectionReason = null;
      }

      await property.update(updateData);
      return property;
    } catch (error: any) {
      throw new Error(`Failed to update listing status: ${error.message}`);
    }
  }

  async createSaleInquiry(propertyId: string, inquiryData: any, inquirerId: string) {
    try {
      const inquiry = await SaleInquiry.create({
        ...inquiryData,
        propertyId,
        inquirerId,
      });
      return inquiry;
    } catch (error: any) {
      throw new Error(`Failed to create sale inquiry: ${error.message}`);
    }
  }

  async getInquiriesForProperty(propertyId: string, ownerId: string, page = 1, limit = 20) {
    try {
      const property = await SaleProperty.findOne({ where: { id: propertyId, ownerId } });
      if (!property) return null;

      const offset = (page - 1) * limit;

      const { count, rows } = await SaleInquiry.findAndCountAll({
        where: { propertyId },
        include: [
          {
            model: User,
            as: 'inquirer',
            attributes: ['id', 'username', 'email', 'firstName', 'surname', 'profilePicture', 'role', 'verified'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        inquiries: rows,
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
      throw new Error(`Failed to get property inquiries: ${error.message}`);
    }
  }

  async getUserInquiries(inquirerId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await SaleInquiry.findAndCountAll({
        where: { inquirerId },
        include: [
          {
            model: SaleProperty,
            as: 'property',
            attributes: ['id', 'title', 'salePrice', 'currency', 'images'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as any),
        offset: parseInt(offset as any),
      });

      const totalPages = Math.ceil(count / limit);

      return {
        inquiries: rows,
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
      throw new Error(`Failed to get user inquiries: ${error.message}`);
    }
  }

  async respondToInquiry(inquiryId: string, responseData: any, ownerId: string) {
    try {
      const inquiry = await SaleInquiry.findOne({
        where: { id: inquiryId },
        include: [
          {
            model: SaleProperty,
            as: 'property',
            where: { ownerId },
          },
        ],
      });

      if (!inquiry) return null;

      await inquiry.update({
        ...responseData,
        respondedAt: new Date(),
      });

      return inquiry;
    } catch (error: any) {
      throw new Error(`Failed to respond to inquiry: ${error.message}`);
    }
  }

  async addToFavorites(propertyId: string, userId: string) {
    try {
      const [favorite, created] = await SaleFavorite.findOrCreate({
        where: { propertyId, userId },
        defaults: { propertyId, userId },
      });
      return { favorite, created };
    } catch (error: any) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  async removeFromFavorites(propertyId: string, userId: string) {
    try {
      const deleted = await SaleFavorite.destroy({
        where: { propertyId, userId },
      });
      return deleted > 0;
    } catch (error: any) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  async getUserFavorites(userId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await SaleFavorite.findAndCountAll({
        where: { userId },
        include: [
          {
            model: SaleProperty,
            as: 'property',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'username', 'email', 'firstName', 'surname', 'profilePicture', 'role', 'verified'],
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
        favorites: rows,
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
      throw new Error(`Failed to get user favorites: ${error.message}`);
    }
  }

  async isPropertyFavorited(propertyId: string, userId: string) {
    try {
      const favorite = await SaleFavorite.findOne({
        where: { propertyId, userId },
      });
      return !!favorite;
    } catch (error: any) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }
}

export default new SaleRepository();
