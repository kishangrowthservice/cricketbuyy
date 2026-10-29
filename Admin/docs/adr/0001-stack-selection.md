# ADR 0001: Technology Stack Selection for Admin Application

## Status
Accepted

## Context
The owner requires a production-grade, highly secure, fast, scalable Admin portal (`Admin/`) with complete database-driven RBAC, operating as an independent deployment on Vercel.

## Decision
We select the following core stack conforming strictly to §3 of `ADMIN_SPEC.md`:

1. **Framework**: **Next.js 16.x App Router** (latest stable release ≥ 16.2.6) + **React 19.2**.
   - Server Components by default for zero client bundle bloat and fast data fetching.
   - Server Actions governed by mandatory `secureAction` middleware.
   - Pinned exact versions in `Admin/package.json`.
2. **Language & Compiler**: **TypeScript 5.x** with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
3. **Styling & Components**: **Tailwind CSS v4** + **shadcn/ui** (accessible Radix primitives) + **Lucide Icons** + **TanStack Table** (with TanStack Virtual for 100k+ row pagination).
4. **Data Access & ORM**: **Drizzle ORM** + `drizzle-kit` targeting **PostgreSQL 16+ (Supabase)** with pooled and direct connection URLs. Hand-crafted SQL migrations for PostgreSQL Row-Level Security, triggers, and partitioning.
5. **Authentication**: **Better Auth** with Email/Password, TOTP 2FA, Passkeys (WebAuthn), and secure HTTP-only session cookies stored in PostgreSQL + Redis secondary store.
6. **Authorization Engine**: In-house database-driven RBAC engine enforcing:
   - Super Admin (system wildcard) & Admin (customizable top level).
   - Dynamic custom roles, granular permissions (`resource:action`), scoping (`own`, `team`, `all`), and field-level masking.
7. **Cache & Rate Limiting**: **Upstash Redis** (via Vercel Marketplace) + `@upstash/ratelimit`.
8. **Testing**: Vitest (unit/integration), Testcontainers (real Postgres), Playwright (E2E per role), k6 (concurrency/load).

## Consequences
- Clean separation of concerns between Admin and customer frontend.
- Zero `any` types; all API inputs validated via Zod schemas.
- High velocity and safety with pre-built accessible UI primitives.

