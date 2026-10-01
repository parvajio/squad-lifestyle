'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCart, CartProduct } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Check, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

interface ProductDetail {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  images: string[];
  sizes?: string[];
  inStock: boolean;
  category?: { name: string; slug: string };
}

export default function ProductDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setProduct(json.data);
            if (json.data.sizes && json.data.sizes.length > 0) {
              setSelectedSize(json.data.sizes[0]);
            }
          }
        })
        .catch((err) => console.error('Error fetching product:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-xl font-bold uppercase tracking-wider">Product Not Found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold uppercase text-xs rounded-xl shadow-xs"
          >
            Return to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
      : [];
  const displayImages =
    images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  const categoryName = product.category?.name || 'Apparel';
  const hasDiscount = Boolean(product.discountPrice);

  const handleAddToCart = () => {
    const cartProd: CartProduct = {
      _id: product._id,
      title: product.title,
      originalPrice: product.originalPrice,
      discountPrice: product.discountPrice,
      images: product.images,
      inStock: product.inStock,
      category: categoryName,
    };

    addToCart(cartProd, product.sizes && product.sizes.length > 0 ? selectedSize : undefined, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </button>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <Image
                src={displayImages[selectedImageIndex] ?? displayImages[0]}
                alt={product.title}
                fill
                priority
                className="object-cover"
              />

              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                  SPECIAL OFFER
                </div>
              )}
            </div>

            {/* Thumbnail Carousel / List */}
            {displayImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-neutral-900 dark:border-white scale-105 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Title */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  {categoryName}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                  {product.title}
                </h1>
              </div>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-4 py-3 border-y border-neutral-200/80 dark:border-neutral-800">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                      ৳{product.discountPrice}
                    </span>
                    <span className="text-xl font-mono text-neutral-400 line-through">
                      ৳{product.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-2.5 py-1 rounded-full uppercase">
                      Save ৳{(product.originalPrice - (product.discountPrice || 0)).toFixed(0)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    ৳{product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Product Overview
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
                      Select Size:
                    </label>
                    <span className="text-xs text-neutral-400 font-mono">
                      Selected: <strong className="text-neutral-900 dark:text-white">{selectedSize}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-11 px-4 border text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-xl ${
                          selectedSize === size
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm scale-105'
                            : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white block">
                  Quantity:
                </label>
                <div className="inline-flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-mono font-bold text-sm text-neutral-900 dark:text-white"
                  >
                    -
                  </button>
                  <span className="px-5 font-mono font-bold text-sm text-neutral-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-mono font-bold text-sm text-neutral-900 dark:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Action */}
            <div className="space-y-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50 rounded-xl"
              >
                <ShoppingBag size={18} />
                <span>{product.inStock ? 'Add to Shopping Cart' : 'Currently Out of Stock'}</span>
              </button>

              {addedToast && (
                <div className="p-3 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider text-center rounded-xl flex items-center justify-center gap-2 animate-pulse shadow-xs">
                  <Check size={16} />
                  <span>Item added to cart!</span>
                </div>
              )}

              {/* Shipping & Support Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-neutral-900 dark:text-white" />
                  <span>Express Delivery Nationwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-neutral-900 dark:text-white" />
                  <span>100% Authentic Squad Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
