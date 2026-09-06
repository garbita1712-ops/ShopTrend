'use client';

import React from 'react';
import Link from 'next/link';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = 'Admin Dashboard',
  subtitle = 'Manage catalog inventory, pricing, and registered accounts',
}: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <Link
        href="/"
        className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all"
      >
        ← Storefront
      </Link>
    </div>
  );
}
