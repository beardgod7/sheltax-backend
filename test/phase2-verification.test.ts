import { test } from 'node:test';
import assert from 'node:assert';
import { UserVerification, VerificationDocument, PropertyOwnershipRecord } from '../src/features/Verification/model';

test('UserVerification model initializes with valid ENUM statuses', () => {
  const v = UserVerification.build({
    userId: '00000000-0000-0000-0000-000000000001',
    verificationType: 'NIN',
    status: 'PENDING',
  });
  assert.strictEqual(v.get('verificationType'), 'NIN');
  assert.strictEqual(v.get('status'), 'PENDING');
});

test('VerificationDocument model sets default isPrivate to true', () => {
  const doc = VerificationDocument.build({
    userId: '00000000-0000-0000-0000-000000000001',
    documentType: 'GOVERNMENT_ID',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
  });
  assert.strictEqual(doc.get('documentType'), 'GOVERNMENT_ID');
  assert.strictEqual(doc.get('isPrivate'), true);
});

test('PropertyOwnershipRecord model stores property ownership type', () => {
  const record = PropertyOwnershipRecord.build({
    propertyId: '00000000-0000-0000-0000-000000000002',
    ownerId: '00000000-0000-0000-0000-000000000001',
    ownershipType: 'TITLE_DEED',
    documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1/deed.pdf',
  });
  assert.strictEqual(record.get('ownershipType'), 'TITLE_DEED');
  assert.strictEqual(record.get('verificationStatus'), 'PENDING');
});
