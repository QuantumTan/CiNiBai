import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Compass, Film, Tv, Sparkles, Bookmark, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MiniPlayerBadge } from './MiniPlayerBadge';
import { spring, useSpatialMotion } from '../../lib/motion';

interface DockTab {
  to: string;
  label: string;
  icon: typeof Compass;
}

const TABS: DockTab[] = [
  { to: '/', label: 'Discover', icon: Compass },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/tv', label: 'Series', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Sparkles },
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { to: '/search', label: 'Search', icon: Search },
];

function DockIcon({
  tab,
  mouseX,
  active,
}: {
  tab: DockTab;
  mouseX: any;
  active: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { isReduced } = useSpatialMotion();

  // macOS dock magnification math (§4.2)
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 54, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 250, damping: 14 });

  const Icon = tab.icon;

  return (
    <motion.div
      ref={ref}
      style={{ width: isReduced ? 44 : width }}
      className="relative flex aspect-square items-center justify-center rounded-full"
    >
      {/* Active Glass Lens Magnification Capsule */}
      {active && (
        <motion.div
          layoutId="dockActiveGlider"
          transition={spring}
          className="apple-glass-thin absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
        />
      )}

      <Icon
        size={20}
        strokeWidth={active ? 2.2 : 1.5}
        className={`relative z-10 transition-colors ${
          active ? 'text-white brightness-125' : 'text-slate-400 hover:text-slate-200'
        }`}
      />
    </motion.div>
  );
}

export function FloatingDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const mouseX = useMotionValue(Infinity);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Keyboard Roving Tabindex Handler (§4.2, §7)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % TABS.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + TABS.length) % TABS.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(TABS[focusedIndex].to);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Spatial Dock"
      onKeyDown={handleKeyDown}
      className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Main visionOS Detached Pill Dock */}
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="apple-glass-heavy apple-glass-grain flex items-center gap-2 rounded-full p-2 shadow-2xl border border-white/10"
        >
          {TABS.map((tab, idx) => {
            const active =
              tab.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(tab.to);

            return (
              <Link
                key={tab.to}
                to={tab.to}
                tabIndex={idx === focusedIndex ? 0 : -1}
                aria-current={active ? 'page' : undefined}
                aria-label={tab.label}
                className="outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
              >
                <DockIcon tab={tab} mouseX={mouseX} active={active} />
              </Link>
            );
          })}
        </motion.div>

        {/* Docked Mini-Player Badge Slot (§4.2) */}
        <MiniPlayerBadge />
      </div>
    </nav>
  );
}
