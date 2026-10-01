'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart, CartProduct } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    description?: string;
    originalPrice: number;
    discountPrice?: number;
    images: string[];
    sizes?: string[];
    inStock: boolean;
    category?: { name: string; slug: string } | string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const validImages = (product.images || []).filter(
    (u) => typeof u === 'string' && /^https?:\/\//.test(u)
  );
  const mainImage =
    validImages.length > 0
      ? validImages[0]
      : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';

  const secondaryImage = validImages.length > 1 ? validImages[1] : mainImage;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : 'Apparel';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartProd: CartProduct = {
      _id: product._id,
      title: product.title,
      originalPrice: product.originalPrice,
      discountPrice: product.discountPrice,
      images: product.images,
      inStock: product.inStock,
      category: categoryName,
    };

    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    addToCart(cartProd, defaultSize, 1);
  };

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* Image Showcase Container */}
      <Link href={`/product/${product._id}`} className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 block">
        {/* Main Image */}
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
        />

        {/* Hover Secondary Image */}
        <Image
          src={secondaryImage}
          alt={`${product.title} preview`}
          fill
          className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md text-neutral-900 dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs border border-neutral-200/50 dark:border-neutral-700/50">
            {categoryName}
          </span>
        </div>

        {/* Discount Tag */}
        {product.discountPrice && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xs">
              SAVE ৳{(product.originalPrice - product.discountPrice).toFixed(0)}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-4 py-1.5 bg-black text-white font-bold text-xs uppercase tracking-widest border border-neutral-700 rounded-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Action Overlay on Hover */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-lg rounded-xl disabled:opacity-50"
          >
            <ShoppingBag size={14} />
            <span>Quick Add</span>
          </button>
          <span className="p-2.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <Eye size={16} />
          </span>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link href={`/product/${product._id}`}>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-neutral-300 transition-colors line-clamp-1 uppercase tracking-tight">
              {product.title}
            </h3>
          </Link>
          {product.sizes && product.sizes.length > 0 && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
              Sizes: {product.sizes.join(', ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-base font-black font-mono text-neutral-900 dark:text-white">
                  ৳{product.discountPrice}
                </span>
                <span className="text-xs text-neutral-400 line-through font-mono">
                  ৳{product.originalPrice}
                </span>
              </>
            ) : (
              <span className="text-base font-black font-mono text-neutral-900 dark:text-white">
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              product.inStock
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
