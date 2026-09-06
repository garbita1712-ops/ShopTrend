'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import CreateAdminForm from '@/components/admin/CreateAdminForm';
import UserManager, { UserRecord } from '@/components/admin/UserManager';

export default function AdminUsersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsersList(data);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated]);

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs text-slate-500 font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <AdminHeader title="User Accounts" subtitle="Manage registered users and administrator roles" />
      <AdminNavTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <CreateAdminForm onAdminCreated={fetchUsers} />
        </div>
        <div className="lg:col-span-2">
          <UserManager usersList={usersList} isLoading={isLoading} onRefreshNeeded={fetchUsers} />
        </div>
      </div>
    </main>
  );
}
