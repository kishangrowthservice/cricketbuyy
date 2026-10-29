export interface SystemPermissionDef {
  action: string;
  resource: string;
  category: 'System' | 'Users & Staff' | 'Customers' | 'Financial & Wallet' | 'Markets & Trading' | 'Risk & Limits' | 'Audit & Compliance' | 'Settings';
  description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // System & Staff
  { action: 'admin:read', resource: 'admin', category: 'Users & Staff', description: 'View admin staff profiles and lists' },
  { action: 'admin:create', resource: 'admin', category: 'Users & Staff', description: 'Create new administrator accounts' },
  { action: 'admin:update', resource: 'admin', category: 'Users & Staff', description: 'Update admin staff information and status' },
  { action: 'admin:delete', resource: 'admin', category: 'Users & Staff', description: 'Suspend or archive admin staff accounts' },
  { action: 'admin:reset_password', resource: 'admin', category: 'Users & Staff', description: 'Trigger password resets for admin staff' },

  // Roles & RBAC
  { action: 'role:read', resource: 'role', category: 'Users & Staff', description: 'View roles, permissions and assignments' },
  { action: 'role:create', resource: 'role', category: 'Users & Staff', description: 'Create new dynamic custom roles' },
  { action: 'role:update', resource: 'role', category: 'Users & Staff', description: 'Modify permissions and scopes for custom roles' },
  { action: 'role:delete', resource: 'role', category: 'Users & Staff', description: 'Delete custom roles' },
  { action: 'role:assign', resource: 'role', category: 'Users & Staff', description: 'Assign or revoke roles for admin staff' },

  // Customers
  { action: 'customer:read', resource: 'customer', category: 'Customers', description: 'View customer accounts and balances' },
  { action: 'customer:create', resource: 'customer', category: 'Customers', description: 'Register new customer accounts' },
  { action: 'customer:update', resource: 'customer', category: 'Customers', description: 'Update customer profiles and status' },
  { action: 'customer:block', resource: 'customer', category: 'Customers', description: 'Suspend or ban customer betting accounts' },
  { action: 'customer:read_pii', resource: 'customer', category: 'Customers', description: 'View unmasked customer PII (phone, email, KYC)' },
  { action: 'customer:impersonate', resource: 'customer', category: 'Customers', description: 'Impersonate customer account for support' },

  // Financial & Wallet
  { action: 'wallet:read', resource: 'wallet', category: 'Financial & Wallet', description: 'View customer wallets and transactions' },
  { action: 'wallet:deposit', resource: 'wallet', category: 'Financial & Wallet', description: 'Credit funds to customer wallet' },
  { action: 'wallet:withdraw', resource: 'wallet', category: 'Financial & Wallet', description: 'Approve or process customer withdrawals' },
  { action: 'wallet:adjust', resource: 'wallet', category: 'Financial & Wallet', description: 'Manual ledger balance adjustment' },
  { action: 'wallet:approve_large', resource: 'wallet', category: 'Financial & Wallet', description: 'Dual-custody approval for large transactions' },

  // Markets & Trading
  { action: 'market:read', resource: 'market', category: 'Markets & Trading', description: 'View sports events and betting markets' },
  { action: 'market:create', resource: 'market', category: 'Markets & Trading', description: 'Create or schedule sports markets' },
  { action: 'market:update', resource: 'market', category: 'Markets & Trading', description: 'Update market odds, parameters, and status' },
  { action: 'market:suspend', resource: 'market', category: 'Markets & Trading', description: 'Suspend in-play or emergency market trading' },
  { action: 'market:settle', resource: 'market', category: 'Markets & Trading', description: 'Settle market outcomes and distribute winnings' },
  { action: 'market:void', resource: 'market', category: 'Markets & Trading', description: 'Void markets and refund placed bets' },

  // Bets & Slips
  { action: 'bet:read', resource: 'bet', category: 'Markets & Trading', description: 'View placed bet slips and history' },
  { action: 'bet:cancel', resource: 'bet', category: 'Markets & Trading', description: 'Cancel unmatched bets' },
  { action: 'bet:void', resource: 'bet', category: 'Markets & Trading', description: 'Void disputed or fraudulent bets' },

  // Risk & Limits
  { action: 'risk:read', resource: 'risk', category: 'Risk & Limits', description: 'View market liabilities and exposure alerts' },
  { action: 'risk:update_limits', resource: 'risk', category: 'Risk & Limits', description: 'Configure max bet and exposure limits' },
  { action: 'risk:block_exposure', resource: 'risk', category: 'Risk & Limits', description: 'Instantly cut exposure across books' },

  // Audit & Compliance
  { action: 'audit:read', resource: 'audit', category: 'Audit & Compliance', description: 'View tamper-evident audit logs' },
  { action: 'audit:export', resource: 'audit', category: 'Audit & Compliance', description: 'Export compliance reports and audit archives' },
  { action: 'audit:verify_integrity', resource: 'audit', category: 'Audit & Compliance', description: 'Run cryptographic hash-chain verification' },

  // Settings & System
  { action: 'setting:read', resource: 'setting', category: 'Settings', description: 'View global platform and branding configuration' },
  { action: 'setting:update', resource: 'setting', category: 'Settings', description: 'Update branding, notifications, and integration settings' },
  { action: 'setting:maintenance_toggle', resource: 'setting', category: 'Settings', description: 'Toggle site maintenance mode' },

  // Dual-Custody Approvals
  { action: 'approval:read', resource: 'approval', category: 'System', description: 'View pending and historic approval requests' },
  { action: 'approval:create', resource: 'approval', category: 'System', description: 'Submit 4-eyes dual-custody approval requests' },
  { action: 'approval:review', resource: 'approval', category: 'System', description: 'Approve or reject dual-custody requests' }
];

export type ActionName = typeof SYSTEM_PERMISSIONS[number]['action'];
