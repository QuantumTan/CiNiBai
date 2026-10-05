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
  Lock,
  Layers,
  Coins,
  RefreshCw,
  FastForward
} from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaEpisode, DramaSeriesDetailResponse } from '../../lib/reels/dramaboxTypes';

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
    coins,
    deductCoins,
    recordProgress,
    setAuthModalOpen,
  } = useDramaBoxStore();

  const [detailData, setDetailData] = useState<DramaSeriesDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
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
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);

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

  // Initialize and attach HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeEpisode) return;

    // Destroy existing HLS session
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setStreamError(null);
    const videoUrl = activeEpisode.video_url;

    if (!activeEpisode.is_unlocked && activeEpisode.is_paid) {
      // Episode is locked; do not stream yet
      video.pause();
      return;
    }

    if (!videoUrl) {
      // Stream URL missing from upstream
      setStreamError('Stream is preparing. Tap "Refresh Stream" below.');
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
              setStreamError('Stream connection interrupted.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native iOS / Safari HLS fallback
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
  }, [activeEpisode, isMuted, playbackRate]);

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

  // Handle Double Tap to Seek (-5s / +5s)
  const handlePlayerTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const side = x < rect.width / 2 ? 'left' : 'right';
    const now = Date.now();

    if (lastTapRef.current && now - lastTapRef.current.time < 300 && lastTapRef.current.side === side) {
      // Double tap detected
      const video = videoRef.current;
      if (video) {
        const delta = side === 'left' ? -5 : 5;
        video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
        setSeekRipple(side);
        setTimeout(() => setSeekRipple(null), 500);
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, side };
      // Single tap toggle play after short debounce
      setTimeout(() => {
        if (!lastTapRef.current) return;
        togglePlay();
        lastTapRef.current = null;
      }, 300);
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

  // Unlock episode handler
  const handleUnlock = async () => {
    if (!activeEpisode) return;
    setIsUnlocking(true);
    try {
      const cost = activeEpisode.coin_cost || 10;
      if (coins < cost) {
        setAuthModalOpen(true);
        setIsUnlocking(false);
        return;
      }
      const success = await dramaboxApi.unlockEpisode(activeEpisode.id);
      if (success || coins >= cost) {
        deductCoins(cost);
        // Reload detail with refresh_stream=1 to get signed m3u8
        await loadDetail(true);
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!activeModalSeries) return null;

  const isSaved = isInShelf(activeModalSeries.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-6xl max-h-[96vh] apple-glass-heavy rounded-3xl border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={closePlayerModal}
          className="absolute top-4 right-4 z-50 p-2 rounded-full apple-glass-thin border border-white/10 text-white/72 hover:text-white hover:border-white/30 transition-all"
          aria-label="Close Player"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* ============================================================ */}
        {/* LEFT COLUMN: 9:16 Vertical Video Player Stage                */}
        {/* ============================================================ */}
        <div className="relative w-full md:w-[480px] lg:w-[520px] bg-black flex items-center justify-center flex-shrink-0 min-h-[460px] md:min-h-[640px] overflow-hidden">
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
            onClick={handlePlayerTap}
          >
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
            {!isPlaying && !activeEpisode?.is_paid && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/25">
                <div className="w-16 h-16 rounded-full apple-glass-heavy border border-white/20 flex items-center justify-center shadow-xl text-white">
                  <Play className="w-8 h-8 fill-white ml-1" strokeWidth={1.5} />
                </div>
              </div>
            )}

            {/* Locked Episode Overlay */}
            {activeEpisode?.is_paid && !activeEpisode?.is_unlocked && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/85 backdrop-blur-md">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Episode {activeEpisode.episode_index} is Locked</h3>
                <p className="type-meta text-white/72 mb-6 max-w-xs">
                  Unlock this episode to continue watching in full high-definition streaming.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlock();
                  }}
                  disabled={isUnlocking}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Coins className="w-4 h-4" />
                  <span>
                    {isUnlocking ? 'Unlocking...' : `Unlock for ${activeEpisode.coin_cost || 10} Coins`}
                  </span>
                </button>
                <span className="type-meta text-white/48 mt-3 text-xs">
                  Your Balance: {coins} Coins
                </span>
              </div>
            )}

            {/* Stream Error / Retry Overlay */}
            {streamError && activeEpisode?.is_unlocked && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-sm">
                <p className="type-meta text-white/88 mb-4 max-w-xs">{streamError}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadDetail(true);
                  }}
                  className="px-5 py-2.5 rounded-full apple-glass-regular border border-white/20 text-white text-xs font-semibold flex items-center gap-2 hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Stream</span>
                </button>
              </div>
            )}

            {/* Right Floating Action Dock */}
            <div
              className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Like Button */}
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className={`w-10 h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center transition-all ${
                  isLiked ? 'text-rose-500 border-rose-500/40 bg-rose-500/10' : 'text-white/80 hover:text-white'
                }`}
                title="Like"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} strokeWidth={1.5} />
              </button>

              {/* Shelf / Bookmark Button */}
              <button
                type="button"
                onClick={() => toggleShelf(activeModalSeries)}
                className={`w-10 h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center transition-all ${
                  isSaved ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-white/80 hover:text-white'
                }`}
                title="Add to Shelf"
              >
                {isSaved ? <Check className="w-5 h-5" strokeWidth={1.5} /> : <Bookmark className="w-5 h-5" strokeWidth={1.5} />}
              </button>

              {/* Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (videoRef.current) videoRef.current.muted = nextMuted;
                }}
                className="w-10 h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" strokeWidth={1.5} /> : <Volume2 className="w-5 h-5" strokeWidth={1.5} />}
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full apple-glass-regular border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Bottom Scrim & HUD Controls */}
            <div
              className="absolute inset-x-0 bottom-0 z-20 pt-10 pb-4 px-4 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title & Episode Badge */}
              <div className="flex items-center justify-between text-xs text-white/80">
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
                className="group/scrub relative w-full h-2 rounded-full bg-white/20 cursor-pointer overflow-hidden"
              >
                <div
                  className="h-full bg-rose-500 rounded-full relative"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {/* Previous Episode */}
                  <button
                    type="button"
                    disabled={activeModalEpisodeIndex <= 1}
                    onClick={() => setActiveEpisodeIndex(activeModalEpisodeIndex - 1)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Previous Episode"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>

                  {/* Play / Pause Toggle */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-full apple-glass-thin border border-white/10 text-white hover:bg-white/20"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  {/* Next Episode */}
                  <button
                    type="button"
                    disabled={activeModalEpisodeIndex >= episodes.length}
                    onClick={() => setActiveEpisodeIndex(activeModalEpisodeIndex + 1)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Next Episode"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Playback Speed Cycle Button */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-md apple-glass-thin border border-white/10 text-[11px] font-bold text-white/90 hover:text-white"
                >
                  {playbackRate}x
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Series Details & Episode Playlist             */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col min-w-0 h-[480px] md:h-[640px] lg:h-[750px] p-6 lg:p-8 overflow-hidden bg-[#0a0b0f]/80">
          {/* Series Meta Info */}
          <div className="border-b border-white/[0.08] pb-5 mb-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                DramaBox Series
              </span>
              <span className="type-meta text-xs text-white/48">
                {episodes.length || activeModalSeries.chapter_count} Total Episodes
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white line-clamp-1 mb-2">
              {activeModalSeries.title}
            </h2>

            <p className="type-body text-xs sm:text-sm text-white/60 line-clamp-3 leading-relaxed mb-3">
              {activeModalSeries.description}
            </p>

            {/* Themes */}
            <div className="flex flex-wrap gap-1.5">
              {activeModalSeries.theme?.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-white/[0.06] text-white/72 text-xs border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Episode Playlist Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="type-section-title text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" strokeWidth={1.5} />
              <span>Episodes</span>
            </h3>
            <span className="type-meta text-xs text-white/48">
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
                const isLocked = ep.is_paid && !ep.is_unlocked;

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
                        {isCurrent ? (
                          <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        ) : isLocked ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-400" />
                          </div>
                        ) : null}
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
                      ) : isLocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {ep.coin_cost ? `${ep.coin_cost} Coins` : 'Locked'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-white/48 text-[11px]">
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
