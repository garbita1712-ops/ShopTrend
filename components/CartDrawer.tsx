'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from './ProductCard';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
}

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  updateQuantity,
  removeFromCart,
  cartTotal,
}: CartDrawerProps) {
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="w-full max-w-sm bg-white border-l border-slate-200 h-full flex flex-col justify-between p-5 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Shopping Cart</h3>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="py-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                Your cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded bg-slate-100 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-slate-600 font-semibold">${item.product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-4 h-4 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-4 h-4 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600">Total</span>
              <span className="text-slate-900">${cartTotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center transition-all block text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
