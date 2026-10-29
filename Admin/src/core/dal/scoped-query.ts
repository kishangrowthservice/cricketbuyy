import { SQL, eq, inArray, and } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { DataScope } from '../rbac/evaluator';

export interface ScopeOptions {
  scope: DataScope;
  actorId: string;
  teamIds?: string[];
}

export class DalScopingEngine {
  /**
   * Builds an appropriate SQL filter condition based on the actor's RBAC scope
   */
  public static buildScopeCondition<TCol extends PgColumn>(
    ownerColumn: TCol,
    options: ScopeOptions
  ): SQL | undefined {
    switch (options.scope) {
      case 'all':
        // No restriction applied
        return undefined;

      case 'team':
        if (options.teamIds && options.teamIds.length > 0) {
          const validIds = [...new Set([options.actorId, ...options.teamIds])];
          return inArray(ownerColumn, validIds);
        }
        // Fallback to own if no team members configured
        return eq(ownerColumn, options.actorId);

      case 'own':
      default:
        return eq(ownerColumn, options.actorId);
    }
  }

  /**
   * Filters in-memory arrays based on RBAC scope (useful for pre-filtered or cached sets)
   */
  public static filterRecordsByScope<T extends Record<string, unknown>>(
    records: T[],
    ownerKey: keyof T,
    options: ScopeOptions
  ): T[] {
    if (options.scope === 'all') {
      return records;
    }

    if (options.scope === 'team') {
      const allowed = new Set([options.actorId, ...(options.teamIds || [])]);
      return records.filter((r) => allowed.has(String(r[ownerKey])));
    }

    // 'own'
    return records.filter((r) => String(r[ownerKey]) === options.actorId);
  }
}

