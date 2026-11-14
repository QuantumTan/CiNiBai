import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Compass, Film, Tv, Sparkles, Bookmark, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { spring, useSpatialMotion } from '../../lib/motion';
import { useWatchlistStore } from '../../stores/watchlistStore';

interface DockTab {
  to: string;
  label: string;
  icon: typeof Compass;
  badge?: number;
}

export function FloatingDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isReduced } = useSpatialMotion();
  const watchlistCount = useWatchlistStore((s) => s.items.length);

  // Mobile dock tabs (< md): Home / Movies / Series / Anime / Search / Watchlist
  const mobileTabs: DockTab[] = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'Series', icon: Tv },
    { to: '/anime', label: 'Anime', icon: Sparkles },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlistCount },
  ];

  const [mobileFocusedIndex, setMobileFocusedIndex] = useState(0);
  const mobileLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    tabs: DockTab[],
    focusedIndex: number,
    setFocusedIndex: (index: number) => void,
    linkRefs: React.RefObject<(HTMLAnchorElement | null)[]>
  ) => {
    if (e.altKey || e.ctrlKey || e.metaKey || tabs.length === 0) return;

    const activeIndex = linkRefs.current.findIndex((el) => el === document.activeElement);
    const currentIndex =
      activeIndex !== -1 ? activeIndex : Math.min(Math.max(focusedIndex, 0), tabs.length - 1);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setFocusedIndex(nextIndex);
      linkRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setFocusedIndex(nextIndex);
      linkRefs.current[nextIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      linkRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = tabs.length - 1;
      setFocusedIndex(lastIndex);
      linkRefs.current[lastIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const targetTab = tabs[currentIndex];
      if (targetTab) {
        navigate(targetTab.to);
      }
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      onKeyDown={(e) =>
        handleKeyDown(e, mobileTabs, mobileFocusedIndex, setMobileFocusedIndex, mobileLinkRefs)
      }
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-lg bg-bg-surface/95 backdrop-blur-xl border border-border-default rounded-2xl flex items-center justify-around px-1 py-1 shadow-2xl">
        {mobileTabs.map((tab, idx) => {
          const active = isActive(tab.to);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              ref={(el) => {
                mobileLinkRefs.current[idx] = el;
              }}
              to={tab.to}
              tabIndex={idx === mobileFocusedIndex ? 0 : -1}
              onFocus={() => setMobileFocusedIndex(idx)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[42px] px-1.5 py-1 rounded-xl text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobileActiveGlider"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-accent/25"
                  transition={isReduced ? { duration: 0 } : spring}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon size={18} strokeWidth={active ? 2.3 : 1.7} aria-hidden="true" />
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent"
                      aria-label={`${tab.badge} items in watchlist`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] leading-tight ${active ? 'font-bold text-text-primary' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
