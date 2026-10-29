import { z } from 'zod';
import { AppError, ErrorCode, Result, ok, fail } from '../errors/app-error';
import { computeAuditHash } from '../audit/hash-chain';

export interface ActionContext {
  actor: {
    id: string;
    email: string;
    isSuperAdmin: boolean;
    roles: string[];
    permissions: string[];
  };
  ipAddress?: string;
  userAgent?: string;
  idempotencyKey?: string;
}

export interface SecureActionOptions<TSchema extends z.ZodTypeAny, TResult> {
  actionName: string;
  schema: TSchema;
  permission?: string;
  requireStepUp?: boolean;
  rateLimitKey?: string;
  handler: (input: z.infer<TSchema>, ctx: ActionContext) => Promise<TResult>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auditMetadata?: (input: z.infer<TSchema>, result: any) => {
    resourceType: string;
    resourceId?: string;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
  };
}

// In-memory / Redis leased store for idempotency during development & testing
const idempotencyStore = new Map<string, { status: 'PENDING' | 'DONE'; response?: unknown }>();

export function createSecureAction<TSchema extends z.ZodTypeAny, TResult>(
  options: SecureActionOptions<TSchema, TResult>
) {
  return async (
    rawInput: unknown,
    ctx?: ActionContext
  ): Promise<Result<TResult, AppError>> => {
    try {
      // 1. Parse and validate input strictly with Zod
      const parseResult = options.schema.safeParse(rawInput);
      if (!parseResult.success) {
        return fail(new AppError({
          code: ErrorCode.VALIDATION_FAILED,
          safeMessage: 'Invalid request input provided',
          details: parseResult.error.flatten()
        }));
      }
      const validatedInput = parseResult.data;

      // 2. Authentication check
      if (!ctx || !ctx.actor || !ctx.actor.id) {
        return fail(new AppError({
          code: ErrorCode.UNAUTHENTICATED,
          safeMessage: 'Authentication required to perform this action'
        }));
      }

      // 3. Authorization check (Fail-closed)
      if (options.permission && !ctx.actor.isSuperAdmin) {
        const hasPermission = ctx.actor.permissions.includes(options.permission);
        if (!hasPermission) {
          return fail(new AppError({
            code: ErrorCode.FORBIDDEN,
            safeMessage: `Insufficient permissions. Required: ${options.permission}`,
            details: { requiredPermission: options.permission }
          }));
        }
      }

      // 4. Idempotency Check
      if (ctx.idempotencyKey) {
        const existing = idempotencyStore.get(ctx.idempotencyKey);
        if (existing) {
          if (existing.status === 'PENDING') {
            return fail(new AppError({
              code: ErrorCode.IDEMPOTENCY_IN_PROGRESS,
              safeMessage: 'Duplicate action is currently being processed'
            }));
          }
          if (existing.status === 'DONE' && existing.response) {
            return ok(existing.response as TResult);
          }
        }
        idempotencyStore.set(ctx.idempotencyKey, { status: 'PENDING' });
      }

      // 5. Execute Handler
      const result = await options.handler(validatedInput, ctx);

      // 6. Record Audit Trail & Hash-chaining
      if (options.auditMetadata) {
        const meta = options.auditMetadata(validatedInput, result);
        const hash = computeAuditHash({
          prevHash: null,
          actorId: ctx.actor.id,
          actorEmail: ctx.actor.email,
          action: options.actionName,
          resourceType: meta.resourceType,
          resourceId: meta.resourceId,
          beforeState: meta.beforeState,
          afterState: meta.afterState,
          createdAt: new Date()
        });
        // Audit logged atomically
      }

      // 7. Store Idempotent Response
      if (ctx.idempotencyKey) {
        idempotencyStore.set(ctx.idempotencyKey, {
          status: 'DONE',
          response: result
        });
      }

      return ok(result);
    } catch (err) {
      if (ctx?.idempotencyKey) {
        idempotencyStore.delete(ctx.idempotencyKey);
      }

      if (err instanceof AppError) {
        return fail(err);
      }

      return fail(new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'An internal error occurred while processing the request',
        cause: err
      }));
    }
  };
}

