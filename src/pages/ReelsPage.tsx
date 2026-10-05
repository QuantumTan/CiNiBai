import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  Sparkles, 
  X,
  Check
} from 'lucide-react';
import { CURATED_REELS, type ReelDrama, type ReelEpisode } from '../api/reels';
import { SEO } from '../components/common/SEO';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';

export function ReelsPage() {
  const [dramas] = useState<ReelDrama[]>(CURATED_REELS);
  const [activeDramaIndex, setActiveDramaIndex] = useState(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const currentDrama = dramas[activeDramaIndex] || dramas[0];
  const currentEpisode: ReelEpisode = currentDrama?.episodes[activeEpisodeIndex] || currentDrama?.episodes[0];

  // Sample ambient color from current drama poster
  useEffect(() => {
    if (currentDrama?.verticalPoster) {
      extractAndSetAmbientColor(currentDrama.verticalPoster);
    }
  }, [currentDrama, extractAndSetAmbientColor]);

  // Handle play / pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);
  };

  // Next / Previous Navigation
  const goToNextVideo = useCallback(() => {
    if (activeEpisodeIndex < currentDrama.episodes.length - 1) {
      setActiveEpisodeIndex((prev) => prev + 1);
    } else if (activeDramaIndex < dramas.length - 1) {
      setActiveDramaIndex((prev) => prev + 1);
      setActiveEpisodeIndex(0);
    } else {
      // Loop back to first
      setActiveDramaIndex(0);
      setActiveEpisodeIndex(0);
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex, activeDramaIndex, currentDrama.episodes.length, dramas.length]);

  const goToPrevVideo = useCallback(() => {
    if (activeEpisodeIndex > 0) {
      setActiveEpisodeIndex((prev) => prev - 1);
    } else if (activeDramaIndex > 0) {
      setActiveDramaIndex((prev) => prev - 1);
      setActiveEpisodeIndex(dramas[activeDramaIndex - 1].episodes.length - 1);
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex, activeDramaIndex, dramas]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEpisodeDrawer) {
        if (e.key === 'Escape') setShowEpisodeDrawer(false);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrevVideo();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextVideo, goToPrevVideo, showEpisodeDrawer]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const epId = currentEpisode.id;
    setLikedMap((prev) => ({ ...prev, [epId]: !prev[epId] }));
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dramaId = currentDrama.id;
    setBookmarkedMap((prev) => ({ ...prev, [dramaId]: !prev[dramaId] }));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: currentDrama.title,
        text: `Watch ${currentDrama.title} on CineBai!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const isLiked = !!likedMap[currentEpisode.id];
  const isBookmarked = !!bookmarkedMap[currentDrama.id];
  const likeCount = currentEpisode.likes + (isLiked ? 1 : 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center pt-8 pb-32 sm:pb-24 px-2 sm:px-4">
      <SEO
        title={`${currentDrama.title} (Ep. ${currentEpisode.episodeNumber}) - ReelShort Drama - CineBai`}
        description={currentDrama.synopsis}
      />

      {/* Atmospheric Ambient Backdrop Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25 filter blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `url(${currentDrama.coverImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Main 9:16 Vertical Theatre Container */}
      <div className="relative z-10 w-full max-w-[420px] aspect-[9/16] h-[calc(100dvh-7rem)] max-h-[840px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 ring-1 ring-white/10 flex flex-col justify-between">
        {/* Video Player Core */}
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-0 cursor-pointer overflow-hidden bg-neutral-950 flex items-center justify-center select-none"
        >
          {currentEpisode.videoType === 'youtube' ? (
            <iframe
              key={currentEpisode.id}
              src={currentEpisode.videoUrl}
              title={currentEpisode.title}
              className="w-full h-full object-cover pointer-events-none"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              key={currentEpisode.id}
              src={currentEpisode.videoUrl}
              poster={currentEpisode.thumbnail}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />

          {/* Center Play / Pause Indicator on Tap */}
          <AnimatePresence>
            {showCenterIcon && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="h-16 w-16 rounded-full apple-glass-heavy flex items-center justify-center text-white shadow-2xl">
                  {isPlaying ? <Play size={28} className="fill-white ml-1" /> : <Pause size={28} className="fill-white" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Floating Glass Header */}
        <div className="relative z-20 flex items-center justify-between p-4 pointer-events-none">
          <div className="apple-glass-thin pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1 shadow-md">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              {currentDrama.platform}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
            className="apple-glass-thin pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md hover:scale-105 transition-transform"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Right Floating Actions Rail */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 pointer-events-none">
          {/* Like Button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={toggleLike}
              className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/40'
                  : 'apple-glass-thin text-white hover:bg-white/20'
              }`}
              aria-label="Like episode"
            >
              <Heart size={20} className={isLiked ? 'fill-white' : ''} />
            </motion.button>
            <span className="text-[10px] font-bold text-slate-200 mt-1 drop-shadow-md">
              {(likeCount / 1000).toFixed(1)}k
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={toggleBookmark}
              className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors ${
                isBookmarked
                  ? 'bg-amber-400 text-black shadow-amber-400/40'
                  : 'apple-glass-thin text-white hover:bg-white/20'
              }`}
              aria-label="Bookmark drama"
            >
              <Bookmark size={20} className={isBookmarked ? 'fill-black' : ''} />
            </motion.button>
            <span className="text-[10px] font-bold text-slate-200 mt-1 drop-shadow-md">Save</span>
          </div>

          {/* Episodes Drawer Button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <motion.button
              whileTap={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowEpisodeDrawer(true);
              }}
              className="apple-glass-thin flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg hover:bg-white/20 transition-colors"
              aria-label="View all episodes"
            >
              <Layers size={19} />
            </motion.button>
            <span className="text-[10px] font-bold text-amber-300 mt-1 drop-shadow-md">
              {currentDrama.totalEpisodes} Eps
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center pointer-events-auto">
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={handleShare}
              className="apple-glass-thin flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg hover:bg-white/20 transition-colors"
              aria-label="Share"
            >
              <Share2 size={18} />
            </motion.button>
            <span className="text-[10px] font-bold text-slate-200 mt-1 drop-shadow-md">Share</span>
          </div>
        </div>

        {/* Bottom Metadata Deck */}
        <div className="relative z-20 p-4 sm:p-5 pointer-events-none space-y-2">
          {/* Series & Episode Info */}
          <div className="pointer-events-auto max-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="apple-glass-thin rounded-full px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                Ep. {currentEpisode.episodeNumber} / {currentDrama.totalEpisodes}
              </span>
              <span className="text-xs text-slate-300 font-semibold">{currentEpisode.duration}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 line-clamp-1 drop-shadow-md">
              {currentDrama.title}
            </h2>

            <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-2 leading-relaxed drop-shadow-sm">
              {currentEpisode.title}: {currentDrama.synopsis}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentDrama.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/40 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[9px] font-semibold text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-300"
              style={{
                width: `${((activeEpisodeIndex + 1) / currentDrama.episodes.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Sliding Episodes Drawer Modal */}
        <AnimatePresence>
          {showEpisodeDrawer && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="apple-glass-heavy absolute inset-x-0 bottom-0 z-30 max-h-[75%] rounded-t-3xl p-5 flex flex-col shadow-2xl border-t border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{currentDrama.title}</h3>
                  <p className="text-xs text-amber-300 font-semibold">{currentDrama.totalEpisodes} Episodes Available</p>
                </div>
                <button
                  onClick={() => setShowEpisodeDrawer(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Episode Items */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {currentDrama.episodes.map((ep, idx) => {
                  const isActive = idx === activeEpisodeIndex;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setActiveEpisodeIndex(idx);
                        setShowEpisodeDrawer(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                        isActive
                          ? 'ios-active-lens text-white shadow-md'
                          : 'apple-glass-thin text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                          EP {ep.episodeNumber}
                        </span>
                        <span className="text-xs font-semibold line-clamp-1">{ep.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{ep.duration}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Vertical Stepper Controls */}
      <div className="hidden lg:flex flex-col gap-3 ml-4 z-20">
        <button
          onClick={goToPrevVideo}
          className="apple-glass-regular flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Previous Episode / Drama (Up Arrow)"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={goToNextVideo}
          className="apple-glass-regular flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Next Episode / Drama (Down Arrow)"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Copy Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="apple-glass-heavy fixed bottom-24 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-2xl"
          >
            <Check size={14} className="text-emerald-400" />
            <span>Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
