import { motion } from 'framer-motion';
import { Play, Pause, Maximize2 } from 'lucide-react';
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
      className="apple-glass-heavy apple-glass-grain flex items-center gap-2.5 rounded-full p-1.5 pr-3 shadow-2xl"
    >
      {/* Thumbnail with Radial Progress Ring */}
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-white/20">
        <img
          src={currentTrack.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
          alt={currentTrack.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Track Title */}
      <div className="max-w-[90px] truncate text-[11px] font-semibold text-white">
        {currentTrack.title}
      </div>

      {/* Mini Play / Pause */}
      <button
        onClick={() => setPlaying(!isPlaying)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black hover:bg-slate-200"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={11} className="fill-black" /> : <Play size={11} className="fill-black ml-0.5" />}
      </button>

      {/* Expand to Full Player */}
      <button
        onClick={() => setMiniPlayer(false)}
        className="text-slate-400 hover:text-white"
        aria-label="Expand player"
      >
        <Maximize2 size={13} />
      </button>
    </motion.div>
  );
}
