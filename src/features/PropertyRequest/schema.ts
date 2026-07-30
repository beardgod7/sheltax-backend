import Joi from 'joi';

export const createPropertyRequestSchema = Joi.object({
  propertyCategory: Joi.string().required().messages({
    'any.required': 'Property category is required',
  }),
  listingType: Joi.string().required().messages({
    'any.required': 'Listing type is required',
  }),
  maximumBudget: Joi.number().positive().required().messages({
    'number.positive': 'Maximum budget must be a positive number',
    'any.required': 'Maximum budget is required',
  }),
  minimumBudget: Joi.number().positive().required().messages({
    'number.positive': 'Minimum budget must be a positive number',
    'any.required': 'Minimum budget is required',
  }),
  state: Joi.string().required().messages({
    'any.required': 'State is required',
  }),
  region: Joi.string().required().messages({
    'any.required': 'Region is required',
  }),
  timeline: Joi.string().required().messages({
    'any.required': 'Timeline is required',
  }),
  duration: Joi.string().optional().allow('', null),
  otherInformation: Joi.string().max(2000).optional().allow('', null),
});

export const updatePropertyRequestSchema = Joi.object({
  propertyCategory: Joi.string().optional(),
  listingType: Joi.string().optional(),
  maximumBudget: Joi.number().positive().optional(),
  minimumBudget: Joi.number().positive().optional(),
  state: Joi.string().optional(),
  region: Joi.string().optional(),
  timeline: Joi.string().optional(),
  duration: Joi.string().optional().allow('', null),
  otherInformation: Joi.string().max(2000).optional().allow('', null),
  status: Joi.string().valid('active', 'fulfilled', 'cancelled', 'expired').optional(),
});

export const createResponseSchema = Joi.object({
  message: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message cannot exceed 2000 characters',
    'any.required': 'Message is required',
  }),
  propertyId: Joi.string().uuid().optional(),
  propertyType: Joi.string().max(100).optional(),
  propertyLocation: Joi.string().max(200).optional(),
  propertyPrice: Joi.number().positive().optional(),
  propertyImages: Joi.array().items(Joi.string().uri()).optional(),
  propertyDescription: Joi.string().max(1000).optional(),
  contactName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Contact name must be at least 2 characters long',
    'string.max': 'Contact name cannot exceed 100 characters',
    'any.required': 'Contact name is required',
  }),
  contactPhone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Contact phone is required',
    }),
  contactEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Contact email is required',
  }),
});

export const updateResponseStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'viewed', 'interested', 'rejected', 'accepted')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, viewed, interested, rejected, accepted',
      'any.required': 'Status is required',
    }),
  seekerFeedback: Joi.string().max(500).optional(),
  seekerRating: Joi.number().integer().min(1).max(5).optional(),
});

export const searchPropertyRequestsSchema = Joi.object({
  query: Joi.string().min(2).max(100).optional(),
  propertyCategory: Joi.string().optional(),
  listingType: Joi.string().optional(),
  state: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional(),
  status: Joi.string().valid('active', 'fulfilled', 'cancelled', 'expired').optional(),
  minBudget: Joi.number().positive().optional(),
  maxBudget: Joi.number().positive().optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'minimumBudget', 'maximumBudget')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});
