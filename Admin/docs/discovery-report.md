# Discovery Report — Main Site (`E:\SLIVER-EXCHANGE`)

**Date:** 2026-10-29  
**Target Product:** Cricketbuyy.com (Sports & Live Casino Betting Exchange)  
**Main Site Path:** `E:\SLIVER-EXCHANGE`  
**Audience:** Admin Engineering Team / Google Antigravity Agent  

---

## 1. Executive Summary & Tech Stack Audit

The main site is a high-performance, single-page customer-facing application constructed with:
- **Framework**: React 19.3 + React Router 7.18 + Vite 8.3 (Client-side Single Page Application)
- **Styling**: Vanilla CSS with customized design tokens, Maroon palette (`#941b2c` / `#6e101c`), dark canvas (`#16191C`), and Bootstrap 5 grid utilities.
- **Brand Identity**: **Cricketbuyy.com** (`/logo.svg`, `/logo.png`, `/favicon.svg`).
- **Live Deployment**: Deployed on Vercel (`https://cricketbuyy-growth-service.vercel.app` & `https://cricketbuyy-sage.vercel.app`) with SPA rewrites via `vercel.json`.

---

## 2. Discovered Domain Entities & Business Models

From our comprehensive inspection of `src/data/mockData.js`, `src/context/`, and `src/pages/`, the following core domain entities have been cataloged:

### 2.1. Customer Accounts & Identity
- **Entity**: `User` / `Customer`
- **Fields**: `id`, `uname` (Username), `email`, `phone`, `bal` (Wallet Balance in INR), `exp` (Active Exposure / Liability), `isDemo`, `status` (`ACTIVE`, `SUSPENDED`, `LOCKED`), `createdAt`, `lastLoginAt`.
- **Admin Capabilities Needed**:
  - View list with search, filter, and balance sorting.
  - Credit / Debit manual balance adjustment with mandatory audit narration.
  - Suspend / Ban account or terminate active customer sessions.
  - Impersonate customer (read-only view with strict audit log).

### 2.2. Sports & Match Market Management
- **Entity**: `SportCategory`, `Tournament`, `MatchEvent`, `Market`
- **Fields**: `sportId` (4: Cricket, 1: Football, 2: Tennis, 7: Horse Racing, 43: Greyhound), `tournament`, `name`, `date`, `isInPlay`, `hasTv`, `hasBookmaker`, `hasFancy`, `status` (`UPCOMING`, `IN_PLAY`, `SUSPENDED`, `CLOSED`).
- **Market Types**:
  - Match Odds (6-column Back/Lay ladder)
  - Bookmaker Market (0% Commission)
  - Fancy / Session Markets (Run amounts Over/Under)
- **Admin Capabilities Needed**:
  - Toggle live stream radar / TV visibility per match.
  - Suspend individual markets or freeze bet placement during critical overs/VAR.
  - Manually settle match markets (trigger payout calculation to winning bets).

### 2.3. Bets & Risk Exposure
- **Entity**: `Bet`
- **Fields**: `id`, `customerId`, `matchId`, `marketId`, `selection`, `type` (`BACK`, `LAY`), `odds`, `stake`, `potentialProfit`, `liability`, `status` (`MATCHED`, `UNMATCHED`, `WON`, `LOST`, `CANCELLED`, `VOIDED`), `placedAt`, `settledAt`.
- **Admin Capabilities Needed**:
  - Real-time risk & exposure monitoring (liability book per runner).
  - Void or cancel fraudulent bets with required supervisor approval.
  - Settlement overrides with two-person approval for high-value payouts.

### 2.4. Casino & Provider Catalog
- **Entity**: `CasinoGame`, `CasinoProvider`, `CasinoRound`
- **Fields**: `id`, `gname`, `category` (`crash`, `live`, `table`, `slots`), `provider` (`Spribe`, `Smartsoft`, `Evolution`, `Ezugi`, `SuperNowa`), `status` (`ACTIVE`, `MAINTENANCE`), `roundId`, `winner`, `multiplier`.
- **Admin Capabilities Needed**:
  - Enable/disable individual games or entire provider aggregators.
  - Inspect round histories and audit provably fair logs.

### 2.5. Financial Ledger & Passbook
- **Entity**: `Transaction`
- **Fields**: `id`, `customerId`, `type` (`DEPOSIT`, `WITHDRAWAL`, `BET_PLACED`, `BET_WON`, `ADMIN_ADJUSTMENT`), `credit`, `debit`, `balanceAfter`, `referenceId`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`), `gateway` (`UPI`, `IMPS`, `BANK_TRANSFER`), `proofUrl`.
- **Admin Capabilities Needed**:
  - Pending deposit & withdrawal approvals queue.
  - Reconcile bank payments with transaction references.
  - Set global and per-user deposit/withdrawal velocity limits.

### 2.6. Global Site Configuration & Banners
- **Entity**: `SiteSetting`, `AnnouncementTicker`, `FeatureFlag`
- **Fields**: `title`, `domain`, `themePrimary`, `themeSecondary`, `newsTicker`, `whatsappNo`, `telegramLink`, `maintenanceMode`, `registrationOpen`.
- **Admin Capabilities Needed**:
  - Update marquee announcement text in real-time.
  - Toggle maintenance mode (instantly reflected on the main site).
  - Change support contact numbers without code deployment.

---

## 3. Integration & Boundary Specifications

1. **Isolation Guarantee**:
   - The Admin application will live completely inside `Admin/` and deploy to its own Vercel project (`cricketbuyy-admin` / `admin.cricketbuyy.com`).
   - Customer cookies and admin session cookies MUST be host-only and isolated.
2. **Data Sharing Strategy**:
   - Production Database: PostgreSQL on Neon.
   - Admin-owned tables (Admins, Roles, Permissions, Audit Logs, Approvals, Feature Flags) live in dedicated schema `admin`.
   - Business tables (`customers`, `bets`, `matches`, `transactions`) live in `public` or domain schemas and are accessed through strongly typed repository layers with optimistic concurrency locks.
3. **Signalling Mechanisms**:
   - Fast cache-layer flags (Maintenance Mode, Global Banners) updated via Edge Config / Redis.
   - Webhook events dispatched with HMAC-SHA256 signatures for async events.

