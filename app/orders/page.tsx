'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderRecord {
  _id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem('shoptrend_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.user?.email) {
          setUserEmail(parsed.user.email);
          fetchOrders(parsed.user.email);
        }
      } catch (e) {}
    }
  }, []);

  const fetchOrders = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const isEmail = query.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(query.trim())}` : `orderId=${encodeURIComponent(query.trim())}`;
      const res = await fetch(`/api/orders/track?${param}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (e) {
      toast.error('Failed to fetch order history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchQuery);
  };

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 max-w-4xl">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Track Orders</h1>
          <p className="text-xs text-slate-500">Order lookup and status tracking</p>
        </div>
        <Link
          href="/"
          className="px-3 py-1 rounded border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50"
        >
          ← Back to Catalog
        </Link>
      </div>

      {/* Simple Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 text-xs mb-6">
        <input
          type="text"
          placeholder="Email address or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
        >
          Lookup Order
        </button>
      </form>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center border border-slate-200 rounded p-4 text-xs text-slate-500">
          {userEmail ? `No orders found for ${userEmail}.` : 'Enter an email address or Order ID above to search.'}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-slate-200 rounded p-4 bg-white space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-2">
                <div>
                  <p className="font-mono font-bold text-slate-900">Order ID: #{order._id}</p>
                  <p className="text-[11px] text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Status: {order.status}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-slate-700 text-[11px]">Items:</p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-800">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-6 h-6 object-cover rounded border border-slate-200"
                        />
                      )}
                      <span>{item.name} (x{item.quantity})</span>
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-600">Shipping: {order.shippingAddress}, {order.city}</span>
                <span className="font-bold text-slate-900">Total: ${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
