import { test } from 'node:test';
import assert from 'node:assert';
import { Session } from '../src/features/Session/model';
import { AdminPermission } from '../src/features/Admin/permissionModel';
import { AuditLog } from '../src/features/Audit/model';
import { logAuditAction } from '../src/features/Audit/service';

test('Session model initializes active non-revoked session', () => {
  const session = Session.build({
    userId: '00000000-0000-0000-0000-000000000001',
    refreshTokenHash: 'mock-hash-12345',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    ipAddress: '127.0.0.1',
  });
  assert.strictEqual(session.get('refreshTokenHash'), 'mock-hash-12345');
  assert.strictEqual(session.get('deviceInfo'), 'Mozilla/5.0 (Macintosh; Intel Mac OS X)');
  assert.ok(!session.get('revokedAt'));
});

test('AdminPermission model initializes fine-grained permission', () => {
  const perm = AdminPermission.build({
    adminId: '00000000-0000-0000-0000-000000000002',
    permission: 'kyc_review',
  });
  assert.strictEqual(perm.get('permission'), 'kyc_review');
});

test('AuditLog model initializes audit trail entry', () => {
  const log = AuditLog.build({
    actorId: '00000000-0000-0000-0000-000000000002',
    action: 'KYC_APPROVED',
    resourceType: 'USER',
    resourceId: '00000000-0000-0000-0000-000000000001',
    ipAddress: '192.168.1.1',
  });
  assert.strictEqual(log.get('action'), 'KYC_APPROVED');
  assert.strictEqual(log.get('resourceType'), 'USER');
  assert.strictEqual(log.get('ipAddress'), '192.168.1.1');
});
