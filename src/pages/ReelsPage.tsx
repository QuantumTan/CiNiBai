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
  Play, 
  Pause, 
  X, 
  Check, 
  Search, 
  Flame, 
  Radio, 
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  ListVideo,
  Sparkles,
  Clock,
  Trash2,
  Film,
  Compass,
  Tv
} from 'lucide-react';
import { 
  CURATED_REELS, 
  REEL_CATEGORIES, 
  filterReelsByCategory, 
  fetchLiveTrendingSeries,
  fetchLiveNewReleases,
  fetchLiveAllMovies,
  fetchSeriesDetailWithEpisodes,
  type ReelDrama, 
  type ReelEpisode, 
  type ReelCategory 
} from '../api/reels';
import { SEO } from '../components/common/SEO';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { useWatchlistStore } from '../store/watchlistStore';
import { useReelsHistoryStore, type ReelHistoryItem } from '../store/reelsHistoryStore';

type ReelsTab = 'home' | 'all' | 'new' | 'history';

export function ReelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDramaId = searchParams.get('drama');
  const initialTab = (searchParams.get('tab') as ReelsTab) || 'home';

  // Navigation tab state matching https://reels.7xmtools.com/
  const [activeTab, setActiveTab] = useState<ReelsTab>(initialTab);

  // Catalogs
  const [trendingDramas, setTrendingDramas] = useState<ReelDrama[]>(CURATED_REELS);
  const [newReleases, setNewReleases] = useState<ReelDrama[]>(() => CURATED_REELS.slice(15, 55));
  const [allMovies, setAllMovies] = useState<ReelDrama[]>(CURATED_REELS);
  const [selectedCategory, setSelectedCategory] = useState<ReelCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mountTime] = useState(() => Date.now());

  // Active playing drama for SeriesDetailModal
  const [activeDramaId, setActiveDramaId] = useState<string | null>(() => {
    if (initialDramaId) {
      const found = CURATED_REELS.find(
        (d) => d.id === initialDramaId || d.bookId === initialDramaId || d.id === `db-${initialDramaId}`
      );
      if (found) return found.id;
      return initialDramaId;
    }
    return null;
  });

  const [activeDramaData, setActiveDramaData] = useState<ReelDrama | null>(null);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<'back' | 'forward' | null>(null);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link copied to clipboard!');
  const [forceWebPlayer, setForceWebPlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);

  const { extractAndSetAmbientColor } = useAmbientCanvas();
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const { history, recordWatch, removeHistoryItem, clearHistory } = useReelsHistoryStore();

  // Sync tab with URL
  const handleTabChange = (tab: ReelsTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'home') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    }, { replace: true });
  };

  // Load live catalogs on mount
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      fetchLiveTrendingSeries(),
      fetchLiveNewReleases(1),
      fetchLiveAllMovies(1),
    ]).then(([trendRes, newRes, allRes]) => {
      if (!isMounted) return;

      if (trendRes.status === 'fulfilled' && trendRes.value.length > 0) {
        setTrendingDramas(trendRes.value);
      }
      if (newRes.status === 'fulfilled' && newRes.value.length > 0) {
        setNewReleases(newRes.value);
      }
      if (allRes.status === 'fulfilled' && allRes.value.length > 0) {
        setAllMovies(allRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Featured Trending Hero Drama (#1 Drama for home banner)
  const heroDrama = useMemo(() => {
    return trendingDramas[0] || CURATED_REELS[0];
  }, [trendingDramas]);

  // Find the basic drama object for the active modal
  const currentDramaBase: ReelDrama | null = useMemo(() => {
    if (!activeDramaId) return null;
    const clean = activeDramaId.replace(/^db-/, '');
    return (
      activeDramaData ||
      trendingDramas.find((d) => d.id === activeDramaId || d.bookId === clean) ||
      allMovies.find((d) => d.id === activeDramaId || d.bookId === clean) ||
      newReleases.find((d) => d.id === activeDramaId || d.bookId === clean) ||
      CURATED_REELS.find((d) => d.id === activeDramaId || d.bookId === clean) ||
      null
    );
  }, [activeDramaId, activeDramaData, trendingDramas, allMovies, newReleases]);

  // When activeDramaId changes, fetch full episodes and details
  useEffect(() => {
    if (!activeDramaId) return;

    let isMounted = true;

    fetchSeriesDetailWithEpisodes(activeDramaId, currentDramaBase || undefined)
      .then(({ drama }) => {
        if (isMounted) {
          setActiveDramaData(drama);
          setIsLoadingStream(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingStream(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeDramaId, currentDramaBase]);

  const currentDrama = activeDramaData || currentDramaBase;

  // Active episode object
  const currentEpisode: ReelEpisode = useMemo(() => {
    if (!currentDrama?.episodes || currentDrama.episodes.length === 0) {
      return {
        id: `${currentDrama?.bookId || 'db'}-1`,
        episodeNumber: 1,
        title: 'Episode 1',
        duration: '1:30',
        videoUrl: currentDrama?.embedUrl || '',
        videoType: 'dramabox',
        thumbnail: currentDrama?.coverImage || '',
        likes: 15200,
        commentsCount: 380,
        isUnlocked: true,
      };
    }
    return currentDrama.episodes[activeEpisodeIndex] || currentDrama.episodes[0];
  }, [currentDrama, activeEpisodeIndex]);

  // Sync active drama with URL
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (activeDramaId && currentDrama) {
        next.set('drama', currentDrama.bookId || currentDrama.id);
        if (activeEpisodeIndex > 0) {
          next.set('ep', String(activeEpisodeIndex + 1));
        } else {
          next.delete('ep');
        }
      } else {
        next.delete('drama');
        next.delete('ep');
      }
      return next;
    }, { replace: true });
  }, [activeDramaId, currentDrama, activeEpisodeIndex, setSearchParams]);

  // Record watch history automatically whenever an episode is viewed
  useEffect(() => {
    if (currentDrama && currentEpisode) {
      recordWatch(
        currentDrama,
        activeEpisodeIndex,
        currentEpisode.episodeNumber,
        currentEpisode.title,
        currentTime
      );
    }
  }, [currentDrama, activeEpisodeIndex, currentEpisode, recordWatch, currentTime]);

  // Ambient lighting extraction
  useEffect(() => {
    const poster = currentDrama?.verticalPoster || heroDrama?.verticalPoster;
    if (poster) {
      extractAndSetAmbientColor(poster);
    }
  }, [currentDrama, heroDrama, extractAndSetAmbientColor]);

  // Video Streaming Setup with Hls.js and MP4 support
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentEpisode) return;

    // Clean up previous HLS instance
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    const videoSrc = currentEpisode.m3u8Url || currentEpisode.videoUrl;
    const isM3u8 = videoSrc.includes('.m3u8');
    const isDirectMp4 = currentEpisode.videoType === 'mp4' || videoSrc.includes('.mp4');

    if (isM3u8) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hlsInstanceRef.current = hls;
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.playbackRate = playbackSpeed;
          if (isPlaying) {
            video.play().catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            });
          }
        });
        hls.on(Hls.Events.ERROR, () => {
          // If HLS fails, fallback to embed web player
          setForceWebPlayer(true);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.playbackRate = playbackSpeed;
        if (isPlaying) {
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      }
    } else if (isDirectMp4 && !forceWebPlayer) {
      video.src = videoSrc;
      video.playbackRate = playbackSpeed;
      if (isPlaying) {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    }

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [currentEpisode, forceWebPlayer, playbackSpeed, isPlaying]);

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

  // Next / Previous Episode Navigation
  const goToNextVideo = useCallback(() => {
    if (!currentDrama) return;
    const total = currentDrama.episodes?.length || currentDrama.totalEpisodes || 1;
    if (activeEpisodeIndex < total - 1) {
      setActiveEpisodeIndex((prev) => prev + 1);
    } else {
      setActiveEpisodeIndex(0);
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex, currentDrama]);

  const goToPrevVideo = useCallback(() => {
    if (activeEpisodeIndex > 0) {
      setActiveEpisodeIndex((prev) => prev - 1);
    }
    setIsPlaying(true);
  }, [activeEpisodeIndex]);

  // Double tap seek (left: -10s, right: +10s)
  const handleSeek = (direction: 'back' | 'forward', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const delta = direction === 'forward' ? 10 : -10;
    const target = Math.max(0, Math.min(videoRef.current.duration || 100, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    setSeekFeedback(direction);
    setTimeout(() => setSeekFeedback(null), 650);
  };

  // Cycle playback speed (1x -> 1.25x -> 1.5x -> 2x -> 1x)
  const cyclePlaybackSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    setToastMessage(`Speed set to ${nextSpeed}x`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  // Fullscreen toggle
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation when player is active
  useEffect(() => {
    if (!currentDrama) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEpisodeDrawer) {
        if (e.key === 'Escape') setShowEpisodeDrawer(false);
        return;
      }
      if (e.key === 'Escape') {
        setActiveDramaId(null);
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
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
        if (videoRef.current) videoRef.current.muted = !isMuted;
      } else if (e.key === 'f' || e.key === 'F') {
        if (playerContainerRef.current) {
          if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDrama, goToNextVideo, goToPrevVideo, isMuted, showEpisodeDrawer]);

  // Like & Watchlist handlers
  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const epId = currentEpisode.id;
    setLikedMap((prev) => ({ ...prev, [epId]: !prev[epId] }));
  };

  const dramaNumericId = useMemo(() => {
    const bId = currentDrama?.bookId || heroDrama?.bookId;
    if (!bId) return 99999;
    return parseInt(bId.replace(/\D/g, ''), 10) || 99999;
  }, [currentDrama?.bookId, heroDrama?.bookId]);

  const isCurrentBookmarked = isInWatchlist(dramaNumericId, 'tv');

  const toggleBookmark = (dramaToBookmark: ReelDrama, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const numId = parseInt(dramaToBookmark.bookId?.replace(/\D/g, '') || '99999', 10);
    const inList = isInWatchlist(numId, 'tv');
    if (inList) {
      removeItem(numId, 'tv');
      setToastMessage('Removed from Shelf');
    } else {
      addItem({
        id: numId,
        type: 'tv',
        title: dramaToBookmark.title,
        posterPath: dramaToBookmark.coverImage,
        voteAverage: dramaToBookmark.rating,
        releaseDate: new Date().toISOString().split('T')[0],
      });
      setToastMessage('Saved to My Shelf');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = (drama: ReelDrama, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const dramaKey = drama.bookId || drama.id;
    const url = `${window.location.origin}/reels?drama=${encodeURIComponent(dramaKey)}`;
    if (navigator.share) {
      navigator
        .share({
          title: drama.title,
          text: `Watch ${drama.title} on CineBai DramaBox!`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // Filtered catalog for All Movies or Search
  const filteredCatalog = useMemo(() => {
    let list = activeTab === 'new' ? newReleases : allMovies;
    if (selectedCategory !== 'All') {
      list = filterReelsByCategory(list, selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.synopsis.toLowerCase().includes(q) ||
          (d.tags && d.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [activeTab, newReleases, allMovies, selectedCategory, searchQuery]);

  // Categorized Shelves for Home View (matching https://reels.7xmtools.com/)
  const shelves = useMemo(() => {
    return [
      {
        id: 'trending',
        title: 'Trending Now',
        icon: Flame,
        items: trendingDramas.slice(0, 16),
      },
      {
        id: 'new-release',
        title: 'New Releases',
        icon: Sparkles,
        items: newReleases.slice(0, 16),
      },
      {
        id: 'billionaire',
        title: 'Billionaire & CEO Romance',
        icon: Sparkles,
        items: filterReelsByCategory(allMovies, 'Billionaire').slice(0, 16),
      },
      {
        id: 'werewolf',
        title: 'Werewolf & Shifter Packs',
        icon: Radio,
        items: filterReelsByCategory(allMovies, 'Werewolf').slice(0, 16),
      },
      {
        id: 'revenge',
        title: 'Revenge & Rebirth',
        icon: Flame,
        items: filterReelsByCategory(allMovies, 'Revenge').slice(0, 16),
      },
      {
        id: 'mafia',
        title: 'Mafia & Forbidden Desire',
        icon: Sparkles,
        items: filterReelsByCategory(allMovies, 'Mafia').slice(0, 16),
      },
      {
        id: 'fantasy',
        title: 'Fantasy & Ancient Gods',
        icon: Sparkles,
        items: filterReelsByCategory(allMovies, 'Fantasy').slice(0, 16),
      },
    ];
  }, [trendingDramas, newReleases, allMovies]);

  // Streaming type determination
  const hasDirectVideo =
    !forceWebPlayer &&
    (currentEpisode.videoType === 'mp4' ||
      currentEpisode.videoType === 'hls' ||
      currentEpisode.videoUrl.includes('.mp4') ||
      currentEpisode.videoUrl.includes('.m3u8'));

  const embedPlaybackUrl =
    currentEpisode.videoType === 'dramabox'
      ? currentEpisode.videoUrl
      : currentDrama?.embedUrl ||
        `https://www.dramabox.com/video/${currentDrama?.bookId}_${currentDrama?.slug || 'drama'}/${currentDrama?.chapterId || '1'}`;

  // Time formatting helper
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Horizontal shelf scroll helper
  const scrollShelf = (shelfId: string, direction: 'left' | 'right') => {
    const el = document.getElementById(`shelf-scroll-${shelfId}`);
    if (el) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Open drama player helper
  const openDramaPlayer = (drama: ReelDrama | ReelHistoryItem, epIndex: number = 0) => {
    setActiveDramaId(drama.id);
    setActiveEpisodeIndex(epIndex);
    setIsPlaying(true);
    setForceWebPlayer(false);
  };

  // Relative timestamp formatting for History
  const formatRelativeTime = (timestamp: number) => {
    const diff = mountTime - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f4f4f7] selection:bg-rose-500 selection:text-white pb-32">
      <SEO
        title="DramaBox Reels - Watch Live Micro-Dramas & Short Video Series - CineBai"
        description="Stream trending vertical micro-dramas, billionaire romances, werewolf packs, and revenge mini-series live on CineBai."
      />

      {/* Atmospheric Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 filter blur-3xl scale-125 transition-all duration-1000 -z-10"
        style={{
          backgroundImage: `url(${heroDrama?.coverImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* ========================================================================= */}
      {/* Top Sticky Navbar Architecture (Replicating https://reels.7xmtools.com/) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Primary Navigation Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
            {/* Branding badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Tv size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white uppercase">Reels</span>
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-black text-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold -mt-0.5">DramaBox</span>
              </div>
            </div>

            {/* Navigation Links (Home, All Movies, New Release, History) */}
            <nav className="flex items-center gap-1">
              {[
                { id: 'home' as ReelsTab, label: 'Home', icon: Compass },
                { id: 'all' as ReelsTab, label: 'All Movies', icon: Film },
                { id: 'new' as ReelsTab, label: 'New Release', icon: Sparkles },
                { id: 'history' as ReelsTab, label: 'History', icon: Clock, count: history.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none cursor-pointer ${
                      isActive
                        ? 'text-white bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-white text-rose-600' : 'bg-white/20 text-white'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar right in header */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search titles, billionaires, alphas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white/[0.07] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Category Pills (Visible when in All Movies or Home Search) */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || searchQuery) && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
            {REEL_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Main Content Areas based on Active Tab */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-10">

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: HOME VIEW (Hero Spotlight + Categorized Horizontal Shelves) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'home' && !searchQuery && (
          <>
            {/* Cinematic Hero Spotlight Banner (Inspired by reels.7xmtools.com) */}
            {heroDrama && (
              <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-neutral-950 via-[#121218] to-neutral-950 shadow-2xl p-6 sm:p-10 lg:p-12 min-h-[420px] flex items-center">
                {/* Backdrop image */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-sm scale-105 pointer-events-none"
                  style={{ backgroundImage: `url(${heroDrama.coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                  {/* Left Column: Metadata & CTAs */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black uppercase tracking-wider">
                        <Flame size={13} className="text-rose-400 fill-rose-400 animate-pulse" />
                        <span>TRENDING NO. 1</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold">
                        ⭐ {heroDrama.rating}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-bold">
                        🔴 Live on DramaBox
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                      {heroDrama.title}
                    </h1>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                      <span className="text-amber-400 font-extrabold">{heroDrama.totalEpisodes} Episodes</span>
                      <span>•</span>
                      <span>{heroDrama.views} Plays</span>
                      <span>•</span>
                      <span>⭐ {heroDrama.rating} Score</span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
                      {heroDrama.synopsis}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {heroDrama.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-3">
                      <button
                        onClick={() => openDramaPlayer(heroDrama, 0)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-sm shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Play size={18} className="fill-white" />
                        <span>Watch Episode 1</span>
                      </button>

                      <button
                        onClick={() => toggleBookmark(heroDrama)}
                        className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Bookmark size={16} className={isInWatchlist(parseInt(heroDrama.bookId || '0', 10), 'tv') ? 'fill-white' : ''} />
                        <span>My Shelf</span>
                      </button>

                      <button
                        onClick={() => handleShare(heroDrama)}
                        className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-105 cursor-pointer"
                        title="Share drama"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Floating Poster Showcase */}
                  <div className="hidden lg:flex justify-end">
                    <div 
                      onClick={() => openDramaPlayer(heroDrama, 0)}
                      className="group relative w-56 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-rose-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer hover:scale-105 transition-all duration-500"
                    >
                      <img
                        src={heroDrama.verticalPoster}
                        alt={heroDrama.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="h-14 w-14 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl">
                          <Play size={24} className="fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs font-bold line-clamp-1">{heroDrama.title}</p>
                        <p className="text-[10px] text-amber-300 font-semibold">{heroDrama.totalEpisodes} EP • Stream Now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Categorized Media Shelves */}
            {shelves.map((shelf) => {
              if (!shelf.items || shelf.items.length === 0) return null;
              const ShelfIcon = shelf.icon;
              return (
                <section key={shelf.id} className="relative space-y-3">
                  {/* Shelf Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <ShelfIcon size={14} />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {shelf.title}
                      </h2>
                    </div>

                    {/* Scroll controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => scrollShelf(shelf.id, 'left')}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => scrollShelf(shelf.id, 'right')}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Scroll right"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrolling Card Track */}
                  <div
                    id={`shelf-scroll-${shelf.id}`}
                    className="flex items-start gap-4 overflow-x-auto hide-scrollbar scroll-smooth py-2"
                  >
                    {shelf.items.map((drama) => (
                      <div
                        key={drama.id}
                        onClick={() => openDramaPlayer(drama, 0)}
                        className="group relative flex-shrink-0 w-36 sm:w-44 cursor-pointer select-none rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-rose-500/50 hover:shadow-[0_12px_30px_rgba(225,29,72,0.2)]"
                      >
                        <div className="aspect-[9/16] w-full relative overflow-hidden">
                          <img
                            src={drama.verticalPoster}
                            alt={drama.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/10">
                              {drama.totalEpisodes} EP
                            </span>
                          </div>

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl">
                              <Play size={18} className="fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Bottom Text */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                            <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors drop-shadow-md">
                              {drama.title}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1.5 font-medium">
                              <span>⭐ {drama.rating}</span>
                              <span className="text-amber-400 font-bold">{drama.views} Plays</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: ALL MOVIES & SEARCH GRID */}
        {/* ------------------------------------------------------------- */}
        {(activeTab === 'all' || searchQuery) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'All Micro-Dramas & Mini-Series'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Showing {filteredCatalog.length} drama series available for instant HD streaming
                </p>
              </div>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/10 p-8">
                <Search size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-lg font-bold text-white">No dramas found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another search keyword or select a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredCatalog.map((drama) => (
                  <div
                    key={drama.id}
                    onClick={() => openDramaPlayer(drama, 0)}
                    className="group relative cursor-pointer rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-rose-500/50 hover:shadow-2xl"
                  >
                    <div className="aspect-[9/16] w-full relative overflow-hidden">
                      <img
                        src={drama.verticalPoster}
                        alt={drama.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/10">
                        {drama.totalEpisodes} EP
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl">
                          <Play size={18} className="fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
                          {drama.title}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1">
                          <span>⭐ {drama.rating}</span>
                          <span className="text-amber-400 font-semibold">{drama.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: NEW RELEASE GRID */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'new' && !searchQuery && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles size={22} className="text-amber-400" />
                  <span>New Releases</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Fresh premiere short dramas and newly unlocked episodes streaming in real-time
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {newReleases.map((drama) => (
                <div
                  key={drama.id}
                  onClick={() => openDramaPlayer(drama, 0)}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-rose-500/50 hover:shadow-2xl"
                >
                  <div className="aspect-[9/16] w-full relative overflow-hidden">
                    <img
                      src={drama.verticalPoster}
                      alt={drama.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-[9px] font-black text-white shadow-md">
                      NEW
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/10">
                      {drama.totalEpisodes} EP
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl">
                        <Play size={18} className="fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
                        {drama.title}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-300 mt-1">
                        <span>⭐ {drama.rating}</span>
                        <span className="text-amber-400 font-semibold">{drama.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: WATCH HISTORY (Matching https://reels.7xmtools.com/history/) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'history' && !searchQuery && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">YOUR LIBRARY</span>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Clock size={22} className="text-rose-500" />
                  <span>Watch History</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Your recently watched episodes and progress saved across sessions
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-600/20 text-xs font-bold text-slate-300 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-24 bg-neutral-900/40 rounded-3xl border border-white/10 p-8 space-y-4 max-w-xl mx-auto">
                <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <Clock size={28} />
                </div>
                <h2 className="text-lg font-bold text-white">No Watch History Yet</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Episodes you start watching will automatically appear here so you can easily resume right where you left off.
                </p>
                <button
                  onClick={() => handleTabChange('home')}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Explore Trending Dramas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-rose-500/40 transition-all duration-300 flex gap-3 p-3"
                  >
                    <div
                      onClick={() => openDramaPlayer(item, item.lastEpisodeIndex)}
                      className="relative w-20 aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={16} className="text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-300 font-semibold">
                            {formatRelativeTime(item.watchedAt)}
                          </span>
                          <button
                            onClick={() => removeHistoryItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="Remove from history"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <h3 className="text-xs font-bold text-white line-clamp-2 mt-1 group-hover:text-rose-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-rose-300 mt-1">
                          Last: EP {item.lastEpisodeNumber} / {item.totalEpisodes}
                        </p>
                      </div>

                      <button
                        onClick={() => openDramaPlayer(item, item.lastEpisodeIndex)}
                        className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Resume Playback</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* ========================================================================= */}
      {/* Signature SeriesDetailModal - Vertical Theatre Experience (7xmtools replica) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {currentDrama && (
          <div className="fixed inset-0 z-50 bg-[#050508f5] backdrop-blur-[30px] flex overflow-hidden">
            {/* Close Modal Button */}
            <button
              onClick={() => setActiveDramaId(null)}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 h-11 w-11 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-110 hover:rotate-90 cursor-pointer border border-white/15"
              aria-label="Close Player"
            >
              <X size={20} />
            </button>

            {/* Split Screen Container */}
            <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center">
              {/* Left Column: 9:16 Vertical Video Player */}
              <div 
                ref={playerContainerRef}
                className="flex-1 flex flex-col items-center justify-center w-full h-full p-2 sm:p-6"
              >
                <div className="relative aspect-[9/16] h-[calc(100dvh-5rem)] max-h-[800px] w-full max-w-[420px] rounded-3xl overflow-hidden bg-black shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/15 flex flex-col justify-between">
                  {/* Video Streaming Core */}
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 z-0 cursor-pointer overflow-hidden bg-neutral-950 flex items-center justify-center select-none"
                  >
                    {hasDirectVideo ? (
                      <video
                        ref={videoRef}
                        key={currentEpisode.videoUrl}
                        poster={currentEpisode.thumbnail || currentDrama.coverImage}
                        autoPlay
                        playsInline
                        muted={isMuted}
                        onEnded={goToNextVideo}
                        onTimeUpdate={(e) => {
                          const target = e.currentTarget;
                          setCurrentTime(target.currentTime);
                          setDuration(target.duration || 0);
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      /* Live DramaBox Web Player Stream */
                      <iframe
                        key={`${currentDrama.id}-${currentEpisode.id}`}
                        src={embedPlaybackUrl}
                        title={`${currentDrama.title} - Episode ${currentEpisode.episodeNumber}`}
                        className="w-full h-full object-cover border-0"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    )}

                    {/* Loading Stream Spinner */}
                    {isLoadingStream && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-15 pointer-events-none">
                        <div className="h-10 w-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-[11px] font-bold text-slate-300">Loading Stream...</span>
                      </div>
                    )}

                    {/* Gradient Vignettes */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />

                    {/* Double Tap Seek Zones */}
                    <div
                      onDoubleClick={(e) => handleSeek('back', e)}
                      className="absolute inset-y-0 left-0 w-[35%] z-10 cursor-pointer"
                      title="Double tap to rewind 10s"
                    />
                    <div
                      onDoubleClick={(e) => handleSeek('forward', e)}
                      className="absolute inset-y-0 right-0 w-[35%] z-10 cursor-pointer"
                      title="Double tap to fast forward 10s"
                    />

                    {/* Seek Feedback Indicator */}
                    <AnimatePresence>
                      {seekFeedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1.1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute top-1/2 -translate-y-1/2 z-20 h-20 w-20 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white pointer-events-none ${
                            seekFeedback === 'back' ? 'left-12' : 'right-12'
                          }`}
                        >
                          {seekFeedback === 'back' ? <RotateCcw size={24} /> : <RotateCw size={24} />}
                          <span className="text-[10px] font-bold mt-1">
                            {seekFeedback === 'back' ? '-10s' : '+10s'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Center Play / Pause Indicator */}
                    <AnimatePresence>
                      {showCenterIcon && (
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1.1, opacity: 1 }}
                          exit={{ scale: 1.3, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        >
                          <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                            {isPlaying ? (
                              <Play size={28} className="fill-white ml-1" />
                            ) : (
                              <Pause size={28} className="fill-white" />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Top Bar inside Player */}
                  <div className="relative z-20 flex items-center justify-between p-4 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-rose-500/30">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider">
                          LIVE
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">•</span>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          DramaBox
                        </span>
                      </div>
                    </div>

                    {/* Player Action Buttons Top Right */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setForceWebPlayer((prev) => !prev);
                          setToastMessage(!forceWebPlayer ? 'Switched to DramaBox Web Player' : 'Switched to Direct Video Stream');
                          setShowToast(true);
                          setTimeout(() => setShowToast(false), 2000);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                          !forceWebPlayer
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-black/50 text-slate-300 border border-white/10'
                        }`}
                        title="Toggle Stream Mode"
                      >
                        {!forceWebPlayer ? (
                          <>
                            <Radio size={12} className="text-amber-400 animate-pulse" />
                            <span className="text-[10px] font-extrabold">HD LIVE</span>
                          </>
                        ) : (
                          <>
                            <Tv size={12} />
                            <span className="text-[10px]">Web</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        title="Toggle Fullscreen"
                      >
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Right Floating Action Rail (Episodes, Speed, Sound, Like) */}
                  <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-3 pointer-events-none">
                    {/* Episodes drawer trigger */}
                    <div className="flex flex-col items-center pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEpisodeDrawer(true);
                        }}
                        className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
                        title="Episodes"
                      >
                        <Layers size={19} />
                      </button>
                      <span className="text-[9px] font-bold text-amber-300 mt-1 drop-shadow-md">
                        {currentDrama.totalEpisodes} Eps
                      </span>
                    </div>

                    {/* Speed button */}
                    {hasDirectVideo && (
                      <div className="flex flex-col items-center pointer-events-auto">
                        <button
                          onClick={cyclePlaybackSpeed}
                          className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
                          title="Playback Speed"
                        >
                          <span className="text-xs font-black text-rose-300">{playbackSpeed}x</span>
                        </button>
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Speed</span>
                      </div>
                    )}

                    {/* Sound button */}
                    {hasDirectVideo && (
                      <div className="flex flex-col items-center pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted((prev) => !prev);
                            if (videoRef.current) videoRef.current.muted = !isMuted;
                          }}
                          className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
                          title="Sound"
                        >
                          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <span className="text-[9px] font-bold text-slate-300 mt-1">
                          {isMuted ? 'Muted' : 'Sound'}
                        </span>
                      </div>
                    )}

                    {/* Like button */}
                    <div className="flex flex-col items-center pointer-events-auto">
                      <button
                        onClick={toggleLike}
                        className={`h-11 w-11 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                          likedMap[currentEpisode.id]
                            ? 'bg-rose-600 text-white'
                            : 'bg-black/60 border border-white/20 text-white hover:bg-white/20'
                        }`}
                        title="Like"
                      >
                        <Heart size={18} className={likedMap[currentEpisode.id] ? 'fill-white' : ''} />
                      </button>
                      <span className="text-[9px] font-bold text-slate-200 mt-1">
                        {((currentEpisode.likes + (likedMap[currentEpisode.id] ? 1 : 0)) / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* Bottom Navigation & Metadata Deck */}
                  <div className="relative z-20 p-4 pointer-events-none space-y-2.5">
                    {/* Previous / All Episodes / Next navigation bar */}
                    <div className="flex items-center justify-between gap-2 pointer-events-auto bg-black/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                      <button
                        onClick={goToPrevVideo}
                        disabled={activeEpisodeIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <SkipBack size={14} />
                        <span>Prev</span>
                      </button>

                      <button
                        onClick={() => setShowEpisodeDrawer(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ListVideo size={14} />
                        <span>All Episodes</span>
                      </button>

                      <button
                        onClick={goToNextVideo}
                        disabled={activeEpisodeIndex >= (currentDrama.episodes?.length || 1) - 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <SkipForward size={14} />
                      </button>
                    </div>

                    {/* Episode details overlay */}
                    <div className="pointer-events-auto max-w-[270px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/40 text-[9px] font-black text-rose-300 uppercase">
                          Episode {currentEpisode.episodeNumber}
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold">
                          {currentEpisode.duration}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 mt-1 drop-shadow-md">
                        {currentDrama.title}
                      </h3>
                    </div>

                    {/* Scrub Progress Bar */}
                    <div className="pointer-events-auto pt-1">
                      {hasDirectVideo && duration > 0 ? (
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={currentTime}
                            onChange={(e) => {
                              const newTime = parseFloat(e.target.value);
                              setCurrentTime(newTime);
                              if (videoRef.current) {
                                videoRef.current.currentTime = newTime;
                              }
                            }}
                            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-500 hover:h-1.5 transition-all"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${((activeEpisodeIndex + 1) / (currentDrama.episodes?.length || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Desktop Detail & Episodes Grid (Exact 7xmtools SeriesDetailModal replica) */}
              <div className="hidden lg:flex flex-col w-[420px] xl:w-[480px] h-full p-8 border-l border-white/10 bg-[#08080c]/90 overflow-y-auto custom-scrollbar">
                {/* Drama Header */}
                <div className="space-y-4 border-b border-white/10 pb-6">
                  <div className="flex gap-4">
                    <img
                      src={currentDrama.coverImage}
                      alt={currentDrama.title}
                      className="w-24 aspect-[9/16] rounded-xl object-cover border border-white/15 shadow-xl flex-shrink-0"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase">
                          DramaBox Original
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold">
                          ⭐ {currentDrama.rating}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white leading-tight line-clamp-2">
                        {currentDrama.title}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                        <span>{currentDrama.totalEpisodes} EP</span>
                        <span>•</span>
                        <span>{currentDrama.views} Plays</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleBookmark(currentDrama)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isCurrentBookmarked
                          ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      <Bookmark size={15} className={isCurrentBookmarked ? 'fill-black' : ''} />
                      <span>{isCurrentBookmarked ? 'Saved to Shelf' : 'Add to Shelf'}</span>
                    </button>

                    <button
                      onClick={() => handleShare(currentDrama)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
                    >
                      <Share2 size={15} />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Synopsis</p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed line-clamp-4">
                      {currentDrama.synopsis}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {currentDrama.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Episodes Grid Title */}
                <div className="pt-6 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListVideo size={16} className="text-rose-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Episodes ({currentDrama.episodes?.length || currentDrama.totalEpisodes})
                    </h3>
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold">
                    Now Playing: EP {activeEpisodeIndex + 1}
                  </span>
                </div>

                {/* All Episodes Number Grid (Inspired by 7xmtools) */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pb-6">
                  {currentDrama.episodes?.map((ep, idx) => {
                    const isActive = idx === activeEpisodeIndex;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          setActiveEpisodeIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`relative py-3 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-rose-400'
                            : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                        }`}
                      >
                        <span>EP {ep.episodeNumber}</span>
                        <span className="text-[9px] font-normal opacity-70 mt-0.5">
                          {ep.duration}
                        </span>
                        {ep.videoType === 'mp4' && !isActive && (
                          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Sliding Episode Drawer */}
            <AnimatePresence>
              {showEpisodeDrawer && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  className="lg:hidden absolute inset-x-0 bottom-0 z-50 max-h-[75%] rounded-t-3xl p-5 bg-[#0e0e14]/95 backdrop-blur-2xl flex flex-col shadow-2xl border-t border-white/20"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{currentDrama.title}</h3>
                      <p className="text-xs text-amber-300 font-semibold">
                        {currentDrama.totalEpisodes} Total Episodes • Live DramaBox Stream
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEpisodeDrawer(false)}
                      className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {currentDrama.episodes?.map((ep, idx) => {
                      const isActive = idx === activeEpisodeIndex;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => {
                            setActiveEpisodeIndex(idx);
                            setShowEpisodeDrawer(false);
                            setIsPlaying(true);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-bold ${
                                isActive ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              EP {ep.episodeNumber}
                            </span>
                            <span className="text-xs font-semibold line-clamp-1">{ep.title}</span>
                            {ep.videoType === 'mp4' && (
                              <span className="rounded px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                                720p HD
                              </span>
                            )}
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
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 z-50 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white bg-neutral-900/90 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
