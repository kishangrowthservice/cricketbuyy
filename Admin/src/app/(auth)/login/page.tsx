'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { loginAction } from '../../../modules/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@cricketbuyy.com');
  const [password, setPassword] = useState('CricketBuyy@Root2026!');
  const [totpCode, setTotpCode] = useState('');
  const [requires2fa, setRequires2fa] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await loginAction({
        email,
        password,
        totpCode: requires2fa ? totpCode : undefined
      });

      if (!res.success) {
        if ('requires2fa' in res && res.requires2fa) {
          setRequires2fa(true);
          setErrorMessage('');
        } else {
          setErrorMessage(res.error || 'Authentication failed');
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push('/');
      router.refresh();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#941b2c] border border-rose-300 shadow-lg shadow-rose-900/10 mb-1">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cricketbuyy <span className="text-[#941b2c]">Admin</span>
        </h1>
        <p className="text-xs text-slate-500">
          Restricted administrative access. All sessions are monitored and cryptographically audited.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!requires2fa ? (
          <>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cricketbuyy.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400 font-medium">MFA Protected</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] transition-colors"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Two-Factor Authentication Required
            </div>
            <p className="text-[11px] text-slate-600">
              Enter the 6-digit code from your Google Authenticator or hardware token.
            </p>
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#941b2c]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] transition-all shadow-md shadow-rose-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Authenticating...</span>
          ) : requires2fa ? (
            <>
              <span>Verify &amp; Launch Session</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Proceed to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
