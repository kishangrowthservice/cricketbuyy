import { createHash } from 'crypto';

export interface AuditPayload {
  prevHash: string | null;
  actorId: string | null;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  createdAt: Date;
}

export function computeAuditHash(payload: AuditPayload): string {
  const data = JSON.stringify({
    prevHash: payload.prevHash || 'GENESIS_HASH_00000000000000000000000000000000',
    actorId: payload.actorId,
    actorEmail: payload.actorEmail,
    action: payload.action,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId || null,
    beforeState: payload.beforeState || null,
    afterState: payload.afterState || null,
    createdAt: payload.createdAt.toISOString()
  });

  return createHash('sha256').update(data).digest('hex');
}

