/**
 * DramaBox & ReelShort Series Detail & Vertical Video Player Modal
 * 1-to-1 match with https://reels.7xmtools.com SeriesDetailModal:
 * - 9:16 vertical video player powered by HLS.js streaming live .m3u8
 * - Gesture double-tap left/right seek (-5s/+5s)
 * - Right floating dock (like, shelf, mute, fullscreen)
 * - Interactive scrubber, playback speed (1x - 2x), and prev/next episode navigation
 * - Episode unlock flow with user coins and stream auto-refresh
 * - Right column episode playlist with duration and status badges
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  FastForward,
  Zap,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaEpisode, DramaSeriesDetailResponse } from '../../lib/reels/dramaboxTypes';
import {
  REEL_PROVIDERS,
  isEmbedUrl,
  getOfficialEmbedUrl,
} from '../../api/reelsProviders';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function DramaPlayerModal() {
  const {
    activeModalSeries,
    activeModalEpisodeIndex,
    closePlayerModal,
    setActiveEpisodeIndex,
    toggleShelf,
    isInShelf,
    recordProgress,
  } = useDramaBoxStore();

  const [detailData, setDetailData] = useState<DramaSeriesDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [selectedServer, setSelectedServer] = useState<'hls-direct' | 'official-embed' | 'cloud-mirror'>('hls-direct');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seekRipple, setSeekRipple] = useState<'left' | 'right' | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Fetch full series detail and episodes on open
  const loadDetail = useCallback(async (refresh = false) => {
    if (!activeModalSeries) return;
    setIsLoadingDetail(true);
    setStreamError(null);
    try {
      const data = await dramaboxApi.getSeriesDetail(activeModalSeries.id, undefined, refresh);
      if (data) {
        setDetailData(data);
      } else {
        setStreamError('Could not load episode details. Please try again.');
      }
    } catch {
      setStreamError('Failed to fetch series data from streaming server.');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [activeModalSeries]);

  useEffect(() => {
    if (activeModalSeries) {
      loadDetail();
    }
  }, [activeModalSeries, loadDetail]);

  const episodes = detailData?.episodes || [];
  const activeEpisode: DramaEpisode | undefined =
    episodes.find((ep) => ep.episode_index === activeModalEpisodeIndex) || episodes[0];

  const directHlsAvailable = Boolean(
    activeEpisode?.m3u8_url ||
    (activeEpisode?.video_url && activeEpisode.video_url.includes('.m3u8') && !isEmbedUrl(activeEpisode.video_url))
  );

  const isEmbedMode = selectedServer !== 'hls-direct' || !directHlsAvailable;

  // Initialize and attach HLS stream (only in direct HLS mode)
  useEffect(() => {
    if (isEmbedMode) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video || !activeEpisode) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setStreamError(null);
    const videoUrl = activeEpisode.m3u8_url || activeEpisode.video_url;

    if (!videoUrl || !videoUrl.includes('.m3u8')) {
      return;
    }

    if (Hls.isSupported() && videoUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 10,
        startLevel: -1,
      });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.playbackRate = playbackRate;
        video.muted = isMuted;
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setSelectedServer('official-embed');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.playbackRate = playbackRate;
      video.muted = isMuted;
      video.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      video.src = videoUrl;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isEmbedMode, activeEpisode, isMuted, playbackRate]);

  // Heartbeat watch progress recording (every 5 seconds)
  useEffect(() => {
    if (!activeModalSeries || !activeEpisode || !isPlaying) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        recordProgress({
          series_id: activeModalSeries.id,
          series_title: activeModalSeries.title,
          cover_pic: activeModalSeries.cover_pic,
          episode_id: activeEpisode.id,
          episode_index: activeEpisode.episode_index,
          progress_seconds: video.currentTime,
          duration: video.duration || activeEpisode.duration,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeModalSeries, activeEpisode, isPlaying, recordProgress]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle Single Tap (Play/Pause) and Double Tap to Seek (-5s / +5s) with 0 latency
  const handlePlayerTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const side = x < rect.width / 2 ? 'left' : 'right';
      const video = videoRef.current;
      if (video) {
        const delta = side === 'left' ? -5 : 5;
        video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
        setSeekRipple(side);
        setTimeout(() => setSeekRipple(null), 500);
      }
      return;
    }

    if (e.detail === 1) {
      togglePlay();
    }
  };

  // Scrubber drag / click
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setCurrentTime(video.currentTime);
  };

  // Speed selector cycle
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackRate(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  if (!activeModalSeries) return null;

  const isSaved = isInShelf(activeModalSeries.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/90 md:bg-black/80 backdrop-blur-xl animate-fade-in">
      {/* Modal Dialog Container */}
      <div className="relative w-full h-[100dvh] md:h-auto max-w-6xl md:max-h-[96vh] apple-glass-heavy rounded-none md:rounded-3xl border-0 md:border md:border-white/[0.12] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={closePlayerModal}
          className="absolute top-3 right-3 z-50 p-2.5 rounded-full bg-black/60 md:bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all shadow-lg"
          aria-label="Close Player"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* ============================================================ */}
        {/* LEFT COLUMN: 9:16 Vertical Video Player Stage                */}
        {/* ============================================================ */}
        <div className="relative w-full h-[46vh] sm:h-[48vh] md:h-[680px] lg:h-[750px] md:w-[460px] lg:w-[500px] bg-black flex items-center justify-center flex-shrink-0 overflow-hidden">
          {/* Blurred Ambient Backdrop for aspect ratio filling */}
          <div
            className="absolute inset-0 filter blur-3xl opacity-30 transform scale-125"
            style={{
              backgroundImage: `url(${activeEpisode?.video_pic || activeModalSeries.cover_pic})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* 9:16 Vertical Stage Box */}
          <div
            className="relative aspect-[9/16] h-full max-h-[750px] w-auto max-w-full flex items-center justify-center bg-black overflow-hidden shadow-2xl"
            onClick={isEmbedMode ? undefined : handlePlayerTap}
          >
            {/* Quick Floating Server Switcher Pill on Top of Video Stage */}
            <div
              className="absolute top-3 left-3 z-30 flex items-center gap-1 p-1 rounded-full apple-glass-heavy border border-white/15 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 px-2 py-0.5">
                <Zap size={11} className="text-amber-400" />
                <span className="hidden sm:inline">SERVER</span>
              </span>
              {REEL_PROVIDERS.map((p) => {
                const isActive = selectedServer === p.id;
                const isHlsDisabled = p.id === 'hls-direct' && !directHlsAvailable;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isHlsDisabled}
                    onClick={() => setSelectedServer(p.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-rose-500 text-white shadow'
                        : isHlsDisabled
                          ? 'text-white/30 cursor-not-allowed'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {isEmbedMode ? (
              /* ============================================================ */
              /* EMBED STAGE: Sandboxed Official Web Player                   */
              /* ============================================================ */
              <iframe
                key={`${activeEpisode?.id}-${selectedServer}`}
                src={
                  activeEpisode?.embed_url ||
                  getOfficialEmbedUrl(activeModalSeries.id)
                }
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                title={`${activeModalSeries.title} - Episode ${activeModalEpisodeIndex}`}
              />
            ) : (
              /* ============================================================ */
              /* NATIVE HLS STAGE: Direct .m3u8 CDN Stream                    */
              /* ============================================================ */
              <>
                {/* HTML5 Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  loop
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  className="w-full h-full object-cover"
                  poster={activeEpisode?.video_pic || activeModalSeries.cover_pic}
                />

                {/* Double Tap Ripple Animations (-5s / +5s) */}
                {seekRipple && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-30 px-4 py-2 rounded-full apple-glass-heavy text-white font-bold text-sm flex items-center gap-1.5 animate-ping ${
                      seekRipple === 'left' ? 'left-8' : 'right-8'
                    }`}
                  >
                    <FastForward className={`w-4 h-4 ${seekRipple === 'left' ? 'rotate-180' : ''}`} />
                    <span>{seekRipple === 'left' ? '-5s' : '+5s'}</span>
                  </div>
                )}

                {/* Play/Pause Center Indicator (visible when paused) */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/25">
                    <div className="w-16 h-16 rounded-full apple-glass-heavy border border-white/20 flex items-center justify-center shadow-xl text-white">
                      <Play className="w-8 h-8 fill-white ml-1" strokeWidth={1.5} />
                    </div>
                  </div>
                )}

                {/* Stream Error / Retry Overlay */}
                {streamError && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/85 backdrop-blur-md">
                    <p className="type-meta text-white/88 mb-4 max-w-xs">{streamError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServer('official-embed');
                        }}
                        className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Switch to Official Web Stream</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Right Floating Action Dock */}
                <div
                  className="absolute right-2.5 md:right-3 bottom-16 md:bottom-24 z-20 flex flex-col items-center gap-2 md:gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center transition-all ${
                      isLiked ? 'text-rose-500 border-rose-500/40 bg-rose-500/10' : 'text-white/80 hover:text-white'
                    }`}
                    title="Like"
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-rose-500' : ''}`} strokeWidth={1.5} />
                  </button>

                  {/* Shelf / Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleShelf(activeModalSeries)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center transition-all ${
                      isSaved ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-white/80 hover:text-white'
                    }`}
                    title="Add to Shelf"
                  >
                    {isSaved ? <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} /> : <Bookmark className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />}
                  </button>

                  {/* Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (videoRef.current) videoRef.current.muted = nextMuted;
                    }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-rose-400" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    title="Fullscreen"
                  >
                    <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Bottom Scrim & HUD Controls */}
                <div
                  className="absolute inset-x-0 bottom-0 z-20 pt-8 pb-2 md:pb-4 px-3 md:px-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1.5 md:gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Title & Episode Badge */}
                  <div className="flex items-center justify-between text-[11px] md:text-xs text-white/80">
                    <span className="font-semibold truncate max-w-[200px]">
                      {activeModalSeries.title} · Ep {activeModalEpisodeIndex}
                    </span>
                    <span className="type-meta text-white/60 tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration || activeEpisode?.duration || 0)}
                    </span>
                  </div>

                  {/* Custom Scrubber Bar */}
                  <div
                    ref={progressBarRef}
                    onClick={handleScrub}
                    className="group/scrub relative w-full h-1.5 md:h-2 rounded-full bg-white/20 cursor-pointer overflow-hidden"
                  >
                    <div
                      className="h-full bg-rose-500 rounded-full relative"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between pt-0.5 md:pt-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button
                        type="button"
                        disabled={activeModalEpisodeIndex <= 1}
                        onClick={() => setActiveEpisodeIndex(activeModalEpisodeIndex - 1)}
                        className="p-1 md:p-1.5 rounded-full hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Previous Episode"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 md:p-2 rounded-full apple-glass-thin border border-white/10 text-white hover:bg-white/20"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        disabled={activeModalEpisodeIndex >= episodes.length}
                        onClick={() => setActiveEpisodeIndex(activeModalEpisodeIndex + 1)}
                        className="p-1 md:p-1.5 rounded-full hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Next Episode"
                      >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-md apple-glass-thin border border-white/10 text-[10px] md:text-[11px] font-bold text-white/90 hover:text-white"
                    >
                      {playbackRate}x
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Series Details & Episode Playlist             */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col min-w-0 h-[54vh] sm:h-[52vh] md:h-[680px] lg:h-[750px] p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#0a0b0f]/95 md:bg-[#0a0b0f]/80">
          {/* Series Meta Info */}
          <div className="border-b border-white/[0.08] pb-3 md:pb-5 mb-3 md:mb-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-semibold border border-amber-500/30">
                CineBai Series
              </span>
              <span className="type-meta text-[11px] sm:text-xs text-white/48">
                {episodes.length || activeModalSeries.chapter_count} Episodes · 100% Free
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white line-clamp-1 mb-1 md:mb-2">
              {activeModalSeries.title}
            </h2>

            <p className="type-body text-xs sm:text-sm text-white/60 line-clamp-2 md:line-clamp-3 leading-relaxed mb-2 md:mb-3">
              {activeModalSeries.description}
            </p>

            {/* Themes */}
            <div className="flex flex-wrap gap-1.5">
              {activeModalSeries.theme?.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-white/[0.06] text-white/72 text-[10px] sm:text-xs border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Multi-Provider Streaming Selector */}
            <div className="mt-3 p-3 rounded-2xl apple-glass-thin border border-white/[0.08] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  Streaming Server
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Free · Unlocked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REEL_PROVIDERS.map((provider) => {
                  const isCurrent = selectedServer === provider.id;
                  const isHlsDisabled = provider.id === 'hls-direct' && !directHlsAvailable;

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      disabled={isHlsDisabled}
                      onClick={() => setSelectedServer(provider.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'apple-glass-heavy border-rose-500/60 bg-rose-500/15 shadow-sm'
                          : isHlsDisabled
                            ? 'border-white/[0.04] bg-white/[0.02] opacity-40 cursor-not-allowed'
                            : 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold truncate ${isCurrent ? 'text-rose-400' : 'text-white'}`}>
                          {provider.name.split(' ')[0]}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`} />
                      </div>
                      <span className="text-[9px] text-white/50 truncate mt-0.5">
                        {isHlsDisabled ? 'Embed fallback' : provider.badge || 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Episode Playlist Header */}
          <div className="flex items-center justify-between mb-2 md:mb-3 flex-shrink-0">
            <h3 className="type-section-title text-xs sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <span>Episodes</span>
            </h3>
            <span className="type-meta text-[11px] sm:text-xs text-white/48">
              Now Playing: Ep {activeModalEpisodeIndex}
            </span>
          </div>

          {/* Scrollable Episode List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {isLoadingDetail && episodes.length === 0 ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : (
              episodes.map((ep) => {
                const isCurrent = ep.episode_index === activeModalEpisodeIndex;

                return (
                  <div
                    key={ep.id || ep.episode_index}
                    onClick={() => setActiveEpisodeIndex(ep.episode_index)}
                    className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isCurrent
                        ? 'apple-glass-heavy border-rose-500/40 bg-rose-500/10 shadow-lg'
                        : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Left: Thumbnail & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                        <img
                          src={ep.video_pic || activeModalSeries.cover_pic}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col text-left min-w-0">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-rose-400' : 'text-white'
                          }`}
                        >
                          {ep.title || `Episode ${ep.episode_index}`}
                        </span>
                        <span className="type-meta text-xs text-white/48 mt-0.5">
                          {formatTime(ep.duration || 120)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status Pill */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCurrent ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                          Playing
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
