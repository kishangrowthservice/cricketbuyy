# ADR 0002: Integration Contract Between Admin and Main Site

## Status
Accepted

## Context
The Admin application lives in `Admin/` and is deployed as a distinct Vercel project (`admin.cricketbuyy.com`). The customer-facing exchange runs at `cricketbuyy.com`. Admin must supervise and control customers, bets, matches, and global settings without tight coupling or risking main-site stability.

## Decision
We implement a hybrid integration model:

1. **Database Layer (Option A — Shared PostgreSQL with Dedicated Schema)**:
   - PostgreSQL 16+ on Neon.
   - Admin-owned metadata (Admins, Roles, Permissions, Approvals, Audit Logs, Feature Flags, System Settings) lives in the dedicated schema `admin`.
   - Domain tables (`customers`, `bets`, `matches`, `transactions`) live in `public`.
   - Admin connects using a dedicated database role `admin_app` with explicit SELECT/UPDATE/INSERT grants. Admin migrations never alter `public` tables directly without formal contract versioning.
2. **Real-time Signal Propagation**:
   - **Edge Config & Redis**: High-read flags (Maintenance Mode, Announcement Ticker, Emergency Market Freeze) are published to Redis / Edge Config so the customer application reads them sub-millisecond with zero DB load.
   - **Signed Webhooks**: Mutations like customer suspension or market settlement dispatch signed HMAC-SHA256 webhooks to the customer site's notification workers.
3. **Cookie & Identity Separation**:
   - Customer cookies (`silverbhai_session` / `cricketbuyy_session`) and Admin cookies (`__Host-admin-session`) are strictly host-only and isolated on separate origins.
   - No shared JWT secret or cross-domain cookie leakage.

## Consequences
- Zero blast radius: A problem in the main site's frontend cannot crash the admin panel.
- Fast propagation of administrative actions without polling.
