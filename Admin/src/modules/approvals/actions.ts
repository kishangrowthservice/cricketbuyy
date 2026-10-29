'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { db } from '../../core/db/client';
import { approvalRequests } from '../../core/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';
import { DualCustodyEngine } from '../../core/rbac/approvals';

// 1. Submit Dual-Custody Approval Request
export const createApprovalRequestAction = createSecureAction({
  actionName: 'approval.create',
  permission: 'approval:create',
  schema: z.object({
    action: z.string().min(2),
    resourceType: z.string().min(2),
    resourceId: z.string().optional(),
    payload: z.record(z.unknown()),
    ttlHours: z.number().int().min(1).max(72).default(24)
  }),
  auditMetadata: (input, result) => ({
    resourceType: 'approval_request',
    resourceId: result.id,
    afterState: { action: input.action, resourceType: input.resourceType, payload: input.payload }
  }),
  handler: async (input, ctx) => {
    const expiresAt = new Date(Date.now() + input.ttlHours * 60 * 60 * 1000);

    const [request] = await db
      .insert(approvalRequests)
      .values({
        requesterId: ctx.actor.id,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId || null,
        payload: input.payload,
        status: 'PENDING',
        expiresAt
      })
      .returning();

    if (!request) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'Failed to create approval request record'
      });
    }

    return { id: request.id, status: request.status, expiresAt: request.expiresAt.toISOString() };
  }
});

// 2. Review (Approve or Reject) Approval Request
export const reviewApprovalRequestAction = createSecureAction({
  actionName: 'approval.review',
  permission: 'approval:review',
  schema: z.object({
    approvalId: z.string().uuid(),
    decision: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional()
  }),
  auditMetadata: (input) => ({
    resourceType: 'approval_request',
    resourceId: input.approvalId,
    afterState: { decision: input.decision, rejectionReason: input.rejectionReason }
  }),
  handler: async (input, ctx) => {
    const [request] = await db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, input.approvalId))
      .limit(1);

    if (!request) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        safeMessage: 'Approval request not found'
      });
    }

    // Enforce maker-checker policy via DualCustodyEngine
    DualCustodyEngine.validateReviewEligibility(
      {
        ...request,
        status: request.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED',
        payload: request.payload as Record<string, unknown>
      },
      ctx.actor.id
    );

    // Update status in DB
    const now = new Date();
    const [updated] = await db
      .update(approvalRequests)
      .set({
        status: input.decision,
        reviewerId: ctx.actor.id,
        rejectionReason: input.decision === 'REJECTED' ? input.rejectionReason || 'Rejected by reviewer' : null,
        reviewedAt: now
      })
      .where(eq(approvalRequests.id, input.approvalId))
      .returning();

    if (!updated) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'Failed to update approval request decision'
      });
    }

    return {
      id: updated.id,
      status: updated.status,
      reviewerId: ctx.actor.id,
      action: updated.action,
      payload: updated.payload
    };
  }
});
