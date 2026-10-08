import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReelsStore } from '../../stores/reels';

export function ReelsDiscoveryBar() {
  const navigate = useNavigate();
  const setSearchOpen = useReelsStore((state) => state.setSearchOpen);

  return (
    <header
      aria-label="Reels navigation"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5"
    >
      <button
        type="button"
        onClick={() => navigate('/reels?tab=home')}
        className="focus-optical pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-black/72 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/85"
        aria-label="Return to the reels catalog"
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} />
        <span className="hidden sm:inline">Catalog</span>
      </button>

      <div className="pointer-events-none rounded-full bg-black/72 px-4 py-2 text-sm font-semibold text-white">
        Reels
      </div>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="focus-optical pointer-events-auto grid min-h-11 min-w-11 place-items-center rounded-full bg-black/72 text-white transition-colors hover:bg-black/85"
        aria-label="Search loaded reels"
      >
        <Search aria-hidden="true" size={19} strokeWidth={2} />
      </button>
    </header>
  );
}
