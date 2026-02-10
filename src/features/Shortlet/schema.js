const Joi = require("joi");

// Create shortlet property schema
const createShortletPropertySchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().min(20).max(2000).required().messages({
    "string.min": "Description must be at least 20 characters long",
    "string.max": "Description cannot exceed 2000 characters",
    "any.required": "Description is required",
  }),
  propertyType: Joi.string()
    .valid("apartment", "house", "duplex", "bungalow", "flat", "room", "studio", "hotel", "resort")
    .required()
    .messages({
      "any.only": "Property type must be one of: apartment, house, duplex, bungalow, flat, room, studio, hotel, resort",
      "any.required": "Property type is required",
    }),
  // Location
  address: Joi.string().min(10).max(500).required().messages({
    "string.min": "Address must be at least 10 characters long",
    "string.max": "Address cannot exceed 500 characters",
    "any.required": "Address is required",
  }),
  city: Joi.string().min(2).max(100).required().messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 100 characters",
    "any.required": "City is required",
  }),
  state: Joi.string().min(2).max(100).required().messages({
    "string.min": "State must be at least 2 characters long",
    "string.max": "State cannot exceed 100 characters",
    "any.required": "State is required",
  }),
  area: Joi.string().min(2).max(100).optional(),
  // Property details
  bedrooms: Joi.number().integer().min(0).max(20).required().messages({
    "number.min": "Bedrooms cannot be negative",
    "number.max": "Bedrooms cannot exceed 20",
    "any.required": "Number of bedrooms is required",
  }),
  bathrooms: Joi.number().integer().min(0).max(20).required().messages({
    "number.min": "Bathrooms cannot be negative",
    "number.max": "Bathrooms cannot exceed 20",
    "any.required": "Number of bathrooms is required",
  }),
  toilets: Joi.number().integer().min(0).max(20).optional(),
  maxGuests: Joi.number().integer().min(1).max(50).required().messages({
    "number.min": "Maximum guests must be at least 1",
    "number.max": "Maximum guests cannot exceed 50",
    "any.required": "Maximum number of guests is required",
  }),
  // Shortlet pricing
  pricePerNight: Joi.number().positive().required().messages({
    "number.positive": "Price per night must be a positive number",
    "any.required": "Price per night is required",
  }),
  pricePerWeek: Joi.number().positive().optional(),
  pricePerMonth: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional().default("NGN"),
  securityDeposit: Joi.number().positive().optional(),
  cleaningFee: Joi.number().positive().optional(),
  serviceFee: Joi.number().positive().optional(),
  // Booking rules
  minimumStay: Joi.number().integer().min(1).max(365).optional().default(1),
  maximumStay: Joi.number().integer().min(1).max(365).optional(),
  checkInTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  checkOutTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  instantBooking: Joi.boolean().optional().default(false),
  // Features and amenities
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  houseRules: Joi.array().items(Joi.string()).optional(),
  // Media
  images: Joi.array().items(Joi.string().uri()).optional(),
  virtualTourUrl: Joi.string().uri().optional(),
  // Availability
  availableFrom: Joi.date().optional(),
  availableTo: Joi.date().optional(),
  // Tag field
  tag: Joi.string()
    .valid("rent", "buy", "swap", "shortlet")
    .optional()
    .default("shortlet"),
});

// Update shortlet property schema
const updateShortletPropertySchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(20).max(2000).optional(),
  propertyType: Joi.string()
    .valid("apartment", "house", "duplex", "bungalow", "flat", "room", "studio", "hotel", "resort")
    .optional(),
  address: Joi.string().min(10).max(500).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  area: Joi.string().min(2).max(100).optional(),
  bedrooms: Joi.number().integer().min(0).max(20).optional(),
  bathrooms: Joi.number().integer().min(0).max(20).optional(),
  toilets: Joi.number().integer().min(0).max(20).optional(),
  maxGuests: Joi.number().integer().min(1).max(50).optional(),
  pricePerNight: Joi.number().positive().optional(),
  pricePerWeek: Joi.number().positive().optional(),
  pricePerMonth: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  securityDeposit: Joi.number().positive().optional(),
  cleaningFee: Joi.number().positive().optional(),
  serviceFee: Joi.number().positive().optional(),
  minimumStay: Joi.number().integer().min(1).max(365).optional(),
  maximumStay: Joi.number().integer().min(1).max(365).optional(),
  checkInTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  checkOutTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  instantBooking: Joi.boolean().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  houseRules: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  virtualTourUrl: Joi.string().uri().optional(),
  status: Joi.string()
    .valid("active", "booked", "inactive", "under_review")
    .optional(),
  listingStatus: Joi.string()
    .valid("pending", "active", "rejected", "expired")
    .optional(),
  rejectionReason: Joi.string().max(500).optional(),
  isAvailable: Joi.boolean().optional(),
  availableFrom: Joi.date().optional(),
  availableTo: Joi.date().optional(),
  isFeatured: Joi.boolean().optional(),
  featuredUntil: Joi.date().optional(),
  tag: Joi.string()
    .valid("rent", "buy", "swap", "shortlet")
    .optional(),
});

