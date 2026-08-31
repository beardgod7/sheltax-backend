import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}
