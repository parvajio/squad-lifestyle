'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, RefreshCw, Check, FolderOpen } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

const inputClass =
  'w-full px-4 py-3 min-h-[44px] text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNameInput('');
    setSlugInput('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setSlugInput(cat.slug);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Name is required');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), slug: slugInput.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        setShowModal(false);
        fetchCategories();
      } else {
        setErrorMsg(json.error || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchCategories();
      } else {
        alert(json.error || 'Failed to delete category');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Tag size={26} className="shrink-0" />
            <span className="truncate">Categories</span>
            {!loading && (
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums">
                {categories.length}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Organize products with categories and URL slugs.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            New category
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wide font-bold">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderOpen size={32} className="mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-bold text-neutral-900 dark:text-white">No categories yet</p>
            <p className="text-xs text-neutral-500">Create one to organize your catalog.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
              {categories.map((cat) => (
                <li key={cat._id} className="p-4 flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                    <Tag size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{cat.name}</p>
                    <p className="text-xs text-neutral-500 tabular-nums truncate">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center bg-red-50 dark:bg-red-950/50 text-red-600 rounded-lg"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 uppercase text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Category</th>
                    <th className="px-5 py-3.5 font-semibold">Slug</th>
                    <th className="px-5 py-3.5 font-semibold">Created</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900 dark:text-white truncate max-w-[220px]">
                        {cat.name}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        /{cat.slug}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-neutral-400 whitespace-nowrap">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="ml-1.5 p-2.5 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          aria-label={`Delete ${cat.name}`}
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

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl my-4 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                  {editingCategory ? 'Edit category' : 'New category'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
                    {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label htmlFor="cat-name" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Name *
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        if (!editingCategory) {
                          setSlugInput(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, '')
                          );
                        }
                      }}
                      placeholder="e.g. Footwear"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="cat-slug" className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Slug
                    </label>
                    <input
                      id="cat-slug"
                      type="text"
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      placeholder="e.g. footwear"
                      className={`${inputClass} tabular-nums`}
                    />
                    <p className="mt-1.5 text-xs text-neutral-500">Used in the product URL: /products?cat={slugInput || 'slug'}</p>
                  </div>
                  <div className="pt-1 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-5 py-3 min-h-[44px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-sm rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 min-h-[44px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl hover:bg-black dark:hover:bg-neutral-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                      {editingCategory ? 'Update' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
