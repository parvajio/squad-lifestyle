'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Logo from './Logo';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, User as UserIcon, Shield, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -ml-2 shrink-0 text-neutral-800 dark:text-neutral-100 hover:opacity-75 transition-opacity"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Logo size="md" className="min-w-0 shrink-0" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-xs tracking-widest uppercase">
          <Link
            href="/"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-neutral-900 dark:text-white hover:opacity-75 transition-opacity font-bold"
          >
            Shop All
          </Link>
          <Link
            href="/#categories"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/#products"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Featured
          </Link>
          <Link
            href="/products"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors md:hidden lg:inline"
          >
            Collections
          </Link>
          {session && (
            <Link
              href="/orders"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <Shield size={14} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Light / Dark Mode Toggle Switcher */}
          <button
            onClick={toggleTheme}
            className="shrink-0 p-2 sm:p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
            aria-label="Toggle Theme Mode"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon size={16} className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-300 hover:rotate-12" />
            ) : (
              <Sun size={16} className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-300 hover:rotate-45 text-amber-400" />
            )}
          </button>

          {/* Cart Icon Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="shrink-0 relative p-2 sm:p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono border-2 border-white dark:border-black animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Dropdown */}
          <div className="relative shrink-0">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 whitespace-nowrap shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                >
                  <UserIcon size={16} />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl py-2 z-50 text-xs uppercase font-medium">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 lowercase truncate">
                        {session.user.email}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        Role: {session.user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-emerald-600 dark:text-emerald-400 font-bold"
                      >
                        <Shield size={14} />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold"
                    >
                      <ShoppingBag size={14} />
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        signOut();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 font-semibold"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center whitespace-nowrap shrink-0 px-3 sm:px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md px-6 py-6 space-y-4 font-bold text-xs uppercase tracking-widest">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-600 dark:text-neutral-400"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-900 dark:text-white"
          >
            Shop All Products
          </Link>
          <Link
            href="/#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-600 dark:text-neutral-400"
          >
            Categories
          </Link>
          {session && (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-neutral-900 dark:text-white"
            >
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-emerald-600 dark:text-emerald-400 font-bold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