// Shortlet inquiry schema
const createShortletInquirySchema = Joi.object({
  message: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Message must be at least 10 characters long",
    "string.max": "Message cannot exceed 1000 characters",
    "any.required": "Message is required",
  }),
  inquirerName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  inquirerEmail: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  inquirerPhone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
    }),
  inquiryType: Joi.string()
    .valid("booking_inquiry", "availability_check", "general_question")
    .optional()
    .default("booking_inquiry"),
  checkInDate: Joi.date().optional(),
  checkOutDate: Joi.date().optional(),
  numberOfGuests: Joi.number().integer().min(1).max(50).optional(),
});

// Respond to inquiry schema
const respondToShortletInquirySchema = Joi.object({
  response: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Response must be at least 10 characters long",
    "string.max": "Response cannot exceed 1000 characters",
    "any.required": "Response is required",
  }),
  status: Joi.string()
    .valid("responded", "booking_confirmed", "closed")
    .optional()
    .default("responded"),
});

// Search and filter schema
const searchShortletPropertiesSchema = Joi.object({
  // Search query
  query: Joi.string().min(2).max(100).optional(),
  
  // Filters
  propertyType: Joi.string()
    .valid("apartment", "house", "duplex", "bungalow", "flat", "room", "studio", "hotel", "resort")
    .optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  area: Joi.string().max(100).optional(),
  
  // Price filters
  minPricePerNight: Joi.number().positive().optional(),
  maxPricePerNight: Joi.number().positive().optional(),
  
  // Property details filters
  minBedrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBedrooms: Joi.number().integer().min(0).max(20).optional(),
  minBathrooms: Joi.number().integer().min(0).max(20).optional(),
  maxBathrooms: Joi.number().integer().min(0).max(20).optional(),
  minGuests: Joi.number().integer().min(1).max(50).optional(),
  maxGuests: Joi.number().integer().min(1).max(50).optional(),
  
  // Booking filters
  checkInDate: Joi.date().optional(),
  checkOutDate: Joi.date().optional(),
  minimumStay: Joi.number().integer().min(1).optional(),
  maximumStay: Joi.number().integer().min(1).optional(),
  instantBooking: Joi.boolean().optional(),
  
  // Feature filters
  features: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  
  // Status filters
  isAvailable: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  status: Joi.string()
    .valid("active", "booked", "inactive", "under_review")
    .optional(),
  listingStatus: Joi.string()
    .valid("pending", "active", "rejected", "expired")
    .optional(),
  
  // Tag filter
  tag: Joi.string()
    .valid("rent", "buy", "swap", "shortlet")
    .optional(),
  
  // Date filters
  availableFrom: Joi.date().optional(),
  availableTo: Joi.date().optional(),
  
  // Sorting
  sortBy: Joi.string()
    .valid("pricePerNight", "createdAt", "updatedAt", "bedrooms", "bathrooms", "maxGuests", "title")
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
  
  // Pagination
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

// Property verification schema (Admin only)
const verifyShortletPropertySchema = Joi.object({
  isVerified: Joi.boolean().required().messages({
    "any.required": "Verification status is required",
  }),
});

// Listing approval/rejection schema (Admin only)
const updateListingStatusSchema = Joi.object({
  listingStatus: Joi.string()
    .valid("active", "rejected", "expired")
    .required()
    .messages({
      "any.only": "Listing status must be one of: active, rejected, expired",
      "any.required": "Listing status is required",
    }),
  rejectionReason: Joi.string().max(500).when("listingStatus", {
    is: "rejected",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    "any.required": "Rejection reason is required when rejecting a listing",
  }),
});

module.exports = {
  createShortletPropertySchema,
  updateShortletPropertySchema,
  createShortletInquirySchema,
  respondToShortletInquirySchema,
  searchShortletPropertiesSchema,
  verifyShortletPropertySchema,
  updateListingStatusSchema,
};