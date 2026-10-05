import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bookmark, 
  Menu, 
  X, 
  Sparkles, 
  Compass, 
  Film, 
  Tv, 
  Flame
} from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const watchlistItems = useWatchlistStore((s) => s.items);
  const { ambientEnabled, setAmbientEnabled } = useAmbientCanvas();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Discover', icon: Compass },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'Series', icon: Tv },
    { to: '/reels', label: 'Reels', icon: Flame, isNew: true },
    { to: '/anime', label: 'Anime', icon: Sparkles },
  ];

  const studioNetworks = [
    { to: '/network/apple', label: 'Apple TV+' },
    { to: '/network/netflix', label: 'Netflix' },
    { to: '/network/hbo', label: 'HBO Max' },
    { to: '/network/prime', label: 'Prime Video' },
    { to: '/network/disney', label: 'Disney+' },
    { to: '/network/hulu', label: 'Hulu' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
        scrolled
          ? 'apple-glass-regular border-b border-white/10 shadow-2xl'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-3.5 lg:px-8">
        {/* Brand Lockup */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 rounded-full"
          aria-label="CineBai Home"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/30 via-amber-500/15 to-transparent border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <span className="text-xs font-black tracking-tight text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
              CineBai
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links (Visible on large screens) */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-xs font-semibold uppercase tracking-wider transition-colors duration-200 py-1 ${
                  active ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.label}
                  {link.isNew && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                  )}
                </span>
                {active && (
                  <motion.div
                    layoutId="topNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-200"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ambient Lighting Toggle */}
          <button
            onClick={() => setAmbientEnabled((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all apple-glass-thin ${
              ambientEnabled ? 'text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
            title={ambientEnabled ? 'Ambient Light On' : 'Ambient Light Off'}
            aria-label="Toggle Ambient Light"
          >
            <Sparkles size={16} className={ambientEnabled ? 'fill-amber-300/30' : ''} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => navigate('/search')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all apple-glass-thin ${
              location.pathname === '/search' ? 'text-amber-300 bg-white/20' : 'text-slate-300 hover:text-white'
            }`}
            aria-label="Search Catalog"
            title="Search"
          >
            <Search size={16} />
          </button>

          {/* Watchlist Quick Pill (Desktop/Tablet) */}
          <Link
            to="/watchlist"
            className={`hidden sm:flex h-9 items-center gap-1.5 px-3 rounded-full transition-all apple-glass-thin ${
              isActive('/watchlist') ? 'text-amber-300 bg-white/20 font-bold' : 'text-slate-300 hover:text-white'
            }`}
            aria-label="Watchlist"
          >
            <Bookmark size={15} />
            <span className="text-xs font-semibold">Watchlist</span>
            {watchlistItems.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-black">
                {watchlistItems.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-slate-200 hover:text-white apple-glass-thin transition-transform active:scale-90"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Liquid Glass Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="apple-glass-heavy md:hidden border-t border-white/10 px-5 pt-3 pb-6 shadow-2xl overflow-hidden"
          >
            {/* Quick Search Shortcut Bar */}
            <button
              onClick={() => {
                navigate('/search');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl apple-glass-thin text-xs text-slate-300 mb-4 hover:bg-white/15 transition-colors"
            >
              <Search size={15} className="text-slate-400" />
              <span>Search movies, shows, reels...</span>
            </button>

            {/* Primary Destinations */}
            <div className="space-y-1 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1">
                Explore CineBai
              </span>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const active = isActive(link.to);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'ios-active-lens text-amber-300 font-bold shadow-md'
                          : 'apple-glass-thin text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-amber-300' : 'text-slate-400'} />
                      <span>{link.label}</span>
                      {link.isNew && (
                        <span className="ml-auto text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400 text-black">
                          Hot
                        </span>
                      )}
                    </Link>
                  );
                })}

                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive('/watchlist')
                      ? 'ios-active-lens text-amber-300 font-bold shadow-md'
                      : 'apple-glass-thin text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark size={16} className={isActive('/watchlist') ? 'text-amber-300' : 'text-slate-400'} />
                  <span>Watchlist</span>
                  {watchlistItems.length > 0 && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-black">
                      {watchlistItems.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Premier Studios & Networks */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
                Premier Studios
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {studioNetworks.map((studio) => (
                  <Link
                    key={studio.to}
                    to={studio.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="apple-glass-thin flex items-center justify-center py-2 px-1 text-center rounded-lg text-[11px] font-medium text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
                  >
                    {studio.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
