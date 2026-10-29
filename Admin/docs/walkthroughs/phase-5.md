# Phase 5 Walkthrough — Domain Modules: Sports Markets, In-Play Trading & Bet Risk Surveillance

**Version**: 1.0.0  
**Date**: 2026-10-29  
**Branch**: `feat/phase-5-domain-modules`  
**Status**: Completed & Verified  

---

## 1. What Was Built in Phase 5

In Phase 5, we designed, implemented, and verified the complete domain modules for **Sports Markets, In-Play Trading, Bookmaker Configuration, Disputed Voiding, and Bet Risk Surveillance** for the **Cricketbuyy Admin application**:

### A. Sports Markets & In-Play Trading Engine (`src/modules/markets/actions.ts`)
- **Market Lifecycle Management**:
  - `createMarketAction`: Registers new sports events and markets (Cricket, Football, Tennis) with back and lay ladders across runners. Sets initial status to `UPCOMING` and version to `1`.
  - `updateMarketOddsAction`: Real-time back/lay price updates protected by optimistic concurrency (`expectedVersion`) and distributed mutex leases.
  - `suspendMarketAction`: Emergency in-play suspension (`market:suspend`) stopping trading immediately across client connections and emitting `MARKET_SUSPENDED` outbox event.
  - `resumeMarketAction`: Resumes in-play trading (`IN_PLAY`).
  - `settleMarketAction`: Confirms official winning runner, updates status to `SETTLED`, calculates customer bet slip payouts atomically, and locks market against subsequent modifications.
  - `voidMarketAction`: Voids disrupted or weather-abandoned matches, triggers refunds back to customer wallets.
    - **Dual-Custody Invariant**: If market total liability/exposure exceeds ₹2,00,000, voiding cannot execute directly; it automatically routes to the 4-Eyes Dual-Custody Approval Queue (`admin.approval_requests`) for independent confirmation.

### B. Bet Order Book & Risk Surveillance Engine (`src/modules/bets/actions.ts`)
- **Order Management & Liquidity Controls**:
  - `cancelBetAction`: Cancels `UNMATCHED` bet slips prior to market matching, refunds stake back to customer wallet, and emits `BET_CANCELLED` outbox event. Matched bets are strictly protected from accidental cancellation.
  - `voidBetAction`: Voids disputed matched bets (e.g. palp errors, late feed spikes) with mandatory justification reason (minimum 8 characters) and emits `BET_VOIDED` audit log.
- **Exposure Surveillance**:
  - Real-time book liability calculation by runner and outcome.
  - Highlighting highest book liability runners (e.g., Pakistan Lay liabilities) to assist risk traders.

### C. Interactive Sports Control Center UI Views
- **Sports Markets Control Center (`/markets`)**:
  - Sports & status filter tabs (`ALL`, `IN_PLAY`, `UPCOMING`, `SUSPENDED`, `SETTLED`).
  - Real-time odds ladders displaying Back (sky blue) and Lay (rose pink) decimal odds for all runners.
  - Quick action controls:
    - Emergency one-click "Suspend" / "Resume" in-play trading button.
    - "Settle" modal with declared winner selection radio cards and atomic payout trigger.
    - "Void" modal with dual-custody warning banner when liabilities exceed ₹2,00,000.
- **Bet Risk & Surveillance Stream (`/bets`)**:
  - Real-time bet slip ledger displaying Bet ID, Market, Customer, Runner, Bet Type (`BACK` vs `LAY`), Odds, Stake, Liability, and Status.
  - Risk KPI summaries: Total Active Bet Exposure, Highest Liability Runner, and Unmatched Orders waiting for liquidity.
  - Interactive "Cancel Order" on unmatched slips and "Void Disputed Bet" modal with mandatory reason prompt.

---

## 2. Automated Test Verification & Evidence

### A. Vitest Test Suite (57/57 Passed Across 9 Test Suites)
```bash
> cricketbuyy-admin@1.0.0 test
> vitest run

 ✓ tests/totp.test.ts (6 tests) 27ms
 ✓ tests/audit.test.ts (2 tests) 27ms
 ✓ tests/impersonation.test.ts (4 tests) 20ms
 ✓ tests/secure-action.test.ts (5 tests) 26ms
 ✓ tests/rbac.test.ts (14 tests) 33ms
 ✓ tests/auth.test.ts (3 tests) 1074ms
 ✓ tests/session.test.ts (3 tests) 23ms
 ✓ tests/concurrency.test.ts (12 tests) 139ms
 ✓ tests/markets.test.ts (8 tests) 773ms

 Test Files  9 passed (9)
      Tests  57 passed (57)
```

Tests verified:
1. Creating and scheduling cricket match market with runners and initial version `v1`.
2. Immediate in-play emergency suspension and resume lifecycle.
3. Odds update with optimistic concurrency (`version` progression and collision detection).
4. Market settlement locks against subsequent re-settlement or modifications (`CONFLICT_STATE`).
5. High exposure market voiding ($> ₹2,00,000$) routes to Dual-Custody Approval Queue.
6. Cancelling unmatched bet refunds stake and updates status.
7. Attempting to cancel matched bet is rejected (`CONFLICT_STATE`).
8. Voiding disputed bet succeeds with mandatory audit logging.

### B. AST Security Enforcement Script
```bash
> cricketbuyy-admin@1.0.0 check:actions
> tsx scripts/check-secure-actions.ts

🔍 Checking for un-sanctioned mutation exports bypassing secureAction...
✅ Success: All server actions conform strictly to the secureAction pipeline!
```

### C. Next.js Production Build
```bash
> cricketbuyy-admin@1.0.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.ts took 127ms
✓ Compiled successfully in 1861ms
✓ Finished TypeScript in 9.6s (Zero type errors)
✓ Generating static pages using 11 workers (13/13) in 3.1s

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /admins
├ ƒ /api/health
├ ○ /audit
├ ○ /bets
├ ○ /customers
├ ○ /financial
├ ○ /login
├ ○ /markets
├ ○ /roles
└ ○ /settings
```

---

## 3. Known Gaps / Next Phase Handoff

- **Phase 6 Handoff**: Cryptographic Audit Ledger & Integrity Verification Viewer (`/audit`), Platform Global Settings & Maintenance Mode Toggle (`/settings`), and End-to-End System Integration.
