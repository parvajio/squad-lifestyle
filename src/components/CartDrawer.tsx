'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    totalSelectedAmount,
    selectedItemCount,
  } = useCart();

  if (!isCartOpen) return null;

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-neutral-900 dark:text-white" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Your Cart</h2>
              <span className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Close cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium text-sm">Your shopping cart is empty</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold uppercase text-xs tracking-wider rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
                  <label className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 dark:accent-white rounded cursor-pointer"
                    />
                    Select All Items
                  </label>
                  <span className="text-xs text-neutral-400 font-mono">
                    {selectedItemCount} selected for checkout
                  </span>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4">
                  {cart.map((item, index) => {
                    const activePrice =
                      item.product.discountPrice ?? item.product.originalPrice;
                    const mainImage =
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';

                    return (
                      <div
                        key={`${item.product._id}-${item.selectedSize || index}`}
                        className={`flex items-center gap-4 p-3.5 border ${
                          item.selected
                            ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-50/80 dark:bg-neutral-900/60 shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 opacity-60'
                        } rounded-xl transition-all`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() =>
                            toggleSelectItem(item.product._id, item.selectedSize)
                          }
                          className="w-4 h-4 accent-neutral-900 dark:accent-white rounded cursor-pointer"
                        />

                        {/* Image */}
                        <div className="relative w-16 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                          <Image
                            src={mainImage}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-sm font-bold truncate text-neutral-900 dark:text-white uppercase tracking-tight">
                            {item.product.title}
                          </h3>

                          {item.selectedSize && (
                            <p className="text-xs font-mono text-neutral-500">
                              Size: <span className="font-bold text-neutral-900 dark:text-white">{item.selectedSize}</span>
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                              ${activePrice}
                            </span>
                            {item.product.discountPrice && (
                              <span className="text-xs text-neutral-400 line-through font-mono">
                                ${item.product.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden bg-white dark:bg-neutral-900">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.selectedSize,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2 text-xs font-bold font-mono min-w-[20px] text-center">
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
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-white"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeFromCart(item.product._id, item.selectedSize)
                              }
                              className="p-1 text-neutral-400 hover:text-red-600 transition-colors ml-auto"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 uppercase font-bold text-xs tracking-wider">
                  Subtotal ({selectedItemCount}):
                </span>
                <span className="text-2xl font-black font-mono text-neutral-900 dark:text-white">
                  ৳{totalSelectedAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 text-center">
                + Delivery charge (Inside Dhaka / Outside Dhaka) at checkout
              </p>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className={`w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-md rounded-xl ${
                  selectedItemCount === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>

              <div className="text-center">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline uppercase tracking-wider font-semibold"
                >
                  View Full Cart Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
