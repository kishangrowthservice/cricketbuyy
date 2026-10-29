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
  X,
  ChevronRight
} from 'lucide-react';

export default function AdminAppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased selection:bg-rose-100 selection:text-[#941b2c]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-40 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 bg-white">
          <div className="w-9 h-9 rounded-xl bg-[#941b2c] flex items-center justify-center shadow-xs">
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
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#941b2c] flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">root@cricketbuyy.com</div>
              </div>
            </div>
            <Link href="/login" className="text-slate-400 hover:text-[#941b2c] p-2 transition-colors rounded-lg hover:bg-slate-200/60" title="Log Out">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Brand Header with Close Button */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#941b2c] flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-slate-900">CRICKETBUYY</div>
              <div className="text-[9px] text-[#941b2c] font-bold uppercase tracking-wider">Super Admin</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-rose-50 text-[#941b2c] border border-rose-200 font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#941b2c]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#941b2c]" />}
              </Link>
            );
          })}
        </nav>

        {/* Drawer User Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#941b2c] flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">root@cricketbuyy.com</div>
              </div>
            </div>
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-rose-700 hover:text-[#941b2c] p-2 transition-colors rounded-lg hover:bg-rose-100/60" 
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile Drawer Trigger (min 42px touch size) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Title */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#941b2c] flex items-center justify-center shadow-xs">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-slate-900">
                CRICKET<span className="text-[#941b2c]">BUYY</span>
              </span>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customers, bets, markets..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Environment Status Badge */}
            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Production Active</span>
              <span className="sm:hidden">Prod</span>
            </span>

            {/* Notifications Button */}
            <button 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center relative cursor-pointer transition-colors" 
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#941b2c]" />
            </button>
          </div>
        </header>

        {/* Mobile Search Bar Dropdown */}
        {mobileSearchOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-3.5 py-2.5 shadow-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search customers, bets, markets..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
              />
            </div>
          </div>
        )}

        {/* Fluid Page Content with Responsive Padding */}
        <main className="px-3.5 py-4 sm:px-6 sm:py-6 flex-1 bg-slate-50 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
