import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cricketbuyy Admin Portal — Super Admin & RBAC Control',
  description: 'Production-grade enterprise administration system for Cricketbuyy.com'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-rose-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
