import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeProfile } from '../src/features/Profile/controller';

test('sanitizeProfile strips sensitive KYC documents and financial metrics for public callers', () => {
  const fullProfile = {
    id: 'profile-123',
    userId: 'user-456',
    fullName: 'John Doe',
    governmentId: 'https://cloudinary.com/secret-gov-id.png',
    ninCacDocument: 'https://cloudinary.com/secret-nin.pdf',
    verificationDocuments: { governmentId: 'https://cloudinary.com/secret-gov-id.png' },
    creditScore: 750,
    monthlyIncome: 500000,
    annualIncome: 6000000,
  };

  // 1. Caller is another user (public query)
  const publicView = sanitizeProfile(fullProfile, 'other-user-789', 'seeker');
  assert.strictEqual(publicView.governmentId, undefined);
  assert.strictEqual(publicView.ninCacDocument, undefined);
  assert.strictEqual(publicView.verificationDocuments, undefined);
  assert.strictEqual(publicView.creditScore, undefined);
  assert.strictEqual(publicView.fullName, 'John Doe');

  // 2. Caller is the profile owner
  const ownerView = sanitizeProfile(fullProfile, 'user-456', 'seeker');
  assert.strictEqual(ownerView.governmentId, 'https://cloudinary.com/secret-gov-id.png');
  assert.strictEqual(ownerView.creditScore, 750);

  // 3. Caller is an Admin
  const adminView = sanitizeProfile(fullProfile, 'admin-999', 'admin');
  assert.strictEqual(adminView.governmentId, 'https://cloudinary.com/secret-gov-id.png');
  assert.strictEqual(adminView.creditScore, 750);
});
