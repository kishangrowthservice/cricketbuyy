<!--
ADMIN_SPEC.md — single source of truth for the Admin project
Repo location : Admin/docs/ADMIN_SPEC.md   (companion file: Admin/AGENTS.md)
Audience      : AI coding agent (Google Antigravity) + human reviewers
Language      : English (the owner's original Hinglish requirement is quoted verbatim in §1.1)
Spec version  : 1.0.0  (2026-10-29)
-->

# Admin Panel — Production Requirements Specification

**One-line summary:** A separate, production-grade **Admin application** (Super Admin + Admin + custom roles) with **complete, database-driven RBAC**, built for **security, concurrency-safety, speed and scale**, living in its own `Admin/` folder and deployed as its **own Vercel project**.

## Contents

0. Read this first — agent working agreement
1. Context, scope and owner's requirement
2. Engineering principles and priorities
3. Technology stack
4. Architecture
5. Identity, authentication and sessions
6. RBAC — roles, permissions, guardrails
7. Functional modules (complete catalogue)
8. Global UX system and customization matrix
9. Concurrency and data-integrity guarantees
10. Security requirements
11. Performance and scalability
12. Database design
13. Observability and operations
14. Testing strategy and quality gates
15. CI/CD and Vercel deployment (separate project)
16. Delivery plan (phases and gates)
17. Global Definition of Done
- Appendix A — Permission registry (initial)
- Appendix B — Default role matrices
- Appendix C — Environment variables (names only)
- Appendix D — Error codes
- Appendix E — Reference patterns (illustrative)
- Appendix F — Open questions for the owner

---

## 0. Read this first — agent working agreement

**MUST / MUST NOT / SHOULD / MAY** follow RFC 2119. Items written as `<<FILL: …>>` are owner-specific facts: discover them from the main-site codebase in Phase 0, or ask **once**, in **one batched message**, proposing defaults.

### 0.1 The 12 things that matter most

1. Build a **separate** admin application in its own folder `Admin/`, deployed as its **own Vercel project** on its own (sub)domain. Do not modify the main site except through the approved integration contract (§4.6).
2. Two top-level roles — **Super Admin** and **Admin** — on top of a **complete, database-driven RBAC** (custom roles, scoped permissions, field-level masking, temporary access, approvals, impersonation rules). See §6.
3. Ship **every functionality and customization option** in §7 and §8. For `<<FILL>>` domain modules follow the Module Recipe (§7.22) so everything stays consistent.
4. **Senior-level structure**: modular monolith, strict layering, ADRs, typed end-to-end, tests, docs, CI gates (§4, §14, §15).
5. **Security first** (§10): fail-closed authorization, mandatory MFA, hardened sessions, strict CSP, rate limits, everything audited.
6. **Concurrency guarantees** (§9): optimistic locking, idempotency keys, transactional outbox, row locks where needed — **proven by automated parallel tests**.
7. **Fast and scalable** (§11): server-first rendering, keyset pagination, indexed queries, correct cache invalidation, async jobs for heavy work.
8. Use **production-grade tooling** (§3, §13, §15): Sentry, OpenTelemetry, Playwright, k6, CodeQL, gitleaks, Renovate, etc.
9. Work **phase by phase** (§16). Stop at every phase gate for human approval.
10. When the spec is ambiguous, choose the **safest** option, record an ADR, continue. Ask only blocking questions, batched.
11. Never claim something works without running it. Evidence = passing tests + green CI + a short walkthrough.
12. Never commit secrets, never run destructive commands against shared/production databases, never weaken a check to make a build pass.

### 0.2 How to work

- **Start in Planning mode.** Produce, in this order: (a) Discovery report of the main site (read-only), (b) ADRs for every open decision, (c) implementation plan + task list for Phases 0–2. **Wait for human approval before writing application code.**
- One phase at a time (§16). Branch per phase: `feat/phase-<n>-<slug>`. Small, reviewable commits using Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `perf:`, `security:`).
- Every phase ends with: CI green, tests added, docs updated, `docs/walkthroughs/phase-<n>.md` (what was built, how to verify, known gaps). Then **stop**.
- Every non-trivial decision becomes an ADR: `docs/adr/NNNN-title.md` (Context → Decision → Alternatives → Consequences).
- **Dependency rules:** actively maintained (release within the last 12 months), permissive licence (MIT/Apache-2.0/BSD/ISC), no known critical advisories, no unexplained install scripts, **exact pinned versions**, prefer releases at least 14 days old. Verify with the registry (`npm view <pkg> version time`) and `pnpm audit` before adding.
- **Versions:** use the latest stable at project start. **Next.js MUST be ≥ 16.2.6 (or newer)** — the May 2026 security release fixed several advisories including proxy/middleware bypass classes. Re-check advisories for Next.js, React and Better Auth at the start of every phase.
- If the main-site code is not accessible in your workspace, stop and ask the human to place a **sanitized** copy in `docs/main-site-reference/` (`package.json`, DB schema/migrations, auth setup, API route list, env var *names* only).

