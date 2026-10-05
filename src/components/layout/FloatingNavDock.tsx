import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Tv, 
  Sparkles, 
  Bookmark, 
  Search, 
  Compass
} from 'lucide-react';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';
import { useWatchlistStore } from '../../store/watchlistStore';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Film;
  badge?: number;
}

export function FloatingNavDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ambientEnabled, setAmbientEnabled } = useAmbientCanvas();
  const watchlistItems = useWatchlistStore((s) => s.items);

  const [isContracted, setIsContracted] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll direction detection for adaptive contraction/expansion
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        // Scrolling down: contract dock
        setIsContracted(true);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 60) {
        // Scrolling up or near top: expand dock
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
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav
        role="navigation"
        aria-label="Primary Navigation"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="pointer-events-auto"
      >
        <div
          className={`liquid-glass-dock flex items-center rounded-full transition-all duration-300 ${
            isContracted ? 'p-1.5 gap-1.5' : 'p-2 md:p-2.5 gap-2 md:gap-3'
          }`}
        >
          {/* Brand Monogram */}
          <Link
            to="/"
            className="flex items-center gap-2 pl-2 pr-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-full"
            aria-label="CineBai Home"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/20 via-amber-500/10 to-transparent border border-white/15 shadow-inner">
              <span className="text-sm font-black tracking-tight text-amber-300">C</span>
            </div>
            <AnimatePresence>
              {!isContracted && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:inline-block overflow-hidden font-bold tracking-tight text-sm text-neutral-200 group-hover:text-white transition-colors"
                >
                  CineBai
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Vertical Separator */}
          <div className="h-5 w-[1px] bg-white/10" aria-hidden="true" />

          {/* Navigation Items with Spring Sliding Active Indicator */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isCurrentActive(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                  aria-current={active ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.75} />
                    
                    {/* Dynamic Label Hide on Scroll Down */}
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

                    {/* Watchlist Counter Badge */}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>

                  {/* Spring Physics Active Glider */}
                  {active && (
                    <motion.div
                      layoutId="navDockActiveGlider"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-white/12 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.4)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Vertical Separator */}
          <div className="h-5 w-[1px] bg-white/10" aria-hidden="true" />

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className={`relative flex items-center justify-center rounded-full p-2 text-neutral-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                location.pathname === '/search' ? 'bg-white/15 text-white' : ''
              }`}
              aria-label="Search Catalog"
            >
              <Search size={16} strokeWidth={1.8} />
            </motion.button>

            {/* Ambient Canvas Lighting Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmbientEnabled((prev) => !prev)}
              className={`hidden sm:flex items-center justify-center rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                ambientEnabled
                  ? 'text-amber-300 hover:text-amber-200'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              aria-label={ambientEnabled ? 'Disable Ambient Canvas' : 'Enable Ambient Canvas'}
              title={ambientEnabled ? 'Ambient Light On' : 'Ambient Light Off'}
            >
              <Sparkles size={16} strokeWidth={1.8} className={ambientEnabled ? 'fill-amber-300/30' : ''} />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </header>
  );
}
