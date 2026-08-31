import { AuditLog } from './model';

export interface AuditLogOptions {
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  changes?: Record<string, any> | string | null;
}

export async function logAuditAction(options: AuditLogOptions): Promise<any> {
  try {
    const changesString = typeof options.changes === 'object'
      ? JSON.stringify(options.changes)
      : options.changes || null;

    const log = await AuditLog.create({
      actorId: options.actorId || null,
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId || null,
      ipAddress: options.ipAddress || null,
      changes: changesString,
    });
    return log;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
