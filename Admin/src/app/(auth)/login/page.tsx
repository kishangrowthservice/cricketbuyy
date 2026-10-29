'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Mail, Key, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In Phase 1 demonstration / dev flow, route to dashboard if valid admin format
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Please enter a valid administrator email and password.');
      }

      // Successful client redirection to app dashboard
      window.location.href = '/';
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-950 to-rose-900 border border-rose-700/50 shadow-lg shadow-rose-950/50 mb-3">
          <Shield className="w-7 h-7 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">CRICKETBUYY</h1>
        <p className="text-xs uppercase tracking-widest font-semibold text-rose-400 mt-0.5">Admin Control Center</p>
        <p className="text-xs text-slate-400 mt-2">Authorized Administrative Access Only</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@cricketbuyy.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Master Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            2FA Security Code <span className="text-slate-500">(TOTP, if enabled)</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6-digit code (e.g. 123456)"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-gradient-to-r from-rose-800 to-rose-700 hover:from-rose-700 hover:to-rose-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
        <span className="text-xs text-slate-500">
          Default Super Admin: <code className="text-slate-400">superadmin@cricketbuyy.com</code>
        </span>
      </div>
    </div>
  );
}

