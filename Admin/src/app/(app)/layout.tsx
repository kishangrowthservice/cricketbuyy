'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Users, 
  UserCheck, 
  KeyRound, 
  Trophy, 
  TrendingUp, 
  Wallet, 
  FileText, 
  Sliders, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X
} from 'lucide-react';

export default function AdminAppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard Overview', href: '/', icon: TrendingUp },
    { name: 'Administrators', href: '/admins', icon: UserCheck },
    { name: 'Roles & RBAC', href: '/roles', icon: KeyRound },
    { name: 'Customers & Wallets', href: '/customers', icon: Users },
    { name: 'Sports & Markets', href: '/markets', icon: Trophy },
    { name: 'Live Bets & Risk', href: '/bets', icon: TrendingUp },
    { name: 'Financial Ledger', href: '/financial', icon: Wallet },
    { name: 'Audit Logs', href: '/audit', icon: FileText },
    { name: 'System Settings', href: '/settings', icon: Sliders }
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md z-40">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-950 to-rose-900 border border-rose-700/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white">CRICKETBUYY</div>
            <div className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Super Admin Console</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-900/60 border border-rose-700/50 flex items-center justify-center text-xs font-bold text-rose-200">
                SA
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Super Admin</div>
                <div className="text-[10px] text-slate-400">root@cricketbuyy.com</div>
              </div>
            </div>
            <Link href="/login" className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customers, bets, matches..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/70 border border-emerald-800/80 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Production Active
            </span>
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

