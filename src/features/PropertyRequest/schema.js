const Joi = require("joi");

// Create property request schema
const createPropertyRequestSchema = Joi.object({
  category: Joi.string()
    .valid("rent", "buy", "shortlet")
    .required()
    .messages({
      "any.only": "Category must be one of: rent, buy, shortlet",
      "any.required": "Category is required",
    }),
  minimumBudget: Joi.number().positive().required().messages({
    "number.positive": "Minimum budget must be a positive number",
    "any.required": "Minimum budget is required",
  }),
  maximumBudget: Joi.number().positive().required().messages({
    "number.positive": "Maximum budget must be a positive number",
    "any.required": "Maximum budget is required",
  }),
  currency: Joi.string().length(3).optional().default("NGN"),
  state: Joi.string().min(2).max(100).required().messages({
    "string.min": "State must be at least 2 characters long",
    "string.max": "State cannot exceed 100 characters",
    "any.required": "State is required",
  }),
  locality: Joi.string().min(2).max(100).optional(),
  numberOfBedrooms: Joi.number().integer().min(0).max(20).optional(),
  numberOfBathrooms: Joi.number().integer().min(0).max(20).optional(),
  propertyType: Joi.string().max(100).optional(),
  otherInformation: Joi.string().max(1000).optional(),
  urgency: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .optional()
    .default("medium"),
  desiredMoveInDate: Joi.date().optional(),
  stayDuration: Joi.number().integer().min(1).max(365).optional(),
  expiresAt: Joi.date().optional(),
});

// Update property request schema
const updatePropertyRequestSchema = Joi.object({
  category: Joi.string().valid("rent", "buy", "shortlet").optional(),
  minimumBudget: Joi.number().positive().optional(),
  maximumBudget: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  state: Joi.string().min(2).max(100).optional(),
  locality: Joi.string().min(2).max(100).optional(),
  numberOfBedrooms: Joi.number().integer().min(0).max(20).optional(),
  numberOfBathrooms: Joi.number().integer().min(0).max(20).optional(),
  propertyType: Joi.string().max(100).optional(),
  otherInformation: Joi.string().max(1000).optional(),
  status: Joi.string()
    .valid("active", "fulfilled", "cancelled", "expired")
    .optional(),
  urgency: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  desiredMoveInDate: Joi.date().optional(),
  stayDuration: Joi.number().integer().min(1).max(365).optional(),
  expiresAt: Joi.date().optional(),
});

// Create response to property request schema
const createResponseSchema = Joi.object({
  message: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Message must be at least 10 characters long",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message is required",
  }),
  propertyId: Joi.string().uuid().optional(),
  propertyType: Joi.string().max(100).optional(),
  propertyLocation: Joi.string().max(200).optional(),
  propertyPrice: Joi.number().positive().optional(),
  propertyImages: Joi.array().items(Joi.string().uri()).optional(),
  propertyDescription: Joi.string().max(1000).optional(),
  contactName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Contact name must be at least 2 characters long",
    "string.max": "Contact name cannot exceed 100 characters",
    "any.required": "Contact name is required",
  }),
  contactPhone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
      "any.required": "Contact phone is required",
    }),
  contactEmail: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Contact email is required",
  }),
});

// Update response status schema
const updateResponseStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "viewed", "interested", "rejected", "accepted")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, viewed, interested, rejected, accepted",
      "any.required": "Status is required",
    }),
  seekerFeedback: Joi.string().max(500).optional(),
  seekerRating: Joi.number().integer().min(1).max(5).optional(),
});

// Search property requests schema
const searchPropertyRequestsSchema = Joi.object({
  // Search query
  query: Joi.string().min(2).max(100).optional(),
  
  // Filters
  category: Joi.string().valid("rent", "buy", "shortlet").optional(),
  state: Joi.string().max(100).optional(),
  locality: Joi.string().max(100).optional(),
  status: Joi.string()
    .valid("active", "fulfilled", "cancelled", "expired")
    .optional(),
  urgency: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  
  // Budget filters
  minBudget: Joi.number().positive().optional(),
  maxBudget: Joi.number().positive().optional(),
  
  // Property specifications
  minBedrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBedrooms: Joi.number().integer().min(0).max(20).optional(),
  minBathrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBathrooms: Joi.number().integer().min(0).max(20).optional(),
  propertyType: Joi.string().max(100).optional(),
  
  // Date filters
  createdAfter: Joi.date().optional(),
  createdBefore: Joi.date().optional(),
  expiringBefore: Joi.date().optional(),
  
  // Sorting
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "minimumBudget", "maximumBudget", "urgency", "responseCount")
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
  
  // Pagination
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

module.exports = {
  createPropertyRequestSchema,
  updatePropertyRequestSchema,
  createResponseSchema,
  updateResponseStatusSchema,
  searchPropertyRequestsSchema,
};