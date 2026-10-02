'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/categories', label: 'Categories', icon: Tag, exact: false },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, exact: false },
  { href: '/admin/settings', label: 'Delivery Charges', icon: Truck, exact: false },
];

function NavLinks({ activePath, onNavigate }: { activePath: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Admin navigation">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact ? activePath === item.href : activePath.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
              isActive
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans lg:flex">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2.5 -ml-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <Logo size="sm" />
        </div>
        <span className="shrink-0 inline-flex px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-widest">
          Admin
        </span>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-5 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Logo size="sm" />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close admin menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-widest">
                Admin control panel
              </span>
            </div>
            <NavLinks activePath={pathname} onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors min-h-[44px]"
              >
                <ArrowLeft size={16} />
                <span>Return to store front</span>
              </Link>
              <p className="text-xs text-neutral-500 truncate">
                Logged in as <span className="font-bold text-neutral-800 dark:text-neutral-200">{userEmail}</span>
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col justify-between p-6 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-8">
          <div className="space-y-2">
            <Logo layout="horizontal" size="sm" />
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-widest">
              Admin control panel
            </span>
          </div>
          <NavLinks activePath={pathname} />
        </div>
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors min-h-[44px]"
          >
            <ArrowLeft size={16} />
            <span>Return to store front</span>
          </Link>
          <p className="text-xs text-neutral-500 truncate" title={userEmail}>
            Logged in as <span className="text-neutral-800 dark:text-neutral-200 font-bold">{userEmail}</span>
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 w-full">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
