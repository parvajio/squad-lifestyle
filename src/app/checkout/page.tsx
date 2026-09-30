'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import DeliveryTypeSelector from '@/components/DeliveryTypeSelector';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ArrowLeft, ShieldCheck, Truck, Lock, Loader2 } from 'lucide-react';

interface FormState {
  name: string;
  number: string;
  address: string;
  email: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, totalSelectedAmount, clearSelectedItems, deliveryType, setDeliveryType } = useCart();
  const selectedCartItems = cart.filter((item) => item.selected);

  const [deliveryCharges, setDeliveryCharges] = useState({ dhaka: 70, outside: 130 });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setDeliveryCharges({
            dhaka: Number(json.data.dhaka) || 70,
            outside: Number(json.data.outside) || 130,
          });
        }
      })
      .catch(() => {});
  }, []);

  const deliveryCharge = deliveryType === 'dhaka' ? deliveryCharges.dhaka : deliveryCharges.outside;
  const grandTotal = totalSelectedAmount + (selectedCartItems.length > 0 ? deliveryCharge : 0);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    number: '',
    address: '',
    email: '',
  });

  // Prefill customer details for logged-in users so orders link to their account
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        name: prev.name || session.user.name || '',
        number: prev.number,
        address: prev.address,
        email: prev.email || session.user.email || '',
      }));
    }
  }, [session]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Record<string, unknown> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCartItems.length === 0) {
      setErrorMsg('No selected items in cart for checkout.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        customerDetails: formData,
        items: selectedCartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        deliveryType,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setCompletedOrder(json.data);
        clearSelectedItems();
      } else {
        setErrorMsg(json.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (completedOrder) {
    const customer = completedOrder.customerDetails as FormState;
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm border border-emerald-200 dark:border-emerald-800 animate-bounce">
            <CheckCircle2 size={48} />
          </div>

          <div className="space-y-3">
            <span className="inline-block px-3.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono font-bold text-xs uppercase tracking-widest rounded-full">
              Order Status: IN_REVIEW
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              Order Received Successfully!
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Thank you for shopping with Squad Lifestyle. Your order has been registered and is currently under review by our team.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl text-left space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-xs text-neutral-500 uppercase font-bold">Order ID:</span>
              <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{String(completedOrder._id)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-neutral-500">Customer Name:</p>
                <p className="font-bold text-neutral-900 dark:text-white">{customer.name}</p>
              </div>
              <div>
                <p className="text-neutral-500">Phone Number:</p>
                <p className="font-bold text-neutral-900 dark:text-white">{customer.number}</p>
              </div>
              <div>
                <p className="text-neutral-500">Shipping Address:</p>
                <p className="font-bold text-neutral-900 dark:text-white">{customer.address}</p>
              </div>
              <div>
                <p className="text-neutral-500">Delivery Area:</p>
                <p className="font-bold text-neutral-900 dark:text-white">
                  {String(
                    (completedOrder.deliveryType as string) === 'outside'
                      ? 'Outside Dhaka'
                      : 'Inside Dhaka'
                  )}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Subtotal:</p>
                <p className="font-bold text-neutral-900 dark:text-white">
                  ৳{Number(
                    (completedOrder.subtotalAmount as number) ??
                      (Number(completedOrder.totalAmount) -
                        Number((completedOrder.deliveryCharge as number) ?? 0))
                  ).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Delivery Charge:</p>
                <p className="font-bold text-neutral-900 dark:text-white">
                  ৳{Number((completedOrder.deliveryCharge as number) ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-neutral-500">Total Amount:</p>
                <p className="font-bold text-neutral-900 dark:text-white text-base">৳{Number(completedOrder.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
            >
              Back to Home
            </Link>
            {session && (
              <Link
                href="/orders"
                className="px-8 py-3.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
              >
                View My Orders
              </Link>
            )}
          </div>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight">Checkout Order</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Complete your details to place your order with cash on delivery.
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
        </div>

        {selectedCartItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-4 max-w-lg mx-auto shadow-xs">
            <h3 className="text-lg font-bold uppercase tracking-wider">No Items Selected</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Please select at least one item from your cart to proceed with checkout.
            </p>
            <Link
              href="/cart"
              className="inline-block px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl"
            >
              Go to Cart
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Shipping Details Form */}
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Lock className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Customer Shipping Details
                </h2>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 text-xs border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="number"
                      required
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="e.g. +880 1918-XXXXXX"
                      className="w-full px-4 py-3 text-xs border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. customer@example.com"
                      className="w-full px-4 py-3 text-xs border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                      Full Delivery Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House No, Road No, Area, City"
                      className="w-full px-4 py-3 text-xs border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                    />
                  </div>
                </div>

                <DeliveryTypeSelector
                  value={deliveryType}
                  onChange={setDeliveryType}
                  dhakaCharge={deliveryCharges.dhaka}
                  outsideCharge={deliveryCharges.outside}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-lg rounded-xl disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Place Order (Status: IN_REVIEW)</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Selected Order Items Summary */}
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-6 shadow-md sticky top-28">
                <h2 className="text-lg font-black uppercase tracking-wider border-b border-neutral-200/80 dark:border-neutral-800 pb-4 text-neutral-900 dark:text-white">
                  Selected Items ({selectedCartItems.length})
                </h2>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {selectedCartItems.map((item, idx) => {
                    const activePrice = item.product.discountPrice ?? item.product.originalPrice;
                    const img =
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80';

                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div className="relative w-12 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                          <Image src={img} alt={item.product.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate uppercase text-neutral-900 dark:text-white">{item.product.title}</p>
                          <p className="text-neutral-500 font-mono">
                            Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                          </p>
                        </div>
                        <p className="font-bold font-mono text-neutral-900 dark:text-white">${(activePrice * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 text-xs font-mono pt-2">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal:</span>
                    <span className="text-neutral-900 dark:text-white font-bold">
                      ৳{totalSelectedAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>
                      Delivery ({deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):
                    </span>
                    <span className="text-neutral-900 dark:text-white font-bold">
                      ৳{deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Total Payable:</span>
                  <span className="text-2xl font-black font-mono text-neutral-900 dark:text-white">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
