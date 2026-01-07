const Joi = require("joi");

// Create profile schema for seekers (based on Figma design)
const createSeekerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    "string.min": "Surname must be at least 2 characters long",
    "string.max": "Surname cannot exceed 50 characters",
    "any.required": "Surname is required",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
      "any.required": "Phone number is required",
    }),
  emailAddress: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email address is required",
  }),
  stateOfResidence: Joi.string().required().messages({
    "any.required": "State of residence is required",
  }),
  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "Gender must be male, female, or other",
    "any.required": "Gender is required",
  }),
  dateOfBirth: Joi.date().max("now").required().messages({
    "date.max": "Date of birth cannot be in the future",
    "any.required": "Date of birth is required",
  }),
  ninVerification: Joi.string().optional(), // Optional as shown in Figma
  // Optional preference fields
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string().valid("employed", "self_employed", "unemployed", "student", "retired").optional(),
  preferredPropertyType: Joi.string().valid("apartment", "house", "condo", "townhouse", "studio", "any").optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

// Create profile schema for agents (based on Figma design)
const createAgentProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  emailAddress: Joi.string().email().required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  // Agency Information (optional as shown in Figma)
  agencyCompanyName: Joi.string().max(100).optional().messages({
    "string.max": "Agency/Company name cannot exceed 100 characters",
  }),
  agentLicense: Joi.string().max(50).optional().messages({
    "string.max": "Agent license cannot exceed 50 characters",
  }),
  // Optional professional fields
  yearsOfExperience: Joi.number().integer().min(0).max(50).optional(),
  specialization: Joi.string().max(500).optional(),
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  linkedinProfile: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

// Create profile schema for owners (similar to agent but without agency fields)
const createOwnerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  emailAddress: Joi.string().email().required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  // Owner-specific fields
  ownerType: Joi.string().valid("individual", "company", "investment_group").required().messages({
    "any.required": "Owner type is required",
  }),
  // Optional fields
  companyName: Joi.string().max(100).optional(),
  businessRegistrationNumber: Joi.string().max(50).optional(),
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

// Generic create profile schema (determines which schema to use based on role)
const createProfileSchema = Joi.object({
  role: Joi.string().valid("seeker", "agent", "owner").required(),
}).unknown(true); // Allow other fields to be validated by role-specific schemas

// Update profile schemas (all fields optional for updates)
const updateSeekerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ninVerification: Joi.string().optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string().valid("employed", "self_employed", "unemployed", "student", "retired").optional(),
  preferredPropertyType: Joi.string().valid("apartment", "house", "condo", "townhouse", "studio", "any").optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

const updateAgentProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  agencyCompanyName: Joi.string().max(100).optional(),
  agentLicense: Joi.string().max(50).optional(),
  yearsOfExperience: Joi.number().integer().min(0).max(50).optional(),
  specialization: Joi.string().max(500).optional(),
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  linkedinProfile: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

const updateOwnerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ownerType: Joi.string().valid("individual", "company", "investment_group").optional(),
  companyName: Joi.string().max(100).optional(),
  businessRegistrationNumber: Joi.string().max(50).optional(),
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

// Generic update profile schema
const updateProfileSchema = Joi.object({}).unknown(true); // Allow any fields for updates

// Profile picture upload schema
const profilePictureSchema = Joi.object({
  profilePicture: Joi.string().uri().required().messages({
    "string.uri": "Profile picture must be a valid URL",
    "any.required": "Profile picture URL is required",
  }),
});

// Verification documents schema
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
    .required()
    .messages({
      "array.min": "At least one verification document is required",
      "any.required": "Verification documents are required",
    }),
});

/**
 * Get the appropriate schema based on user role
 * @param {string} role - User role
 * @param {string} operation - 'create' or 'update'
 * @returns {Joi.Schema} - Joi validation schema
 */
function getProfileSchema(role, operation = 'create') {
  if (operation === 'create') {
    switch (role) {
      case 'seeker':
        return createSeekerProfileSchema;
      case 'agent':
        return createAgentProfileSchema;
      case 'owner':
        return createOwnerProfileSchema;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  } else if (operation === 'update') {
    switch (role) {
      case 'seeker':
        return updateSeekerProfileSchema;
      case 'agent':
        return updateAgentProfileSchema;
      case 'owner':
        return updateOwnerProfileSchema;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }
  
  throw new Error(`Invalid operation: ${operation}`);
}

module.exports = {
  createProfileSchema,
  updateProfileSchema,
  createSeekerProfileSchema,
  createAgentProfileSchema,
  createOwnerProfileSchema,
  updateSeekerProfileSchema,
  updateAgentProfileSchema,
  updateOwnerProfileSchema,
  profilePictureSchema,
  verificationDocumentsSchema,
  getProfileSchema,
};