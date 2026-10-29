import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/core/db/client';
import { permissions, roles, rolePermissions } from '../src/core/db/schema';
import { SYSTEM_PERMISSIONS } from '../src/core/rbac/registry';
import { eq } from 'drizzle-orm';

interface DefaultRoleSpec {
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissions: Array<{
    action: string;
    scope: 'all' | 'team' | 'own';
    fieldMask?: string[];
  }>;
}

const DEFAULT_ROLES: DefaultRoleSpec[] = [
  {
    name: 'Super Administrator',
    slug: 'super_admin',
    description: 'System root administrator with unrestricted wildcard capabilities (*)',
    isSystem: true,
    permissions: [{ action: '*', scope: 'all' }]
  },
  {
    name: 'Operations Administrator',
    slug: 'admin',
    description: 'General platform operations manager for customer and market operations',
    isSystem: true,
    permissions: [
      { action: 'admin:read', scope: 'all' },
      { action: 'role:read', scope: 'all' },
      { action: 'customer:*', scope: 'all' },
      { action: 'wallet:read', scope: 'all' },
      { action: 'wallet:deposit', scope: 'all' },
      { action: 'wallet:withdraw', scope: 'all' },
      { action: 'market:*', scope: 'all' },
      { action: 'bet:*', scope: 'all' },
      { action: 'risk:read', scope: 'all' },
      { action: 'audit:read', scope: 'all' },
      { action: 'approval:read', scope: 'all' },
      { action: 'approval:create', scope: 'all' },
      { action: 'approval:review', scope: 'all' }
    ]
  },
  {
    name: 'Risk & Trading Manager',
    slug: 'risk_manager',
    description: 'Manages market odds, liabilities, voiding, and exposure thresholds',
    isSystem: true,
    permissions: [
      { action: 'market:*', scope: 'all' },
      { action: 'bet:*', scope: 'all' },
      { action: 'risk:*', scope: 'all' },
      { action: 'customer:read', scope: 'all' }
    ]
  },
  {
    name: 'Finance & Banking Officer',
    slug: 'finance_officer',
    description: 'Processes customer deposits, withdrawals, and balances',
    isSystem: true,
    permissions: [
      { action: 'wallet:*', scope: 'all' },
      { action: 'customer:read', scope: 'all' },
      { action: 'approval:create', scope: 'all' }
    ]
  },
  {
    name: 'Compliance & KYC Officer',
    slug: 'compliance_officer',
    description: 'Verifies customer identity and KYC documents with unmasked PII access',
    isSystem: true,
    permissions: [
      { action: 'customer:read', scope: 'all' },
      { action: 'customer:read_pii', scope: 'all' },
      { action: 'customer:block', scope: 'all' },
      { action: 'audit:read', scope: 'all' },
      { action: 'audit:export', scope: 'all' }
    ]
  },
  {
    name: 'Customer Support Agent',
    slug: 'support_agent',
    description: 'Assists customers with ticket resolution with masked PII protections',
    isSystem: true,
    permissions: [
      { action: 'customer:read', scope: 'team', fieldMask: ['phone', 'email', 'bankAccount'] },
      { action: 'customer:update', scope: 'team' },
      { action: 'bet:read', scope: 'team' }
    ]
  },
  {
    name: 'Read-Only Auditor',
    slug: 'auditor',
    description: 'Compliance auditor with read-only access and cryptographic verification',
    isSystem: true,
    permissions: [
      { action: 'audit:read', scope: 'all' },
      { action: 'audit:verify_integrity', scope: 'all' },
      { action: 'customer:read', scope: 'all' },
      { action: 'bet:read', scope: 'all' },
      { action: 'market:read', scope: 'all' }
    ]
  }
];

export async function seedRbacRegistry() {
  console.log('🛡️ Starting RBAC Permission & Role Seeding...');

  try {
    // 1. Seed Permissions
    console.log(`📌 Upserting ${SYSTEM_PERMISSIONS.length} system permissions...`);
    const permMap = new Map<string, string>(); // action -> id

    for (const p of SYSTEM_PERMISSIONS) {
      const existing = await db
        .select()
        .from(permissions)
        .where(eq(permissions.action, p.action))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        permMap.set(p.action, existing[0].id);
      } else {
        const [inserted] = await db
          .insert(permissions)
          .values({
            action: p.action,
            resource: p.resource,
            description: p.description
          })
          .returning();
        if (inserted) {
          permMap.set(p.action, inserted.id);
        }
      }
    }

    // 2. Seed Default Roles and Assignments
    for (const roleDef of DEFAULT_ROLES) {
      console.log(`👤 Syncing role: ${roleDef.name} (${roleDef.slug})...`);
      let roleId: string;

      const existingRole = await db
        .select()
        .from(roles)
        .where(eq(roles.slug, roleDef.slug))
        .limit(1);

      if (existingRole.length > 0 && existingRole[0]) {
        roleId = existingRole[0].id;
      } else {
        const [insertedRole] = await db
          .insert(roles)
          .values({
            name: roleDef.name,
            slug: roleDef.slug,
            description: roleDef.description,
            isSystem: roleDef.isSystem
          })
          .returning();
        if (!insertedRole) continue;
        roleId = insertedRole.id;
      }

      // Sync role permissions
      for (const pDef of roleDef.permissions) {
        if (pDef.action === '*') {
          // Super admin wildcard role doesn't need explicit granular permission rows
          continue;
        }

        // Handle wildcard prefixes like "customer:*"
        const matchedPermActions = pDef.action.endsWith(':*')
          ? SYSTEM_PERMISSIONS.filter((sp) => sp.action.startsWith(pDef.action.slice(0, -1))).map(
              (sp) => sp.action
            )
          : [pDef.action];

        for (const actionName of matchedPermActions) {
          const permId = permMap.get(actionName);
          if (!permId) continue;

          try {
            await db
              .insert(rolePermissions)
              .values({
                roleId,
                permissionId: permId,
                scope: pDef.scope,
                fieldMask: pDef.fieldMask || null
              })
              .onConflictDoNothing();
          } catch {
            // Safe ignore on existing
          }
        }
      }
    }

    console.log('✅ RBAC Registry & Roles successfully seeded!');
  } catch (err) {
    console.warn(`⚠️ Note: DB connection skipped during offline seed run: ${(err as Error).message}`);
  }
}

// Run directly if invoked from CLI
if (process.argv[1]?.includes('seed-rbac')) {
  seedRbacRegistry();
}
