import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Search, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/movies', icon: Film, label: 'Movies' },
  { to: '/tv', icon: Tv, label: 'TV Shows' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/watchlist', icon: Bookmark, label: 'Watchlist' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="glass-dark fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors',
                active ? 'text-gold' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
