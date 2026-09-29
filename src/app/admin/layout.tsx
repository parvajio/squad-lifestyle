import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Logo from '@/components/Logo';
import { LayoutDashboard, Tag, Package, ShoppingCart, ArrowLeft, Truck } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Protected Route Guard: Admin Only
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between flex-shrink-0 shadow-xs">
        <div className="space-y-8">
          <div className="space-y-2">
            <Logo layout="horizontal" size="sm" />
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-widest">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <nav className="space-y-1.5 text-xs uppercase font-bold tracking-wider">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Tag size={18} />
              <span>Categories</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Package size={18} />
              <span>Products</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ShoppingCart size={18} />
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Truck size={18} />
              <span>Delivery Charges</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Store Front</span>
          </Link>
          <div className="text-[10px] text-neutral-500 font-mono truncate">
            Logged in as: <span className="text-neutral-800 dark:text-neutral-200 font-bold">{session.user.email}</span>
          </div>
        </div>
      </aside>

      {/* Admin Content Workspace */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 min-h-screen">
        {children}
      </main>
    </div>
  );
}
