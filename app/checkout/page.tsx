'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('shoptrend_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {}
    }

    const savedSession = localStorage.getItem('shoptrend_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          setName(parsed.user.name || '');
          setEmail(parsed.user.email || '');
        }
      } catch (e) {}
    }
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Processing your order...');

    try {
      const orderPayload = {
        customerName: name,
        customerEmail: email,
        shippingAddress: address,
        city: city,
        postalCode: pincode,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Order placed successfully!', { id: toastId });
        localStorage.removeItem('shoptrend_cart');
        setCartItems([]);
        setPlacedOrder(data.order);
      } else {
        toast.error(data.error || 'Failed to place order', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to order backend', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <main className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Order Placed!</h1>
          <p className="text-xs text-slate-600">
            Thank you, <span className="font-semibold text-slate-900">{placedOrder.customerName}</span>. Your order ID is:
          </p>
          <p className="font-mono text-xs font-bold text-slate-900 bg-white p-2 rounded border border-slate-200">
            {placedOrder._id}
          </p>
          <div className="pt-2 text-left text-xs space-y-1">
            <p><span className="font-semibold">Status:</span> {placedOrder.status}</p>
            <p><span className="font-semibold">Total Amount:</span> ${placedOrder.totalAmount?.toFixed(2)}</p>
            <p><span className="font-semibold">Shipping Address:</span> {placedOrder.shippingAddress}, {placedOrder.city}</p>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          ← Back to Catalog
        </Link>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="py-12 text-center border border-slate-200 rounded p-6">
          <p className="text-xs text-slate-500 mb-4">Your shopping cart is currently empty.</p>
          <Link
            href="/"
            className="px-4 py-2 rounded bg-slate-900 text-white font-semibold text-xs"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 border border-slate-200 rounded-lg p-5 bg-white space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Shipping Information
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Main St, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    placeholder="10001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer mt-4"
              >
                Place Order (${totalAmount.toFixed(2)})
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Order Summary ({cartItems.length} Items)
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 truncate max-w-[160px]">{item.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs font-bold text-slate-900">
              <span>Total Amount</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
