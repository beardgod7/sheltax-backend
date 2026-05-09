const Joi = require("joi");

const createProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  ninVerification: Joi.string().optional(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
  stateOfResidence: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  ninVerification: Joi.string().optional(),
});

const createBrokerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
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

const updateBrokerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
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

const createOwnerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  ninVerification: Joi.string().optional(),
  ownerType: Joi.string().valid("individual", "company", "investment_group").required(),
  companyName: Joi.string().max(100).optional(),
  businessRegistrationNumber: Joi.string().max(50).optional(),
  bio: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(10).optional(),
});

const updateOwnerProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  surname: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).optional(),
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

const createSeekerPreferenceSchema = Joi.object({
  preferredPropertyType: Joi.string().valid("apartment", "house", "condo", "townhouse", "studio", "any").optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string().valid("employed", "self_employed", "unemployed", "student", "retired").optional(),
  preferredCity: Joi.string().max(50).optional(),
  preferredState: Joi.string().max(50).optional(),
  preferredZipCode: Joi.string().max(10).optional(),
});

const updateSeekerPreferenceSchema = Joi.object({
  preferredPropertyType: Joi.string().valid("apartment", "house", "condo", "townhouse", "studio", "any").optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string().valid("employed", "self_employed", "unemployed", "student", "retired").optional(),
  preferredCity: Joi.string().max(50).optional(),
  preferredState: Joi.string().max(50).optional(),
  preferredZipCode: Joi.string().max(10).optional(),
});

const updateUserActivitySchema = Joi.object({
  creditScore: Joi.number().integer().min(300).max(850).optional(),
  backgroundCheckStatus: Joi.string().valid("pending", "approved", "rejected", "not_requested").optional(),
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
  documents: Joi.array().items(
    Joi.object({
      type: Joi.string().valid("license", "id_card", "certificate", "nin", "other").required(),
      url: Joi.string().uri().required(),
      description: Joi.string().max(200).optional(),
    })
  ).min(1).required(),
});

const createCompleteProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  stateOfResidence: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  dateOfBirth: Joi.date().max("now").required(),
  ninVerification: Joi.string().optional(),
  preferredPropertyType: Joi.string().valid("apartment", "house", "condo", "townhouse", "studio", "any").optional(),
  preferredLocation: Joi.string().max(100).optional(),
  budgetMin: Joi.number().positive().optional(),
  budgetMax: Joi.number().positive().optional(),
  preferredBedrooms: Joi.number().integer().min(0).max(10).optional(),
  preferredBathrooms: Joi.number().integer().min(0).max(10).optional(),
  occupation: Joi.string().max(100).optional(),
  monthlyIncome: Joi.number().positive().optional(),
  employmentStatus: Joi.string().valid("employed", "self_employed", "unemployed", "student", "retired").optional(),
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
