'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import CartDrawer from '@/components/CartDrawer';
import { Filter, Search, ArrowUpDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  images: string[];
  sizes?: string[];
  inStock: boolean;
  category: { _id: string; name: string; slug: string } | string;
  createdAt: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [loading, setLoading] = useState<boolean>(true);

  // Keep URL in sync when category changes (so links /products?category=x are shareable)
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  // Sync if user navigates with a different ?category= directly
  useEffect(() => {
    const fromUrl = searchParams.get('category') || 'all';
    setSelectedCategory((prev) => (prev !== fromUrl ? fromUrl : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?category=${selectedCategory}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.discountPrice ?? a.originalPrice;
    const priceB = b.discountPrice ?? b.originalPrice;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCategoryName =
    selectedCategory === 'all'
      ? 'All Products'
      : categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                {activeCategoryName}
              </h1>
              <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-1">
                {loading ? 'Loading…' : `${sortedProducts.length} item${sortedProducts.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-2 flex items-center gap-1 shrink-0">
                <Filter size={14} /> Filter:
              </span>
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-neutral-200/80 dark:border-neutral-800 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-xs"
                />
              </div>
              <div className="relative flex items-center">
                <ArrowUpDown className="absolute left-3.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
                  className="pl-9 pr-6 py-2 text-xs font-semibold border border-neutral-200/80 dark:border-neutral-800 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none cursor-pointer appearance-none uppercase tracking-wider shadow-xs"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 py-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200/60 dark:bg-neutral-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-4 shadow-xs">
            <p className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-sm">
              No products found matching your search criteria.
            </p>
            <button
              onClick={() => {
                handleCategoryChange('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold uppercase text-xs tracking-wider rounded-xl shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}>
      <ProductsContent />
    </Suspense>
  );
}
