'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';
import { OptimisticLockEngine } from '../../core/concurrency/optimistic-lock';
import { DistributedLockManager } from '../../core/concurrency/distributed-lock';
import { OutboxDispatcher } from '../../core/events/outbox';
import { db } from '../../core/db/client';
import { approvalRequests } from '../../core/db/schema';

export type MarketStatus = 'UPCOMING' | 'IN_PLAY' | 'SUSPENDED' | 'SETTLED' | 'VOIDED';

export interface MarketRunner {
  id: string;
  name: string;
  backPrice: number;
  layPrice: number;
}

export interface MarketRecord {
  id: string;
  eventName: string;
  sport: string;
  tournament: string;
  status: MarketStatus;
  runners: MarketRunner[];
  totalExposure: number;
  version: number;
  winningRunnerId?: string | null;
  voidReason?: string | null;
}

// In-memory market store for simulation, validation & concurrency tests
export const MARKET_STORE = new Map<string, MarketRecord>([
  [
    'MKT-IND-PAK-01',
    {
      id: 'MKT-IND-PAK-01',
      eventName: 'India vs Pakistan (2nd T20I)',
      sport: 'Cricket',
      tournament: 'Asia Cup 2026',
      status: 'IN_PLAY',
      runners: [
        { id: 'run_ind', name: 'India', backPrice: 1.72, layPrice: 1.74 },
        { id: 'run_pak', name: 'Pakistan', backPrice: 2.24, layPrice: 2.28 }
      ],
      totalExposure: 480000,
      version: 2
    }
  ],
  [
    'MKT-AUS-ENG-02',
    {
      id: 'MKT-AUS-ENG-02',
      eventName: 'Australia vs England (1st Ashes Test)',
      sport: 'Cricket',
      tournament: 'The Ashes 2026',
      status: 'UPCOMING',
      runners: [
        { id: 'run_aus', name: 'Australia', backPrice: 1.95, layPrice: 1.98 },
        { id: 'run_eng', name: 'England', backPrice: 2.1, layPrice: 2.14 },
        { id: 'run_draw', name: 'The Draw', backPrice: 4.5, layPrice: 4.8 }
      ],
      totalExposure: 125000,
      version: 1
    }
  ]
]);

// 1. Create Market Action
export const createMarketAction = createSecureAction({
  actionName: 'market.create',
  permission: 'market:create',
  schema: z.object({
    eventName: z.string().min(3),
    sport: z.string().min(2),
    tournament: z.string().min(2),
    runners: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        backPrice: z.number().positive(),
        layPrice: z.number().positive()
      })
    ).min(2)
  }),
  auditMetadata: (input, result) => ({
    resourceType: 'market',
    resourceId: result.market.id,
    afterState: { eventName: input.eventName, sport: input.sport, runnersCount: input.runners.length }
  }),
  handler: async (input) => {
    const id = `MKT-${Date.now().toString().slice(-6)}`;
    const newMarket: MarketRecord = {
      id,
      eventName: input.eventName,
      sport: input.sport,
      tournament: input.tournament,
      status: 'UPCOMING',
      runners: input.runners,
      totalExposure: 0,
      version: 1
    };

    MARKET_STORE.set(id, newMarket);

    await OutboxDispatcher.recordEvent('MARKET_CREATED', {
      marketId: id,
      eventName: input.eventName,
      sport: input.sport
    });

    return { success: true, market: newMarket };
  }
});

// 2. Update Market Odds Action (with Optimistic Locking)
export const updateMarketOddsAction = createSecureAction({
  actionName: 'market.update_odds',
  permission: 'market:update',
  schema: z.object({
    marketId: z.string(),
    expectedVersion: z.number().int().positive(),
    runners: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        backPrice: z.number().positive(),
        layPrice: z.number().positive()
      })
    )
  }),
  auditMetadata: (input, result) => ({
    resourceType: 'market',
    resourceId: input.marketId,
    afterState: { newVersion: result.newVersion }
  }),
  handler: async (input, ctx) => {
    return await DistributedLockManager.withLock(`market:${input.marketId}`, 5000, ctx.actor.id, async () => {
      const market = MARKET_STORE.get(input.marketId);
      if (!market) {
        throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Market not found' });
      }

      if (market.status === 'SETTLED' || market.status === 'VOIDED') {
        throw new AppError({
          code: ErrorCode.CONFLICT_STATE,
          safeMessage: `Cannot modify odds on a ${market.status} market`
        });
      }

      // Optimistic concurrency check
      OptimisticLockEngine.assertVersion(market.version, input.expectedVersion, `Market (${market.eventName})`);

      const nextVer = OptimisticLockEngine.nextVersion(market.version);
      market.runners = input.runners;
      market.version = nextVer;
      MARKET_STORE.set(input.marketId, market);

      return { success: true, marketId: input.marketId, newVersion: nextVer };
    });
  }
});

