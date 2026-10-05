import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  PictureInPicture2,
  Sparkles,
  Subtitles,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAmbientCanvas } from '../../context/AmbientCanvasContext';

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
}

const DEFAULT_CHAPTERS: Chapter[] = [
  { time: 0, title: 'Prologue' },
  { time: 180, title: 'The Awakening' },
  { time: 640, title: 'The Encounter' },
  { time: 1200, title: 'Resolution' },
];

export function LiquidVideoPlayer({
  src,
  title,
  subtitle,
  poster,
  onBack,
  chapters = DEFAULT_CHAPTERS,
}: LiquidVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ambientEnabled, setAmbientEnabled } = useAmbientCanvas();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Scrubber Hover Preview state
  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);

  // Audio / Subtitles Drawer
  const [showSubtitleDrawer, setShowSubtitleDrawer] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<'off' | 'en' | 'es' | 'ja'>('en');
  const [selectedAudio, setSelectedAudio] = useState<'original' | 'dubbed'>('original');

  // Hotkey HUD Indicator state
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHud = (message: string) => {
    setHudMessage(message);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setHudMessage(null);
    }, 1500);
  };

  // Reset 2.5s Inactivity Timer
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying) {
      idleTimerRef.current = setTimeout(() => {
        if (!showSubtitleDrawer) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [isPlaying, showSubtitleDrawer]);

  useEffect(() => {
    handleUserActivity();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlaying, handleUserActivity]);

  // Video Time & Buffer Tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      triggerHud('Playing');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerHud('Paused');
    }
  }, []);

  const skipSeconds = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      duration
    );
    triggerHud(seconds > 0 ? '+10s Skip' : '-10s Rewind');
  }, [duration]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    const clamped = Math.min(Math.max(newVolume, 0), 1);
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
    triggerHud(`Volume ${Math.round(clamped * 100)}%`);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const targetMute = !isMuted;
    videoRef.current.muted = targetMute;
    setIsMuted(targetMute);
    triggerHud(targetMute ? 'Muted' : `Volume ${Math.round(volume * 100)}%`);
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
      triggerHud('Fullscreen');
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
      triggerHud('Windowed');
    }
  }, []);

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        triggerHud('Exit PiP');
      } else {
        await videoRef.current.requestPictureInPicture();
        triggerHud('Picture in Picture');
      }
    } catch {
      triggerHud('PiP not available');
    }
  };

  // Keyboard Hotkey Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyJ':
          e.preventDefault();
          skipSeconds(-10);
          break;
        case 'KeyL':
          e.preventDefault();
          skipSeconds(10);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, togglePlay, skipSeconds, toggleFullscreen, toggleMute, handleVolumeChange]);

  // Scrubber Hover Calculation
  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration === 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setHoverPosition(pos);
    setHoverTime(pos * duration);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || !videoRef.current || duration === 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active chapter title
  const currentChapter = chapters
    .slice()
    .reverse()
    .find((c) => currentTime >= c.time);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className="relative aspect-video w-full overflow-hidden bg-black select-none rounded-3xl shadow-2xl group/player"
    >
      {/* HTML5 Native Video Tag */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Hotkey HUD Indicator Toast */}
      <AnimatePresence>
        {hudMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="liquid-glass-elevated pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2 text-sm font-semibold tracking-wide text-white shadow-2xl"
          >
            {hudMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Overlays (Auto-hidden on 2.5s Inactivity) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-transparent to-black/60"
          >
            {/* Top Navigation Bar */}
            <div className="pointer-events-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="liquid-glass-control flex h-10 w-10 items-center justify-center rounded-full text-white"
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-md">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs font-medium text-slate-300 drop-shadow-sm">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Ambient Lighting Toggle & Audio Drawer */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAmbientEnabled((p) => !p)}
                  className={`liquid-glass-control flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    ambientEnabled ? 'text-amber-300' : 'text-slate-400'
                  }`}
                  aria-label="Toggle Ambient Glow"
                >
                  <Sparkles size={14} className={ambientEnabled ? 'fill-amber-300' : ''} />
                  <span>Ambient Light</span>
                </button>

                <button
                  onClick={() => setShowSubtitleDrawer((prev) => !prev)}
                  className={`liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors ${
                    showSubtitleDrawer ? 'bg-amber-400/20 text-amber-300' : ''
                  }`}
                  aria-label="Audio and Subtitles"
                >
                  <Subtitles size={17} />
                </button>
              </div>
            </div>

            {/* Center Big Play/Pause Touch Indicator */}
            <div className="pointer-events-auto flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="liquid-glass-elevated flex h-18 w-18 items-center justify-center rounded-full text-white shadow-2xl"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={30} className="fill-white" />
                ) : (
                  <Play size={30} className="fill-white ml-1" />
                )}
              </motion.button>
            </div>

            {/* Bottom Scrubber & Deck Controls */}
            <div className="pointer-events-auto space-y-3">
              {/* Liquid Scrubber Bar */}
              <div
                ref={scrubberRef}
                onMouseEnter={() => setIsHoveringScrubber(true)}
                onMouseLeave={() => setIsHoveringScrubber(false)}
                onMouseMove={handleScrubberMouseMove}
                onClick={handleScrubberClick}
                className="group/scrubber relative flex h-7 cursor-pointer items-center py-2"
              >
                {/* Frame Hover Tooltip Preview */}
                <AnimatePresence>
                  {isHoveringScrubber && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="liquid-glass-elevated pointer-events-none absolute bottom-9 -translate-x-1/2 rounded-xl p-2 text-center shadow-xl"
                      style={{ left: `${hoverPosition * 100}%` }}
                    >
                      <div className="aspect-video w-32 overflow-hidden rounded-lg bg-neutral-900 border border-white/10 mb-1">
                        <img
                          src={poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {formatTime(hoverTime)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Track Base */}
                <div className="relative h-1.5 w-full rounded-full bg-white/20 transition-all duration-200 group-hover/scrubber:h-2.5">
                  {/* Buffered Track */}
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-full bg-white/30"
                    style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
                  />

                  {/* Played Track with Refracted Gradient */}
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-white shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />

                  {/* Chapter Marker Notches */}
                  {duration > 0 &&
                    chapters.map((ch) => (
                      <div
                        key={ch.time}
                        className="absolute top-0 bottom-0 w-[2px] bg-black/60 z-10"
                        style={{ left: `${(ch.time / duration) * 100}%` }}
                        title={ch.title}
                      />
                    ))}

                  {/* Glowing Scrubber Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Floating Glass Control Deck */}
              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-4">
                  {/* 10s Rewind */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => skipSeconds(-10)}
                    className="liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full"
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw size={16} />
                  </motion.button>

                  {/* 10s Fast Forward */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => skipSeconds(10)}
                    className="liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full"
                    aria-label="Forward 10 seconds"
                  >
                    <RotateCw size={16} />
                  </motion.button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 group/volume">
                    <button
                      onClick={toggleMute}
                      className="liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX size={16} />
                      ) : volume < 0.5 ? (
                        <Volume1 size={16} />
                      ) : (
                        <Volume2 size={16} />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 accent-amber-400 cursor-pointer h-1.5 opacity-70 group-hover/volume:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Time & Chapter Display */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-slate-500">/</span>
                    <span>{formatTime(duration)}</span>
                    {currentChapter && (
                      <span className="ml-2 font-sans rounded bg-white/10 px-2 py-0.5 text-[10px] text-amber-300 font-semibold hidden sm:inline">
                        {currentChapter.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-3">
                  {/* PiP Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePiP}
                    className="liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full"
                    aria-label="Picture in Picture"
                  >
                    <PictureInPicture2 size={16} />
                  </motion.button>

                  {/* Fullscreen Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFullscreen}
                    className="liquid-glass-control flex h-9 w-9 items-center justify-center rounded-full"
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitles & Audio Sliding Drawer with Glass Backdrop */}
      <AnimatePresence>
        {showSubtitleDrawer && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="liquid-glass-elevated pointer-events-auto absolute top-16 right-6 z-40 w-72 rounded-2xl p-5 shadow-2xl backdrop-blur-3xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Audio & Subtitles
            </h3>

            {/* Audio Section */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-white block mb-2">Audio Track</label>
              <div className="space-y-1">
                {[
                  { id: 'original', label: 'English [Original] (Dolby Atmos)' },
                  { id: 'dubbed', label: 'Spanish (5.1 Surround)' },
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedAudio(track.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedAudio === track.id
                        ? 'bg-amber-400/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{track.label}</span>
                    {selectedAudio === track.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitles Section */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Subtitles</label>
              <div className="space-y-1">
                {[
                  { id: 'off', label: 'Off' },
                  { id: 'en', label: 'English [CC]' },
                  { id: 'es', label: 'Spanish' },
                  { id: 'ja', label: 'Japanese' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubtitle(sub.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedSubtitle === sub.id
                        ? 'bg-amber-400/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {selectedSubtitle === sub.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
