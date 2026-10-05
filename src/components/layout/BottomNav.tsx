import { Link, useLocation } from 'react-router-dom';
import { Compass, Film, Tv, Sparkles, Bookmark, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWatchlistStore } from '../../store/watchlistStore';

const navItems = [
  { to: '/', icon: Compass, label: 'Discover' },
  { to: '/movies', icon: Film, label: 'Movies' },
  { to: '/tv', icon: Tv, label: 'Series' },
  { to: '/anime', icon: Sparkles, label: 'Anime' },
  { to: '/watchlist', icon: Bookmark, label: 'Watchlist' },
  { to: '/search', icon: Search, label: 'Search' },
];

export function BottomNav() {
  const location = useLocation();
  const watchlistCount = useWatchlistStore((s) => s.items.length);

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="liquid-glass-dock fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] p-1 text-[10px] font-medium transition-colors"
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  size={19} 
                  strokeWidth={active ? 2.3 : 1.7} 
                  className={active ? 'text-amber-300' : 'text-slate-400'} 
                />
                {item.to === '/watchlist' && watchlistCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-400 px-0.5 text-[8px] font-black text-black">
                    {watchlistCount}
                  </span>
                )}
              </div>
              <span className={`mt-1 tracking-tight ${active ? 'text-white font-bold' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="absolute bottom-0.5 h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
