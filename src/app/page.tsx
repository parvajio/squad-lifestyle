'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import CartDrawer from '@/components/CartDrawer';
import { Filter, Sparkles, RefreshCw, ArrowRight, LayoutGrid } from 'lucide-react';

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

const PREVIEW_LIMIT = 8;
const SECTION_LIMIT = 4;

function getCategorySlug(p: ProductItem): string {
  return typeof p.category === 'object' && p.category !== null ? p.category.slug : '';
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products?category=all'),
      ]);
      const [catJson, prodJson] = await Promise.all([catRes.json(), prodRes.json()]);
      if (catJson.success) setCategories(catJson.data);
      if (prodJson.success) setProducts(prodJson.data);
    } catch (err) {
      console.error('Error fetching shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchAll();
    } catch (e) {
      console.error('Seed error:', e);
    } finally {
      setSeeding(false);
    }
  };

  // Preview: filtered by pill, newest first, capped
  const previewProducts = useMemo(() => {
    const filtered =
      selectedCategory === 'all'
        ? products
        : products.filter((p) => getCategorySlug(p) === selectedCategory);
    return [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, PREVIEW_LIMIT);
  }, [products, selectedCategory]);

  const previewTotalCount = useMemo(() => {
    if (selectedCategory === 'all') return products.length;
    return products.filter((p) => getCategorySlug(p) === selectedCategory).length;
  }, [products, selectedCategory]);

  // Section-wise: group all products under each known category
  const categorySections = useMemo(() => {
    return categories
      .map((cat) => {
        const items = products
          .filter((p) => getCategorySlug(p) === cat.slug)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { category: cat, items, total: items.length };
      })
      .filter((s) => s.total > 0);
  }, [categories, products]);

  // Products whose category is missing/deleted still deserve visibility
  const uncategorizedItems = useMemo(
    () =>
      products.filter((p) => {
        const slug = getCategorySlug(p);
        return !slug || !categories.some((c) => c.slug === slug);
      }),
    [products, categories]
  );

  const previewLink =
    selectedCategory === 'all' ? '/products' : `/products?category=${selectedCategory}`;

  const selectedCategoryName =
    selectedCategory === 'all'
      ? 'All Products'
      : categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none flex items-center justify-center">
          <span className="text-[22vw] font-black tracking-tighter uppercase select-none text-neutral-900 dark:text-white">
            SQUAD
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase tracking-widest shadow-xs">
            <Sparkles size={14} className="text-amber-500" />
            <span>Autumn / Winter 2026 Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none max-w-4xl mx-auto text-neutral-900 dark:text-white">
            SQUAD LIFESTYLE
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
            Engineered minimalism. Clean apparel & luxury streetwear crafted for modern urban aesthetics.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#products"
              className="px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest hover:bg-black dark:hover:bg-neutral-200 transition-all rounded-xl shadow-md"
            >
              Shop Collection
            </a>
            <Link
              href="/products"
              className="px-6 py-3.5 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 font-semibold uppercase text-xs tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 rounded-xl shadow-xs"
            >
              <LayoutGrid size={14} />
              <span>View All Products</span>
            </Link>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-6 py-3.5 bg-transparent text-neutral-500 dark:text-neutral-400 font-semibold uppercase text-xs tracking-widest hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-2 rounded-xl"
            >
              <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
              <span>{seeding ? 'Loading Demo Data...' : 'Load Demo Data'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Preview: limited products + category filter + Show All */}
      <main id="products" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Fresh Drops
            </p>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
              Shop Latest Products
            </h2>
            <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-1">
              {loading ? 'Loading…' : `Showing ${previewProducts.length} of ${previewTotalCount} — ${selectedCategoryName}`}
            </p>
          </div>
          <Link
            href={previewLink}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest rounded-xl shadow-md hover:bg-black dark:hover:bg-neutral-200 transition-all"
          >
            Show All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category pills filter for preview */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-2 flex items-center gap-1 shrink-0">
            <Filter size={14} /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
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
              onClick={() => setSelectedCategory(cat.slug)}
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

        {/* Preview grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200/60 dark:bg-neutral-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : previewProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl space-y-4 shadow-xs">
            <p className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-sm">
              No products found in this category yet.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold uppercase text-xs tracking-wider rounded-xl shadow-xs"
            >
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {previewProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {previewTotalCount > PREVIEW_LIMIT && (
              <div className="flex justify-center pt-2">
                <Link
                  href={previewLink}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-bold uppercase text-xs tracking-widest rounded-xl hover:border-neutral-900 dark:hover:border-white transition-all shadow-xs"
                >
                  Show All {previewTotalCount} {selectedCategoryName} <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* Category-wise sections for scroll browsing */}
      <section id="categories" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 scroll-mt-24">
        <div className="text-center space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            Browse by Category
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Shop by Collection
          </h2>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Scroll down to explore each category — tap View All for the full range
          </p>
        </div>

        {loading ? (
          <div className="space-y-12">
            {[1, 2].map((s) => (
              <div key={s} className="space-y-4">
                <div className="h-6 w-48 bg-neutral-200/60 dark:bg-neutral-900 rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-neutral-200/60 dark:bg-neutral-900 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categorySections.length === 0 && uncategorizedItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs">
            <p className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-sm">
              No categorized products yet.
            </p>
          </div>
        ) : (
          <>
            {categorySections.map(({ category, items, total }) => (
              <div key={category._id} id={`category-${category.slug}`} className="space-y-5 scroll-mt-28">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{category.name}</h3>
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {total} item{total === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white rounded-full px-4 py-2 bg-white dark:bg-neutral-900"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.slice(0, SECTION_LIMIT).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ))}

            {uncategorizedItems.length > 0 && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">More Products</h3>
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {uncategorizedItems.length} item{uncategorizedItems.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white rounded-full px-4 py-2 bg-white dark:bg-neutral-900"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {uncategorizedItems.slice(0, SECTION_LIMIT).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
