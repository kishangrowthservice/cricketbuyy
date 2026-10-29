# ADR 0004: Concurrency Guarantees, Optimistic Locking, and Audit Integrity

## Status
Accepted

## Context
High-volume betting exchanges experience concurrent balance modifications, odds updates, and simultaneous admin reviews. We must guarantee zero lost updates, zero double processing, and tamper-evident audit history.

## Decision
1. **Optimistic Locking via Row Versions**:
   - Every mutable entity table includes an integer `version` column.
   - Updates perform `UPDATE table SET ..., version = version + 1 WHERE id = :id AND version = :expectedVersion`.
   - If 0 rows are affected, a `CONFLICT_VERSION` (HTTP 409) is returned, prompting the admin with a visual diff dialog to review concurrent modifications before retrying.
2. **Pessimistic Row Locks for Critical Financial Transactions**:
   - Direct wallet balance adjustments and bet payouts use PostgreSQL `SELECT ... FOR UPDATE` inside `REPEATABLE READ` or `SERIALIZABLE` transactions with short statement timeouts (5s).
3. **Idempotency Lease**:
   - Mutating requests must supply an `Idempotency-Key` header (or one generated client-side).
   - Redis leases the key using `SET NX PX 30000`. If duplicate requests arrive simultaneously, they receive `IDEMPOTENCY_IN_PROGRESS`.
   - On completion, the response is stored in Redis for 24 hours, returning the cached payload on retries.
4. **Append-Only Tamper-Evident Audit Log**:
   - Stored in `admin.audit_logs`.
   - Each entry contains `id`, `actor_id`, `actor_role`, `action`, `resource_type`, `resource_id`, `before_state`, `after_state`, `ip_address`, `user_agent`, `prev_hash`, and `entry_hash` (SHA-256 hash-chaining).
   - Written in the **exact same database transaction** as the underlying business change.
   - Periodic verification jobs (`scripts/audit-verify.ts`) traverse the hash chain to confirm cryptographic immutability.

## Consequences
- Guaranteed concurrency safety under heavy administrative load.
- Provable defense against race conditions and internal fraud.

