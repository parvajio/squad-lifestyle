'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = '8801918316404';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20Squad%20Lifestyle!%20I%20have%20an%20inquiry.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip Popup */}
      {showTooltip && (
        <div className="relative hidden md:flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-neutral-800 dark:border-neutral-200 animate-bounce">
          <span>Need help? Chat with us!</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition-colors"
            aria-label="Close tooltip"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 fill-current stroke-emerald-600" />
      </a>
    </div>
  );
}
