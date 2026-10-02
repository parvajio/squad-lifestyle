'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import DeliveryTypeSelector from '@/components/DeliveryTypeSelector';
import { useCart } from '@/context/CartContext';
import { trackInitiateCheckout } from '@/lib/fpixel';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    totalSelectedAmount,
    selectedItemCount,
    deliveryType,
    setDeliveryType,
  } = useCart();

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
  const grandTotal = totalSelectedAmount + (selectedItemCount > 0 ? deliveryCharge : 0);

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);

  // The user action that begins checkout — fires once per real click.
  const handleProceedToCheckout = () => {
    trackInitiateCheckout(
      cart
        .filter((item) => item.selected)
        .map((item) => ({
          contentId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.discountPrice ?? item.product.originalPrice,
        }))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight">Shopping Bag</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Review items and select which products you wish to checkout.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider">Your Shopping Bag is Empty</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              Explore our minimalist collection and add your favorite apparel items.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Items List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Select All Bar */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs">
                <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-neutral-900 dark:accent-white rounded cursor-pointer"
                  />
                  Select All Items ({cart.length})
                </label>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {selectedItemCount} items selected
                </span>
              </div>

              {/* Item Cards */}
              <div className="space-y-4">
                {cart.map((item, index) => {
                  const activePrice = item.product.discountPrice ?? item.product.originalPrice;
                  const mainImage =
                    item.product.images && item.product.images.length > 0
                      ? item.product.images[0]
                      : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div
                      key={`${item.product._id}-${item.selectedSize || index}`}
                      className={`p-6 bg-white dark:bg-neutral-900 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all ${
                        item.selected
                          ? 'border-neutral-400 dark:border-neutral-600 shadow-sm'
                          : 'border-neutral-200/80 dark:border-neutral-800 opacity-65'
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectItem(item.product._id, item.selectedSize)}
                        className="w-5 h-5 accent-neutral-900 dark:accent-white rounded cursor-pointer mt-1 sm:mt-0"
                      />

                      {/* Image */}
                      <div className="relative w-24 h-28 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                        <Image
                          src={mainImage}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-base uppercase tracking-tight text-neutral-900 dark:text-white">
                          {item.product.title}
                        </h3>

                        {item.selectedSize && (
                          <p className="text-xs font-mono text-neutral-500">
                            Size Tag: <span className="font-bold text-neutral-900 dark:text-white">{item.selectedSize}</span>
                          </p>
                        )}

                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black font-mono text-neutral-900 dark:text-white">
                            ৳{activePrice}
                          </span>
                          {item.product.discountPrice && (
                            <span className="text-xs text-neutral-400 line-through font-mono">
                              ৳{item.product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-xs">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-900 dark:text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-xs font-bold font-mono text-neutral-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-900 dark:text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product._id, item.selectedSize)}
                          className="text-xs text-red-600 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-6 shadow-md sticky top-28">
                <h2 className="text-lg font-black uppercase tracking-wider border-b border-neutral-200/80 dark:border-neutral-800 pb-4 text-neutral-900 dark:text-white">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-neutral-500">
                    <span>Selected Items ({selectedItemCount}):</span>
                    <span className="text-neutral-900 dark:text-white font-bold">
                      ৳{totalSelectedAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Delivery ({deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                    <span className="text-neutral-900 dark:text-white font-bold">
                      ৳{selectedItemCount > 0 ? deliveryCharge.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <DeliveryTypeSelector
                  value={deliveryType}
                  onChange={setDeliveryType}
                  dhakaCharge={deliveryCharges.dhaka}
                  outsideCharge={deliveryCharges.outside}
                />

                <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Total Amount:</span>
                  <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    ৳{grandTotal.toFixed(2)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={handleProceedToCheckout}
                  className={`w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-lg rounded-xl ${
                    selectedItemCount === 0 ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>

                <p className="text-[10px] text-neutral-400 text-center uppercase tracking-wider">
                  No online payment gateway required. Payment on Delivery.
                </p>
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
