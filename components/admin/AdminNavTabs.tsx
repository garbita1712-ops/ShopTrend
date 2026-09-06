'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', href: '/admin' },
    { label: 'Catalog Products', href: '/admin/products' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Customer Orders', href: '/admin/orders' },
    { label: 'Users & Admins', href: '/admin/users' },
  ];

  return (
    <nav className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
