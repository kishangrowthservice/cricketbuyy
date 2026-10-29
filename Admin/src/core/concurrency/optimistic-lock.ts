import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

export interface VersionedEntity {
  id: string;
  version: number;
}

export class OptimisticLockEngine {
  /**
   * Asserts that the entity's current version matches the caller's expected version.
   * Throws CONFLICT_VERSION if a concurrent modification has occurred.
   */
  public static assertVersion(
    currentVersion: number,
    expectedVersion: number,
    entityName: string = 'Record'
  ): void {
    if (currentVersion !== expectedVersion) {
      throw new AppError({
        code: ErrorCode.CONFLICT_VERSION,
        safeMessage: `Concurrency collision on ${entityName}: Current version is v${currentVersion}, but expected v${expectedVersion}. Please reload data and retry.`,
        details: {
          currentVersion,
          expectedVersion,
          entityName
        }
      });
    }
  }

  /**
   * Calculates next version integer
   */
  public static nextVersion(currentVersion: number): number {
    return currentVersion + 1;
  }
}

