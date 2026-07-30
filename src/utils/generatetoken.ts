import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const oneHourFromNow = (): Date => new Date(Date.now() + 60 * 60 * 1000);

export function generateAccessToken(userId: string, role: string): string {
  const secret: Secret = process.env.JWT_SECRET || 'secret';
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '12h',
  };
  return jwt.sign({ sub: userId, role: role }, secret, options);
}

export function generateVerificationToken(userId: string) {
  return {
    userId: userId,
    token: crypto.randomBytes(16).toString('hex'),
    token_type: 'verify_account',
    expiresIn: oneHourFromNow().toISOString(),
  };
}

export function generateRefreshToken(userId: string): string {
  const secret: Secret = process.env.JWT_SECRET || 'secret';
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: '24h',
  };
  return jwt.sign({ sub: userId }, secret, options);
}

export function generatePasswordResetToken(userId: string) {
  return {
    userId: userId,
    token: crypto.randomBytes(16).toString('hex'),
    token_type: 'reset_password',
    expiresIn: oneHourFromNow(),
  };
}

export function generateSessionToken(userId: string) {
  return {
    userId: userId,
    token_type: 'session_token',
    token: crypto.randomBytes(16).toString('hex'),
    expiresIn: oneHourFromNow(),
  };
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
