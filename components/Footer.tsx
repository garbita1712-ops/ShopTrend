'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-12 text-xs text-slate-600">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        {/* Main Content Grid: Left Brand Info & Right Text Links */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left Side: Brand Header & Extended Text */}
          <div className="max-w-lg space-y-2">
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              ShopTrend
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Curated everyday tech essentials, audio gear, and lifestyle accessories. Designed for minimalist aesthetics, quality craftsmanship, and seamless online shopping experiences with live order tracking.
            </p>
          </div>

          {/* Right Side: Navigation & Social Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                Explore
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                <li>
                  <Link href="/" className="hover:text-slate-900 transition-colors">
                    Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-slate-900 transition-colors">
                    Orders
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                Connect
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 ShopTrend E-Commerce Storefront. All rights reserved.</p>
          <p className="font-semibold text-slate-700">Built by Garbita Chowdhury</p>
        </div>
      </div>
    </footer>
  );
}
