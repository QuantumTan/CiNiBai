import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  Film, 
  Tv, 
  Search, 
  Bookmark,
} from 'lucide-react';
import { useAmbientStore } from '../../stores/ambient';
import { useWatchlistStore } from '../../stores/watchlistStore';

interface NavLinkItem {
  to: string;
  label: string;
  icon: typeof Film;
}

const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Discover', icon: Compass },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/tv', label: 'Series', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Sparkles },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const watchlistCount = useWatchlistStore((s) => s.items.length);
  const { ambilightEnabled, setAmbilightEnabled } = useAmbientStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Quick-Search Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-200 pt-[env(safe-area-inset-top)] ${
        scrolled
          ? 'bg-bg-base/95 backdrop-blur-md border-b border-border-default/80 shadow-lg'
          : 'bg-gradient-to-b from-bg-base via-bg-base/60 to-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-3.5 lg:px-8">
        {/* Left Section: Brand Logo + Primary Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 rounded-lg p-1 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
            aria-label="CineBai Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 border border-accent/40 shadow-sm group-hover:bg-accent/30 transition-colors">
              <span className="text-sm font-black tracking-tight text-accent">C</span>
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-text-primary group-hover:text-accent-light transition-colors">
              CineBai
            </span>
          </Link>

          {/* Desktop Primary Navigation Links */}
          <nav
            role="navigation"
            aria-label="Desktop primary navigation"
            className="hidden md:flex items-center gap-1.5"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? 'text-accent bg-accent/10 border border-accent/25'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Quick Search + Watchlist + Ambient Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut */}
          <Link
            to="/search"
            className={`flex h-11 items-center gap-2 px-3 sm:px-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive('/search')
                ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                : 'bg-bg-surface/80 border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated'
            }`}
            aria-label="Search movies, TV shows, and anime"
            title="Search catalog (Ctrl+K)"
          >
            <Search size={16} aria-hidden="true" />
            <span className="text-xs font-semibold hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-white/5 border border-border-subtle rounded">
              ⌘K
            </kbd>
          </Link>

          {/* Watchlist Shortcut with Badge */}
          <Link
            to="/watchlist"
            className={`flex h-11 items-center gap-2 px-3 sm:px-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive('/watchlist')
                ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                : 'bg-bg-surface/80 border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated'
            }`}
            aria-label={`Watchlist with ${watchlistCount} items`}
            title="Your Watchlist"
          >
            <Bookmark size={16} aria-hidden="true" />
            <span className="text-xs font-semibold hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent"
                aria-hidden="true"
              >
                {watchlistCount}
              </span>
            )}
          </Link>

          {/* Ambient Lighting Controller */}
          <button
            type="button"
            onClick={() => setAmbilightEnabled((prev) => !prev)}
            className={`flex h-11 items-center gap-2 px-3 sm:px-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              ambilightEnabled
                ? 'bg-accent/20 border-accent/50 text-accent font-semibold shadow-sm'
                : 'bg-bg-surface/80 border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated'
            }`}
            aria-pressed={ambilightEnabled}
            aria-label={ambilightEnabled ? 'Ambient lighting on — click to turn off' : 'Ambient lighting off — click to turn on'}
            title={ambilightEnabled ? 'Ambient lighting on (click to turn off)' : 'Ambient lighting off (click to turn on)'}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span className="text-xs font-semibold hidden sm:inline">Ambient</span>
          </button>
        </div>
      </div>
    </header>
  );
}
