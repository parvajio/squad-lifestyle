'use client';

import React from 'react';
import { Truck, MapPin } from 'lucide-react';
import type { DeliveryType } from '@/context/CartContext';

interface Props {
  value: DeliveryType;
  onChange: (type: DeliveryType) => void;
  dhakaCharge: number;
  outsideCharge: number;
}

export default function DeliveryTypeSelector({ value, onChange, dhakaCharge, outsideCharge }: Props) {
  const options: Array<{
    id: DeliveryType;
    title: string;
    subtitle: string;
    charge: number;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dhaka',
      title: 'Inside Dhaka',
      subtitle: 'Delivery within Dhaka city',
      charge: dhakaCharge,
      icon: <MapPin size={18} />,
    },
    {
      id: 'outside',
      title: 'Outside Dhaka',
      subtitle: 'All other districts',
      charge: outsideCharge,
      icon: <Truck size={18} />,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
        Delivery Area *
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Delivery area">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? 'border-neutral-900 dark:border-white bg-neutral-900/[0.03] dark:bg-white/[0.06] shadow-sm ring-1 ring-neutral-900 dark:ring-white'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  active ? 'border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                {active && (
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white" />
                )}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">{opt.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-neutral-900 dark:text-white">
                  {opt.title}
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  {opt.subtitle}
                </span>
              </span>
              <span className="text-sm font-black font-mono text-neutral-900 dark:text-white whitespace-nowrap">
                ৳{opt.charge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
