'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';
import { OutboxDispatcher } from '../../core/events/outbox';

export type BetType = 'BACK' | 'LAY';
export type BetStatus = 'MATCHED' | 'UNMATCHED' | 'CANCELLED' | 'VOIDED' | 'SETTLED_WON' | 'SETTLED_LOST';

export interface BetSlipRecord {
  id: string;
  marketId: string;
  marketName: string;
  runnerName: string;
  customerId: string;
  customerName: string;
  type: BetType;
  odds: number;
  stake: number;
  potentialProfit: number;
  liability: number;
  status: BetStatus;
  placedAt: string;
  voidReason?: string;
}

export const BETS_STORE = new Map<string, BetSlipRecord>([
  [
    'BET-9901',
    {
      id: 'BET-9901',
      marketId: 'MKT-IND-PAK-01',
      marketName: 'India vs Pakistan (2nd T20I)',
      runnerName: 'India',
      customerId: 'CUST-8091',
      customerName: 'Rohan Sharma',
      type: 'BACK',
      odds: 1.74,
      stake: 50000,
      potentialProfit: 37000,
      liability: 50000,
      status: 'MATCHED',
      placedAt: '2026-10-29 16:30:12'
    }
  ],
  [
    'BET-9902',
    {
      id: 'BET-9902',
      marketId: 'MKT-IND-PAK-01',
      marketName: 'India vs Pakistan (2nd T20I)',
      runnerName: 'Pakistan',
      customerId: 'CUST-8092',
      customerName: 'Rahul Verma',
      type: 'LAY',
      odds: 2.26,
      stake: 100000,
      potentialProfit: 100000,
      liability: 126000,
      status: 'MATCHED',
      placedAt: '2026-10-29 16:35:40'
    }
  ],
  [
    'BET-9903',
    {
      id: 'BET-9903',
      marketId: 'MKT-AUS-ENG-02',
      marketName: 'Australia vs England (1st Ashes Test)',
      runnerName: 'England',
      customerId: 'CUST-8093',
      customerName: 'Anand Singh',
      type: 'BACK',
      odds: 2.14,
      stake: 15000,
      potentialProfit: 17100,
      liability: 15000,
      status: 'UNMATCHED',
      placedAt: '2026-10-29 16:40:02'
    }
  ]
]);

// 1. Cancel Unmatched Bet Action
export const cancelBetAction = createSecureAction({
  actionName: 'bet.cancel',
  permission: 'bet:cancel',
  schema: z.object({
    betId: z.string(),
    reason: z.string().min(3)
  }),
  auditMetadata: (input) => ({
    resourceType: 'bet',
    resourceId: input.betId,
    afterState: { status: 'CANCELLED', reason: input.reason }
  }),
  handler: async (input) => {
    const bet = BETS_STORE.get(input.betId);
    if (!bet) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Bet not found' });
    }

    if (bet.status !== 'UNMATCHED') {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: `Cannot cancel bet with status: ${bet.status}. Only UNMATCHED bets can be cancelled.`
      });
    }

    bet.status = 'CANCELLED';
    BETS_STORE.set(input.betId, bet);

    await OutboxDispatcher.recordEvent('BET_CANCELLED', {
      betId: input.betId,
      customerId: bet.customerId,
      refundStake: bet.stake,
      reason: input.reason
    });

    return { success: true, betId: input.betId, status: 'CANCELLED', refundAmount: bet.stake };
  }
});

// 2. Void Disputed Bet Action
export const voidBetAction = createSecureAction({
  actionName: 'bet.void',
  permission: 'bet:void',
  schema: z.object({
    betId: z.string(),
    reason: z.string().min(8)
  }),
  auditMetadata: (input) => ({
    resourceType: 'bet',
    resourceId: input.betId,
    afterState: { status: 'VOIDED', reason: input.reason }
  }),
  handler: async (input) => {
    const bet = BETS_STORE.get(input.betId);
    if (!bet) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Bet not found' });
    }

    if (bet.status === 'SETTLED_WON' || bet.status === 'SETTLED_LOST') {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: 'Cannot void already settled bet slip'
      });
    }

    bet.status = 'VOIDED';
    bet.voidReason = input.reason;
    BETS_STORE.set(input.betId, bet);

    await OutboxDispatcher.recordEvent('BET_VOIDED', {
      betId: input.betId,
      customerId: bet.customerId,
      stakeRefunded: bet.stake,
      reason: input.reason
    });

    return { success: true, betId: input.betId, status: 'VOIDED', stakeRefunded: bet.stake };
  }
});

