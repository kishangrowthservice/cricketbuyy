import { ErrorCode } from './codes';
import type { ErrorCodeType } from './codes';

export { ErrorCode };
export type { ErrorCodeType };

export interface AppErrorOptions {
  code: ErrorCodeType;
  httpStatus?: number;
  safeMessage: string;
  details?: Record<string, unknown> | null;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;
  public readonly safeMessage: string;
  public readonly details?: Record<string, unknown> | null;

  constructor(options: AppErrorOptions) {
    super(options.safeMessage);
    this.name = 'AppError';
    this.code = options.code;
    this.safeMessage = options.safeMessage;
    this.details = options.details;
    this.httpStatus = options.httpStatus || this.mapDefaultHttpStatus(options.code);
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  private mapDefaultHttpStatus(code: ErrorCodeType): number {
    switch (code) {
      case ErrorCode.VALIDATION_FAILED: return 400;
      case ErrorCode.UNAUTHENTICATED: return 401;
      case ErrorCode.FORBIDDEN:
      case ErrorCode.STEP_UP_REQUIRED:
      case ErrorCode.APPROVAL_REQUIRED: return 403;
      case ErrorCode.NOT_FOUND: return 404;
      case ErrorCode.CONFLICT_VERSION:
      case ErrorCode.CONFLICT_STATE:
      case ErrorCode.IDEMPOTENCY_IN_PROGRESS: return 409;
      case ErrorCode.RATE_LIMITED: return 429;
      default: return 500;
    }
  }
}

export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function fail<E extends AppError = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}
