'use client';

import React from 'react';

interface AdminStatsProps {
  productCount: number;
  grossSalesDisplay: string;
  userCount: number;
  sessionUser: any;
}

export default function AdminStats({
  productCount,
  grossSalesDisplay,
  userCount,
  sessionUser,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 block mb-1">Total Catalog Items</span>
        <p className="text-2xl font-bold text-slate-900 font-mono">{productCount}</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 block mb-1">Gross Inventory Value</span>
        <p className="text-2xl font-bold text-slate-900 font-mono">{grossSalesDisplay}</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 block mb-1">Total Registered Users</span>
        <p className="text-2xl font-bold text-slate-900 font-mono">{userCount}</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 block mb-1">Active Admin</span>
        <p className="text-sm font-bold text-slate-900 truncate">{sessionUser?.name || 'Admin User'}</p>
        <span className="text-[11px] text-slate-500 block mt-0.5">{sessionUser?.email || 'admin@shoptrend.com'}</span>
      </div>
    </div>
  );
}
