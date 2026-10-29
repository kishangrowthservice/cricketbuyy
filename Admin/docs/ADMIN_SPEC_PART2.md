<!--
ADMIN_SPEC_PART2.md — continuation of ADMIN_SPEC.md (Part 1 = §0–§4)
Repo location : Admin/docs/ADMIN_SPEC_PART2.md
Contents      : §5 Identity & auth, §6 RBAC, §7 Functional modules, §8 UX system & customization matrix
Spec version  : 1.0.0  (2026-10-29)
-->

# Admin Panel — Specification, Part 2 of 3

> **This is a continuation of `ADMIN_SPEC.md`** (Part 1 covers §0–§4: working agreement, context, principles, stack, architecture). All rules from Part 1 still apply (RFC 2119 keywords, the never-do list §0.3, priorities §2, anti-patterns §4.8).
> **If you already produced a plan from Part 1 alone, re-read this part and update the plan.** Part 3 covers §9–§17 and the appendices.

---

## 5. Identity, authentication and sessions

### 5.1 Identity model

- Admin identities are **separate** from customer identities. Admin users live in `admin.admin_users` (Better Auth's user/session/account/verification/two-factor/passkey tables are mapped into schema `admin` and extended with additional columns — do **not** duplicate identity in two tables).
- Separate subdomain, separate host-only cookie, separate sessions table. **No public sign-up. Invite-only.** No route for self-registration may exist in code.
- The **first Super Admin** is created only by the CLI `pnpm bootstrap:super-admin`, which requires a one-time `BOOTSTRAP_TOKEN` env value plus interactive confirmation, sets a temporary password/passkey enrolment link, and **refuses to run if a Super Admin already exists** unless `--break-glass` is passed (§6.4 RBAC-12). Every run is logged.

### 5.2 Authentication methods

| Method | Policy |
|---|---|
| Email + password | Baseline (unless SSO-only is enabled by Super Admin) |
| **TOTP** (RFC 6238) + backup codes | **Mandatory for every admin**, enforced at first login; cannot be skipped |
| **Passkeys** (WebAuthn) | Supported for everyone. **Super Admin MUST enrol a phishing-resistant factor** (passkey/security key) within a configurable grace period (default 7 days), after which access is blocked until enrolled |
| SSO (OIDC: Google Workspace / Microsoft Entra; SAML optional) | Domain allow-list; **invite-first** (no just-in-time provisioning unless Super Admin enables it per domain); roles still assigned inside Admin; IdP MFA claims honoured only if explicitly configured |
| Email OTP / magic link | **Disabled** for sign-in (phishable). Allowed only inside recovery flows |

### 5.3 Password policy (defaults; Super Admin can tighten)

- Minimum 12 characters, maximum ≥ 128, all Unicode and spaces allowed, **no composition rules** (NIST SP 800-63B). Strength meter (zxcvbn).
- **Breached-password check** via the HIBP k-anonymity range API (only a hash prefix leaves the server). If the service is unreachable: allow, log a warning, re-check at next login.
- No reuse of the last 5 passwords. No forced periodic rotation; force a reset on suspected compromise.
- **Hashing:** Argon2id with OWASP-recommended parameters (≥ 19 MiB memory, ≥ 2 iterations, parallelism 1), or scrypt (N=2^17, r=8, p=1) if that is the auth library default. Benchmark inside a Vercel Function and tune to roughly 150–300 ms. Per-user salt. Optional pepper from a versioned secret.
- Changing a password revokes all other sessions and emails the user.

### 5.4 MFA

- TOTP enrolment: QR + manual key, **verify a code before activation**. 10 single-use backup codes (stored hashed; regenerating invalidates the old set). Passkey enrolment. Warn if only one factor is registered.
- "Remember this device" is **off by default**. If Super Admin enables it: max 7 days, signed `HttpOnly` cookie bound to a device hash, revocable, **never available to Super Admin accounts**.
- **MFA reset** is allowed only for a Super Admin, with step-up **and** approval from a second Super Admin (when more than one exists). It invalidates sessions, notifies the user and is audited.

### 5.5 Login protections

- **Generic errors** (no user enumeration) and **constant-time** behaviour: hash a dummy password for unknown emails.
- **Rate limits:** per IP (default 20 attempts / 10 min) and per account (5 failures / 15 min with progressive delay). Temporary lock for 15 min after 10 failures; Super Admin can unlock. Global login-flood alert.
- **BotID** (or Turnstile) on login, forgot-password and invite-accept.
- **New device / new location** → email notification + security event; optional impossible-travel rule → force step-up.
- **Access conditions** (global and per role, configurable): IP allow-list, country allow/deny, time window (e.g. 08:00–22:00 local). Checked coarsely in `proxy.ts` and **authoritatively inside `can()`**.
- **Max concurrent sessions** per admin (default 3, configurable). The oldest session is revoked.

### 5.6 Sessions

- **Opaque** random 256-bit token; store only its **SHA-256 hash**. Server-side session row in Postgres with a Redis read-through cache. **Not a JWT-as-session** (must be instantly revocable).
- Cookie: `__Host-` prefix (`Secure`, `Path=/`, no `Domain`), `HttpOnly`, `Secure`, `SameSite=Lax`. Nothing sensitive inside it. Verify the final cookie attributes in an automated test.
- Timeouts (configurable per role): **idle 30 min** (Super Admin 15 min), **absolute 12 h** (Super Admin 8 h). `last_active_at` updates are throttled (≤ 1 write/min/session).
- **Rotate** the session on login, step-up, password change, MFA change and role change.
- Session record: id hash, user, created, last active, idle/absolute expiry, IP, parsed UA, device id, coarse geo, `mfa_verified_at`, `step_up_at`, `revoked_at/by/reason`.
- **Revocation is immediate** (DB flag + Redis tombstone) on: suspension, role removal, password reset, MFA reset, "log out everywhere", or admin-initiated revoke.
- Do not hard-bind sessions to IP (mobile networks change IP). Use **risk signals** (UA change, geo jump) → step-up instead.
- **CSRF:** `SameSite=Lax` + `Origin`/`Host` verification on every mutation. Server Actions verify origin; **Route Handlers MUST verify `Origin` against `trustedOrigins`** and non-action mutating routes also require an anti-CSRF token.

### 5.7 Step-up authentication

Permissions flagged `sensitive` require a fresh re-authentication (password / passkey / TOTP) within `step_up_window` (default 10 min, configurable). `STEP_UP_REQUIRED` opens a modal; on success the session's `step_up_at` is set and the **original action is retried automatically with the same idempotency key**.

Always step-up for: role/permission changes, creating or promoting a Super Admin, MFA reset, security-policy changes, PII export, purge / hard delete, bulk delete, API-key creation, secrets, maintenance mode, impersonation start.

### 5.8 Invitations

- Token: 256-bit random, **store the hash**, expires in 72 h (configurable), **single-use consumed atomically** (`UPDATE … WHERE used_at IS NULL AND expires_at > now() RETURNING …`), bound to the invited email and pre-assigned role(s).
- Invitee sees who invited them and which role they receive. Invites can be resent/revoked; creation and acceptance are rate-limited.
- On accept: set password or passkey → **forced MFA enrolment** → land in the app.
- An inviter can never invite above their own rank (§6.4).

### 5.9 Recovery

- Forgot password: always the same generic response; token single-use, 15 min, stored hashed, rate-limited. After reset: all sessions revoked; MFA still required.
- Lost MFA device: backup codes, else the MFA-reset flow (§5.4).
- Every recovery step emits a security event.

### 5.10 Security events (all logged, searchable in §7.7)

Login success/failure, MFA success/failure, lockout/unlock, password change/reset, MFA enrol/remove, passkey add/remove, session revoke, new device/location, invite create/accept/revoke, role change, API-key events, impersonation start/stop, permission-denied spikes.
