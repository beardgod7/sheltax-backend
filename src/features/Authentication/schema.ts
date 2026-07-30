import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('seeker', 'owner', 'broker').default('seeker').optional(),
  firstName: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
  ninVerification: Joi.string().optional().allow('', null),
  brokerProfileType: Joi.string().optional().allow('', null),
  yearsOfExperience: Joi.number().integer().min(0).optional().allow(null),
  bio: Joi.string().max(2000).optional().allow('', null),
  specialization: Joi.string().max(200).optional().allow('', null),
});

export const setPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  setupToken: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const completeOwnerProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  location: Joi.string().required(),
  propertyTypes: Joi.string().required(),
  listingIntent: Joi.string().required(),
  ownerType: Joi.string().required(),
});

export const completeBrokerProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  agencyCompanyName: Joi.string().max(200).optional().allow('', null),
  companyYearsOfExistence: Joi.string().optional().allow('', null),
  operatingLocations: Joi.string().required(),
  companySize: Joi.string().optional().allow('', null),
  portfolioSummary: Joi.string().max(2000).optional().allow('', null),
});

export const signinSchema = Joi.object({
  identifier: Joi.string().optional(),
  email: Joi.string().optional(),
  password: Joi.string().min(8).required(),
}).or('identifier', 'email');

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email address is required.',
    'any.required': 'Email is required.',
  }),
});

export const googleOAuthSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required.',
  }),
});

export const twitterOAuthSchema = Joi.object({
  oauth_token: Joi.string().required().messages({
    'any.required': 'Twitter OAuth token is required.',
  }),
  oauth_verifier: Joi.string().required().messages({
    'any.required': 'Twitter OAuth verifier is required.',
  }),
});

export const facebookOAuthSchema = Joi.object({
  accessToken: Joi.string().required().messages({
    'any.required': 'Facebook access token is required.',
  }),
});
