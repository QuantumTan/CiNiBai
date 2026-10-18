import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Compass, Film, Tv, Sparkles, Bookmark, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MiniPlayerBadge } from './MiniPlayerBadge';
import { spring, useSpatialMotion } from '../../lib/motion';
import { useWatchlistStore } from '../../store/watchlistStore';

interface DockTab {
  to: string;
  label: string;
  icon: typeof Compass;
  badge?: number;
}

export function FloatingDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const mouseX = useMotionValue(Infinity);
  const { isReduced } = useSpatialMotion();
  const watchlistCount = useWatchlistStore((s) => s.items.length);

  const [isContracted, setIsContracted] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection for compact desktop dock
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY) {
        setIsContracted(true);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 60) {
        setIsContracted(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Mobile 5-item dock (Home / Movies / TV / Search / Watchlist)
  const mobileTabs: DockTab[] = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'TV', icon: Tv },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlistCount },
  ];

  // Desktop dock tabs
  const desktopTabs: DockTab[] = [
    { to: '/', label: 'Discover', icon: Compass },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'Series', icon: Tv },
    { to: '/anime', label: 'Anime', icon: Sparkles },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlistCount },
  ];

  const [focusedIndex, setFocusedIndex] = useState(0);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Keyboard Roving Tabindex Handler
  const handleKeyDown = (e: React.KeyboardEvent, tabs: DockTab[]) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + tabs.length) % tabs.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(tabs[focusedIndex].to);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. Mobile Bottom Dock (< md)
          Home / Movies / TV / Search / Watchlist
          Visible labels, min-h-[44px], safe-area padding
      ───────────────────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Mobile Navigation"
        onKeyDown={(e) => handleKeyDown(e, mobileTabs)}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5 pointer-events-none"
      >
        <div className="pointer-events-auto mx-auto max-w-md bg-bg-elevated/95 backdrop-blur-xl border border-border-default rounded-2xl flex items-center justify-around px-2 py-1 shadow-lg">
          {mobileTabs.map((tab, idx) => {
            const active = isActive(tab.to);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.to}
                to={tab.to}
                tabIndex={idx === focusedIndex ? 0 : -1}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveGlider"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-accent/20"
                    transition={isReduced ? { duration: 0 } : spring}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <Icon size={18} strokeWidth={active ? 2.3 : 1.7} aria-hidden="true" />
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span
                        className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-on-accent"
                        aria-label={`${tab.badge} items in watchlist`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs ${active ? 'font-bold text-text-primary' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. Desktop visionOS Spatial Liquid Glass Dock (>= md)
          Visible labels, 44px targets, roving tabindex, safe-area
      ───────────────────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Spatial Dock"
        onKeyDown={(e) => handleKeyDown(e, desktopTabs)}
        className="hidden md:flex fixed bottom-6 left-0 right-0 z-40 justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom)]"
      >
        <div className="pointer-events-auto flex items-center gap-3">
          <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={`apple-glass-heavy flex items-center rounded-full border border-border-default shadow-xl transition-[padding,gap] duration-200 ${
              isContracted ? 'p-1.5 gap-1' : 'p-2 gap-1.5'
            }`}
          >
            {desktopTabs.map((tab, idx) => {
              const active = isActive(tab.to);

              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  tabIndex={idx === focusedIndex ? 0 : -1}
                  aria-current={active ? 'page' : undefined}
                  aria-label={tab.label}
                  title={tab.label}
                  className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <DesktopDockItem
                    tab={tab}
                    active={active}
                    mouseX={mouseX}
                    isReduced={isReduced}
                  />
                </Link>
              );
            })}
          </motion.div>

          {/* Mini-Player Badge Slot */}
          <MiniPlayerBadge />
        </div>
      </nav>
    </>
  );
}

function DesktopDockItem({
  tab,
  active,
  mouseX,
  isReduced,
}: {
  tab: DockTab;
  active: boolean;
  mouseX: any;
  isReduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = tab.icon;

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const scaleSync = useTransform(distance, [-120, 0, 120], [1, 1.06, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 250, damping: 14 });

  return (
    <motion.div
      ref={ref}
      style={{ scale: isReduced ? 1 : scale }}
      className={`relative flex items-center min-h-[44px] px-3.5 py-2 rounded-full cursor-pointer transition-colors duration-150 ${
        active ? 'text-accent font-bold' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {active && (
        <motion.div
          layoutId="desktopDockActiveGlider"
          transition={isReduced ? { duration: 0 } : spring}
          className="absolute inset-0 rounded-full bg-white/10 border border-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
        />
      )}

      <div className="relative z-10 flex items-center gap-2">
        <div className="relative">
          <Icon size={18} strokeWidth={active ? 2.3 : 1.7} aria-hidden="true" />
          {typeof tab.badge === 'number' && tab.badge > 0 && (
            <span
              className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-on-accent"
              aria-label={`${tab.badge} items in watchlist`}
            >
              {tab.badge}
            </span>
          )}
        </div>

        <span className="text-xs font-semibold whitespace-nowrap">
          {tab.label}
        </span>
      </div>
    </motion.div>
  );
}
