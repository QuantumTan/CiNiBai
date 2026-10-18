import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, Film } from 'lucide-react';
import { usePlayerStore } from '../../stores/player';
import { springSnappy } from '../../lib/motion';

export function MiniPlayerBadge() {
  const { currentTrack, isPlaying, isMiniPlayer, setPlaying, setMiniPlayer } =
    usePlayerStore();

  if (!isMiniPlayer || !currentTrack) return null;

  return (
    <motion.div
      layoutId="playerDeckContainer"
      transition={springSnappy}
      className="apple-glass-heavy apple-glass-grain flex items-center gap-2.5 rounded-full p-1.5 pr-3 shadow-2xl border border-border-default"
      role="region"
      aria-label="Mini video player"
    >
      {/* Thumbnail with poster fallback */}
      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-white/20 bg-poster-fallback">
        {currentTrack.poster ? (
          <img
            src={currentTrack.poster}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <Film size={16} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Track Title (text-xs minimum) */}
      <div className="max-w-[110px] truncate text-xs font-semibold text-text-primary" title={currentTrack.title}>
        {currentTrack.title}
      </div>

      {/* Mini Play / Pause (44x44 touch target) */}
      <button
        type="button"
        onClick={() => setPlaying(!isPlaying)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent hover:bg-accent-light active:scale-95 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={16} className="fill-current" aria-hidden="true" />
        ) : (
          <Play size={16} className="fill-current ml-0.5" aria-hidden="true" />
        )}
      </button>

      {/* Expand to Full Player (44x44 touch target) */}
      <button
        type="button"
        onClick={() => setMiniPlayer(false)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer transition-colors"
        aria-label="Expand player to full size"
      >
        <Maximize2 size={16} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
