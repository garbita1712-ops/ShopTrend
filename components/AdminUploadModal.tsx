'use client';

import React, { useState } from 'react';
import { Plus, X, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from './ProductCard';

interface AdminUploadModalProps {
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  categories: string[];
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export default function AdminUploadModal({
  isAdminOpen,
  setIsAdminOpen,
  categories,
  products,
  addProduct,
  deleteProduct,
}: AdminUploadModalProps) {
  const [tab, setTab] = useState<'create' | 'manage'>('create');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isAdminOpen) return null;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      const created: Product = {
        id: `prod-${Date.now()}`,
        name: newProdName || 'New Tech Item',
        category: newProdCategory,
        price: parseFloat(newProdPrice) || 89.99,
        rating: 5.0,
        reviews: 1,
        image: newProdImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
        description: newProdDesc || 'Product item added via Admin panel.',
        stock: 25,
        isNew: true,
      };
      addProduct(created);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdImage('');
        setNewProdDesc('');
        setTab('manage');
      }, 800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative max-h-[90vh] flex flex-col justify-between">
        <div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Admin Control Panel</h3>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setTab('create')}
              className={`pb-2 text-xs font-bold mr-4 border-b-2 transition-all ${
                tab === 'create'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Add New Product
            </button>
            <button
              onClick={() => setTab('manage')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all ${
                tab === 'manage'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Manage Catalog ({products.length})
            </button>
          </div>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs overflow-y-auto">
            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Product published to catalog!</span>
              </div>
            )}

            <div>
              <label className="block text-slate-600 font-medium mb-1">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Mechanical Wireless Keyboard"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="89.99"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newProdImage}
                onChange={(e) => setNewProdImage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Item specification & description..."
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
            >
              {isUploading ? (
                <span>Adding...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Save Product
                </span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded bg-white" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-slate-500 font-mono">${p.price.toFixed(2)} · {p.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
