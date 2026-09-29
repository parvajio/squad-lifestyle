import React from 'react';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { ShoppingCart, Package, Clock, ArrowUpRight, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="space-y-8 font-sans transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real-time management metrics for Squad Lifestyle.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-black font-mono text-neutral-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Gross order volume</span>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-black font-mono text-neutral-900 dark:text-white">{pendingOrders}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            Status: IN_REVIEW
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-black font-mono text-neutral-900 dark:text-white">{totalOrders}</p>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">All registered orders</span>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <Package size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-black font-mono text-neutral-900 dark:text-white">{totalProducts}</p>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{totalCategories} active categories</span>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Recent Customer Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase font-bold tracking-wider flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            {recentOrders.map((ord) => (
              <div key={String(ord._id)} className="py-4 flex items-center justify-between text-xs gap-4">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white uppercase">{ord.customerDetails?.name}</p>
                  <p className="text-neutral-400 font-mono text-[10px]">{ord.customerDetails?.number}</p>
                </div>

                <div className="font-mono text-neutral-500">
                  {ord.items?.length || 0} item(s)
                </div>

                <div className="font-mono font-bold text-neutral-900 dark:text-white">
                  ${(ord.totalAmount || 0).toFixed(2)}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                    ord.status === 'IN_REVIEW'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : ord.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : ord.status === 'SUCCESSFUL'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
