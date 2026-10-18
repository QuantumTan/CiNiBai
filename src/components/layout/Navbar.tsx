import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bookmark, 
  Sparkles, 
  Film, 
  Tv,
} from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useAmbientStore } from '../../stores/ambient';

interface NavLinkItem {
  to: string;
  label: string;
  icon: typeof Film;
}

const NAV_LINKS: NavLinkItem[] = [
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/tv', label: 'Series', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Sparkles },
  { to: '/search', label: 'Search', icon: Search },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const watchlistCount = useWatchlistStore((s) => s.items.length);
  const { ambilightEnabled, setAmbilightEnabled } = useAmbientStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-colors duration-200 pt-[env(safe-area-inset-top)] ${
        scrolled
          ? 'bg-bg-base/90 backdrop-blur-md border-b border-border-default shadow-md'
          : 'bg-gradient-to-b from-bg-base/90 via-bg-base/40 to-transparent'
      }`}
    >
      <nav
        role="navigation"
        aria-label="Desktop primary navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-3.5 lg:px-8"
      >
        {/* Brand Lockup */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 rounded-md p-1 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="CineBai Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 border border-accent/40 shadow-sm">
            <span className="text-sm font-black tracking-tight text-accent">C</span>
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-text-primary hover:text-accent-light transition-colors">
            CineBai
          </span>
        </Link>

        {/* Desktop Nav Links (Movies / TV / Anime / Search) */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-md text-xs font-semibold uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? 'text-accent font-bold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{link.label}</span>
                {active && (
                  <motion.div
                    layoutId="desktopNavUnderline"
                    className="absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons: Ambient Toggle + Watchlist */}
        <div className="flex items-center gap-2">
          {/* Ambient Lighting Toggle with visible label and tooltip */}
          <button
            type="button"
            onClick={() => setAmbilightEnabled((prev) => !prev)}
            className={`flex h-11 items-center gap-2 px-3.5 rounded-full border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              ambilightEnabled
                ? 'bg-accent/20 border-accent/50 text-accent font-semibold'
                : 'bg-black/60 border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
            }`}
            aria-pressed={ambilightEnabled}
            aria-label={ambilightEnabled ? 'Ambient lighting on — click to turn off' : 'Ambient lighting off — click to turn on'}
            title={ambilightEnabled ? 'Ambient lighting on (click to turn off)' : 'Ambient lighting off (click to turn on)'}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span className="text-xs font-semibold hidden sm:inline">Ambient</span>
          </button>

          {/* Desktop Search Shortcut */}
          <Link
            to="/search"
            className={`hidden sm:flex md:hidden h-11 w-11 items-center justify-center rounded-full border border-border-default bg-black/60 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive('/search') ? 'border-accent text-accent' : ''
            }`}
            aria-label="Search catalog"
            title="Search catalog"
          >
            <Search size={16} aria-hidden="true" />
          </Link>

          {/* Watchlist Button */}
          <Link
            to="/watchlist"
            aria-current={isActive('/watchlist') ? 'page' : undefined}
            title={`Watchlist (${watchlistCount} saved)`}
            className={`flex h-11 items-center gap-2 px-3.5 rounded-full border border-border-default transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive('/watchlist')
                ? 'bg-accent/20 border-accent/50 text-accent font-bold'
                : 'bg-black/60 text-text-secondary hover:text-text-primary hover:border-border-strong'
            }`}
            aria-label={`Watchlist with ${watchlistCount} items`}
          >
            <Bookmark size={15} aria-hidden="true" />
            <span className="text-xs font-semibold hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent"
                aria-label={`${watchlistCount} items in watchlist`}
              >
                {watchlistCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
