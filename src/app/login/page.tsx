'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-neutral-900/10 dark:bg-white/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-8 space-y-8 shadow-xl">
        <div className="text-center space-y-4">
          <Logo layout="vertical" size="lg" className="mx-auto" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase tracking-widest">
            Member & Admin Portal Access
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-md rounded-xl disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Google OAuth Provider Button */}
        <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/admin' })}
            className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-xl shadow-xs"
          >
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
