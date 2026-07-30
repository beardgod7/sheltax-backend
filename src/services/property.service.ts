import { Op, WhereOptions } from 'sequelize';
import { Property, PropertyIntent, User } from '../models';
import { NotificationService } from './notification.service';
import { sendNewListingAdminNotificationEmail, sendListingStatusEmail } from './email.service';
import { CustomError } from '../middlewares/error.middleware';

export interface PropertyFilterQuery {
  intent?: string;
  propertyType?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  q?: string;
  state?: string;
  city?: string;
  area?: string;
  isFeatured?: string | boolean;
  isPopular?: string | boolean;
  limit?: string | number;
  status?: string;
}

export class PropertyService {
  public static async getProperties(query: PropertyFilterQuery) {
    const whereClause: WhereOptions = {};

    if (query.intent) {
      whereClause.intent = query.intent.toUpperCase() as PropertyIntent;
    }

    if (query.propertyType && query.propertyType.toLowerCase() !== 'any') {
      whereClause.propertyType = {
        [Op.iLike]: `%${query.propertyType}%`,
      };
    }

    if (query.state && query.state.trim().length > 0) {
      whereClause.state = {
        [Op.iLike]: `%${query.state.trim()}%`,
      };
    }

    if (query.city && query.city.trim().length > 0) {
      whereClause.city = {
        [Op.iLike]: `%${query.city.trim()}%`,
      };
    }

    if (query.area && query.area.trim().length > 0) {
      whereClause.location = {
        [Op.iLike]: `%${query.area.trim()}%`,
      };
    }

    if (query.minPrice || query.maxPrice) {
      const priceWhere: Record<symbol, number> = {};
      if (query.minPrice && query.minPrice !== 'min') {
        const parsedMin = Number(query.minPrice);
        if (!isNaN(parsedMin)) priceWhere[Op.gte] = parsedMin;
      }
      if (query.maxPrice && query.maxPrice !== 'max') {
        const parsedMax = Number(query.maxPrice);
        if (!isNaN(parsedMax)) priceWhere[Op.lte] = parsedMax;
      }
      if (Object.keys(priceWhere).length > 0) {
        whereClause.price = priceWhere;
      }
    }

    if (query.q && query.q.trim().length > 0) {
      const rawSearch = query.q.trim();
      const tokens = rawSearch.split(/\s+/).filter((t) => t.length > 0);

      if (tokens.length > 1) {
        // Multi-word token matching (all words match somewhere in property details)
        const tokenConditions = tokens.map((token) => {
          const term = `%${token}%`;
          return {
            [Op.or]: [
              { title: { [Op.iLike]: term } },
              { description: { [Op.iLike]: term } },
              { propertyType: { [Op.iLike]: term } },
              { location: { [Op.iLike]: term } },
              { city: { [Op.iLike]: term } },
              { state: { [Op.iLike]: term } },
            ],
          };
        });
        whereClause[Op.and as unknown as keyof WhereOptions] = tokenConditions;
      } else {
        // Single word search
        const searchTerm = `%${rawSearch}%`;
        whereClause[Op.or as unknown as keyof WhereOptions] = [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } },
          { propertyType: { [Op.iLike]: searchTerm } },
          { location: { [Op.iLike]: searchTerm } },
          { city: { [Op.iLike]: searchTerm } },
          { state: { [Op.iLike]: searchTerm } },
        ];
      }
    }

    if (query.isFeatured !== undefined) {
      whereClause.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    if (query.isPopular !== undefined) {
      whereClause.isPopular = query.isPopular === 'true' || query.isPopular === true;
    }

    // Public homepage and seekers ONLY see APPROVED properties
    if (query.status && query.status.toUpperCase() !== 'ALL') {
      whereClause.approvalStatus = query.status.toUpperCase();
    } else if (!query.status) {
      whereClause.approvalStatus = 'APPROVED';
    }

    const limit = query.limit ? Math.min(Number(query.limit), 50) : undefined;

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'surname', 'email', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return properties;
  }

  public static async getPropertyById(id: string, user?: { id: string; role: string }) {
    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'surname', 'email', 'role'],
        },
      ],
    });

    if (!property) return null;

    // If property is NOT approved yet, only the owner or an admin can view it
    if (property.approvalStatus !== 'APPROVED') {
      const isOwner = user && user.id === property.ownerId;
      const isAdmin = user && user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return null;
      }
    }

    return property;
  }

  public static async getLocations() {
    const dbProperties = await Property.findAll({
      attributes: ['state', 'city', 'location'],
      raw: true,
    });

    const locationsByState: Record<string, Set<string>> = {
      Lagos: new Set([
        'Lekki',
        'Ikoyi',
        'Victoria Island',
        'Ikeja',
        'Ajah',
        'Chevron',
        'Maryland',
        'Surulere',
        'Gbagada',
        'Magodo',
        'Yaba',
        'Sangotedo',
        'Festac',
        'Ogudu',
        'Epe',
      ]),
      Abuja: new Set([
        'Maitama',
        'Asokoro',
        'Wuse',
        'Guzape',
        'Gwarinpa',
        'Jahi',
        'Katampe',
        'Utako',
        'Jabi',
        'Kubwa',
        'Apo',
        'Lugbe',
        'Lokogoma',
        'Dawaki',
      ]),
      Rivers: new Set(['GRA Phase 2', 'Peter Odili', 'Trans Amadi', 'Ada George', 'Rumuogba']),
      Oyo: new Set(['Bodija', 'Iyaganku', 'Jericho', 'Ring Road', 'Akobo']),
      Enugu: new Set(['Independence Layout', 'New Haven', 'GRA']),
      Anambra: new Set(['GRA Awka', 'Nnewi', 'Onitsha']),
      Kano: new Set(['Nassarawa GRA', 'Kano City']),
    };

    dbProperties.forEach((p) => {
      const stateName = p.state?.trim();
      const cityName = p.city?.trim();
      if (stateName) {
        if (!locationsByState[stateName]) {
          locationsByState[stateName] = new Set();
        }
        if (cityName) {
          locationsByState[stateName].add(cityName);
        }
      }
    });

    const resultLocationsByState: Record<string, string[]> = {};
    Object.keys(locationsByState)
      .sort()
      .forEach((stateKey) => {
        resultLocationsByState[stateKey] = Array.from(locationsByState[stateKey]).sort();
      });

    return {
      states: Object.keys(resultLocationsByState),
      locationsByState: resultLocationsByState,
    };
  }

  public static async createProperty(ownerId: string, input: any) {
    const owner = await User.findByPk(ownerId);
    if (!owner) {
      const err: CustomError = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (owner.kycStatus !== 'APPROVED') {
      const err: CustomError = new Error('Identity verification (KYC) is required before creating a property listing.');
      err.statusCode = 403;
      throw err;
    }

    let formattedIntent: PropertyIntent = 'RENT';
    const rawIntent = (input.intent || input.purpose || 'RENT').toString().toUpperCase().trim();
    if (rawIntent === 'SALE' || rawIntent === 'FOR SALE' || rawIntent === 'SELL' || rawIntent === 'BUY') {
      formattedIntent = 'BUY';
    } else if (rawIntent === 'SHORTLET' || rawIntent === 'SHORT-LET') {
      formattedIntent = 'SHORTLET';
    } else if (rawIntent === 'SWAP' || rawIntent === 'HOUSE SWAP') {
      formattedIntent = 'SWAP';
    } else {
      formattedIntent = 'RENT';
    }

    const property = await Property.create({
      ownerId,
      title: input.title,
      description: input.description || input.title,
      intent: formattedIntent,
      propertyType: input.propertyType || 'apartment',
      price: Number(input.price) || 0,
      currency: input.currency || 'NGN',
      location: input.location || input.address || input.area || 'Abuja',
      city: input.city || input.locality || 'Abuja',
      state: input.state || 'Federal Capital Territory',
      bedrooms: Number(input.bedrooms) || 1,
      bathrooms: Number(input.bathrooms) || 1,
      sittingRooms: Number(input.sittingRooms) || 1,
      tags: Array.isArray(input.tags) ? input.tags : [(input.propertyType || 'APARTMENT').toUpperCase()],
      images: Array.isArray(input.images) && input.images.length > 0
        ? input.images
        : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'],
      isFeatured: input.isFeatured !== undefined ? Boolean(input.isFeatured) : true,
      isPopular: input.isPopular !== undefined ? Boolean(input.isPopular) : true,
      approvalStatus: 'PENDING',
    });

    // 1. Notify Owner In-App
    NotificationService.createNotification({
      userId: ownerId,
      title: 'Property Listing Created 📝',
      message: `Your property listing "${property.title}" was submitted successfully and is pending admin approval.`,
      type: 'LISTING_CREATED',
      link: '/owner/listings',
    }).catch((err) => console.error('Owner notification error:', err));

    // 2. Notify Admins In-App & via Email
    NotificationService.notifyAdmins({
      title: 'New Property Listing Pending Review 🔔',
      message: `Owner ${owner?.firstName || ''} ${owner?.surname || ''} submitted "${property.title}". Action required.`,
      type: 'LISTING_CREATED',
      link: '/properties',
    }).catch((err) => console.error('Admin notification error:', err));

    if (owner) {
      const adminUsers = await User.findAll({ where: { role: 'admin' } });
      adminUsers.forEach((admin) => {
        sendNewListingAdminNotificationEmail(
          admin.email,
          {
            id: property.id,
            title: property.title,
            intent: property.intent,
            price: property.price,
            currency: property.currency,
            location: property.location,
            state: property.state,
          },
          {
            firstName: owner.firstName,
            surname: owner.surname,
            email: owner.email,
          }
        ).catch((err) => console.error('Admin email notify error:', err));
      });
    }

    return property;
  }

  public static async updatePropertyApproval(id: string, approvalStatus: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
    const property = await Property.findByPk(id, {
      include: [{ model: User, as: 'owner' }],
    });

    if (!property) {
      const err = new Error('Property not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    property.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) {
      property.rejectionReason = rejectionReason;
    }

    await property.save();

    // Notify Owner In-App & via Email
    const owner = (property as any).owner;
    if (owner) {
      const isApproved = approvalStatus === 'APPROVED';
      NotificationService.createNotification({
        userId: owner.id,
        title: isApproved ? 'Property Listing Approved! 🎉' : 'Property Listing Review Update ⚠️',
        message: isApproved
          ? `Your listing "${property.title}" is now approved and live on the marketplace.`
          : `Your listing "${property.title}" requires updates. Reason: ${rejectionReason || 'Check details.'}`,
        type: isApproved ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
        link: '/owner/listings',
      }).catch((err) => console.error('Owner approval notification error:', err));

      sendListingStatusEmail(owner.email, owner.firstName, property.title, approvalStatus, rejectionReason)
        .catch((err) => console.error('Listing status email error:', err));
    }

    return property;
  }

  public static async updateProperty(id: string, user: { id: string; role: string }, input: any) {
    const property = await Property.findByPk(id);

    if (!property) {
      const err = new Error('Property not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (property.ownerId !== user.id && user.role !== 'admin') {
      const err = new Error('Unauthorized to edit this property.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (input.title !== undefined) property.title = input.title;
    if (input.description !== undefined) property.description = input.description;
    if (input.price !== undefined) property.price = Number(input.price);
    if (input.bedrooms !== undefined) property.bedrooms = Number(input.bedrooms);
    if (input.bathrooms !== undefined) property.bathrooms = Number(input.bathrooms);
    if (input.sittingRooms !== undefined) property.sittingRooms = Number(input.sittingRooms);
    if (input.propertyType !== undefined) property.propertyType = input.propertyType;
    if (input.location !== undefined) property.location = input.location;
    if (input.city !== undefined) property.city = input.city;
    if (input.state !== undefined) property.state = input.state;
    if (input.images !== undefined) property.images = input.images;
    if (input.tags !== undefined) property.tags = input.tags;
    if (input.isFeatured !== undefined) property.isFeatured = Boolean(input.isFeatured);

    await property.save();
    return property;
  }

  public static async deleteProperty(id: string, user: { id: string; role: string }) {
    const property = await Property.findByPk(id);

    if (!property) {
      const err = new Error('Property not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (property.ownerId !== user.id && user.role !== 'admin') {
      const err = new Error('Unauthorized to delete this property.');
      (err as any).statusCode = 403;
      throw err;
    }

    await property.destroy();
    return { id, deleted: true };
  }
}
