/**
 * DramaBox & ReelShort Auth Modal (Login / Sign Up)
 * 1-to-1 match with https://reels.7xmtools.com AuthModal with free coins on signup.
 */

import React, { useState } from 'react';
import { X, Lock, User, Coins, AlertCircle } from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';

export function DramaAuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser } = useDramaBoxStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await dramaboxApi.login(username, password);
        setUser(res.user, res.token);
        setAuthModalOpen(false);
      } else {
        const res = await dramaboxApi.register(username, password);
        setUser(res.user, res.token);
        setAuthModalOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md apple-glass-heavy rounded-3xl border border-white/[0.12] shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white apple-glass-thin"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
            <Coins className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back' : 'Join DramaBox Free'}
          </h2>
          <p className="type-meta text-white/60 text-xs mt-1">
            {mode === 'login'
              ? 'Sign in to access your coins and unlock every episode.'
              : 'Create a free account and instantly receive 100 starter coins!'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="type-meta text-xs text-white/72 mb-1.5 block">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="type-meta text-xs text-white/72 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#e11d48] hover:bg-[#f43f5e] text-white text-sm font-semibold tracking-wide transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50 mt-2"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Log In'
              : 'Sign Up & Get 100 Coins'}
          </button>
        </form>

        {/* Mode Toggle Footer */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center type-meta text-xs text-white/60">
          {mode === 'login' ? (
            <>
              New to DramaBox?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-rose-400 font-semibold hover:underline"
              >
                Sign Up Free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-rose-400 font-semibold hover:underline"
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
