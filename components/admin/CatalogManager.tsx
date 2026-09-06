'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { Product } from '../ProductCard';

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
  const handleDeleteProduct = async (id: string) => {
    const toastId = toast.loading('Deleting product...');
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      toast.success('Product removed', { id: toastId });
      onRefreshNeeded();
    } catch (e) {
      toast.error('Could not delete product', { id: toastId });
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
        Catalog Items ({products.length})
      </h2>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No products in catalog.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-y-auto max-h-[380px]">
          {products.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-9 h-9 object-cover rounded bg-slate-100 border border-slate-200"
                />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ${item.price.toFixed(2)} · {item.category} {item.subcategory ? `(${item.subcategory})` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteProduct(item.id)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
