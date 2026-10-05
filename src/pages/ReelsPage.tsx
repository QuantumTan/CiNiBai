import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Hls from 'hls.js';
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
  Check,
  Grid,
  Search,
  Flame,
  Tv
} from 'lucide-react';
import { 
  CURATED_REELS, 
  REEL_CATEGORIES, 
  filterReelsByCategory, 
  type ReelDrama, 
  type ReelEpisode,
  type ReelCategory 
} from '../api/reels';
import { SEO } from '../components/common/SEO';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';

export function ReelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDramaId = searchParams.get('drama');

  const [selectedCategory, setSelectedCategory] = useState<ReelCategory>('All');
  const [activeDramaId, setActiveDramaId] = useState<string>(() => {
    if (initialDramaId) {
      const found = CURATED_REELS.find((d) => d.id === initialDramaId || d.bookId === initialDramaId);
      if (found) return found.id;
    }
    return CURATED_REELS[0]?.id || '';
  });

  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link copied to clipboard!');
  const [hlsError, setHlsError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  // Filtered dramas based on category
  const filteredDramas = useMemo(() => {
    return filterReelsByCategory(CURATED_REELS, selectedCategory);
  }, [selectedCategory]);

  // Current active drama
  const currentDrama: ReelDrama = useMemo(() => {
    return (
      CURATED_REELS.find((d) => d.id === activeDramaId || d.bookId === activeDramaId) ||
      filteredDramas[0] ||
      CURATED_REELS[0]
    );
  }, [activeDramaId, filteredDramas]);

  // Current active episode
  const currentEpisode: ReelEpisode = useMemo(() => {
    if (!currentDrama?.episodes || currentDrama.episodes.length === 0) {
      return {
        id: `${currentDrama?.id || 'ep'}-1`,
        episodeNumber: 1,
        title: 'Episode 1',
        duration: '1:45',
        videoUrl: currentDrama?.embedUrl || '',
        videoType: 'reelshort',
        thumbnail: currentDrama?.coverImage || '',
        likes: 120000,
        commentsCount: 3400,
      };
    }
    return currentDrama.episodes[activeEpisodeIndex] || currentDrama.episodes[0];
  }, [currentDrama, activeEpisodeIndex]);

  // Sync active drama with URL search params
  useEffect(() => {
    if (currentDrama?.id) {
      setSearchParams({ drama: currentDrama.id }, { replace: true });
    }
  }, [currentDrama?.id, setSearchParams]);

  // Ambient lighting extraction
  useEffect(() => {
    if (currentDrama?.verticalPoster) {
      extractAndSetAmbientColor(currentDrama.verticalPoster);
    }
  }, [currentDrama, extractAndSetAmbientColor]);

  // Handle HLS stream setup and lifecycle
  useEffect(() => {
    setHlsError(false);
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = currentEpisode.m3u8Url || (currentEpisode.videoType === 'hls' ? currentEpisode.videoUrl : '');

    if (streamUrl && currentEpisode.videoType === 'hls') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) {
            video.play().catch(() => {});
          }
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setHlsError(true);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        if (isPlaying) {
          video.play().catch(() => {});
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode, isPlaying]);

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
    setTimeout(() => setShowCenterIcon(false), 700);
  };

  // Next / Previous Video Navigation
  const goToNextVideo = useCallback(() => {
    if (activeEpisodeIndex < (currentDrama?.episodes?.length || 1) - 1) {
      setActiveEpisodeIndex((prev) => prev + 1);
    } else {
      // Advance to next drama in filtered list
      const currentIndex = filteredDramas.findIndex((d) => d.id === currentDrama.id);
      if (currentIndex !== -1 && currentIndex < filteredDramas.length - 1) {
        setActiveDramaId(filteredDramas[currentIndex + 1].id);
      } else {
        // Loop back to start
        setActiveDramaId(filteredDramas[0]?.id || CURATED_REELS[0].id);
      }
      setActiveEpisodeIndex(0);
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex, currentDrama, filteredDramas]);

  const goToPrevVideo = useCallback(() => {
    if (activeEpisodeIndex > 0) {
      setActiveEpisodeIndex((prev) => prev - 1);
    } else {
      const currentIndex = filteredDramas.findIndex((d) => d.id === currentDrama.id);
      if (currentIndex > 0) {
        const prevDrama = filteredDramas[currentIndex - 1];
        setActiveDramaId(prevDrama.id);
        setActiveEpisodeIndex(0);
      }
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex, currentDrama, filteredDramas]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEpisodeDrawer || showCatalogModal) {
        if (e.key === 'Escape') {
          setShowEpisodeDrawer(false);
          setShowCatalogModal(false);
        }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrevVideo();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextVideo, goToPrevVideo, showEpisodeDrawer, showCatalogModal]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const epId = currentEpisode.id;
    setLikedMap((prev) => ({ ...prev, [epId]: !prev[epId] }));
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dramaId = currentDrama.id;
    const isNowBookmarked = !bookmarkedMap[dramaId];
    setBookmarkedMap((prev) => ({ ...prev, [dramaId]: isNowBookmarked }));
    setToastMessage(isNowBookmarked ? 'Saved to Watchlist' : 'Removed from Watchlist');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/reels?drama=${encodeURIComponent(currentDrama.id)}`;
    if (navigator.share) {
      navigator.share({
        title: currentDrama.title,
        text: `Watch ${currentDrama.title} on CineBai ReelShort!`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // Filtered catalog list for modal search
  const modalCatalogItems = useMemo(() => {
    if (!catalogSearch.trim()) return CURATED_REELS;
    const q = catalogSearch.toLowerCase();
    return CURATED_REELS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.synopsis.toLowerCase().includes(q) ||
        (d.tags && d.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [catalogSearch]);

  const isLiked = !!likedMap[currentEpisode.id];
  const isBookmarked = !!bookmarkedMap[currentDrama.id];
  const likeCount = currentEpisode.likes + (isLiked ? 1 : 0);

  // Determine player rendering mode
  const shouldUseDirectVideo =
    currentEpisode.videoType === 'hls' && !hlsError && !!(currentEpisode.m3u8Url || currentEpisode.videoUrl);

  const embedPlaybackUrl =
    currentDrama.embedUrl ||
    (currentDrama.bookId && currentDrama.chapterId
      ? `https://www.reelshort.com/en/embed/${currentDrama.bookId}-${currentDrama.chapterId}`
      : currentEpisode.videoUrl);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pt-3 sm:pt-6 pb-28 sm:pb-24 px-2 sm:px-4">
      <SEO
        title={`${currentDrama.title} - ReelShort Micro-Drama Stream - CineBai`}
        description={currentDrama.synopsis}
      />

      {/* Atmospheric Ambient Backdrop Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 filter blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `url(${currentDrama.coverImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Top Category Filter Bar */}
      <div className="relative z-20 w-full max-w-xl mb-3 sm:mb-4 px-2">
        <div className="ios-pill-dock flex items-center justify-between gap-1 p-1 rounded-full overflow-x-auto hide-scrollbar shadow-lg">
          <div className="flex items-center gap-1">
            {REEL_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const list = filterReelsByCategory(CURATED_REELS, cat);
                    if (list.length > 0) {
                      setActiveDramaId(list[0].id);
                      setActiveEpisodeIndex(0);
                    }
                  }}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors select-none ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="reels-cat-pill"
                      className="absolute inset-0 rounded-full ios-active-lens shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {cat === 'Trending' && <Flame size={12} className="text-amber-400" />}
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Catalog Drawer Trigger */}
          <button
            onClick={() => setShowCatalogModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 hover:text-amber-200 apple-glass-thin transition-transform hover:scale-105"
            title="Browse all 125+ ReelShort dramas"
          >
            <Grid size={13} />
            <span className="hidden sm:inline">125+ Dramas</span>
          </button>
        </div>
      </div>

      {/* Main 9:16 Vertical Theatre Container */}
      <div className="relative z-10 w-full max-w-[420px] aspect-[9/16] h-[calc(100dvh-10rem)] max-h-[820px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 ring-1 ring-white/10 flex flex-col justify-between">
        {/* Video Player Core */}
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-0 cursor-pointer overflow-hidden bg-neutral-950 flex items-center justify-center select-none"
        >
          {shouldUseDirectVideo ? (
            <video
              ref={videoRef}
              key={currentEpisode.id}
              poster={currentEpisode.thumbnail || currentDrama.coverImage}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : currentEpisode.videoType === 'youtube' ? (
            <iframe
              key={currentEpisode.id}
              src={currentEpisode.videoUrl}
              title={currentEpisode.title}
              className="w-full h-full object-cover pointer-events-none"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Official ReelShort Direct Embed Player */
            <iframe
              key={`${currentDrama.id}-${currentEpisode.id}`}
              src={embedPlaybackUrl}
              title={`${currentDrama.title} - Episode ${currentEpisode.episodeNumber}`}
              className="w-full h-full object-cover border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

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
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="apple-glass-thin flex items-center gap-1.5 rounded-full px-3 py-1 shadow-md">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                {currentDrama.platform}
              </span>
            </div>

            <span className="apple-glass-thin rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-300 shadow-md">
              ⭐ {currentDrama.rating}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="apple-glass-thin flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md hover:scale-105 transition-transform"
              title="Browse all dramas"
              aria-label="Browse all dramas"
            >
              <Grid size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted((prev) => !prev);
              }}
              className="apple-glass-thin flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md hover:scale-105 transition-transform"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
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
              <span className="text-[10px] text-amber-400 font-medium">👁 {currentDrama.views}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 line-clamp-1 drop-shadow-md">
              {currentDrama.title}
            </h2>

            <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-2 leading-relaxed drop-shadow-sm">
              {currentDrama.synopsis}
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
                width: `${((activeEpisodeIndex + 1) / (currentDrama.episodes.length || 1)) * 100}%`
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
                  <p className="text-xs text-amber-300 font-semibold">{currentDrama.totalEpisodes} Total Episodes</p>
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
      <div className="hidden lg:flex flex-col gap-3 fixed right-8 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={goToPrevVideo}
          className="apple-glass-regular flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Previous Episode or Drama (Up Arrow)"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={goToNextVideo}
          className="apple-glass-regular flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Next Episode or Drama (Down Arrow)"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Browse All 125+ Dramas Modal */}
      <AnimatePresence>
        {showCatalogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="apple-glass-heavy w-full max-w-4xl max-h-[90vh] rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">ReelShort Full Catalog</h2>
                    <p className="text-xs text-slate-400">
                      Explore {CURATED_REELS.length} micro-dramas streamed directly from ReelShort
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCatalogModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, genre, keyword..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl apple-glass-thin text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Drama Grid */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 custom-scrollbar">
                {modalCatalogItems.map((drama) => {
                  const isCurrent = drama.id === currentDrama.id;
                  return (
                    <button
                      key={drama.id}
                      onClick={() => {
                        setActiveDramaId(drama.id);
                        setActiveEpisodeIndex(0);
                        setShowCatalogModal(false);
                      }}
                      className={`group relative text-left rounded-2xl overflow-hidden transition-all duration-300 ${
                        isCurrent
                          ? 'ring-2 ring-amber-400 scale-[1.02] shadow-xl'
                          : 'hover:scale-[1.03] hover:shadow-lg'
                      }`}
                    >
                      <div className="aspect-[9/16] w-full relative bg-neutral-900 overflow-hidden">
                        <img
                          src={drama.verticalPoster}
                          alt={drama.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Top tag */}
                        <span className="apple-glass-thin absolute top-2 left-2 rounded-full px-2 py-0.5 text-[8px] font-bold text-amber-300">
                          {drama.totalEpisodes} Eps
                        </span>

                        {/* Bottom text */}
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="text-xs font-bold line-clamp-2 leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                            {drama.title}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1">
                            <span>⭐ {drama.rating}</span>
                            <span className="text-amber-300 font-semibold">{drama.views}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="apple-glass-heavy fixed bottom-24 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-2xl"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