### 0.3 Never do this

- Never modify anything outside `Admin/` (the main site is read-only reference) except changes approved in the integration contract (§4.6).
- Never run migrations, seeds or destructive SQL against any database that is not local/ephemeral/preview unless a human approved that exact command.
- Never commit secrets or real PII. Use `.env.example` and seeded fake data only.
- Never disable or skip tests, type checks, lint rules or CI gates to get green. Fix the root cause.
- Never use `any`, `@ts-ignore` or `eslint-disable` without a justified comment and issue/ADR link.
- Never write your own crypto primitives. Use vetted libraries or platform APIs.
- Never put authorization only in the UI, or only in `proxy.ts`. (Auth in proxy/middleware alone has been bypassed in the past — §10.)
- Never build SQL by string concatenation. Never use `eval`/`new Function`. Never render unsanitized HTML.
- Never store tokens in `localStorage`/`sessionStorage`. Never log secrets, tokens, passwords or full PII.
- Never call external services inside a database transaction.
- Never leave a `TODO` without an issue reference.

### 0.4 Output contract

Each phase delivers: working code + migrations, tests (unit/integration/concurrency/E2E as relevant), updated docs, updated `.env.example`, ADRs, and the walkthrough file. Quality bar = §17.

---

## 1. Context, scope and owner's requirement

### 1.1 Owner's requirement (verbatim, Hinglish) and interpretation

> "isme mujhe admin ka flow kuch aisa chaiye ab superadmin and admin smjh rahe ho na complete rbac make sure you provide each and every functionality and customization options and strictly follow the senior level structure for everything and use all the production level code to make my site fast and scalble and cocurrency gurrantee and security matters a lot use all the production level tools too as well while buding … alg floder Admin with alg project on vercel rakhna hai"

| # | Interpretation | Where it is specified |
|---|---|---|
| R1 | An admin portal with two top-level roles, **Super Admin** and **Admin**, and a **complete RBAC** system | §5, §6 |
| R2 | **Every** functionality and **every customization option** a mature admin panel needs | §7, §8 |
| R3 | **Senior-level structure** for everything: architecture, folders, code, tests, docs, CI/CD | §4, §14, §15 |
| R4 | **Production-level code and tools** throughout | §3, §13, §15 |
| R5 | The site must be **fast and scalable** | §11 |
| R6 | **Concurrency guarantee** — no lost updates, no double processing, no race conditions | §9 |
| R7 | **Security matters a lot** | §5, §6, §10 |
| R8 | **Separate `Admin/` folder** and a **separate Vercel project** | §4.1, §15 |

### 1.2 Scope

**In scope:** the Admin web application (UI + server logic), its own identity/RBAC/audit/settings data, background jobs, CI/CD, docs, tests, Vercel project configuration, and the *integration contract* through which Admin controls the main site (settings, flags, maintenance mode, user status).

**Out of scope:** redesigning the main site UI, customer-facing features, native mobile apps, storing card data (PCI scope MUST stay out — tokenized payment references only).

### 1.3 Facts to confirm (placeholders)

