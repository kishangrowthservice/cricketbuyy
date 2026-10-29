import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMarketAction,
  updateMarketOddsAction,
  suspendMarketAction,
  resumeMarketAction,
  settleMarketAction,
  voidMarketAction,
  MARKET_STORE
} from '../src/modules/markets/actions';
import { cancelBetAction, voidBetAction, BETS_STORE } from '../src/modules/bets/actions';
import { ErrorCode } from '../src/core/errors/codes';
import { AppError } from '../src/core/errors/app-error';

describe('Sports Markets & Trading Engine Tests', () => {
  const traderCtx = {
    actor: {
      id: 'adm_trader_1',
      email: 'trader@cricketbuyy.com',
      isSuperAdmin: false,
      roles: ['risk_manager'],
      permissions: ['market:create', 'market:update', 'market:suspend', 'market:settle', 'market:void']
    }
  };

  it('creates and schedules a new cricket match market', async () => {
    const res = await createMarketAction(
      {
        eventName: 'New Zealand vs South Africa (Semi Final)',
        sport: 'Cricket',
        tournament: 'World Cup 2026',
        runners: [
          { id: 'run_nz', name: 'New Zealand', backPrice: 1.88, layPrice: 1.9 },
          { id: 'run_sa', name: 'South Africa', backPrice: 2.05, layPrice: 2.1 }
        ]
      },
      traderCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.market.id).toBeDefined();
      expect(res.data.market.status).toBe('UPCOMING');
      expect(res.data.market.version).toBe(1);
    }
  });

  it('executes in-play emergency suspension immediately', async () => {
    const res = await suspendMarketAction(
      {
        marketId: 'MKT-IND-PAK-01',
        reason: 'Third umpire review for run-out'
      },
      traderCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('SUSPENDED');
    }

    const market = MARKET_STORE.get('MKT-IND-PAK-01');
    expect(market?.status).toBe('SUSPENDED');

    // Resume market
    const resumeRes = await resumeMarketAction({ marketId: 'MKT-IND-PAK-01' }, traderCtx);
    expect(resumeRes.success).toBe(true);
    expect(MARKET_STORE.get('MKT-IND-PAK-01')?.status).toBe('IN_PLAY');
  });

  it('updates odds with optimistic concurrency locking', async () => {
    const market = MARKET_STORE.get('MKT-IND-PAK-01');
    const currentVersion = market?.version || 2;

    const res = await updateMarketOddsAction(
      {
        marketId: 'MKT-IND-PAK-01',
        expectedVersion: currentVersion,
        runners: [
          { id: 'run_ind', name: 'India', backPrice: 1.65, layPrice: 1.68 },
          { id: 'run_pak', name: 'Pakistan', backPrice: 2.35, layPrice: 2.4 }
        ]
      },
      traderCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.newVersion).toBe(currentVersion + 1);
    }

    // Stale version collision test
    const collisionRes = await updateMarketOddsAction(
      {
        marketId: 'MKT-IND-PAK-01',
        expectedVersion: currentVersion, // Stale!
        runners: [
          { id: 'run_ind', name: 'India', backPrice: 1.6, layPrice: 1.62 },
          { id: 'run_pak', name: 'Pakistan', backPrice: 2.4, layPrice: 2.45 }
        ]
      },
      traderCtx
    );

    expect(collisionRes.success).toBe(false);
    if (!collisionRes.success) {
      expect(collisionRes.error.code).toBe(ErrorCode.CONFLICT_VERSION);
    }
  });

  it('settles market outcome and locks against subsequent modification', async () => {
    const market = MARKET_STORE.get('MKT-AUS-ENG-02');
    const version = market?.version || 1;

    const res = await settleMarketAction(
      {
        marketId: 'MKT-AUS-ENG-02',
        winningRunnerId: 'run_aus',
        expectedVersion: version
      },
      traderCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('SETTLED');
      expect(res.data.winningRunnerId).toBe('run_aus');
    }

    // Attempting to re-settle throws CONFLICT_STATE
    const reSettleRes = await settleMarketAction(
      {
        marketId: 'MKT-AUS-ENG-02',
        winningRunnerId: 'run_eng',
        expectedVersion: (market?.version || 1) + 1
      },
      traderCtx
    );

    expect(reSettleRes.success).toBe(false);
    if (!reSettleRes.success) {
      expect(reSettleRes.error.code).toBe(ErrorCode.CONFLICT_STATE);
    }
  });

  it('routes high exposure market voiding (> ₹2,00,000) to Dual-Custody Approval Queue', async () => {
    const market = MARKET_STORE.get('MKT-IND-PAK-01');
    expect(market?.totalExposure).toBeGreaterThan(200000);

    const res = await voidMarketAction(
      {
        marketId: 'MKT-IND-PAK-01',
        reason: 'Match abandoned due to torrential cyclone rain',
        expectedVersion: market?.version || 1
      },
      traderCtx
    );

    expect(res.success).toBe(true);
    if (res.success && 'requiresDualCustody' in res.data) {
      expect(res.data.requiresDualCustody).toBe(true);
      expect(res.data.approvalRequestId).toBeDefined();
    }
  });
});

describe('Bet Order Management & Risk Surveillance Tests', () => {
  const betCtx = {
    actor: {
      id: 'adm_trader_1',
      email: 'trader@cricketbuyy.com',
      isSuperAdmin: false,
      roles: ['risk_manager'],
      permissions: ['bet:cancel', 'bet:void']
    }
  };

  it('cancels an UNMATCHED bet slip and initiates stake refund', async () => {
    const res = await cancelBetAction(
      {
        betId: 'BET-9903',
        reason: 'Customer requested order cancellation before market match'
      },
      betCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('CANCELLED');
      expect(res.data.refundAmount).toBe(15000);
    }
  });

  it('rejects cancellation on already MATCHED bets', async () => {
    const res = await cancelBetAction(
      {
        betId: 'BET-9901', // Status is MATCHED
        reason: 'Customer regret'
      },
      betCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.CONFLICT_STATE);
      expect(res.error.safeMessage).toContain('Only UNMATCHED bets can be cancelled');
    }
  });

  it('voids a disputed bet order with mandatory justification reason', async () => {
    const res = await voidBetAction(
      {
        betId: 'BET-9902',
        reason: 'Disputed palp error: erroneous odds feed during powerplay'
      },
      betCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe('VOIDED');
      expect(res.data.stakeRefunded).toBe(100000);
    }
  });
});
