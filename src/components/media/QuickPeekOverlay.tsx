import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Info, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CardRect } from '../../stores/preview';
import { useSpatialMotion } from '../../lib/motion';

export interface QuickPeekData {
  id: string | number;
  title: string;
  poster: string;
  backdrop?: string;
  previewVideoUrl?: string;
  matchScore?: number;
  rating?: string;
  duration?: string;
  year?: string | number;
  tags?: string[];
  overview?: string;
  inWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

interface QuickPeekOverlayProps {
  data: QuickPeekData;
  rect: CardRect;
  onClose: () => void;
}

export function QuickPeekOverlay({ data, rect, onClose }: QuickPeekOverlayProps) {
  const navigate = useNavigate();
  const { spring: activeSpring, isReduced } = useSpatialMotion();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Single-active preview video lifecycle (§4.3)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay with sound blocked; video is muted
    });

    return () => {
      // Explicit buffer teardown to prevent memory bloat (§2 #10, §4.3)
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  // Determine transform origin based on viewport boundary proximity
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const isLeftEdge = rect.left < 100;
  const isRightEdge = windowWidth - (rect.left + rect.width) < 100;
  const transformOrigin = isLeftEdge
    ? 'left center'
    : isRightEdge
    ? 'right center'
    : 'center center';

  return createPortal(
    <div
      ref={overlayRef}
      onMouseLeave={onClose}
      className="pointer-events-auto fixed z-50 select-none"
      style={{
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: isReduced ? 1 : 1.14 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={activeSpring}
        style={{ transformOrigin }}
        className="apple-glass-heavy apple-glass-grain relative -top-6 -left-6 -right-6 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Teaser Video Preview / Poster */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={data.backdrop || data.poster}
            alt={data.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {data.previewVideoUrl && (
            <video
              ref={videoRef}
              src={data.previewVideoUrl}
              muted={isMuted}
              loop
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Local Scrim Gradient (§3.8) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-black/30 pointer-events-none" />

          {/* Sound Toggle (Discreet Glass Pill) */}
          {videoLoaded && (
            <button
              onClick={() => setIsMuted((p) => !p)}
              className="apple-glass-thin absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-slate-200 hover:text-white"
              aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          {/* Spec Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="apple-glass-thin rounded px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
              4K HDR
            </span>
            <span className="apple-glass-thin rounded px-1.5 py-0.5 text-[9px] font-semibold text-slate-200">
              ATMOS
            </span>
          </div>
        </div>

        {/* Metadata Tray */}
        <div className="glass-text-scrim p-3.5 space-y-2.5 bg-[#0a0c10]/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(`/watch/movie/${data.id}`)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-slate-200 transition-colors"
                aria-label={`Play ${data.title}`}
              >
                <Play size={15} className="fill-black ml-0.5" />
              </motion.button>

              {/* Watchlist Toggle */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={data.onToggleWatchlist}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  data.inWatchlist
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
                aria-label={data.inWatchlist ? 'In watchlist' : 'Add to watchlist'}
              >
                {data.inWatchlist ? <Check size={15} strokeWidth={2.5} /> : <Plus size={15} />}
              </motion.button>
            </div>

            {/* Info Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate(`/movie/${data.id}`)}
              className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white"
              aria-label={`More details about ${data.title}`}
            >
              <Info size={16} />
            </motion.button>
          </div>

          <div>
            <h4 className="truncate text-sm font-bold text-white tracking-tight">
              {data.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
              {data.matchScore && (
                <span className="font-semibold text-emerald-400">{data.matchScore}% Match</span>
              )}
              {data.rating && (
                <span className="rounded border border-white/20 px-1 py-0.2 text-[9px] uppercase text-slate-300">
                  {data.rating}
                </span>
              )}
              {data.duration && <span>{data.duration}</span>}
              {data.year && <span>{data.year}</span>}
            </div>
          </div>

          {data.overview && (
            <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-400">
              {data.overview}
            </p>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
