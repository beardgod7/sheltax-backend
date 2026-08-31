import { test } from 'node:test';
import assert from 'node:assert';
import { generateSecureOtp } from '../src/utils/otp';
import { getJwtSecret } from '../src/utils/generatetoken';

test('generateSecureOtp generates cryptographically secure 6-digit numeric string', () => {
  for (let i = 0; i < 100; i++) {
    const otp = generateSecureOtp();
    assert.strictEqual(typeof otp, 'string');
    assert.strictEqual(otp.length, 6);
    assert.ok(/^\d{6}$/.test(otp), `OTP ${otp} should consist of exactly 6 digits`);
    const num = parseInt(otp, 10);
    assert.ok(num >= 100000 && num <= 999999, `OTP ${num} out of range`);
  }
});

test('getJwtSecret throws error if JWT_SECRET is missing or under 32 characters', () => {
  const originalSecret = process.env.JWT_SECRET;
  try {
    process.env.JWT_SECRET = 'short';
    assert.throws(() => getJwtSecret(), /JWT_SECRET must be set in environment variables and be at least 32 characters long/);

    delete process.env.JWT_SECRET;
    assert.throws(() => getJwtSecret(), /JWT_SECRET must be set in environment variables/);

    process.env.JWT_SECRET = 'a_very_long_valid_jwt_secret_key_for_testing_purposes';
    assert.strictEqual(getJwtSecret(), 'a_very_long_valid_jwt_secret_key_for_testing_purposes');
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
});
