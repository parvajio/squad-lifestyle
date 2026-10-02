'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, RefreshCw, User, Phone, MapPin, Mail, Package } from 'lucide-react';

export type OrderStatus = 'IN_REVIEW' | 'IN_PROGRESS' | 'CANCELLED' | 'SUCCESSFUL';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images?: string[];
    originalPrice?: number;
    discountPrice?: number;
  };
  quantity: number;
  selectedSize?: string;
  priceAtPurchase?: number;
}

interface OrderRecord {
  _id: string;
  customerDetails: {
    name: string;
    number: string;
    address: string;
    email: string;
  };
  items: OrderItem[];
  subtotalAmount?: number;
  deliveryType?: 'dhaka' | 'outside';
  deliveryCharge?: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

const FILTERS = ['ALL', 'IN_REVIEW', 'IN_PROGRESS', 'SUCCESSFUL', 'CANCELLED'] as const;

function badge(status: OrderStatus) {
  switch (status) {
    case 'IN_REVIEW':
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'IN_PROGRESS':
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'SUCCESSFUL':
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'CANCELLED':
      return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        fetchOrders();
      } else {
        alert(json.error || 'Failed to update order status');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
              <ShoppingCart size={26} className="shrink-0" />
              <span className="truncate">Orders</span>
              {!loading && (
                <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums">
                  {orders.length}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Review incoming orders and update their status.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-1"
          role="tablist"
          aria-label="Filter orders by status"
        >
          {FILTERS.map((st) => (
            <button
              key={st}
              role="tab"
              aria-selected={statusFilter === st}
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 px-4 py-2.5 min-h-[40px] rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-40 bg-neutral-100 dark:bg-neutral-800 rounded" />
              <div className="mt-3 h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
              <div className="mt-2 h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <Package size={32} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">No orders found</p>
          <p className="mt-1 text-xs text-neutral-500">Try a different status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <article
              key={ord._id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
              {/* Order header */}
              <div className="flex flex-col gap-3 px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <p className="text-sm font-bold tabular-nums text-neutral-900 dark:text-white truncate" title={ord._id}>
                    <span className="text-neutral-400 font-medium">Order </span>
                    #{ord._id.slice(-6).toUpperCase()}
                  </p>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badge(ord.status)}`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                  <p className="text-xs text-neutral-500 tabular-nums">
                    {new Date(ord.createdAt).toLocaleString()}
                  </p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                    <span className="shrink-0">Status</span>
                    <select
                      disabled={updatingId === ord._id}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value as OrderStatus)}
                      className="flex-1 sm:flex-none sm:w-auto px-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold text-xs rounded-xl uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white disabled:opacity-50"
                    >
                      <option value="IN_REVIEW">In review</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="SUCCESSFUL">Successful</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 p-4 sm:p-6">
                {/* Customer */}
                <div className="xl:col-span-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800 p-4 space-y-2.5 self-start">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 border-b border-neutral-200/70 dark:border-neutral-800 pb-2">
                    Customer
                  </h3>
                  <p className="flex items-center gap-2 text-sm min-w-0">
                    <User size={15} className="text-neutral-400 shrink-0" />
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">{ord.customerDetails.name}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <Phone size={15} className="text-neutral-400 shrink-0" />
                    <a href={`tel:${ord.customerDetails.number}`} className="tabular-nums hover:underline truncate">
                      {ord.customerDetails.number}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 min-w-0">
                    <Mail size={15} className="text-neutral-400 shrink-0" />
                    <span className="truncate lowercase">{ord.customerDetails.email}</span>
                  </p>
                  <p className="flex items-start gap-2 pt-2 border-t border-neutral-200/70 dark:border-neutral-800 text-[13px] leading-snug text-neutral-600 dark:text-neutral-300">
                    <MapPin size={15} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="break-words">{ord.customerDetails.address}</span>
                  </p>
                </div>

                {/* Items */}
                <div className="xl:col-span-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-neutral-200/70 dark:border-neutral-800 pb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                      Items ({ord.items.length})
                    </h3>
                    <div className="sm:text-right">
                      {ord.deliveryType && (
                        <p className="text-xs tabular-nums text-neutral-500">
                          Delivery ({ord.deliveryType === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka'}): ৳
                          {(ord.deliveryCharge ?? 0).toFixed(2)}
                        </p>
                      )}
                      <p className="text-base font-extrabold tabular-nums text-neutral-900 dark:text-white">
                        ৳{ord.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <ul className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                    {ord.items.map((item, idx) => {
                      const prodTitle =
                        item.product && typeof item.product === 'object'
                          ? item.product.title
                          : 'Product';
                      const img =
                        item.product &&
                        typeof item.product === 'object' &&
                        item.product.images &&
                        item.product.images.length > 0
                          ? item.product.images[0]
                          : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80';
                      return (
                        <li key={idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                          <div className="relative w-11 h-14 bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                            <Image src={img} alt={prodTitle} fill className="object-cover" sizes="44px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[13px] text-neutral-900 dark:text-white truncate">{prodTitle}</p>
                            <p className="text-xs text-neutral-500 tabular-nums">
                              Qty {item.quantity}
                              {item.selectedSize ? ` · Size ${item.selectedSize}` : ''}
                            </p>
                          </div>
                          <span className="shrink-0 text-[13px] font-bold tabular-nums text-neutral-900 dark:text-white">
                            ৳{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
