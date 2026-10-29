import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ApprovalRecord {
  id: string;
  requesterId: string;
  requesterEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  reviewerId?: string | null;
  reviewerEmail?: string | null;
  rejectionReason?: string | null;
  expiresAt: Date;
  createdAt: Date;
  reviewedAt?: Date | null;
}

export class DualCustodyEngine {
  /**
   * Validates whether a reviewer is eligible to approve or reject a dual-custody request.
   */
  public static validateReviewEligibility(
    request: ApprovalRecord,
    reviewerId: string
  ): void {
    // 1. Check if request is still pending
    if (request.status !== 'PENDING') {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: `Approval request is already in status: ${request.status}`,
        details: { currentStatus: request.status }
      });
    }

    // 2. Check if request has expired
    if (new Date() > new Date(request.expiresAt)) {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: 'Approval request has expired and cannot be reviewed',
        details: { expiresAt: request.expiresAt }
      });
    }

    // 3. Maker-Checker Invariant: Strict prohibition of self-approval
    if (request.requesterId === reviewerId) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'Maker-Checker policy violation: Requester cannot approve or review their own request',
        details: { requesterId: request.requesterId, reviewerId }
      });
    }
  }

  /**
   * Applies the review decision (APPROVE or REJECT) to the record
   */
  public static processReview(
    request: ApprovalRecord,
    reviewerId: string,
    decision: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): ApprovalRecord {
    this.validateReviewEligibility(request, reviewerId);

    const now = new Date();
    return {
      ...request,
      status: decision,
      reviewerId,
      rejectionReason: decision === 'REJECTED' ? rejectionReason || 'Rejected by reviewer' : null,
      reviewedAt: now
    };
  }
}

