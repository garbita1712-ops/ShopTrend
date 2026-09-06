'use client';

import React from 'react';
import Link from 'next/link';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  stock: number;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

export default function ProductCard({ product, addToCart }: ProductCardProps) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    window.dispatchEvent(new Event('shoptrend_cart_updated'));
    window.dispatchEvent(new Event('shoptrend_open_cart'));
  };

  const hasReviews = product.reviews && product.reviews > 0;

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden flex flex-col hover:border-slate-400 transition-all duration-200 max-w-[220px] w-full group">
      {/* Clickable Image Preview */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-100 block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            New
          </span>
        )}
        {/* Only show rating badge if product has reviews */}
        {hasReviews ? (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 text-[10px] font-bold">
            ★ {product.rating} ({product.reviews})
          </div>
        ) : null}
      </Link>

      {/* Compact Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            {product.category} {product.subcategory ? `· ${product.subcategory}` : ''}
          </span>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs font-bold text-slate-900 mt-0.5 mb-0.5 truncate group-hover:underline">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-semibold transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
