import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-t border-neutral-200 dark:border-neutral-900 py-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Logo layout="vertical" size="lg" className="items-start text-left" />
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-sm leading-relaxed">
              Squad Lifestyle represents modern minimalist apparel and streetwear engineered with premium materials and high-contrast design aesthetics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-200">Navigation</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">Shop All Products</Link></li>
              <li><Link href="/#categories" className="hover:text-black dark:hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/cart" className="hover:text-black dark:hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-200">Direct Support</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">WhatsApp Hotline:</p>
            <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">+880 1918-316404</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">Available 24/7 for order inquiries & concierge support.</p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Squad Lifestyle (squad-lifestyle.com). All rights reserved.</p>
          <p className="font-mono text-[10px] tracking-wider uppercase">MINIMALIST APPAREL & STREETWEAR</p>
        </div>
      </div>
    </footer>
  );
}
