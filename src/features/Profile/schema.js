const Joi = require("joi");

// Profile schema - Personal information from Figma design (for seekers)
const createProfileSchema = Joi.object({
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
});

// BrokerProfile schema - Based on Figma design
const createBrokerProfileSchema = Joi.object({
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
  // Agency Information from Figma design
  agencyCompanyName: Joi.string().max(100).optional().messages({
    "string.max": "Agency/Company name cannot exceed 100 characters",
  }),
  agentLicenseNumber: Joi.string().max(50).optional().messages({
    "string.max": "Agent license number cannot exceed 50 characters",
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

// Update profile schema (for seekers)
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ninVerification: Joi.string().optional(),
});

// OwnerProfile schema - Based on Figma design
const createOwnerProfileSchema = Joi.object({
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
  // Owner-specific fields
  ownerType: Joi.string()
    .valid("individual", "company", "investment_group")
    .required()
    .messages({
      "any.required": "Owner type is required",
    }),
  companyName: Joi.string().max(100).optional(),
  businessRegistrationNumber: Joi.string().max(50).optional(),
  // Optional fields
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});
// Update broker profile schema
const updateBrokerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ninVerification: Joi.string().optional(),
  agencyCompanyName: Joi.string().max(100).optional(),
  agentLicenseNumber: Joi.string().max(50).optional(),
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

// Update owner profile schema
const updateOwnerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  emailAddress: Joi.string().email().optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ninVerification: Joi.string().optional(),
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

// SeekerPreference schema - Property preferences and employment info
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

// Update seeker preference schema
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

// UserActivity schema - Activity tracking and verification
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

// Complete profile creation schema (combines all three models)
const createCompleteProfileSchema = Joi.object({
  // Profile fields
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  emailAddress: Joi.string().email().required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  ninVerification: Joi.string().optional(),
  
  // SeekerPreference fields (optional)
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
  createCompleteProfileSchema,
};