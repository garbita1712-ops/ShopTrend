'use client';

import React from 'react';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

export default function ProductGrid({ products, addToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-medium text-slate-400">
        No products available.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} addToCart={addToCart} />
      ))}
    </section>
  );
}
