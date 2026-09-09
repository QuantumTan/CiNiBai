import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/tv', label: 'TV Shows' },
    { to: '/anime', label: 'Anime' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-dark shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gold-gradient text-2xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            CineBai
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                isActive(link.to)
                  ? 'text-gold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={() => navigate('/search')}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <Link
            to="/watchlist"
            className={cn(
              'rounded-full p-2 transition-colors hover:bg-white/10',
              isActive('/watchlist') ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
            )}
            aria-label="Watchlist"
          >
            <Bookmark size={20} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="rounded-full p-2 text-text-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="glass-dark border-t border-white/10 px-4 pb-6 pt-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'block py-3 text-base font-medium transition-colors',
                isActive(link.to) ? 'text-gold' : 'text-text-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-4 border-t border-white/10 pt-4">
            <button
              onClick={() => { navigate('/search'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-text-secondary"
            >
              <Search size={18} /> Search
            </button>
            <Link to="/watchlist" className="flex items-center gap-2 text-text-secondary">
              <Bookmark size={18} /> Watchlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
