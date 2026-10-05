import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  Volume2, 
  VolumeX
} from 'lucide-react';
import { getBackdropUrl } from '../../api/tmdb';
import { getMediaTitle, getMediaDate, getYear, truncate, getMediaType } from '../../lib/utils';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface CinematicHeroProps {
  items: (TMDBMovie | TMDBTVShow)[];
}

// Sample trailer preview clips for seamless cinematic looping
const PREVIEW_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

export function CinematicHero({ items }: CinematicHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const heroItems = items.slice(0, 5);
  const currentItem = heroItems[currentIndex];

  // Dynamic dominant color sampling whenever the slide changes
  useEffect(() => {
    if (!currentItem) return;
    const backdrop = getBackdropUrl(currentItem.backdrop_path, 'w1280');
    extractAndSetAmbientColor(backdrop);
  }, [currentIndex, currentItem, extractAndSetAmbientColor]);

  // Auto-advance banner every 10 seconds
  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  if (!currentItem) return null;

  const type = getMediaType(currentItem);
  const title = getMediaTitle(currentItem);
  const year = getYear(getMediaDate(currentItem));
  const overview = currentItem.overview ? truncate(currentItem.overview, 180) : '';
  const inWatchlist = isInWatchlist(currentItem.id, type);
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, 'original');
  const previewVideoUrl = PREVIEW_VIDEOS[currentIndex % PREVIEW_VIDEOS.length];

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeItem(currentItem.id, type);
    } else {
      addItem({
        id: currentItem.id,
        type,
        title,
        posterPath: currentItem.poster_path,
        voteAverage: currentItem.vote_average,
        releaseDate: getMediaDate(currentItem),
      });
    }
  };

  const handleAudioToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section 
      className="relative h-[85vh] min-h-[580px] max-h-[920px] w-full overflow-hidden bg-[#08080a]"
      aria-label="Featured Showcase"
    >
      {/* Background Media Engine */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* Static high-res backdrop image (base layer) */}
          <img
            src={backdropUrl}
            alt={title}
            className="h-full w-full object-cover object-center scale-[1.03] transition-transform duration-10000 ease-out will-change-transform"
          />

          {/* Seamless looped preview video (active layer) */}
          {!videoFailed && (
            <video
              key={currentIndex}
              ref={videoRef}
              src={previewVideoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                videoLoaded ? 'opacity-85' : 'opacity-0'
              }`}
            />
          )}

          {/* Cinematic Vignette & Edge Feathering into Obsidian Canvas */}
          <div 
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" 
          />
          <div 
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#08080a]/90 via-[#08080a]/30 to-transparent" 
          />
          <div 
            aria-hidden="true"
            className="absolute inset-0 bg-radial-[ellipse_80%_60%_at_50%_20%] from-transparent via-[#08080a]/30 to-[#08080a]/80 pointer-events-none" 
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Ambient Audio Control Pill */}
      {videoLoaded && !videoFailed && (
        <div className="absolute right-6 top-24 z-20 hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAudioToggle}
            className="liquid-glass-control flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-200 shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={isMuted ? 'Unmute preview trailer' : 'Mute preview trailer'}
          >
            {isMuted ? (
              <>
                <VolumeX size={15} className="text-slate-400" />
                <span className="tracking-wide">Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={15} className="text-amber-400" />
                <span className="tracking-wide text-amber-300">Live Preview</span>
                {/* Micro Sound Wave Bars */}
                <div className="flex items-center gap-0.5 ml-1" aria-hidden="true">
                  <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="h-4 w-0.5 animate-pulse rounded-full bg-amber-400 delay-75" />
                  <span className="h-3 w-0.5 animate-pulse rounded-full bg-amber-400 delay-150" />
                </div>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Editorial Title & Content Lockup */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Format & Specification Badges */}
            <div className="mb-3.5 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-slate-300">
              <span className="liquid-glass-control rounded-md px-2 py-0.5 text-[11px] font-bold text-amber-300">
                4K ULTRA HD
              </span>
              <span className="liquid-glass-control rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                DOLBY VISION
              </span>
              <span className="liquid-glass-control rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                ATMOS
              </span>
              {year && (
                <span className="text-slate-400 font-medium ml-1">
                  {year}
                </span>
              )}
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span className="rounded border border-white/20 px-1.5 py-0.2 text-[10px] uppercase text-slate-300">
                {type === 'tv' ? 'Series' : 'Feature'}
              </span>
              {currentItem.vote_average > 0 && (
                <span className="text-amber-400 font-bold ml-1">
                  {Math.round(currentItem.vote_average * 10)}% Match
                </span>
              )}
            </div>

            {/* Editorial Title */}
            <h1 className="tracking-tight-title mb-4 text-4xl font-extrabold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl">
              {title}
            </h1>

            {/* Synopsis */}
            {overview && (
              <p className="mb-6 max-w-2xl text-sm leading-relaxed text-slate-300/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base">
                {overview}
              </p>
            )}

            {/* Continue Watching / Progress Simulation */}
            <div className="mb-6 max-w-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
                <span>Featured Release</span>
                <span className="text-amber-300 font-semibold">Ready to Stream</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Play Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/watch/${type}/${currentItem.id}`)}
                className="flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,255,255,0.25)] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play size={18} className="fill-black" />
                <span>Play Now</span>
              </motion.button>

              {/* Details Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(`/${type}/${currentItem.id}`)}
                className="apple-glass-regular flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg hover:border-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Info size={18} strokeWidth={1.8} />
                <span>Details</span>
              </motion.button>

              {/* Watchlist Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleWatchlistToggle}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                  inWatchlist
                    ? 'bg-amber-400 text-black shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                    : 'apple-glass-regular text-white'
                }`}
                aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2} />}
              </motion.button>
            </div>
          </motion.div>

          {/* Slide Indicator Bars */}
          {heroItems.length > 1 && (
            <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Hero slide switcher">
              {heroItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Show ${getMediaTitle(item)}`}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIndex
                      ? 'w-10 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