| Placeholder | Meaning | Default if not provided |
|---|---|---|
| `<<FILL: PRODUCT_NAME>>` | Brand/product name | "Cricketbuyy" (from Cricketbuyy.com) |
| `<<FILL: MAIN_SITE_PATH>>` | Folder of the existing site | `E:\SLIVER-EXCHANGE` (root) |
| `<<FILL: DOMAIN>>` | Primary domain | `cricketbuyy.com` (Admin at `admin.cricketbuyy.com`) |
| `<<FILL: MAIN_DB>>` | Main site's database | PostgreSQL (Neon via Vercel Marketplace) |
| `<<FILL: DOMAIN_MODULES>>` | Business entities the admin must manage | Users/Customers, Matches/Markets, Bets/Slips, Casino Games, Banking/Ledger/Transactions, Risk & Exposure, Agents/Hierarchy |
| `<<FILL: COMPLIANCE>>` | Regulatory / Privacy standards | GDPR / DPDP-style privacy readiness; PCI out of scope |
| `<<FILL: LOCALES>>` | Admin UI languages | `en` (English), fully i18n-ready |
| `<<FILL: SCALE>>` | Load assumptions | 500 concurrent admin sessions, 10M customer rows, 100M audit rows |
| `<<FILL: SSO>>` | Corporate SSO needed? | Optional (Google/Microsoft OIDC, SAML via Better Auth) |
| `<<FILL: REGION>>` | Data residency / region | `iad1` (US East) or `bom1` (Mumbai, India) matching Neon DB |

---

## 2. Engineering principles and priorities

**Priority order when requirements conflict:** (1) Security → (2) Data integrity & concurrency safety → (3) Correctness → (4) Reliability → (5) Performance → (6) Maintainability → (7) Feature breadth → (8) Visual polish.

Principles:

- **Least privilege, deny by default, fail closed.** Anything not explicitly allowed is denied; errors in authorization deny.
- **Defense in depth.** Authorization is enforced at proxy (coarse), page, server action, data-access layer, and database (§6.10).
- **Everything is audited**, atomically with the change (§9, §12).
- **Idempotent by default.** Any mutation can be safely retried.
- **Modular monolith** — not microservices. Strong module boundaries, one deployable.
- **Boring, proven technology.** Prefer stable, well-documented tools; every exception is an ADR.
- **Explicit over implicit.** Typed contracts, validated at every boundary (Zod), no magic.
- **Server-first.** React Server Components by default; client components only for interactivity.
- **12-factor config.** Config via validated environment variables; no secrets in code.
- **Observable.** Every request has a correlation ID; errors, traces, metrics, and audit trails are linkable.
- **Reversible releases.** Backward-compatible (expand/contract) migrations; feature flags for risky changes; instant rollback.

---

## 3. Technology stack

| Layer | Decision |
|---|---|
| Runtime | Node.js current Active LTS; `pnpm` |
| Language | TypeScript strict mode, end-to-end typed |
| Framework | Next.js 16.x App Router (≥ 16.2.6), React 19.2 |
| UI | Tailwind CSS v4, shadcn/ui (Radix), TanStack Table + Virtual, nuqs, Lucide |
| Forms & Validation | React Hook Form + Zod, @t3-oss/env-nextjs |
| Mutation Layer | `secureAction` pipeline (mandatory) |
| Authentication | Better Auth (Email/Pass, Passkeys/WebAuthn, TOTP 2FA, DB sessions) |
| Authorization | In-house database-driven RBAC engine |
| Database | PostgreSQL 16+ (Neon via Vercel Marketplace) |
| ORM & Migrations | Drizzle ORM + drizzle-kit, dedicated `admin` schema |
| Cache & Rate-limit | Upstash Redis via Vercel Marketplace + @upstash/ratelimit |
| Background Jobs | Vercel Workflow / Vercel Cron, idempotent handlers |
| Email | Resend + React Email |
| Observability | Sentry, OpenTelemetry (@vercel/otel), Pino structured logs |
| Testing | Vitest, Testing Library, Playwright, Testcontainers |

