import React from 'react';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { ShoppingCart, Package, Clock, ArrowUpRight, Banknote, Plus, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusStyles(status: string) {
  if (status === 'IN_REVIEW')
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (status === 'IN_PROGRESS')
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (status === 'SUCCESSFUL')
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
}

export default async function AdminOverviewPage() {
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalProducts = 0;
  let totalCategories = 0;
  let totalRevenue = 0;
  let recentOrders: Array<{
    _id: unknown;
    customerDetails: { name: string; number: string };
    items: Array<{ product?: { title?: string } }>;
    totalAmount: number;
    status: string;
  }> = [];

  try {
    await connectToDatabase();

    totalOrders = await Order.countDocuments();
    pendingOrders = await Order.countDocuments({ status: 'IN_REVIEW' });
    totalProducts = await Product.countDocuments();
    totalCategories = await Category.countDocuments();

    const orders = await Order.find({}).lean();
    totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

    recentOrders = (await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'title')
      .lean()) as unknown as typeof recentOrders;
  } catch (e) {
    console.warn('Database connection skipped or failed during render:', e);
  }

  const stats = [
    {
      label: 'Total sales',
      value: `৳${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      hint: 'Gross order volume',
      icon: Banknote,
      iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'Pending orders',
      value: String(pendingOrders),
      hint: 'Status: IN_REVIEW',
      hintClass: 'text-amber-600 dark:text-amber-400 font-semibold',
      icon: Clock,
      iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      label: 'Total orders',
      value: String(totalOrders),
      hint: 'All registered orders',
      icon: ShoppingCart,
      iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: 'Catalog products',
      value: String(totalProducts),
      hint: `${totalCategories} active categories`,
      icon: Package,
      iconClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5 sm:pb-6">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Squad Lifestyle · Admin
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Dashboard overview
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Real-time management metrics for your store.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:bg-black dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            Add product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-semibold text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            View orders
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="min-w-0 p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2.5 sm:space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 truncate">
                  {s.label}
                </span>
                <span className={`p-2 rounded-lg shrink-0 ${s.iconClass}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-lg sm:text-3xl font-extrabold tabular-nums text-neutral-900 dark:text-white truncate" title={s.value}>
                {s.value}
              </p>
              <p className={`text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500 truncate ${s.hintClass ?? ''}`}>
                {s.hint}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white flex items-center gap-2 min-w-0">
            <ClipboardList size={16} className="shrink-0 text-neutral-400" />
            <span className="truncate">Recent orders</span>
          </h2>
          <Link
            href="/admin/orders"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wide min-h-[44px] px-2"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingCart size={28} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">No orders yet</p>
            <p className="mt-1 text-xs text-neutral-500">New customer orders will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentOrders.map((ord) => (
              <li key={String(ord._id)} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {ord.customerDetails?.name || 'Unknown customer'}
                  </p>
                  <p className="text-xs text-neutral-500 tabular-nums truncate">
                    {ord.customerDetails?.number} · {ord.items?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <span className="text-sm font-bold tabular-nums text-neutral-900 dark:text-white whitespace-nowrap">
                    ৳{(ord.totalAmount || 0).toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyles(ord.status)}`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
