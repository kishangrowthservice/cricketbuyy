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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-[#941b2c] selection:text-white">
        {children}
      </body>
    </html>
  );
}
