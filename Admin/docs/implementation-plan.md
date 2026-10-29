# Admin Panel — Comprehensive Implementation Plan (Phases 0–2 Focus)

**Repository Target:** `Admin/`  
**Deployment Target:** Vercel (`cricketbuyy-admin` / `admin.cricketbuyy.com`)  
**Status:** In Planning Mode (Awaiting Human Approval)

---

## 1. Phase 0: Discovery, ADRs & Architectural Foundations (Completed in Planning)
- [x] **Main Site Discovery**: Documented tech stack, models (Users, Bets, Matches, Casino, Financials), and security boundaries in [`Admin/docs/discovery-report.md`](file:///e:/SLIVER-EXCHANGE/Admin/docs/discovery-report.md).
- [x] **Single Source of Truth**: Stored requirements in [`Admin/docs/ADMIN_SPEC.md`](file:///e:/SLIVER-EXCHANGE/Admin/docs/ADMIN_SPEC.md) and [`Admin/AGENTS.md`](file:///e:/SLIVER-EXCHANGE/Admin/AGENTS.md).
- [x] **Architecture Decisions**: Authored ADRs 0001 (Stack), 0002 (Integration), 0003 (RBAC), and 0004 (Concurrency & Audit Integrity).
- [ ] **Gate 0 Approval**: Present discovery and ADRs to human reviewer before writing application code.

---

## 2. Phase 1: Core Foundation & Secure Pipeline (Next Stage)
**Objective**: Build a running, self-contained Next.js 16+ application in `Admin/` with database connection, migrations, auth, and the mandatory `secureAction` mutation pipeline.

### Task List for Phase 1:
1. **App Initialization**:
   - Initialize `Admin/` with Next.js 16.2+ (App Router), React 19.2, TypeScript (`strict: true`), Tailwind CSS v4, and `@t3-oss/env-nextjs`.
   - Setup `Admin/package.json` with pinned exact dependencies, `tsconfig.json`, `eslint.config.mjs`, and `.dependency-cruiser.cjs`.
2. **Database & Schema Layer**:
   - Configure Drizzle ORM targeting PostgreSQL 16+ (Neon).
   - Write SQL migrations for `admin` schema:
     * `admin.admins` (Admin user accounts, password hashes, 2FA secrets)
     * `admin.sessions` (Active HTTP-only database sessions)
     * `admin.audit_logs` (Hash-chained audit records with row-level locks)
     * `admin.outbox_events` (Transactional outbox for reliable event delivery)
3. **Core Authentication Engine**:
   - Implement Better Auth with Email/Password, TOTP 2FA, and Passkeys (WebAuthn).
   - Create Bootstrap Super Admin script (`Admin/scripts/bootstrap-super-admin.ts`) creating the initial root administrator.
4. **The `secureAction` Pipeline**:
   - Create the mandatory server mutation pipeline enforcing: Zod validation → Session authentication → Fail-closed RBAC check → Rate-limiting → Idempotency reservation → Transactional business logic → Atomic audit write → Outbox dispatch.
   - Build CI check `Admin/scripts/check-secure-actions.ts` to ensure zero mutations bypass the pipeline.
5. **Phase 1 Verification**:
   - Automated tests for authentication, session revocation, and idempotency replay.
   - Deliver `Admin/docs/walkthroughs/phase-1.md`.

---

## 3. Phase 2: Complete Database-Driven RBAC Engine
**Objective**: Deliver full dynamic RBAC with Super Admin, Admin, and custom roles, granular permissions, scoping, field-level masking, and dual-custody approval requests.

### Task List for Phase 2:
1. **RBAC Data Architecture**:
   - Tables: `admin.roles`, `admin.permissions`, `admin.role_permissions`, `admin.user_roles`, `admin.approval_requests`.
   - Seed permission registry (Appendix A): `admin:*`, `customer:*`, `market:*`, `bet:*`, `financial:*`, `setting:*`, `audit:*`.
2. **Permission Evaluation & DAL Filter Engine**:
   - Build `can(actor, permission, resource, ctx)` with caching in Redis and per-request memoization.
   - Build Data Access Layer scope injectors (`own`, `team`, `all`) that filter records inside SQL queries.
   - Implement field-level masking DTO transformer for sensitive PII.
3. **Two-Person Approval Workflow**:
   - Dual-custody system for dangerous operations: requester submits approval request → notification dispatched to supervisors → authorized reviewer approves or rejects → operation executes atomically.
4. **RBAC Management UI**:
   - Role creation and editing matrix with visual permission checkboxes.
   - User-role assignment interface with temporary expiration dates.
   - Audit trail viewer with cryptographic hash-chain verification tool.
5. **Phase 2 Verification**:
   - Complete RBAC matrix test suite covering unauthorized access, privilege escalation attempts, and approval gates.
   - Deliver `Admin/docs/walkthroughs/phase-2.md`.

---

## 4. Subsequent Phases Preview (Phases 3–7)
- **Phase 3**: Customer & Player Operations (Account lifecycle, balance adjustments, KYC/documents, activity tracking, impersonation).
- **Phase 4**: Sports Betting & Risk Management (Match schedule, market odds 6-col supervisor, live radar toggle, bookmaker/fancy settlement, bet voiding).
- **Phase 5**: Financial Ledger & Banking (Deposit/withdrawal review queue, UPI/IMPS reference matching, automated reconciliation, velocity limits).
- **Phase 6**: Operations, Content & Customization (Global news marquee, maroon/dark theme customization, feature flags via Edge Config, support tickets).
- **Phase 7**: Production Hardening, Concurrency Tests & Vercel Deployment (Playwright E2E suite, k6 parallel concurrency scenarios, Vercel project deployment with isolated custom domain).
