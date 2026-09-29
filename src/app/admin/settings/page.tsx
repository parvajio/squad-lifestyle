'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function DeliverySettingsPage() {
  const [dhaka, setDhaka] = useState('70');
  const [outside, setOutside] = useState('130');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setDhaka(String(json.data.dhaka));
        setOutside(String(json.data.outside));
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to load current charges.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dhaka: Number(dhaka), outside: Number(outside) }),
      });
      const json = await res.json();
      if (json.success) {
        setDhaka(String(json.data.dhaka));
        setOutside(String(json.data.outside));
        setMessage({ type: 'success', text: 'Delivery charges updated successfully.' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to update charges.' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans transition-colors duration-200 max-w-2xl">
      <div className="border-b border-neutral-200/80 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
          <Truck size={28} />
          <span>Delivery Charges</span>
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage Inside Dhaka and Outside Dhaka delivery fees applied at checkout.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 text-xs font-bold uppercase rounded-xl border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs"
      >
        {loading ? (
          <div className="py-10 text-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider font-bold">Loading charges...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                  Inside Dhaka (৳) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  required
                  value={dhaka}
                  onChange={(e) => setDhaka(e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full px-4 py-3 text-sm font-mono border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">Applied when customer selects Inside Dhaka.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider block text-neutral-800 dark:text-neutral-200">
                  Outside Dhaka (৳) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  required
                  value={outside}
                  onChange={(e) => setOutside(e.target.value)}
                  placeholder="e.g. 130"
                  className="w-full px-4 py-3 text-sm font-mono border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                />
                <p className="text-[11px] text-neutral-500">Applied when customer selects Outside Dhaka.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-lg rounded-xl disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Delivery Charges</span>
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