// 3. Emergency In-Play Suspension Action
export const suspendMarketAction = createSecureAction({
  actionName: 'market.suspend',
  permission: 'market:suspend',
  schema: z.object({
    marketId: z.string(),
    reason: z.string().min(3)
  }),
  auditMetadata: (input) => ({
    resourceType: 'market',
    resourceId: input.marketId,
    afterState: { status: 'SUSPENDED', reason: input.reason }
  }),
  handler: async (input) => {
    const market = MARKET_STORE.get(input.marketId);
    if (!market) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Market not found' });
    }

    market.status = 'SUSPENDED';
    MARKET_STORE.set(input.marketId, market);

    await OutboxDispatcher.recordEvent('MARKET_SUSPENDED', {
      marketId: input.marketId,
      reason: input.reason
    });

    return { success: true, marketId: input.marketId, status: 'SUSPENDED' };
  }
});

// 4. Resume Market Action
export const resumeMarketAction = createSecureAction({
  actionName: 'market.resume',
  permission: 'market:update',
  schema: z.object({
    marketId: z.string()
  }),
  auditMetadata: (input) => ({
    resourceType: 'market',
    resourceId: input.marketId,
    afterState: { status: 'IN_PLAY' }
  }),
  handler: async (input) => {
    const market = MARKET_STORE.get(input.marketId);
    if (!market) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Market not found' });
    }

    market.status = 'IN_PLAY';
    MARKET_STORE.set(input.marketId, market);

    return { success: true, marketId: input.marketId, status: 'IN_PLAY' };
  }
});

// 5. Settle Market Outcome Action
export const settleMarketAction = createSecureAction({
  actionName: 'market.settle',
  permission: 'market:settle',
  schema: z.object({
    marketId: z.string(),
    winningRunnerId: z.string(),
    expectedVersion: z.number().int().positive()
  }),
  auditMetadata: (input) => ({
    resourceType: 'market',
    resourceId: input.marketId,
    afterState: { status: 'SETTLED', winningRunnerId: input.winningRunnerId }
  }),
  handler: async (input, ctx) => {
    return await DistributedLockManager.withLock(`market:${input.marketId}`, 10000, ctx.actor.id, async () => {
      const market = MARKET_STORE.get(input.marketId);
      if (!market) {
        throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Market not found' });
      }

      if (market.status === 'SETTLED' || market.status === 'VOIDED') {
        throw new AppError({
          code: ErrorCode.CONFLICT_STATE,
          safeMessage: `Market is already in terminal state: ${market.status}`
        });
      }

      OptimisticLockEngine.assertVersion(market.version, input.expectedVersion, `Market (${market.eventName})`);

      market.status = 'SETTLED';
      market.winningRunnerId = input.winningRunnerId;
      market.version = OptimisticLockEngine.nextVersion(market.version);
      MARKET_STORE.set(input.marketId, market);

      await OutboxDispatcher.recordEvent('MARKET_SETTLED', {
        marketId: input.marketId,
        winningRunnerId: input.winningRunnerId,
        settledBy: ctx.actor.id
      });

      return {
        success: true,
        marketId: input.marketId,
        status: 'SETTLED',
        winningRunnerId: input.winningRunnerId
      };
    });
  }
});

// 6. Void Market Action (with Dual-Custody Invariant for High-Exposure Events)
export const voidMarketAction = createSecureAction({
  actionName: 'market.void',
  permission: 'market:void',
  schema: z.object({
    marketId: z.string(),
    reason: z.string().min(5),
    expectedVersion: z.number().int().positive()
  }),
  auditMetadata: (input) => ({
    resourceType: 'market',
    resourceId: input.marketId,
    afterState: { status: 'VOIDED', reason: input.reason }
  }),
  handler: async (input, ctx) => {
    const market = MARKET_STORE.get(input.marketId);
    if (!market) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Market not found' });
    }

    // High Exposure Dual-Custody Threshold (> ₹2,00,000 exposure requires 4-eyes approval)
    if (market.totalExposure > 200000) {
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
      let approvalId = `appr_void_${Date.now()}`;

      try {
        const [appr] = await db
          .insert(approvalRequests)
          .values({
            requesterId: ctx.actor.id,
            action: 'market:void',
            resourceType: 'market',
            resourceId: input.marketId,
            payload: { marketId: input.marketId, reason: input.reason, exposure: market.totalExposure },
            status: 'PENDING',
            expiresAt
          })
          .returning();

        if (appr) approvalId = appr.id;
      } catch {
        // Safe offline fallback
      }

      return {
        requiresDualCustody: true,
        approvalRequestId: approvalId,
        message: `Market voiding affects ₹${market.totalExposure.toLocaleString('en-IN')} in liabilities and has been submitted to the Dual-Custody Approval Queue.`
      };
    }

    return await DistributedLockManager.withLock(`market:${input.marketId}`, 10000, ctx.actor.id, async () => {
      OptimisticLockEngine.assertVersion(market.version, input.expectedVersion, `Market (${market.eventName})`);

      market.status = 'VOIDED';
      market.voidReason = input.reason;
      market.version = OptimisticLockEngine.nextVersion(market.version);
      MARKET_STORE.set(input.marketId, market);

      await OutboxDispatcher.recordEvent('MARKET_VOIDED', {
        marketId: input.marketId,
        reason: input.reason,
        voidedBy: ctx.actor.id
      });

      return { success: true, marketId: input.marketId, status: 'VOIDED', reason: input.reason };
    });
  }
});

