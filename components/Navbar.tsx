'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartDrawer from './CartDrawer';

interface SearchResultProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  image: string;
}

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultProduct[]>([]);
  const [allProducts, setAllProducts] = useState<SearchResultProduct[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const syncCartFromStorage = () => {
    const saved = localStorage.getItem('shoptrend_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch (e) {}
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    const updateSession = () => {
      const saved = localStorage.getItem('shoptrend_session');
      if (saved) {
        try {
          setSession(JSON.parse(saved));
        } catch (e) {
          setSession(null);
        }
      } else {
        setSession(null);
      }
    };

    updateSession();
    syncCartFromStorage();

    // Fetch products for live search autocomplete
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(() => {});

    // Fetch dynamic categories from backend API
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const catNames = ['All', ...data.map((c: any) => c.name)];
          setCategories(catNames);
        } else {
          setCategories(['All', 'Wearables', 'Home & Living', 'Electronics']);
        }
      })
      .catch(() => {
        setCategories(['All', 'Wearables', 'Home & Living', 'Electronics']);
      });

    const handleOpenCart = () => setIsCartOpen(true);

    window.addEventListener('storage', updateSession);
    window.addEventListener('shoptrend_cart_updated', syncCartFromStorage);
    window.addEventListener('shoptrend_open_cart', handleOpenCart);

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', updateSession);
      window.removeEventListener('shoptrend_cart_updated', syncCartFromStorage);
      window.removeEventListener('shoptrend_open_cart', handleOpenCart);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    window.dispatchEvent(new CustomEvent('shoptrend_search', { detail: val }));

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const q = val.toLowerCase().trim();
    const matches = allProducts
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const subcatMatch = p.subcategory?.toLowerCase().includes(q);
        return nameMatch || catMatch || subcatMatch;
      })
      .slice(0, 6);

    setSearchResults(matches);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    window.dispatchEvent(new CustomEvent('shoptrend_category', { detail: cat }));
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('shoptrend_session');
    document.cookie = 'shoptrend_role=; path=/; max-age=0';
    setSession(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        const prodId = item.id || item.product?.id;
        if (prodId === id) {
          const newQty = (item.quantity || 1) + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    setCart(updated);
    localStorage.setItem('shoptrend_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('shoptrend_cart_updated'));
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => (item.id || item.product?.id) !== id);
    setCart(updated);
    localStorage.setItem('shoptrend_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('shoptrend_cart_updated'));
  };

  const totalItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const formattedCartForDrawer = cart.map((item) => ({
    product: item.product || {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category || '',
      description: item.description || '',
      rating: item.rating || 5,
      reviews: item.reviews || 0,
      stock: item.stock || 10,
    },
    quantity: item.quantity || 1,
  }));

  const isAdmin = session?.user?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Brand Typography */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight hover:opacity-80 shrink-0"
          >
            ShopTrend
          </Link>

          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products, category, or subcategory..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </form>

            {/* Desktop Autocomplete Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 overflow-hidden text-xs max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-slate-400 text-center">
                    No products, categories, or subcategories found.
                  </div>
                ) : (
                  searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.id}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-9 h-9 object-cover rounded bg-slate-100 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">
                          {prod.category} {prod.subcategory ? `· ${prod.subcategory}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">${prod.price.toFixed(2)}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Action Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/orders"
              className="px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all"
            >
              My Orders
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold transition-all"
              >
                Admin Panel
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium truncate max-w-[130px]">
                  {session.user?.name?.split(' ')[0]} ({session.user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Action Bar: Cart + Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {totalItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
              className="p-2 rounded border border-slate-200 text-slate-800 hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Left-to-Right Animated Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`fixed inset-0 bg-slate-900/40 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding Panel */}
        <div
          className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-xl z-50 flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-extrabold text-slate-900 text-lg tracking-tight"
              >
                ShopTrend
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </form>

            {/* Category Filter Pills (Dynamically Fetched from Backend API) */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="pt-2 border-t border-slate-100 flex flex-col space-y-1 text-xs font-semibold text-slate-800">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded hover:bg-slate-50 transition-colors"
              >
                Catalog
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded hover:bg-slate-50 transition-colors"
              >
                Orders
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded bg-slate-100 text-slate-900 font-bold transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Footer User Session (Pure Black / Neutral Slate, NO RED) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {session ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <p className="text-slate-500 text-[11px]">Logged in as</p>
                  <p className="font-bold text-slate-900 truncate">
                    {session.user?.name} ({session.user?.role})
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={formattedCartForDrawer}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
      />
    </>
  );
}
