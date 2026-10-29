import React from 'react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
