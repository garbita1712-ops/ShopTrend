'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import AddProductForm from '@/components/admin/AddProductForm';
import CatalogManager from '@/components/admin/CatalogManager';
import { Product } from '@/components/ProductCard';

export default function AdminProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProducts();
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
      <AdminHeader title="Product Catalog" subtitle="Add products and manage inventory" />
      <AdminNavTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <AddProductForm onProductAdded={fetchProducts} />
        </div>
        <div className="lg:col-span-2">
          <CatalogManager products={products} isLoading={isLoading} onRefreshNeeded={fetchProducts} />
        </div>
      </div>
    </main>
  );
}
