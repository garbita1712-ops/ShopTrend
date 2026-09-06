'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Users, ArrowRight } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import AdminStats from '@/components/admin/AdminStats';
import { Product } from '@/components/ProductCard';
import { UserRecord } from '@/components/admin/UserManager';

export default function AdminDashboardOverviewPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, grossSales: 0, activeCustomers: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('shoptrend_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.role === 'admin') {
          setIsAuthenticated(true);
          setSessionUser(parsed.user);
          return;
        }
      } catch (e) {}
    }
    setIsAuthenticated(false);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ])
        .then(async ([prodRes, statsRes, usersRes]) => {
          const prodData = await prodRes.json();
          const statsData = await statsRes.json();
          const usersData = await usersRes.json();

          if (Array.isArray(prodData)) setProducts(prodData);
          if (statsData) setStats(statsData);
          if (Array.isArray(usersData)) setUsersList(usersData);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs text-slate-500 font-medium">Redirecting to login...</p>
      </div>
    );
  }

  const grossSalesDisplay = stats.grossSales
    ? `$${stats.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 1), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <AdminHeader title="Admin Overview" subtitle="System metrics and navigation" />
      <AdminNavTabs />

      {/* Metric Stats Summary */}
      <AdminStats
        productCount={products.length}
        grossSalesDisplay={grossSalesDisplay}
        userCount={usersList.length || stats.activeCustomers || 1}
        sessionUser={sessionUser}
      />

      {/* Navigation Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Products Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{products.length} Products</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Catalog Products</h3>
            <p className="text-xs text-slate-500">Add new products, update prices, and manage inventory.</p>
          </div>

          <Link
            href="/admin/products"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs transition-all shadow-xs"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </Link>
        </div>

        {/* Users Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{usersList.length} Users</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">Users & Admins</h3>
            <p className="text-xs text-slate-500">Create new admin accounts, manage user roles, and delete accounts.</p>
          </div>

          <Link
            href="/admin/users"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs transition-all shadow-xs"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </Link>
        </div>
      </div>
    </main>
  );
}
