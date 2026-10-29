export type DataScope = 'all' | 'team' | 'own';

export interface EvaluatorPermission {
  action: string;
  scope: DataScope;
  fieldMask?: string[] | null;
}

export interface EvaluatorRole {
  id: string;
  slug: string;
  name?: string;
  permissions: EvaluatorPermission[];
}

export interface EvaluatorActor {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  roles: EvaluatorRole[];
}

export interface CanResult {
  granted: boolean;
  scope: DataScope;
  fieldMask: string[];
  reason?: string;
}

export interface CanContext {
  targetResourceId?: string;
  ownerId?: string;
  teamIds?: string[];
}

/**
 * Core database-driven RBAC evaluator
 * Follows fail-closed least-privilege principles.
 */
export function can(
  actor: EvaluatorActor | null | undefined,
  requiredAction: string,
  _resource?: string,
  ctx?: CanContext
): CanResult {
  // 1. Fail-closed on missing actor
  if (!actor || !actor.id) {
    return {
      granted: false,
      scope: 'own',
      fieldMask: [],
      reason: 'No authenticated actor present'
    };
  }

  // 2. Super Admin Wildcard Evaluator
  if (actor.isSuperAdmin) {
    return {
      granted: true,
      scope: 'all',
      fieldMask: [],
      reason: 'Granted via Super Admin root wildcard'
    };
  }

  // 3. Match permissions across assigned active roles
  const matchingPerms: EvaluatorPermission[] = [];

  for (const role of actor.roles) {
    for (const perm of role.permissions) {
      if (perm.action === '*' || perm.action === requiredAction) {
        matchingPerms.push(perm);
      } else if (perm.action.endsWith(':*')) {
        const prefix = perm.action.slice(0, -1); // e.g. "customer:"
        if (requiredAction.startsWith(prefix)) {
          matchingPerms.push(perm);
        }
      }
    }
  }

  if (matchingPerms.length === 0) {
    return {
      granted: false,
      scope: 'own',
      fieldMask: [],
      reason: `Actor lacks required permission: ${requiredAction}`
    };
  }

  // 4. Resolve highest data scope across matching roles: 'all' > 'team' > 'own'
  let resolvedScope: DataScope = 'own';
  if (matchingPerms.some((p) => p.scope === 'all')) {
    resolvedScope = 'all';
  } else if (matchingPerms.some((p) => p.scope === 'team')) {
    resolvedScope = 'team';
  }

  // 5. Context-aware ownership check if context provided and scope < 'all'
  if (ctx && resolvedScope !== 'all') {
    if (resolvedScope === 'own') {
      if (ctx.ownerId && ctx.ownerId !== actor.id) {
        return {
          granted: false,
          scope: 'own',
          fieldMask: [],
          reason: 'Access denied: permission is scoped to own resources only'
        };
      }
    } else if (resolvedScope === 'team') {
      if (ctx.ownerId && ctx.ownerId !== actor.id && ctx.teamIds && !ctx.teamIds.includes(ctx.ownerId)) {
        return {
          granted: false,
          scope: 'team',
          fieldMask: [],
          reason: 'Access denied: resource is outside actor team scope'
        };
      }
    }
  }

  // 6. Merge field masks
  const fieldMaskSet = new Set<string>();
  for (const perm of matchingPerms) {
    if (perm.fieldMask && Array.isArray(perm.fieldMask)) {
      for (const field of perm.fieldMask) {
        fieldMaskSet.add(field);
      }
    }
  }

  return {
    granted: true,
    scope: resolvedScope,
    fieldMask: Array.from(fieldMaskSet),
    reason: `Granted with scope ${resolvedScope}`
  };
}

