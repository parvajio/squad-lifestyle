'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, RefreshCw, Check } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

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
    <div className="space-y-8 font-sans transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
            <Tag size={28} />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Create, edit, and organize product categories and URL slugs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest hover:bg-black dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 rounded-xl shadow-xs"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider font-bold">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <p className="text-sm font-bold uppercase tracking-wider">No categories created yet.</p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase rounded-xl"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 uppercase font-mono border-b border-neutral-200/80 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-950/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white uppercase">{cat.name}</td>
                    <td className="px-6 py-4 font-mono text-neutral-500 dark:text-neutral-400">/{cat.slug}</td>
                    <td className="px-6 py-4 font-mono text-neutral-400 dark:text-neutral-500">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        aria-label="Edit category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (!editingCategory) {
                      setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Footwear"
                  className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-sans shadow-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="e.g. footwear"
                  className="w-full px-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono shadow-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
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
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
