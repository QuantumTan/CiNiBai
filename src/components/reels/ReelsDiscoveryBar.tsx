import { ArrowLeft, Search, Flame, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReelsStore } from '../../stores/reels';
import { useDramaBoxStore } from '../../stores/dramaboxStore';

export function ReelsDiscoveryBar() {
  const navigate = useNavigate();
  const setSearchOpen = useReelsStore((state) => state.setSearchOpen);
  const setActiveTab = useDramaBoxStore((state) => state.setActiveTab);

  return (
    <header
      aria-label="Reels navigation"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5"
    >
      {/* Return to CineBai Home */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="focus-optical pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white/90 border border-white/10 transition-colors hover:bg-black/90 hover:text-white"
        aria-label="Return to CineBai Home"
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
        <span className="hidden sm:inline">CineBai</span>
      </button>

      {/* Mode Switcher: Reels Feed | Series Catalog */}
      <div className="pointer-events-auto flex items-center p-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('infinite-feed')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white shadow-sm"
        >
          <Flame size={13} className="text-amber-400 fill-amber-400" />
          <span>Feed</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('all-movies');
            navigate('/reels?tab=all-movies');
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white/70 hover:text-white transition-colors"
        >
          <Film size={13} />
          <span>Series</span>
        </button>
      </div>

      {/* Spotlight Clip Search */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="focus-optical pointer-events-auto grid min-h-10 min-w-10 place-items-center rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white/90 transition-colors hover:bg-black/90 hover:text-white"
        aria-label="Search loaded reels"
      >
        <Search aria-hidden="true" size={17} strokeWidth={2} />
      </button>
    </header>
  );
}
