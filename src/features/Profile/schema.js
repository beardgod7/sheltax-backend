const Joi = require("joi");

// Seeker profile - Step 2 for seekers (stateOfResidence, gender, dateOfBirth)
const createProfileSchema = Joi.object({
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
});

const updateProfileSchema = Joi.object({
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
});

// Owner profile - Step 2 for owners
const createOwnerProfileSchema = Joi.object({
  location: Joi.string().required(),
  propertyTypes: Joi.array().items(Joi.string()).min(1).required(),
  listingIntent: Joi.string().required(),
  ownerType: Joi.string().required(),
});

const updateOwnerProfileSchema = Joi.object({
  location: Joi.string().optional(),
  propertyTypes: Joi.array().items(Joi.string()).min(1).optional(),
  listingIntent: Joi.string().optional(),
  ownerType: Joi.string().optional(),
});

// Broker profile - Step 2 for brokers
const createBrokerProfileSchema = Joi.object({
  agencyCompanyName: Joi.string().max(100).optional().allow("", null),
  companyYearsOfExistence: Joi.string().optional().allow("", null),
  operatingLocations: Joi.array().items(Joi.string()).optional(),
  companySize: Joi.string().optional().allow("", null),
  portfolioSummary: Joi.string().max(2000).optional().allow("", null),
});

const updateBrokerProfileSchema = Joi.object({
  agencyCompanyName: Joi.string().max(100).optional().allow("", null),
  companyYearsOfExistence: Joi.string().optional().allow("", null),
  operatingLocations: Joi.array().items(Joi.string()).optional(),
  companySize: Joi.string().optional().allow("", null),
  portfolioSummary: Joi.string().max(2000).optional().allow("", null),
});

const createSeekerPreferenceSchema = Joi.object({
  preferredPropertyType: Joi.string()
    .valid("apartment", "house", "condo", "townhouse", "studio", "any")
    .optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string()
    .valid("employed", "self_employed", "unemployed", "student", "retired")
    .optional(),
  preferredCity: Joi.string().max(50).optional(),
  preferredState: Joi.string().max(50).optional(),
  preferredZipCode: Joi.string().max(10).optional(),
});

const updateSeekerPreferenceSchema = Joi.object({
  preferredPropertyType: Joi.string()
    .valid("apartment", "house", "condo", "townhouse", "studio", "any")
    .optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string()
    .valid("employed", "self_employed", "unemployed", "student", "retired")
    .optional(),
  preferredCity: Joi.string().max(50).optional(),
  preferredState: Joi.string().max(50).optional(),
  preferredZipCode: Joi.string().max(10).optional(),
});

const updateUserActivitySchema = Joi.object({
  creditScore: Joi.number().integer().min(300).max(850).optional(),
  backgroundCheckStatus: Joi.string()
    .valid("pending", "approved", "rejected", "not_requested")
    .optional(),
  totalInquiries: Joi.number().integer().min(0).optional(),
  totalApplications: Joi.number().integer().min(0).optional(),
  totalViewedProperties: Joi.number().integer().min(0).optional(),
  totalSavedProperties: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

const profilePictureSchema = Joi.object({
  profilePicture: Joi.string().uri().required(),
});

const verificationDocumentsSchema = Joi.object({
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid("license", "id_card", "certificate", "nin", "other")
          .required(),
        url: Joi.string().uri().required(),
        description: Joi.string().max(200).optional(),
      })
    )
    .min(1)
    .required(),
});

module.exports = {
  createProfileSchema,
  updateProfileSchema,
  createBrokerProfileSchema,
  updateBrokerProfileSchema,
  createOwnerProfileSchema,
  updateOwnerProfileSchema,
  createSeekerPreferenceSchema,
  updateSeekerPreferenceSchema,
  updateUserActivitySchema,
  profilePictureSchema,
  verificationDocumentsSchema,
};
