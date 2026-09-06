'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { Product } from '../ProductCard';

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

interface CatalogManagerProps {
  products: Product[];
  isLoading: boolean;
  onRefreshNeeded: () => void;
}

export default function CatalogManager({
  products,
  isLoading,
  onRefreshNeeded,
}: CatalogManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);
  const [activeSubcategories, setActiveSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data: CategoryItem[]) => {
        if (Array.isArray(data)) {
          setAvailableCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditSubcategory(product.subcategory || '');
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditDescription(product.description || '');
    setEditImage(product.image);

    // Populate active subcategories for selected category
    const foundCat = availableCategories.find((c) => c.name === product.category);
    if (foundCat && foundCat.subcategories && foundCat.subcategories.length > 0) {
      setActiveSubcategories(foundCat.subcategories);
    } else {
      setActiveSubcategories([]);
    }
  };

  const handleEditCategoryChange = (catName: string) => {
    setEditCategory(catName);
    const foundCat = availableCategories.find((c) => c.name === catName);
    if (foundCat && foundCat.subcategories && foundCat.subcategories.length > 0) {
      setActiveSubcategories(foundCat.subcategories);
      setEditSubcategory(foundCat.subcategories[0].name);
    } else {
      setActiveSubcategories([]);
      setEditSubcategory('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading image to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data && data.url) {
        setEditImage(data.url);
        toast.success('Image uploaded to Cloudinary!', { id: toastId });
      } else {
        toast.error('Image upload failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Error uploading image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const toastId = toast.loading('Saving changes...');
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editName,
          category: editCategory,
          subcategory: editSubcategory,
          price: editPrice,
          stock: editStock,
          description: editDescription,
          image: editImage,
        }),
      });

      if (res.ok) {
        toast.success('Product updated successfully', { id: toastId });
        setEditingProduct(null);
        onRefreshNeeded();
      } else {
        toast.error('Failed to update product', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to server', { id: toastId });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const toastId = toast.loading(`Deleting ${name}...`);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully', { id: toastId });
        onRefreshNeeded();
      } else {
        toast.error('Could not delete product', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to server', { id: toastId });
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Catalog Items ({products.length})
        </h2>
        <span className="text-[11px] text-slate-500 font-medium">Manage & Edit Catalog Items</span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No products in catalog.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px] pr-1">
          {products.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-slate-900">${item.price.toFixed(2)}</span> · Stock: <span className="font-semibold text-slate-700">{item.stock}</span> · Category: <span className="font-medium text-slate-600">{item.category}{item.subcategory ? ` (${item.subcategory})` : ''}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Edit & Delete (Monochrome Black/Slate) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Edit Product"
                >
                  <Edit2 className="w-3 h-3 text-slate-700" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteProduct(item.id, item.name)}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Delete Product"
                >
                  <Trash2 className="w-3 h-3 text-slate-700" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Modal Form */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-slate-800" /> Edit Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  required
                />
              </div>

              {/* Category & Subcategory Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  {availableCategories.length > 0 ? (
                    <select
                      value={editCategory}
                      onChange={(e) => handleEditCategoryChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Subcategory</label>
                  {activeSubcategories.length > 0 ? (
                    <select
                      value={editSubcategory}
                      onChange={(e) => setEditSubcategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                    >
                      {activeSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Subcategory"
                      value={editSubcategory}
                      onChange={(e) => setEditSubcategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Cloudinary File Upload Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Upload File (Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-[10px] focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono text-[11px]"
                  placeholder="https://res.cloudinary.com/... (or uploaded above)"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
