import { describe, it, expect } from 'vitest';
import { can, EvaluatorActor } from '../src/core/rbac/evaluator';
import { applyFieldMask, maskEmail, maskPhone, maskFinancialAccount } from '../src/core/rbac/field-masker';
import { DualCustodyEngine, ApprovalRecord } from '../src/core/rbac/approvals';
import { ErrorCode } from '../src/core/errors/codes';
import { AppError } from '../src/core/errors/app-error';

describe('RBAC Engine & Evaluator Tests', () => {
  const superAdminActor: EvaluatorActor = {
    id: 'super_admin_1',
    email: 'root@cricketbuyy.com',
    isSuperAdmin: true,
    roles: [
      {
        id: 'r_super',
        slug: 'super_admin',
        permissions: [{ action: '*', scope: 'all' }]
      }
    ]
  };

  const riskManagerActor: EvaluatorActor = {
    id: 'staff_risk_1',
    email: 'trader@cricketbuyy.com',
    isSuperAdmin: false,
    roles: [
      {
        id: 'r_risk',
        slug: 'risk_manager',
        permissions: [
          { action: 'market:*', scope: 'all' },
          { action: 'bet:read', scope: 'all' },
          { action: 'customer:read', scope: 'team', fieldMask: ['phone', 'email'] }
        ]
      }
    ]
  };

  const supportAgentActor: EvaluatorActor = {
    id: 'staff_agent_1',
    email: 'support@cricketbuyy.com',
    isSuperAdmin: false,
    roles: [
      {
        id: 'r_support',
        slug: 'support_agent',
        permissions: [
          { action: 'customer:read', scope: 'own', fieldMask: ['phone', 'email', 'bankAccount'] },
          { action: 'customer:update', scope: 'own' }
        ]
      }
    ]
  };

  it('Super Admin wildcard grants access to any action with unrestricted "all" scope', () => {
    const res = can(superAdminActor, 'setting:maintenance_toggle');
    expect(res.granted).toBe(true);
    expect(res.scope).toBe('all');
    expect(res.fieldMask).toEqual([]);
  });

  it('Evaluates wildcard prefixes like "market:*" for "market:suspend"', () => {
    const res = can(riskManagerActor, 'market:suspend');
    expect(res.granted).toBe(true);
    expect(res.scope).toBe('all');
  });

  it('Denies access when actor lacks permission', () => {
    const res = can(riskManagerActor, 'setting:update');
    expect(res.granted).toBe(false);
    expect(res.reason).toContain('lacks required permission');
  });

  it('Resolves fieldMask when permission contains masked fields', () => {
    const res = can(riskManagerActor, 'customer:read');
    expect(res.granted).toBe(true);
    expect(res.fieldMask).toContain('phone');
    expect(res.fieldMask).toContain('email');
  });

  it('Enforces ownership scope in "own" permission when accessing other records', () => {
    const deniedRes = can(supportAgentActor, 'customer:update', 'customer', {
      ownerId: 'staff_agent_OTHER'
    });
    expect(deniedRes.granted).toBe(false);
    expect(deniedRes.reason).toContain('scoped to own resources only');

    const allowedRes = can(supportAgentActor, 'customer:update', 'customer', {
      ownerId: 'staff_agent_1'
    });
    expect(allowedRes.granted).toBe(true);
  });
});

describe('Field-Level Masking Engine Tests', () => {
  it('masks emails cleanly', () => {
    expect(maskEmail('player@example.com')).toBe('p***r@example.com');
    expect(maskEmail('ab@domain.com')).toBe('a*@domain.com');
  });

  it('masks phone numbers keeping only last 4 digits visible', () => {
    expect(maskPhone('+91 98765 43210')).toBe('+** ***** *3210');
    expect(maskPhone('9876543210')).toBe('******3210');
  });

  it('masks bank accounts keeping only last 4 digits visible', () => {
    expect(maskFinancialAccount('123456789012')).toBe('********9012');
  });

  it('applies field masking to records when allowPii is false', () => {
    const rawCustomer = {
      id: 'cust_101',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@gmail.com',
      phone: '9876543210',
      bankAccount: '998877665544',
      aadhaarDoc: 'sensitive_aadhaar_file.pdf'
    };

    const masked = applyFieldMask(rawCustomer, ['aadhaarDoc'], false);

    expect(masked.email).not.toBe('rohan.sharma@gmail.com');
    expect(masked.email).toContain('***');
    expect(masked.phone).toBe('******3210');
    expect(masked.bankAccount).toBe('********5544');
    expect(masked.aadhaarDoc).toBe('[REDACTED]');
  });

  it('bypasses masking when allowPii is true', () => {
    const rawCustomer = {
      id: 'cust_101',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@gmail.com',
      phone: '9876543210',
      bankAccount: '998877665544'
    };

    const unmasked = applyFieldMask(rawCustomer, [], true);
    expect(unmasked.email).toBe('rohan.sharma@gmail.com');
    expect(unmasked.phone).toBe('9876543210');
    expect(unmasked.bankAccount).toBe('998877665544');
  });
});

describe('Dual-Custody Approval Workflow Tests', () => {
  const pendingRequest: ApprovalRecord = {
    id: 'appr_123',
    requesterId: 'admin_initiator_1',
    action: 'wallet:adjust',
    resourceType: 'customer_wallet',
    resourceId: 'wall_888',
    payload: { customerId: 'cust_1', adjustmentAmount: 100000, reason: 'Dispute settlement' },
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 hours
    createdAt: new Date()
  };

  it('Strictly prohibits self-approval (Maker-Checker violation)', () => {
    expect(() => {
      DualCustodyEngine.processReview(pendingRequest, 'admin_initiator_1', 'APPROVED');
    }).toThrowError();

    try {
      DualCustodyEngine.processReview(pendingRequest, 'admin_initiator_1', 'APPROVED');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.FORBIDDEN);
      expect((err as AppError).safeMessage).toContain('Maker-Checker policy violation');
    }
  });

  it('Rejects review on expired requests', () => {
    const expiredRequest: ApprovalRecord = {
      ...pendingRequest,
      expiresAt: new Date(Date.now() - 10000) // expired in the past
    };

    expect(() => {
      DualCustodyEngine.processReview(expiredRequest, 'admin_reviewer_2', 'APPROVED');
    }).toThrowError();

    try {
      DualCustodyEngine.processReview(expiredRequest, 'admin_reviewer_2', 'APPROVED');
    } catch (err) {
      expect((err as AppError).code).toBe(ErrorCode.CONFLICT_STATE);
      expect((err as AppError).safeMessage).toContain('has expired');
    }
  });

  it('Allows eligible second administrator to approve request', () => {
    const approved = DualCustodyEngine.processReview(pendingRequest, 'admin_reviewer_2', 'APPROVED');
    expect(approved.status).toBe('APPROVED');
    expect(approved.reviewerId).toBe('admin_reviewer_2');
    expect(approved.reviewedAt).toBeDefined();
  });

  it('Allows eligible second administrator to reject request with reason', () => {
    const rejected = DualCustodyEngine.processReview(
      pendingRequest,
      'admin_reviewer_2',
      'REJECTED',
      'Insufficient proof attached'
    );
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.reviewerId).toBe('admin_reviewer_2');
    expect(rejected.rejectionReason).toBe('Insufficient proof attached');
  });
});
