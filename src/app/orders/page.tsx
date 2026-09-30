'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ShoppingBag, RefreshCw, Package } from 'lucide-react';

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

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        setError(json.error || 'Failed to load orders');
      }
    } catch (e) {
      console.error(e);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShoppingBag size={28} />
              <span>My Orders</span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Track your order information and delivery status.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider font-bold">Fetching your orders...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 rounded-2xl space-y-3 shadow-xs">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-4 shadow-xs">
            <Package className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="text-sm font-bold uppercase tracking-wider">No orders found.</p>
            <p className="text-xs text-neutral-500">Orders placed with your account email will appear here.</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-bold">Order #{ord._id}</span>
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
                  <div className="text-right">
                    <p className="text-[11px] font-mono text-neutral-500">
                      Delivery ({ord.deliveryType === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka'}): ৳
                      {(ord.deliveryCharge ?? 0).toFixed(2)}
                    </p>
                    <span className="text-sm font-black font-mono">
                      Total Payable: ৳{ord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                  {ord.items.map((item, idx) => {
                    const prodTitle =
                      item.product && typeof item.product === 'object' ? item.product.title : 'Product';
                    const mainImg =
                      item.product &&
                      typeof item.product === 'object' &&
                      item.product.images &&
                      item.product.images.length > 0
                        ? item.product.images[0]
                        : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80';

                    return (
                      <div key={idx} className="flex items-center justify-between text-xs py-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-white dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                            <Image src={mainImg} alt={prodTitle} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold uppercase">{prodTitle}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              Quantity: {item.quantity}{' '}
                              {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold">
                          ৳{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
