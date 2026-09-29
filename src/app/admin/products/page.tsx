'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';
import { Package, Plus, Edit2, Trash2, X, RefreshCw, Check, Tag } from 'lucide-react';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

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
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
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
    <div className="space-y-8 font-sans transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <Package size={28} />
            <span>Product Catalog</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Manage inventory, images, prices, discounts, and custom size tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest hover:bg-black dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 rounded-xl shadow-xs"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider font-bold">Loading product catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <p className="text-sm font-bold uppercase tracking-wider">No products added yet.</p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase rounded-xl"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 uppercase font-mono border-b border-neutral-200/80 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Size Tags</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                {products.map((prod) => {
                  const categoryName =
                    typeof prod.category === 'object' && prod.category !== null
                      ? prod.category.name
                      : 'Apparel';

                  const mainImg =
                    prod.images && prod.images.length > 0
                      ? (prod.images.find((u) => typeof u === 'string' && /^https?:\/\//.test(u)) ??
                        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80')
                      : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80';

                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-950/60 transition-colors">
                      <td className="px-6 py-3">
                        <div className="relative w-10 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                          <Image src={mainImg} alt={prod.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-3 font-bold text-neutral-900 dark:text-white uppercase max-w-xs truncate">
                        {prod.title}
                      </td>
                      <td className="px-6 py-3 font-mono text-neutral-500 dark:text-neutral-400">{categoryName}</td>
                      <td className="px-6 py-3 font-mono">
                        {prod.discountPrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-neutral-900 dark:text-white">${prod.discountPrice}</span>
                            <span className="text-[10px] text-neutral-400 line-through">
                              ${prod.originalPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-neutral-900 dark:text-white">${prod.originalPrice}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-neutral-500 dark:text-neutral-400">
                        {prod.sizes && prod.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {prod.sizes.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-[10px] border border-neutral-200 dark:border-neutral-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prod.inStock
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {prod.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                {editingProduct ? 'Edit Product details' : 'Add New Lifestyle Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Product Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Squad Stealth Heavyweight Hoodie"
                  className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-sans shadow-xs"
                />
              </div>

              {/* Category & Stock Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white uppercase font-bold shadow-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer py-3">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-5 h-5 accent-neutral-900 dark:accent-white rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      In Stock & Available
                    </span>
                  </label>
                </div>
              </div>

              {/* Pricing (Original & Discount) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                    Original Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="120.00"
                    className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                    Discount Price ($) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="89.00 (leave empty if no discount)"
                    className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono shadow-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                  Product Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed material specs, fit description, care instructions..."
                  className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-sans shadow-xs"
                />
              </div>

              {/* Dynamic Size Tags Input */}
              <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <Tag size={14} />
                  <span>Arbitrary Size Tags (e.g., S, M, L, XL, 42, 44 or leave blank)</span>
                </label>

                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sizes.map((sz) => (
                      <span
                        key={sz}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono font-bold text-xs rounded-full uppercase shadow-xs"
                      >
                        {sz}
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeTag(sz)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
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
                    placeholder="Type size (e.g. 42 or XL) and press Enter"
                    className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono uppercase shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSizeTag}
                    className="px-4 py-2.5 bg-neutral-800 text-white font-bold text-xs uppercase rounded-xl hover:bg-neutral-700 transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  If left blank, no size selector will be displayed on the customer product page.
                </p>
              </div>

              {/* Image Uploader Integration */}
              <ImageUploader images={images} onChange={setImages} />

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold text-xs uppercase rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black dark:hover:bg-neutral-200 flex items-center gap-2 shadow-xs"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
