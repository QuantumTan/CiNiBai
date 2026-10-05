import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Film, 
  Tv, 
  Sparkles, 
  Bookmark, 
  Search
} from 'lucide-react';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';
import { useWatchlistStore } from '../../store/watchlistStore';
import { spring, useSpatialMotion } from '../../lib/motion';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Compass;
  badge?: number;
}

export function FloatingNavDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ambientEnabled, setAmbientEnabled } = useAmbientCanvas();
  const watchlistItems = useWatchlistStore((s) => s.items);
  const { isReduced } = useSpatialMotion();

  const [isContracted, setIsContracted] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection for adaptive pill compaction
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

  const navItems: NavItem[] = [
    { to: '/', label: 'Discover', icon: Compass },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'Series', icon: Tv },
    { to: '/anime', label: 'Anime', icon: Sparkles },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark, badge: watchlistItems.length },
  ];

  const isCurrentActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <motion.nav
        role="navigation"
        aria-label="Spatial Navigation Dock"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring}
        className="pointer-events-auto"
      >
        {/* Authentic Apple visionOS & iOS 18 Liquid Glass Floating Dock */}
        <div
          className={`ios-liquid-dock flex items-center rounded-full transition-all duration-300 ${
            isContracted ? 'p-1.5 gap-1.5' : 'p-2 md:p-2.5 gap-2 md:gap-2.5'
          }`}
        >
          {/* Brand Monogram */}
          <Link
            to="/"
            className="flex items-center gap-2 pl-2 pr-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 rounded-full"
            aria-label="CineBai Home"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/30 via-amber-500/15 to-transparent border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              <span className="text-xs font-black tracking-tight text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">C</span>
            </div>
            <AnimatePresence>
              {!isContracted && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:inline-block overflow-hidden font-bold tracking-tight text-sm text-slate-100 group-hover:text-white transition-colors"
                >
                  CineBai
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Thin Vertical Glass Divider */}
          <div className="h-5 w-[1px] bg-white/20" aria-hidden="true" />

          {/* Navigation Items with Luminous Optical Glider */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isCurrentActive(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
                  aria-current={active ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={{ scale: isReduced ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />

                    <AnimatePresence>
                      {(!isContracted || active) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="hidden sm:inline-block overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Dynamic Watchlist Count Badge */}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-black shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>

                  {/* Luminous Active Glass Lens Capsule */}
                  {active && (
                    <motion.div
                      layoutId="spatialDockGlider"
                      transition={spring}
                      className="ios-active-lens absolute inset-0 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Thin Vertical Glass Divider */}
          <div className="h-5 w-[1px] bg-white/20" aria-hidden="true" />

          {/* Right Control Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className={`flex items-center justify-center rounded-full p-2 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 ${
                location.pathname === '/search' ? 'bg-white/20 text-white' : ''
              }`}
              aria-label="Search Catalog"
            >
              <Search size={16} strokeWidth={2} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmbientEnabled((prev) => !prev)}
              className={`hidden sm:flex items-center justify-center rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 ${
                ambientEnabled ? 'text-amber-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={ambientEnabled ? 'Disable Ambient Canvas' : 'Enable Ambient Canvas'}
              title={ambientEnabled ? 'Ambient Light On' : 'Ambient Light Off'}
            >
              <Sparkles size={16} strokeWidth={2} className={ambientEnabled ? 'fill-amber-300/40' : ''} />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
