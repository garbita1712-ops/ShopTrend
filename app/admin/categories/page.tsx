'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const [parentCatId, setParentCatId] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0 && !parentCatId) {
          setParentCatId(data[0].id);
        }
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCategories();
  }, [isAuthenticated]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCat) return;
    setIsSubmittingCat(true);

    if (!categoryName.trim()) {
      toast.error('Enter category name');
      setIsSubmittingCat(false);
      return;
    }

    const toastId = toast.loading('Saving category...');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name: categoryName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save', { id: toastId });
      } else {
        toast.success(`Category "${categoryName}" added`, { id: toastId });
        setCategoryName('');
        fetchCategories();
      }
    } catch (e) {
      toast.error('Error saving category', { id: toastId });
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingSub) return;
    setIsSubmittingSub(true);

    if (!subcategoryName.trim() || !parentCatId) {
      toast.error('Select category and enter subcategory name');
      setIsSubmittingSub(false);
      return;
    }

    const toastId = toast.loading('Saving subcategory...');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subcategory',
          name: subcategoryName,
          parentCategoryId: parentCatId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save', { id: toastId });
      } else {
        toast.success(`Subcategory "${subcategoryName}" added`, { id: toastId });
        setSubcategoryName('');
        fetchCategories();
      }
    } catch (e) {
      toast.error('Error saving subcategory', { id: toastId });
    } finally {
      setIsSubmittingSub(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const toastId = toast.loading('Deleting...');
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      toast.success(`Category deleted`, { id: toastId });
      fetchCategories();
    } catch (e) {
      toast.error('Delete failed', { id: toastId });
    }
  };

  const handleDeleteSubcategory = async (catId: string, subId: string) => {
    const toastId = toast.loading('Deleting...');
    try {
      await fetch(`/api/admin/categories?id=${catId}&subId=${subId}`, { method: 'DELETE' });
      toast.success(`Subcategory deleted`, { id: toastId });
      fetchCategories();
    } catch (e) {
      toast.error('Delete failed', { id: toastId });
    }
  };

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs text-slate-500 font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
      <AdminHeader title="Categories" subtitle="Manage store categories and subcategories" />
      <AdminNavTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Forms Column */}
        <div className="space-y-6">
          {/* Create Category Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Add Category</h2>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Appliances"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCat}
                className="w-full py-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
              >
                Save Category
              </button>
            </form>
          </div>

          {/* Create Subcategory Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Add Subcategory</h2>

            <form onSubmit={handleCreateSubcategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Category</label>
                <select
                  value={parentCatId}
                  onChange={(e) => setParentCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingSub}
                className="w-full py-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
              >
                Save Subcategory
              </button>
            </form>
          </div>
        </div>

        {/* Category List Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Active Categories ({categories.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No categories added yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {categories.map((cat) => (
                <div key={cat.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Subcategories Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {cat.subcategories.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No subcategories</span>
                    ) : (
                      cat.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          <span>{sub.name}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                            className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                            title="Remove subcategory"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
