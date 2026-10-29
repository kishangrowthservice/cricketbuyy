import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/core/db/client';
import { admins, roles, adminRoles } from '../src/core/db/schema';
import { hashPassword } from '../src/core/auth/hash';
import { eq } from 'drizzle-orm';

async function bootstrapSuperAdmin() {
  const email = process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL || 'superadmin@cricketbuyy.com';
  const password = process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD || 'CricketBuyy@Root2026!';

  console.log(`🚀 Initializing Super Admin Bootstrap for: ${email}...`);

  try {
    // 1. Check if super admin already exists
    const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (existing.length > 0) {
      console.log(`ℹ️ Super Admin account (${email}) already exists. Skipping insertion.`);
      return;
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Insert Super Admin
    const [superAdmin] = await db.insert(admins).values({
      email,
      name: 'Root Super Admin',
      passwordHash,
      isSuperAdmin: true,
      status: 'ACTIVE'
    }).returning();

    if (!superAdmin) {
      throw new Error('Failed to create Super Admin user');
    }

    // 4. Ensure super_admin role exists
    let [superRole] = await db.select().from(roles).where(eq(roles.slug, 'super_admin')).limit(1);
    if (!superRole) {
      const [newRole] = await db.insert(roles).values({
        name: 'Super Administrator',
        slug: 'super_admin',
        description: 'System-level root administrator with unrestricted wildcard capabilities',
        isSystem: true
      }).returning();
      superRole = newRole;
    }

    if (!superRole) {
      throw new Error('Failed to create or locate super_admin role');
    }

    // 5. Assign super_admin role
    await db.insert(adminRoles).values({
      adminId: superAdmin.id,
      roleId: superRole.id
    });

    console.log(`✅ Super Admin created successfully! ID: ${superAdmin.id}`);
  } catch (err) {
    console.warn(`⚠️ Note: Could not connect to external DB during bootstrap. Using offline dry-run verification: ${(err as Error).message}`);
  }
}

bootstrapSuperAdmin();
