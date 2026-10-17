import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  Sparkles, 
  Clock, 
  Search, 
  Play, 
  Menu, 
  X,
  Compass,
  ArrowLeft,
  Flame
} from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import type { DramaViewTab } from '../../lib/reels/dramaboxTypes';

export function DramaNavbar() {
  const navigate = useNavigate();
  const { 
    activeTab, 
    setActiveTab, 
    setSearchModalOpen 
  } = useDramaBoxStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tab: DramaViewTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    navigate(tab === 'infinite-feed' ? '/reels' : `/reels?tab=${tab}`);
  };

  const navItems: { tab: DramaViewTab; label: string; icon: React.ElementType }[] = [
    { tab: 'infinite-feed', label: 'Reels Feed', icon: Play },
    { tab: 'home', label: 'Spotlight', icon: Compass },
    { tab: 'all-movies', label: 'All Series', icon: Film },
    { tab: 'new-release', label: 'New Drops', icon: Sparkles },
    { tab: 'history', label: 'History', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 w-full apple-glass-regular border-b border-white/[0.08] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass-thin border border-white/10 text-white/70 hover:text-white transition-colors text-xs font-semibold mr-1"
            title="Return to CineBai Discover"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CineBai</span>
          </Link>

          <button 
            type="button"
            onClick={() => handleTabSelect('infinite-feed')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                CineBai
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REELS
                </span>
              </span>
              <span className="type-meta text-white/48 -mt-0.5 hidden sm:inline">Free Cinema & Short Dramas</span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Reels Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleTabSelect(item.tab)}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'text-white/72 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-white/60'}`} strokeWidth={1.5} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search & Free Badge */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-thin border border-white/[0.08] text-white/72 hover:text-white hover:border-white/20 transition-all text-xs"
            title="Search Series (⌘K)"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Search series...</span>
            <kbd className="hidden lg:inline text-[10px] text-white/48 px-1.5 py-0.5 rounded bg-white/[0.06]">⌘K</kbd>
          </button>

          {/* 100% Free Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>100% Free</span>
          </div>

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
                onClick={() => handleTabSelect(item.tab)}
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
