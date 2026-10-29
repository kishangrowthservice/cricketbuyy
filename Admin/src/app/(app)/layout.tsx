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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-40 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-[#941b2c] flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-slate-900">CRICKETBUYY</div>
            <div className="text-[10px] text-[#941b2c] font-bold uppercase tracking-wider">Super Admin Console</div>
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
                    ? 'bg-rose-50 text-[#941b2c] border border-rose-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#941b2c]' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#941b2c] flex items-center justify-center text-xs font-bold text-white shadow-xs">
                SA
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">root@cricketbuyy.com</div>
              </div>
            </div>
            <Link href="/login" className="text-slate-400 hover:text-[#941b2c] p-1.5 transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customers, bets, matches..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Production Active
            </span>
            <button className="p-2 text-slate-500 hover:text-slate-800 relative cursor-pointer" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#941b2c]" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-md">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-rose-50 text-[#941b2c] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="p-6 flex-1 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
