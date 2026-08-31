import { test } from 'node:test';
import assert from 'node:assert';
import { BrokerProfile } from '../src/features/Profile/model';
import { PropertyAgentAuthorization, Commission, AgentRating } from '../src/features/Agent/model';

test('BrokerProfile initializes licence fields correctly', () => {
  const profile = BrokerProfile.build({
    userId: '00000000-0000-0000-0000-000000000001',
    emailAddress: 'agent@shelta-x.com',
    licenceNumber: 'LASRERA/2026/08912',
    licenceIssuer: 'LASRERA',
    licenceExpiryDate: '2027-12-31',
    licenceStatus: 'PENDING',
  });

  assert.strictEqual(profile.get('licenceNumber'), 'LASRERA/2026/08912');
  assert.strictEqual(profile.get('licenceIssuer'), 'LASRERA');
  assert.strictEqual(profile.get('licenceStatus'), 'PENDING');
});

test('PropertyAgentAuthorization initializes active owner-agent authorization', () => {
  const auth = PropertyAgentAuthorization.build({
    ownerId: '00000000-0000-0000-0000-000000000002',
    agentId: '00000000-0000-0000-0000-000000000001',
    status: 'ACTIVE',
    authorizedIntents: ['RENT', 'BUY', 'SHORTLET'],
    commissionRate: 7.50,
  });

  assert.strictEqual(auth.get('status'), 'ACTIVE');
  assert.strictEqual(auth.get('commissionRate'), 7.50);
  assert.deepStrictEqual(auth.get('authorizedIntents'), ['RENT', 'BUY', 'SHORTLET']);
});

test('Commission model initializes accrued commission entry', () => {
  const comm = Commission.build({
    agentId: '00000000-0000-0000-0000-000000000001',
    ownerId: '00000000-0000-0000-0000-000000000002',
    amount: 150000.00,
    commissionRate: 5.00,
    status: 'ACCRUED',
  });

  assert.strictEqual(comm.get('status'), 'ACCRUED');
  assert.strictEqual(comm.get('amount'), 150000.00);
  assert.strictEqual(comm.get('commissionRate'), 5.00);
});

test('AgentRating model validates rating scale (1-5)', () => {
  const rating = AgentRating.build({
    agentId: '00000000-0000-0000-0000-000000000001',
    seekerId: '00000000-0000-0000-0000-000000000003',
    rating: 5,
    review: 'Excellent and professional property tour!',
  });

  assert.strictEqual(rating.get('rating'), 5);
  assert.strictEqual(rating.get('review'), 'Excellent and professional property tour!');
});
