const Joi = require("joi");

// Signup schema
const signupSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().optional(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("seeker", "owner", "agent", "admin").default("seeker"),
});

// Signin schema
const signinSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

// Refresh token schema
const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email address is required.",
    "any.required": "Email is required.",
  }),
});

// Google OAuth schema
const googleOAuthSchema = Joi.object({
  idToken: Joi.string().required().messages({
    "any.required": "Google ID token is required.",
  }),
});

// Twitter OAuth schema
const twitterOAuthSchema = Joi.object({
  oauth_token: Joi.string().required().messages({
    "any.required": "Twitter OAuth token is required.",
  }),
  oauth_verifier: Joi.string().required().messages({
    "any.required": "Twitter OAuth verifier is required.",
  }),
});

// Facebook OAuth schema
const facebookOAuthSchema = Joi.object({
  accessToken: Joi.string().required().messages({
    "any.required": "Facebook access token is required.",
  }),
});

module.exports = {
  signupSchema,
  signinSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  googleOAuthSchema,
  twitterOAuthSchema,
  facebookOAuthSchema,
};
