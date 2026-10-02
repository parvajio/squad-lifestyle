'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';
import { Package, Plus, Edit2, Trash2, X, RefreshCw, Check, Tag, Search } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  _id: string;
  title: string;
  description: string;
  category: { _id: string; name: string } | string;
  originalPrice: number;
  discountPrice?: number;
  images: string[];
  sizes?: string[];
  inStock: boolean;
  createdAt: string;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80';

function mainImage(images?: string[]) {
  if (!images || images.length === 0) return FALLBACK_IMG;
  return images.find((u) => typeof u === 'string' && /^https?:\/\//.test(u)) ?? FALLBACK_IMG;
}

function categoryName(category: ProductItem['category']) {
  return typeof category === 'object' && category !== null ? category.name : 'Apparel';
}

const inputClass =
  'w-full px-4 py-3 min-h-[44px] text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [search, setSearch] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeTagInput, setSizeTagInput] = useState('');
  const [inStock, setInStock] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      const pJson = await pRes.json();
      const cJson = await cRes.json();

      if (pJson.success) setProducts(pJson.data);
      if (cJson.success) setCategories(cJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        categoryName(p.category).toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setCategoryId(categories.length > 0 ? categories[0]._id : '');
    setOriginalPrice('');
    setDiscountPrice('');
    setImages([]);
    setSizes([]);
    setSizeTagInput('');
    setInStock(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setDescription(prod.description);
    setCategoryId(typeof prod.category === 'object' ? prod.category._id : prod.category);
    setOriginalPrice(String(prod.originalPrice));
    setDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setImages(prod.images || []);
    setSizes(prod.sizes || []);
    setSizeTagInput('');
    setInStock(prod.inStock);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleAddSizeTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = sizeTagInput.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
      setSizeTagInput('');
    }
  };

  const handleRemoveSizeTag = (tagToRemove: string) => {
    setSizes(sizes.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId || !originalPrice) {
      setErrorMsg('Please fill in all required fields (title, description, category, price).');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: categoryId,
        originalPrice: Number(originalPrice),
        discountPrice: discountPrice.trim() !== '' ? Number(discountPrice) : undefined,
        images,
        sizes,
        inStock,
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setShowModal(false);
        fetchProductsAndCategories();
      } else {
        setErrorMsg(json.error || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchProductsAndCategories();
      } else {
        alert(json.error || 'Failed to delete product');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Package size={26} className="shrink-0" />
            <span className="truncate">Products</span>
            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums">
              {products.length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage inventory, images, prices and sizes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <label className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories…"
              className="w-full pl-10 pr-4 py-3 min-h-[44px] text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </label>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors shrink-0"
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wide font-bold">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={32} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-bold text-neutral-900 dark:text-white">No products yet</p>
            <p className="text-xs text-neutral-500">Add your first product to start selling.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl"
            >
              <Plus size={16} /> Add product
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">No matches for “{search}”</p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-sm font-semibold text-neutral-500 underline underline-offset-4 min-h-[44px]"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((prod) => (
                <li key={prod._id} className="p-4 flex gap-3">
                  <div className="relative w-16 h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
                    <Image src={mainImage(prod.images)} alt={prod.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{prod.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{categoryName(prod.category)}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                      ৳{prod.discountPrice ?? prod.originalPrice}
                      {prod.discountPrice != null && (
                        <span className="ml-1.5 text-xs font-normal text-neutral-400 line-through">
                          ৳{prod.originalPrice}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          prod.inStock
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {prod.inStock ? 'In stock' : 'Out of stock'}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                          aria-label={`Edit ${prod.title}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg"
                          aria-label={`Delete ${prod.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 uppercase text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Product</th>
                    <th className="px-5 py-3.5 font-semibold">Category</th>
                    <th className="px-5 py-3.5 font-semibold">Price</th>
                    <th className="px-5 py-3.5 font-semibold">Sizes</th>
                    <th className="px-5 py-3.5 font-semibold">Stock</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filtered.map((prod) => (
                    <tr key={prod._id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
                            <Image src={mainImage(prod.images)} alt={prod.title} fill className="object-cover" sizes="40px" />
                          </div>
                          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[220px]" title={prod.title}>
                            {prod.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{categoryName(prod.category)}</td>
                      <td className="px-5 py-3 tabular-nums whitespace-nowrap">
                        {prod.discountPrice ? (
                          <span className="flex items-baseline gap-1.5">
                            <span className="font-bold text-neutral-900 dark:text-white">৳{prod.discountPrice}</span>
                            <span className="text-xs text-neutral-400 line-through">৳{prod.originalPrice}</span>
                          </span>
                        ) : (
                          <span className="font-bold text-neutral-900 dark:text-white">৳{prod.originalPrice}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {prod.sizes && prod.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {prod.sizes.slice(0, 5).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-[11px] border border-neutral-200 dark:border-neutral-700 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {prod.sizes.length > 5 && (
                              <span className="text-[11px] text-neutral-400">+{prod.sizes.length - 5}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${
                            prod.inStock
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          {prod.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          aria-label={`Edit ${prod.title}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="ml-1.5 p-2.5 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          aria-label={`Delete ${prod.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
            <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl my-4 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                  {editingProduct ? 'Edit product' : 'Add new product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2.5 -mr-1 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto px-5 sm:px-7 py-5">
                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <form id="product-form" onSubmit={handleSaveProduct} className="space-y-5">
                  <div>
                    <label htmlFor="prod-title" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Product title *
                    </label>
                    <input
                      id="prod-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Squad Stealth Heavyweight Hoodie"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prod-cat" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                        Category *
                      </label>
                      <select id="prod-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                        {categories.length === 0 && <option value="">No categories — create one first</option>}
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={inStock}
                          onChange={(e) => setInStock(e.target.checked)}
                          className="w-5 h-5 accent-neutral-900 dark:accent-white rounded cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          In stock &amp; available
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prod-price" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                        Original price (৳) *
                      </label>
                      <input
                        id="prod-price"
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="120.00"
                        className={`${inputClass} tabular-nums`}
                      />
                    </div>
                    <div>
                      <label htmlFor="prod-discount" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                        Discount price (৳)
                      </label>
                      <input
                        id="prod-discount"
                        type="number"
                        step="0.01"
                        min={0}
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="Optional"
                        className={`${inputClass} tabular-nums`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="prod-desc" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Description *
                    </label>
                    <textarea
                      id="prod-desc"
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Material, fit, care instructions…"
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-900 dark:text-white flex items-center gap-2">
                      <Tag size={14} />
                      Sizes
                    </p>
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs rounded-full uppercase"
                          >
                            {sz}
                            <button type="button" onClick={() => handleRemoveSizeTag(sz)} aria-label={`Remove size ${sz}`} className="hover:opacity-70 p-0.5">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={sizeTagInput}
                        onChange={(e) => setSizeTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSizeTag();
                          }
                        }}
                        placeholder="e.g. M, XL, 42 — press Enter"
                        className="flex-1 px-4 py-2.5 min-h-[44px] text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSizeTag()}
                        className="px-5 py-2.5 min-h-[44px] bg-neutral-800 dark:bg-neutral-700 text-white font-semibold text-sm rounded-xl hover:bg-neutral-700 transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <ImageUploader images={images} onChange={setImages} />
                </form>
              </div>

              <div className="shrink-0 px-5 sm:px-7 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 min-h-[44px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-sm rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={saving}
                  className="px-6 py-3 min-h-[44px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl hover:bg-black dark:hover:bg-neutral-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                  {editingProduct ? 'Update product' : 'Save product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
