'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroBanner from '../components/HeroBanner';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import AdminUploadModal from '../components/AdminUploadModal';
import { Product } from '../components/ProductCard';

export default function ShopTrendHome() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch dynamic categories and products from MongoDB
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (Array.isArray(prodData)) {
        setProducts(prodData);
      }
      if (Array.isArray(catData)) {
        const catNames = ['All', ...catData.map((c: any) => c.name)];
        setCategories(catNames);
      }
    } catch (e) {
      // offline error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const paramSearch = searchParams?.get('search');
    if (paramSearch) {
      setSearchQuery(paramSearch);
    }

    const handleSearchEvent = (e: any) => {
      if (typeof e.detail === 'string') {
        setSearchQuery(e.detail);
      }
    };

    const handleCategoryEvent = (e: any) => {
      if (typeof e.detail === 'string') {
        setSelectedCategory(e.detail);
      }
    };

    window.addEventListener('shoptrend_search', handleSearchEvent);
    window.addEventListener('shoptrend_category', handleCategoryEvent);

    return () => {
      window.removeEventListener('shoptrend_search', handleSearchEvent);
      window.removeEventListener('shoptrend_category', handleCategoryEvent);
    };
  }, [searchParams]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const addProduct = async (newProduct: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const savedDoc = await res.json();
      if (savedDoc && savedDoc.id) {
        setProducts([savedDoc, ...products]);
        return;
      }
    } catch (e) {
      // ignore
    }
    setProducts([newProduct, ...products]);
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const nameMatch = p.name?.toLowerCase().includes(q);
    const categoryMatch = p.category?.toLowerCase().includes(q);
    const subcategoryMatch = p.subcategory?.toLowerCase().includes(q);
    const descMatch = p.description?.toLowerCase().includes(q);

    return nameMatch || categoryMatch || subcategoryMatch || descMatch;
  });

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8">
      <HeroBanner setIsAdminOpen={setIsAdminOpen} />

      {/* Active Search Query Notice */}
      {searchQuery.trim() !== '' && (
        <div className="mb-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-4 py-2 text-xs">
          <p className="text-slate-700">
            Showing search results for <span className="font-bold text-slate-900">"{searchQuery}"</span> ({filteredProducts.length} items found)
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              window.dispatchEvent(new CustomEvent('shoptrend_search', { detail: '' }));
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Clear Search ✕
          </button>
        </div>
      )}

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        productCount={filteredProducts.length}
      />

      {isLoading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">
          Loading catalog from MongoDB database...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center border border-slate-200 rounded p-8 bg-white my-6">
          <h3 className="text-sm font-bold text-slate-900">Not Found</h3>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} addToCart={addToCart} />
      )}

      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
      />

      <AdminUploadModal
        isAdminOpen={isAdminOpen}
        setIsAdminOpen={setIsAdminOpen}
        categories={categories}
        products={products}
        addProduct={addProduct}
        deleteProduct={deleteProduct}
      />
    </main>
  );
}
