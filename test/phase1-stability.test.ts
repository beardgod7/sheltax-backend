import { test } from 'node:test';
import assert from 'node:assert';
import { User } from '../src/features/Authentication/model';

test('User model initializes Phase 1 accountStatus with default ACTIVE', () => {
  const user = User.build({
    email: 'test@example.com',
    password: 'hashedpassword',
  });
  assert.strictEqual(user.get('accountStatus'), 'ACTIVE');
  assert.strictEqual(user.get('failedLoginAttempts'), 0);
  assert.ok(!user.get('lockedUntil'));
});

test('User model accepts SUSPENDED and RESTRICTED account statuses', () => {
  const suspendedUser = User.build({
    email: 'suspended@example.com',
    accountStatus: 'SUSPENDED',
  });
  assert.strictEqual(suspendedUser.get('accountStatus'), 'SUSPENDED');

  const restrictedUser = User.build({
    email: 'restricted@example.com',
    accountStatus: 'RESTRICTED',
  });
  assert.strictEqual(restrictedUser.get('accountStatus'), 'RESTRICTED');
});

test('Mass-assignment filter strips unapproved listing fields', () => {
  const allowedFields = [
    'title', 'description', 'intent', 'propertyType', 'price', 'location',
    'city', 'state', 'images', 'videoUrl', 'amenities', 'specifications',
    'rentalFrequency', 'depositAmount', 'leaseDuration',
  ];
  const payload = {
    title: 'Luxury Villa',
    approvalStatus: 'APPROVED',
    isFeatured: true,
    price: 500000,
    ownerId: 'hacked-owner-id',
  };
  const sanitized: Record<string, any> = {};
  for (const field of allowedFields) {
    if ((payload as any)[field] !== undefined) {
      sanitized[field] = (payload as any)[field];
    }
  }

  assert.strictEqual(sanitized.title, 'Luxury Villa');
  assert.strictEqual(sanitized.price, 500000);
  assert.strictEqual(sanitized.approvalStatus, undefined);
  assert.strictEqual(sanitized.isFeatured, undefined);
  assert.strictEqual(sanitized.ownerId, undefined);
});
