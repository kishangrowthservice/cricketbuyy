# ADR 0003: Database-Driven RBAC Engine Architecture

## Status
Accepted

## Context
The requirement calls for two top-level roles — **Super Admin** and **Admin** — on top of a **complete, database-driven RBAC** system supporting custom roles, fine-grained permissions, scoping, field-level masking, temporary delegation, two-person approvals, and audited impersonation.

## Decision
We implement an in-house database-driven RBAC engine with the following architecture:

1. **Top-Level Roles**:
   - `super_admin`: Immutable system role assigned to designated root administrators. Grants wildcard capability `*` across all resources. Evaluated through the exact same audit and pipeline mechanisms (no hardcoded `if (role === 'super_admin')` bypasses in feature code).
   - `admin`: High-privilege operational role capable of managing business domains, viewing reports, and supervising support staff, but restricted from modifying root security policies or deleting audit records.
2. **Dynamic Custom Roles & Scopes**:
   - Stored in `admin.roles`, `admin.permissions`, `admin.role_permissions`, and `admin.user_roles`.
   - Permissions format: `resource:action` (e.g. `customer:read`, `customer:adjust_balance`, `market:settle`, `bet:void`).
   - Scopes: `all` (unrestricted), `team` (subordinate agents/staff), `own` (self-created records only).
3. **Data-Access Layer Enforcement**:
   - Filter injection: The Data Access Layer automatically appends `WHERE customer.assigned_agent_id = :actorId` when scope is `team` or `own`.
   - Field Masking: Sensitive fields (phone numbers, email addresses, bank accounts) are masked based on `field_permissions` unless explicitly unmasked by a user holding `customer:read_pii`.
4. **Step-Up MFA & Two-Person Approvals**:
   - High-risk operations (manual balance adjustments over ₹50,000, market settlement override, role permission modification) require:
     * Fresh Step-Up TOTP/Passkey re-authentication within 10 minutes.
     * Dual-custody approval flow (`admin.approval_requests`): Initiator cannot be the approver.
5. **Audited Impersonation**:
   - When an admin views a customer account, a time-limited token is generated with a mandatory reason prompt. All actions during impersonation carry both the customer context and the admin actor ID in the audit trail.

## Consequences
- Highly auditable and compliant with enterprise security standards.
- Granular delegation prevents accidental catastrophic actions by lower-tier admins.

