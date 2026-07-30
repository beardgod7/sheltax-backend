import Joi from 'joi';

export const createSalePropertySchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(20).max(2000).required().messages({
    'string.min': 'Description must be at least 20 characters long',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required',
  }),
  propertyType: Joi.string().optional().allow('', null),
  intent: Joi.string().optional().allow('', null),
  purpose: Joi.string().optional().allow('', null),
  location: Joi.string().optional().allow('', null),
  address: Joi.string().min(2).max(500).optional().allow('', null),
  city: Joi.string().min(2).max(100).optional().allow('', null),
  state: Joi.string().min(2).max(100).optional().allow('', null),
  area: Joi.string().min(2).max(100).optional(),
  bedrooms: Joi.number().integer().min(0).max(50).optional().allow(null),
  bathrooms: Joi.number().integer().min(0).max(50).optional().allow(null),
  sittingRooms: Joi.number().integer().min(0).max(50).optional().allow(null),
  toilets: Joi.number().integer().min(0).max(50).optional().allow(null),
  salePrice: Joi.number().positive().optional().allow(null),
  price: Joi.number().positive().optional().allow(null),
  currency: Joi.string().length(3).optional().default('NGN'),
  titleDocumentType: Joi.string().optional().allow('', null),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  virtualTourUrl: Joi.string().uri().optional().allow('', null),
  tag: Joi.string()
    .valid('rent', 'buy', 'swap', 'shortlet')
    .optional()
    .default('buy'),
}).unknown(true);

export const updateSalePropertySchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(20).max(2000).optional(),
  propertyType: Joi.string()
    .valid('apartment', 'house', 'duplex', 'bungalow', 'flat', 'room', 'studio', 'land', 'commercial')
    .optional(),
  address: Joi.string().min(10).max(500).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  area: Joi.string().min(2).max(100).optional(),
  bedrooms: Joi.number().integer().min(0).max(20).optional(),
  bathrooms: Joi.number().integer().min(0).max(20).optional(),
  toilets: Joi.number().integer().min(0).max(20).optional(),
  salePrice: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  propertyAge: Joi.number().integer().min(0).max(100).optional(),
  landSize: Joi.number().positive().optional(),
  builtUpArea: Joi.number().positive().optional(),
  titleDocument: Joi.string()
    .valid('certificate_of_occupancy', 'deed_of_assignment', 'survey_plan', 'governors_consent', 'other')
    .optional(),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  virtualTourUrl: Joi.string().uri().optional(),
  status: Joi.string()
    .valid('active', 'sold', 'inactive', 'under_review')
    .optional(),
  listingStatus: Joi.string()
    .valid('pending', 'active', 'rejected', 'expired')
    .optional(),
  rejectionReason: Joi.string().max(500).optional(),
  isFeatured: Joi.boolean().optional(),
  featuredUntil: Joi.date().optional(),
  tag: Joi.string()
    .valid('rent', 'buy', 'swap', 'shortlet')
    .optional(),
});

export const createSaleInquirySchema = Joi.object({
  message: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message cannot exceed 1000 characters',
    'any.required': 'Message is required',
  }),
  inquirerName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  inquirerEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  inquirerPhone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  inquiryType: Joi.string()
    .valid('purchase_inquiry', 'viewing_request', 'price_negotiation', 'general_question')
    .optional()
    .default('purchase_inquiry'),
  offerAmount: Joi.number().positive().optional(),
  preferredViewingDate: Joi.date().optional(),
});

export const respondToSaleInquirySchema = Joi.object({
  response: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Response must be at least 10 characters long',
    'string.max': 'Response cannot exceed 1000 characters',
    'any.required': 'Response is required',
  }),
  status: Joi.string()
    .valid('responded', 'viewing_scheduled', 'offer_made', 'closed')
    .optional()
    .default('responded'),
});

export const searchSalePropertiesSchema = Joi.object({
  query: Joi.string().min(2).max(100).optional(),
  propertyType: Joi.string()
    .valid('apartment', 'house', 'duplex', 'bungalow', 'flat', 'room', 'studio', 'land', 'commercial')
    .optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  area: Joi.string().max(100).optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  minBedrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBedrooms: Joi.number().integer().min(0).max(20).optional(),
  minBathrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBathrooms: Joi.number().integer().min(0).max(20).optional(),
  minPropertyAge: Joi.number().integer().min(0).optional(),
  maxPropertyAge: Joi.number().integer().min(0).optional(),
  minLandSize: Joi.number().positive().optional(),
  maxLandSize: Joi.number().positive().optional(),
  minBuiltUpArea: Joi.number().positive().optional(),
  maxBuiltUpArea: Joi.number().positive().optional(),
  titleDocument: Joi.string()
    .valid('certificate_of_occupancy', 'deed_of_assignment', 'survey_plan', 'governors_consent', 'other')
    .optional(),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  isVerified: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  status: Joi.string()
    .valid('active', 'sold', 'inactive', 'under_review')
    .optional(),
  listingStatus: Joi.string()
    .valid('pending', 'active', 'rejected', 'expired')
    .optional(),
  tag: Joi.string()
    .valid('rent', 'buy', 'swap', 'shortlet')
    .optional(),
  sortBy: Joi.string()
    .valid('salePrice', 'createdAt', 'updatedAt', 'bedrooms', 'bathrooms', 'title', 'propertyAge', 'landSize')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
}).unknown(true);

export const verifySalePropertySchema = Joi.object({
  isVerified: Joi.boolean().required().messages({
    'any.required': 'Verification status is required',
  }),
});

export const updateListingStatusSchema = Joi.object({
  listingStatus: Joi.string()
    .valid('active', 'rejected', 'expired')
    .required()
    .messages({
      'any.only': 'Listing status must be one of: active, rejected, expired',
      'any.required': 'Listing status is required',
    }),
  rejectionReason: Joi.string().max(500).when('listingStatus', {
    is: 'rejected',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'any.required': 'Rejection reason is required when rejecting a listing',
  }),
});
