import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  HelpCircle,
  X,
  AlertCircle,
  RotateCcw as RetryIcon
} from 'lucide-react';
import { Scrubber } from './Scrubber';
import { useHotkeys } from './useHotkeys';
import { useSpatialMotion } from '../../lib/motion';

export interface Chapter {
  time: number;
  title: string;
}

export interface LiquidVideoPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  poster?: string;
  onBack?: () => void;
  chapters?: Chapter[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function LiquidVideoPlayer({
  src,
  title,
  subtitle,
  poster,
  onBack,
  chapters = [],
  isLoading = false,
  isError = false,
  onRetry,
}: LiquidVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { springSnappy } = useSpatialMotion();

  // Reset 2.5s Inactivity Timer
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !showHelpModal) {
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, showHelpModal]);

  useEffect(() => {
    const handleMove = () => handleUserActivity();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleUserActivity]);

  // Fullscreen change listener to sync Esc and browser exits
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (deltaSeconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + deltaSeconds, 0), v.duration || 0);
  };

  const handleAbsoluteSeek = (targetTime: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(targetTime, 0), v.duration || 0);
    setCurrentTime(v.currentTime);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !isMuted;
    v.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted = clamped === 0;
      setIsMuted(clamped === 0);
    }
  };

  // Hotkeys integrated with help modal & focus awareness
  useHotkeys(
    {
      onTogglePlay: togglePlay,
      onSeek: handleSeek,
      onVolumeDelta: (delta) => handleVolumeChange(volume + delta),
      onToggleMute: toggleMute,
      onToggleFullscreen: toggleFullscreen,
      onToggleHelp: () => setShowHelpModal((prev) => !prev),
      onCloseModal: () => setShowHelpModal(false),
      isModalOpen: showHelpModal,
    },
    true
  );

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeChapter = chapters.length > 0
    ? chapters.slice().reverse().find((c) => currentTime >= c.time)?.title
    : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-bg-overlay select-none shadow-xl border border-border-default focus-within:ring-2 focus-within:ring-accent"
      tabIndex={0}
      aria-label={`Video player: ${title}`}
    >
      {/* Poster Fallback Layer */}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40 blur-sm pointer-events-none"
        />
      )}

      {/* Actual HTML5 Video or Embed */}
      {src && (
        <video
          ref={videoRef}
          src={src}
          playsInline
          poster={poster}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
              if (videoRef.current.buffered.length > 0) {
                setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
              }
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading video"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
          <span className="mt-3 text-sm font-semibold text-text-primary">Loading video stream...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          aria-live="polite"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center"
        >
          <AlertCircle size={40} className="text-error mb-3" aria-hidden="true" />
          <h3 className="text-base font-bold text-text-primary">Couldn't load this video source</h3>
          <p className="mt-1 text-xs text-text-muted max-w-sm">
            The server may be currently offline or unresponsive. Try switching to another source.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 flex items-center gap-2 rounded-md bg-accent text-on-accent px-5 py-2.5 text-xs font-semibold min-h-[44px] hover:bg-accent-light active:bg-accent-dark cursor-pointer transition-colors"
            >
              <RetryIcon size={16} aria-hidden="true" />
              <span>Retry Stream</span>
            </button>
          )}
        </div>
      )}

      {/* Player Chrome Controls Overlay */}
      <AnimatePresence>
        {(showControls || !isPlaying) && !isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-t from-black/85 via-transparent to-black/75 pointer-events-none"
          >
            {/* Top Bar: Back (44px text + icon) + Title + Chapter Chip */}
            <div className="flex items-center justify-between gap-3 pointer-events-auto">
              <div className="flex items-center gap-3 min-w-0">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex h-11 items-center gap-2 rounded-full px-3.5 bg-black/60 border border-border-default text-text-primary hover:bg-black/80 hover:border-border-strong cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Back to Browse"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span className="text-xs font-semibold hidden sm:inline">Back</span>
                  </button>
                )}
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-text-primary truncate" title={title}>
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-text-muted truncate">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Chapter Chip (hidden below 360px) */}
              <div className="flex items-center gap-2">
                {activeChapter && (
                  <span className="hidden xs:inline-flex rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-semibold text-accent-light">
                    {activeChapter}
                  </span>
                )}
                {/* Help Button */}
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Keyboard Shortcuts Help"
                  title="Keyboard Shortcuts"
                >
                  <HelpCircle size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Center Play Button for Quick Touch Toggle */}
            <div className="self-center pointer-events-auto">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-on-accent hover:bg-accent-light active:scale-95 shadow-xl transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={28} className="fill-current" aria-hidden="true" />
                ) : (
                  <Play size={28} className="fill-current ml-1" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Bottom Deck: Scrubber + Controls Row */}
            <div className="space-y-2 pointer-events-auto">
              {/* Scrubber */}
              <Scrubber
                currentTime={currentTime}
                duration={duration}
                bufferedTime={buffered}
                chapters={chapters}
                onSeek={handleAbsoluteSeek}
              />

              {/* Lower Controls Toolbar */}
              <div className="flex items-center justify-between gap-3 text-text-primary text-xs">
                {/* Left controls: Play, Skip ±10s, Volume, Time Readout */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} className="ml-0.5" aria-hidden="true" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(-10)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Skip back 10 seconds"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(10)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Skip forward 10 seconds"
                  >
                    <RotateCw size={16} aria-hidden="true" />
                  </button>

                  {/* Volume Slider + Mute Button */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                      aria-pressed={isMuted || volume === 0}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={16} aria-hidden="true" />
                      ) : volume < 0.5 ? (
                        <Volume1 size={16} aria-hidden="true" />
                      ) : (
                        <Volume2 size={16} aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="hidden sm:block h-1.5 w-16 accent-accent rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Volume slider"
                    />
                  </div>

                  {/* Time Readout */}
                  <span className="font-mono text-xs text-text-secondary ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls: Fullscreen */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 border border-border-default hover:border-border-strong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={18} aria-hidden="true" /> : <Maximize size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hardware Keyboard Shortcut Modal (responsive dialog) */}
      <AnimatePresence>
        {showHelpModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard Shortcuts"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springSnappy}
              onClick={(e) => e.stopPropagation()}
              className="apple-glass-heavy w-full max-w-lg rounded-xl p-5 sm:p-6 border border-border-default shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Keyboard Shortcuts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:text-text-primary border border-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  aria-label="Close shortcuts dialog"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Play / Pause</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">Space / K</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Seek ±10s</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">J / L</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Seek ±5s</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">← / →</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Volume ±5%</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">↑ / ↓</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Fullscreen</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">F</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Mute</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">M</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Help Guide</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">?</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Close Dialog</span>
                  <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono text-accent-light">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
