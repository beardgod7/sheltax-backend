const jwt = require("jsonwebtoken");
// const config = require("./config");
// const { oneHourExpiry, twoMonthsExpiry } = require("./date-time");
const crypto = require("crypto");
const oneHourFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

function generateAccessToken(userId, role) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined again");
  }
  return jwt.sign({ sub: userId, role: role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "12h",
  });
}

function generateVerificationToken(userId) {
  return {
    userId: userId,
    token: crypto.randomBytes(16).toString("hex"),
    token_type: "verify_account",
    expiresIn: oneHourFromNow().toISOString(),
  };
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
  });
}

function generatePasswordResetToken(userId) {
  return {
    userId: userId,
    token: crypto.randomBytes(16).toString("hex"),
    token_type: "reset_password",
    expiresIn: oneHourFromNow(),
  };
}

function generateSessionToken(userId) {
  return {
    userId: userId,
    token_type: "session_token",
    token: crypto.randomBytes(16).toString("hex"),
    expiresIn: oneHourFromNow(),
  };
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generateSessionToken,
  generateVerificationCode,
};
