'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Filter, RefreshCw, User, Phone, MapPin, Mail } from 'lucide-react';

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

  const getStatusBadge = (status: OrderStatus) => {
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
  };

  return (
    <div className="space-y-8 font-sans transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <ShoppingCart size={28} />
            <span>Order Fulfillment</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Review incoming customer orders and update status progressively.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200/80 dark:border-neutral-800 no-scrollbar">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-2 flex items-center gap-1">
          <Filter size={14} /> Filter Status:
        </span>
        {['ALL', 'IN_REVIEW', 'IN_PROGRESS', 'SUCCESSFUL', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-xs uppercase tracking-wider font-bold">Fetching order records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-3 shadow-xs">
          <p className="text-sm font-bold uppercase tracking-wider">No orders found for this status filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xs"
            >
              {/* Top Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                      Order #{ord._id}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Placed on: {new Date(ord.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Progressive Status Dropdown Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 uppercase font-bold">Update Status:</span>
                  <div className="relative">
                    <select
                      disabled={updatingId === ord._id}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value as OrderStatus)}
                      className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono font-bold text-xs rounded-xl uppercase cursor-pointer focus:outline-none shadow-xs"
                    >
                      <option value="IN_REVIEW">1. IN_REVIEW</option>
                      <option value="IN_PROGRESS">2. IN_PROGRESS</option>
                      <option value="SUCCESSFUL">3. SUCCESSFUL</option>
                      <option value="CANCELLED">X. CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid: Customer Details + Items */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Details */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white border-b border-neutral-200/60 dark:border-neutral-800 pb-2">
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                    <p className="flex items-center gap-2">
                      <User size={14} className="text-neutral-400" />
                      <span className="font-bold text-neutral-900 dark:text-white">{ord.customerDetails.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-neutral-400" />
                      <span>{ord.customerDetails.number}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-neutral-400" />
                      <span className="lowercase">{ord.customerDetails.email}</span>
                    </p>
                    <p className="flex items-start gap-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                      <MapPin size={14} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                      <span className="font-sans text-[11px] leading-tight">{ord.customerDetails.address}</span>
                    </p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="lg:col-span-2 p-4 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-200/60 dark:border-neutral-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Ordered Products ({ord.items.length})
                    </h4>
                    <div className="text-right space-y-0.5">
                      {ord.deliveryType && (
                        <p className="text-[11px] font-mono text-neutral-500">
                          Delivery ({ord.deliveryType === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka'}): ৳
                          {(ord.deliveryCharge ?? 0).toFixed(2)}
                        </p>
                      )}
                      <span className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                        Total Payable: ৳{ord.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800 space-y-3 pt-1">
                    {ord.items.map((item, idx) => {
                      const prodTitle =
                        item.product && typeof item.product === 'object'
                          ? item.product.title
                          : 'Product';
                      const mainImg =
                        item.product &&
                        typeof item.product === 'object' &&
                        item.product.images &&
                        item.product.images.length > 0
                          ? item.product.images[0]
                          : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80';

                      return (
                        <div key={idx} className="flex items-center justify-between text-xs pt-2">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-white dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                              <Image src={mainImg} alt={prodTitle} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 dark:text-white uppercase">{prodTitle}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                Quantity: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-neutral-900 dark:text-white">
                            ৳{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
