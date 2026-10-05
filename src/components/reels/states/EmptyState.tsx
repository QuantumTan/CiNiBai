/**
 * Empty State Component (§3.1 #16)
 * Editorial restraint: calm, specific copy and direct in-system action.
 */
import { Film } from 'lucide-react';
import { useReelsStore } from '../../../stores/reels';

export function EmptyState() {
  const { setActiveFilter, clearMoods } = useReelsStore();

  const handleReset = () => {
    setActiveFilter('discover');
    clearMoods();
  };

  return (
    <div className="relative w-full h-full max-w-[440px] aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-950/80 border border-white/[0.08] flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="h-14 w-14 rounded-2xl apple-glass-regular flex items-center justify-center text-white/60 mb-5">
        <Film size={24} strokeWidth={1.5} />
      </div>

      <h2 className="type-section-title text-white mb-2">No Clips in Selection</h2>
      <p className="type-body text-white/48 max-w-[260px] mb-6 leading-relaxed">
        No film extracts match your current filter and mood combination.
      </p>

      <button
        onClick={handleReset}
        className="apple-glass-regular type-label px-5 py-2.5 rounded-full text-white/90 hover:text-white transition-colors focus-optical cursor-pointer"
      >
        Reset to Discover
      </button>
    </div>
  );
}
