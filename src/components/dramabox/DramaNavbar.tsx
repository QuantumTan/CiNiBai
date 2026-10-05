/**
 * DramaBox & ReelShort Navigation Bar
 * Exact architecture of https://reels.7xmtools.com navigation, styled with visionOS liquid glass.
 */

import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Clock, 
  Search, 
  Coins, 
  User, 
  LogOut, 
  Play, 
  Menu, 
  X,
  Compass
} from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import type { DramaViewTab } from '../../lib/reels/dramaboxTypes';

export function DramaNavbar() {
  const { 
    activeTab, 
    setActiveTab, 
    coins, 
    user, 
    logout, 
    setAuthModalOpen, 
    setSearchModalOpen 
  } = useDramaBoxStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { tab: DramaViewTab; label: string; icon: React.ElementType }[] = [
    { tab: 'home', label: 'Home', icon: Compass },
    { tab: 'all-movies', label: 'All Dramas', icon: Film },
    { tab: 'new-release', label: 'New Release', icon: Sparkles },
    { tab: 'history', label: 'History', icon: Clock },
    { tab: 'infinite-feed', label: 'Infinite Feed', icon: Play },
  ];

  return (
    <header className="sticky top-0 z-40 w-full apple-glass-regular border-b border-white/[0.08] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#e11d48] flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform duration-200">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                DramaBox
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  LIVE
                </span>
              </span>
              <span className="type-meta text-white/48 -mt-0.5 hidden sm:inline">Short Drama Cinema</span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="DramaBox Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'text-white/72 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-white/60'}`} strokeWidth={1.5} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search & Coins / Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-thin border border-white/[0.08] text-white/72 hover:text-white hover:border-white/20 transition-all text-xs"
            title="Search Dramas (⌘K)"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Search titles, billionaires...</span>
            <kbd className="hidden lg:inline text-[10px] text-white/48 px-1.5 py-0.5 rounded bg-white/[0.06]">⌘K</kbd>
          </button>

          {/* User Coins Balance Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 type-meta">
            <Coins className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
            <span className="font-semibold tabular-nums">{coins}</span>
            <span className="hidden sm:inline text-amber-300/80">Coins</span>
          </div>

          {/* Auth Button or Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full apple-glass-thin border border-white/10 text-white type-meta">
                <User className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
                <span className="truncate max-w-[80px] font-medium">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#e11d48] hover:bg-[#f43f5e] text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-rose-950/40"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white/72 hover:text-white apple-glass-thin"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] apple-glass-heavy px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => {
                  setActiveTab(item.tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/72 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-white/60'}`} strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
