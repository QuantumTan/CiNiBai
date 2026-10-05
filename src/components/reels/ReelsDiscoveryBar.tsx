/**
 * Floating Glass Discovery Bar (§6.1)
 * Detached centered glass pill, segmented filters with spring layoutId lens highlight,
 * multi-select mood popover (<= 2 moods), and Spotlight Clip Search trigger.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import type { ReelFilter, ReelMood } from '../../lib/reels/types';
import { useReelsStore } from '../../stores/reels';

interface FilterItem {
  id: ReelFilter;
  label: string;
}

const FILTER_ITEMS: FilterItem[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'top10', label: 'Top 10 Today' },
  { id: 'climaxes', label: 'Iconic Climaxes' },
  { id: 'bts', label: 'Bloopers & BTS' },
  { id: 'soundtracks', label: 'Soundtracks' },
];

const MOOD_OPTIONS: { id: ReelMood; label: string }[] = [
  { id: 'tense', label: 'Tense' },
  { id: 'euphoric', label: 'Euphoric' },
  { id: 'melancholic', label: 'Melancholic' },
  { id: 'mind-bending', label: 'Mind-bending' },
  { id: 'feel-good', label: 'Feel-good' },
];

export function ReelsDiscoveryBar() {
  const {
    activeFilter,
    setActiveFilter,
    activeMoods,
    toggleMood,
    setSearchOpen,
  } = useReelsStore();

  const [isMoodOpen, setIsMoodOpen] = useState(false);

  return (
    <header 
      aria-label="Reels discovery and navigation"
      className="absolute top-5 inset-x-0 z-30 flex items-center justify-center px-4 pointer-events-none select-none"
    >
      <div className="apple-glass-regular squircle-pill p-1 flex items-center gap-1 pointer-events-auto border border-white/[0.1] shadow-2xl">
        {/* Segmented Filter Pills */}
        <nav role="tablist" aria-label="Reel filters" className="flex items-center gap-0.5">
          {FILTER_ITEMS.map((item) => {
            const isSelected = activeFilter === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilter(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full type-label transition-colors focus-optical cursor-pointer whitespace-nowrap ${
                  isSelected ? 'text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeFilterLens"
                    className="absolute inset-0 rounded-full apple-glass-thin border border-white/20 shadow-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Separator Hairline */}
        <div className="h-4 w-[1px] bg-white/[0.14] mx-1" aria-hidden="true" />

        {/* Mood Filter Trigger with Popover */}
        <div className="relative">
          <button
            onClick={() => setIsMoodOpen(!isMoodOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full type-meta transition-colors focus-optical cursor-pointer ${
              activeMoods.length > 0 ? 'text-white apple-glass-thin' : 'text-white/60 hover:text-white'
            }`}
            aria-label="Filter by mood"
            aria-expanded={isMoodOpen}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">
              {activeMoods.length > 0 ? `Mood (${activeMoods.length})` : 'Mood'}
            </span>
          </button>

          {/* Mood Popover */}
          <AnimatePresence>
            {isMoodOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoodOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 apple-glass-heavy rounded-2xl p-2 border border-white/[0.12] shadow-2xl z-50 space-y-1"
                >
                  <div className="px-2 py-1 flex items-center justify-between border-b border-white/[0.08]">
                    <span className="type-meta-caps text-white/48">Mood (Max 2)</span>
                  </div>

                  {MOOD_OPTIONS.map((mood) => {
                    const isChecked = activeMoods.includes(mood.id);
                    return (
                      <button
                        key={mood.id}
                        onClick={() => toggleMood(mood.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl type-label text-left transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-white/[0.12] text-white'
                            : 'text-white/72 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <span>{mood.label}</span>
                        {isChecked && <Check size={13} strokeWidth={2} className="text-white" />}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Spotlight Clip Search Trigger (§6.1) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-white/60 hover:text-white apple-glass-thin transition-colors focus-optical cursor-pointer ml-0.5"
          aria-label="Open Spotlight Clip Search (⌘K)"
          title="Search quotes, actors, tags (⌘K)"
        >
          <Search size={14} strokeWidth={1.5} />
          <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded text-[10px] bg-white/[0.08] text-white/60">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
