'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import OrderManager, { OrderRecord } from '@/components/admin/OrderManager';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('shoptrend_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.role === 'admin') {
          setIsAuthenticated(true);
          return;
        }
      } catch (e) {}
    }
    setIsAuthenticated(false);
    router.replace('/login');
  }, [router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrdersList(data);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs text-slate-500 font-medium">Loading session...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <AdminHeader title="Customer Orders" subtitle="Track order status and fulfill delivery requests" />
      <AdminNavTabs />

      <OrderManager orders={ordersList} isLoading={isLoading} onRefreshNeeded={fetchOrders} />
    </main>
  );
}
