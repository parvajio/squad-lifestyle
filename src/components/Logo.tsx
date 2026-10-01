import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'vertical' | 'horizontal';
}

export default function Logo({
  className = '',
  showText = true,
  size = 'md',
  layout = 'horizontal',
}: LogoProps) {
  const iconSizes = {
    sm: { w: 24, h: 24, svgClass: 'h-6 w-6', fontSize: 'text-sm' },
    md: {
      w: 36,
      h: 36,
      svgClass: 'h-7 w-7 sm:h-9 sm:w-9',
      fontSize: 'text-base sm:text-xl',
    },
    lg: { w: 56, h: 56, svgClass: 'h-10 w-10 sm:h-14 sm:w-14', fontSize: 'text-2xl sm:text-3xl' },
    xl: { w: 80, h: 80, svgClass: 'h-14 w-14 sm:h-20 sm:w-20', fontSize: 'text-3xl sm:text-5xl' },
  };

  const currentSize = iconSizes[size];

  return (
    <Link
      href="/"
      className={`group inline-flex min-w-0 items-center ${
        layout === 'vertical' ? 'flex-col gap-2 text-center' : 'flex-row gap-2 sm:gap-3'
      } ${className}`}
    >
      {/* 3 Parallel Angled Blocks forming the stylized 'S' */}
      <svg
        width={currentSize.w}
        height={currentSize.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${currentSize.svgClass}`}
      >
        {/* Top angled block */}
        <polygon
          points="35,15 90,15 65,35 10,35"
          fill="currentColor"
          className="text-black dark:text-white"
        />
        {/* Middle angled block */}
        <polygon
          points="45,40 100,40 75,60 20,60"
          fill="currentColor"
          className="text-black dark:text-white"
        />
        {/* Bottom angled block */}
        <polygon
          points="55,65 110,65 85,85 30,85"
          fill="currentColor"
          className="text-black dark:text-white"
        />
      </svg>

      {showText && (
        <span
          className={`truncate font-black tracking-[0.18em] sm:tracking-[0.25em] uppercase text-black dark:text-white ${currentSize.fontSize} transition-colors`}
        >
          SQUAD
        </span>
      )}
    </Link>
  );
}
