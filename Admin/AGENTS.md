# Agent Working Agreement — Admin Application

**Audience:** AI Coding Agent (Google Antigravity)  
**Location:** `Admin/AGENTS.md`  
**Companion File:** `Admin/docs/ADMIN_SPEC.md`

## 1. Prime Directives
1. **Never modify the main site outside `Admin/`** except approved integration contracts.
2. **Never invent unverified APIs or fake security.** Use real cryptographic primitives, fail-closed authorization, and true DB transactions.
3. **Never write application code before human approval of Phase 0.** Phase 0 produces the Discovery Report, ADRs, and Implementation Plan.
4. **Enforce `secureAction` on every mutation**:
   - Authentication check
   - Fail-closed RBAC (`can(actor, permission, resource, ctx)`)
   - Rate limiting
   - Idempotency key lease & replay
   - Optimistic locking / row versions
   - Atomic audit log + outbox event in the same DB transaction.
5. **No hardcoded bypasses**: Super Admin is an immutable system role with a wildcard grant, evaluated through the same engine and fully audited.
6. **No client-side auth decisions**: The server data-access layer filters all data according to actor scope (`own`, `team`, `all`) and applies field-level masking before returning DTOs.
7. **Strict quality gates**: Zero TypeScript errors (`strict: true`), zero ESLint warnings, 100% passing tests, and no bypassed checks.
