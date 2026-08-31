import { test } from 'node:test';
import assert from 'node:assert';
import { generateSecureOtp } from '../src/utils/otp';

test('generateSecureOtp generates a 6-digit numeric string', () => {
  for (let i = 0; i < 50; i++) {
    const otp = generateSecureOtp();
    assert.strictEqual(typeof otp, 'string');
    assert.strictEqual(otp.length, 6);
    assert.ok(/^\d{6}$/.test(otp), `OTP ${otp} should consist of 6 digits`);
    const num = parseInt(otp, 10);
    assert.ok(num >= 100000 && num <= 999999, `OTP ${num} out of bounds`);
  }
});
