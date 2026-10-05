/**
 * Right-Hand Liquid Glass Action Dock (§6.2)
 * Vertical floating pill, squircle geometry, 44x44px min touch targets,
 * Like (with ParticleBurst), Discussion, Watchlist, Share, and the High-Luminance
 * Watch Full Title Bridge Button with timestamp handoff.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Bookmark, Share2, Play, Check } from 'lucide-react';
import type { Reel } from '../../lib/reels/types';
import { useReelsStore } from '../../stores/reels';
import { useWatchlistStore } from '../../store/watchlistStore';
import { ParticleBurst } from './ParticleBurst';

interface ReelActionDockProps {
  reel: Reel;
  onOpenDiscussion: () => void;
}

// Locale-aware compact notation for counts >= 10,000 (§3.1 #11)
function formatCount(num: number): string {
  if (num >= 10000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  return new Intl.NumberFormat('en-US').format(num);
}

export function ReelActionDock({ reel, onOpenDiscussion }: ReelActionDockProps) {
  const navigate = useNavigate();
  const { likedMap, toggleLike } = useReelsStore();
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();

  const isLiked = !!likedMap[reel.id] || reel.viewer.liked;
  const [showBurst, setShowBurst] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Watchlist integration on source title (§6.2)
  const numericTitleId = parseInt(reel.source.titleId.replace(/\D/g, ''), 10) || 99999;
  const isSavedInWatchlist = isInWatchlist(numericTitleId, reel.source.kind === 'series' ? 'tv' : 'movie');

  const handleLike = () => {
    toggleLike(reel.id);
    if (!isLiked) {
      setShowBurst(true);
    }
  };

  const handleWatchlist = () => {
    if (isSavedInWatchlist) {
      removeItem(numericTitleId, reel.source.kind === 'series' ? 'tv' : 'movie');
    } else {
      addItem({
        id: numericTitleId,
        type: reel.source.kind === 'series' ? 'tv' : 'movie',
        title: reel.source.title,
        posterPath: reel.source.posterUrl,
        voteAverage: 8.8,
        releaseDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/reels?reelId=${encodeURIComponent(reel.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.source.title,
          text: `Watch this sequence from ${reel.source.title} on CiNiBai`,
          url,
        });
      } catch {
        // Dismissed share
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  // Watch Full Title Bridge (§6.2)
  const handleWatchFullTitle = () => {
    const seconds = Math.floor(reel.source.startAtMs / 1000);
    const targetUrl = `/watch/${reel.source.kind === 'series' ? 'tv' : 'movie'}/${reel.source.titleId}?t=${seconds}&from=reel:${reel.id}`;

    // Track analytics per §6.2
    try {
      window.dispatchEvent(
        new CustomEvent('reel_bridge_click', {
          detail: {
            reelId: reel.id,
            titleId: reel.source.titleId,
            startAtMs: reel.source.startAtMs,
          },
        })
      );
    } catch {
      // Quiet ignore in test env
    }

    navigate(targetUrl);
  };

  const effectiveLikes = reel.stats.likes + (likedMap[reel.id] ? 1 : 0);

  return (
    <aside 
      aria-label="Reel actions"
      className="absolute right-3.5 bottom-24 z-25 flex flex-col items-center gap-3 select-none"
    >
      {/* Toast feedback for copy */}
      {copiedToast && (
        <div className="absolute -left-36 top-1/2 -translate-y-1/2 apple-glass-heavy px-3 py-1.5 rounded-full flex items-center gap-1.5 type-meta text-white shadow-xl pointer-events-none whitespace-nowrap">
          <Check size={12} strokeWidth={1.5} className="text-white" />
          <span>Link Copied</span>
        </div>
      )}

      {/* Main Glass Action Capsule (regular tier, squircle-pill) */}
      <div className="apple-glass-regular squircle-pill p-1.5 flex flex-col items-center gap-2 border border-white/[0.1] shadow-2xl">
        {/* 1. Like Button with Particle Burst */}
        <div className="relative flex flex-col items-center">
          <ParticleBurst active={showBurst} onComplete={() => setShowBurst(false)} />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors focus-optical cursor-pointer ${
              isLiked ? 'text-white' : 'text-white/72 hover:text-white'
            }`}
            aria-label={isLiked ? 'Unlike reel' : 'Like reel'}
            aria-pressed={isLiked}
          >
            <Heart
              size={21}
              strokeWidth={1.5}
              className={`transition-all ${isLiked ? 'fill-white text-white scale-110' : ''}`}
            />
          </motion.button>
          <span className="type-meta text-white/60 -mt-1 w-11 text-center font-mono select-none">
            {formatCount(effectiveLikes)}
          </span>
        </div>

        {/* 2. Discussion Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onOpenDiscussion}
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white/72 hover:text-white transition-colors focus-optical cursor-pointer"
            aria-label="Open discussion and notes"
          >
            <MessageSquare size={20} strokeWidth={1.5} />
          </motion.button>
          <span className="type-meta text-white/60 -mt-1 w-11 text-center font-mono select-none">
            {formatCount(reel.stats.comments)}
          </span>
        </div>

        {/* 3. Watchlist / Bookmark Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWatchlist}
            className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors focus-optical cursor-pointer ${
              isSavedInWatchlist ? 'text-white' : 'text-white/72 hover:text-white'
            }`}
            aria-label={isSavedInWatchlist ? 'Remove source from Watchlist' : 'Save source to Watchlist'}
            aria-pressed={isSavedInWatchlist}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              className={`transition-all ${isSavedInWatchlist ? 'fill-white text-white' : ''}`}
            />
          </motion.button>
          <span className="type-meta text-white/60 -mt-1 text-[10px] select-none">
            Shelf
          </span>
        </div>

        {/* 4. Share Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white/72 hover:text-white transition-colors focus-optical cursor-pointer"
            aria-label="Share clip link"
          >
            <Share2 size={19} strokeWidth={1.5} />
          </motion.button>
          <span className="type-meta text-white/60 -mt-1 text-[10px] select-none">
            Share
          </span>
        </div>
      </div>

      {/* 5. Watch Full Title Bridge (The brightest element on screen, §3.1 #15, §6.2) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleWatchFullTitle}
        className="group relative w-12 h-16 rounded-xl overflow-hidden border-2 border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.8)] focus-optical cursor-pointer bg-white/20 backdrop-blur-md"
        title={`Watch full ${reel.source.kind === 'series' ? 'episode' : 'movie'} at timestamp`}
        aria-label={`Watch full title ${reel.source.title}`}
      >
        <img
          src={reel.source.posterUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
            <Play size={11} strokeWidth={2.5} className="fill-black ml-0.5" />
          </div>
        </div>
      </motion.button>
    </aside>
  );
}
