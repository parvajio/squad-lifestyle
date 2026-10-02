'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Save, Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

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
        setMessage({ type: 'success', text: 'Delivery charges updated.' });
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
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
          <Truck size={26} className="shrink-0" />
          <span className="truncate">Delivery charges</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Fees applied at checkout based on delivery zone.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`p-4 text-sm font-semibold rounded-xl border flex items-start gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 space-y-5"
      >
        {loading ? (
          <div className="py-10 text-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wide font-bold">Loading charges…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="charge-dhaka" className="text-xs font-bold uppercase tracking-wide block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Inside Dhaka (৳) *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    id="charge-dhaka"
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={dhaka}
                    onChange={(e) => setDhaka(e.target.value)}
                    placeholder="70"
                    className="w-full pl-10 pr-4 py-3 min-h-[48px] text-base tabular-nums border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">Applied for Inside Dhaka orders.</p>
              </div>

              <div>
                <label htmlFor="charge-outside" className="text-xs font-bold uppercase tracking-wide block mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Outside Dhaka (৳) *
                </label>
                <div className="relative">
                  <Truck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    id="charge-outside"
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={outside}
                    onChange={(e) => setOutside(e.target.value)}
                    placeholder="130"
                    className="w-full pl-10 pr-4 py-3 min-h-[48px] text-base tabular-nums border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">Applied for Outside Dhaka orders.</p>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800 p-4 text-sm text-neutral-600 dark:text-neutral-300">
              Current checkout preview: <strong className="tabular-nums text-neutral-900 dark:text-white">৳{dhaka}</strong> inside Dhaka ·{' '}
              <strong className="tabular-nums text-neutral-900 dark:text-white">৳{outside}</strong> outside Dhaka.
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 min-h-[48px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save delivery charges
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
