import { useRef, useState, useEffect, useCallback } from 'react';
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
  HelpCircle,
  X,
  ArrowLeft
} from 'lucide-react';
import { Scrubber } from './Scrubber';
import { useHotkeys } from './useHotkeys';
import { usePlayerStore } from '../../stores/player';
import { useAmbientStore } from '../../stores/ambient';
import { useDominantColors } from '../ambient/useDominantColors';
import { springSnappy, useSpatialMotion } from '../../lib/motion';

export interface VideoPlayerHUDProps {
  src: string;
  title: string;
  subtitle?: string;
  poster?: string;
  onBack?: () => void;
}

export function VideoPlayerHUD({
  src,
  title,
  subtitle,
  poster,
  onBack,
}: VideoPlayerHUDProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isPlaying,
    currentTime,
    duration,
    bufferedTime,
    volume,
    isMuted,
    isFullscreen,
    subtitlesEnabled,
    activeChapter,
    chapters,
    setPlaying,
    setTime,
    setBuffered,
    setVolume,
    setMuted,
    setFullscreen,
    setPiP,
    setSubtitlesEnabled,
  } = usePlayerStore();

  const { ambilightEnabled, setAmbilightEnabled } = useAmbientStore();
  const { sampleElement } = useDominantColors();
  const { spring: activeSpring, isReduced } = useSpatialMotion();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Ambilight Video Edge Sampler (<= 15 Hz) (§4.5)
  useEffect(() => {
    if (!ambilightEnabled || isReduced) return;
    const video = videoRef.current;
    if (!video) return;

    let animFrame: number;
    let lastSample = 0;

    const sampleLoop = (now: number) => {
      if (video && !video.paused && !video.ended && now - lastSample >= 66) {
        lastSample = now;
        sampleElement(video);
      }
      animFrame = requestAnimationFrame(sampleLoop);
    };

    animFrame = requestAnimationFrame(sampleLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [ambilightEnabled, isReduced, sampleElement]);

  // 2.5s Idle Autohide Overlay Engine (§4.5)
  const resetIdleTimer = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Never hide while paused, seeking, or modal is open (§4.5)
    if (isPlaying && !isSeeking && !showSubtitleMenu && !showShortcutHelp) {
      idleTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
    }
  }, [isPlaying, isSeeking, showSubtitleMenu, showShortcutHelp]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlaying, isSeeking, showSubtitleMenu, showShortcutHelp, resetIdleTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [setPlaying]);

  const handleSeek = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration);
      setTime(video.currentTime, duration);
    },
    [duration, setTime]
  );

  const handleJumpPercent = useCallback(
    (percent: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = percent * duration;
      setTime(video.currentTime, duration);
    },
    [duration, setTime]
  );

  const handleVolumeDelta = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const newVol = Math.min(Math.max(volume + delta, 0), 1);
      video.volume = newVol;
      setVolume(newVol);
      setMuted(newVol === 0);
    },
    [volume, setVolume, setMuted]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const target = !isMuted;
    video.muted = target;
    setMuted(target);
  }, [isMuted, setMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, [setFullscreen]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPiP(false);
      } else {
        await video.requestPictureInPicture();
        setPiP(true);
      }
    } catch {
      // PiP unavailable
    }
  }, [setPiP]);

  // Frame Stepping when Paused (§4.5)
  const handleFrameStep = useCallback((forward: boolean) => {
    const video = videoRef.current;
    if (!video || !video.paused) return;
    video.currentTime = Math.min(Math.max(video.currentTime + (forward ? 1 / 24 : -1 / 24), 0), video.duration);
  }, []);

  const handleSpeedDelta = useCallback((faster: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = Math.min(Math.max(video.playbackRate + (faster ? 0.25 : -0.25), 0.5), 2.0);
  }, []);

  // Hardware Hotkey Engine Hook
  useHotkeys({
    onTogglePlay: togglePlay,
    onSeek: handleSeek,
    onJumpPercent: handleJumpPercent,
    onVolumeDelta: handleVolumeDelta,
    onToggleMute: toggleMute,
    onToggleFullscreen: toggleFullscreen,
    onToggleCaptions: () => setSubtitlesEnabled(!subtitlesEnabled),
    onTogglePiP: togglePiP,
    onFrameStep: handleFrameStep,
    onSpeedDelta: handleSpeedDelta,
    onToggleHelp: () => setShowShortcutHelp((p) => !p),
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={resetIdleTimer}
      onClick={resetIdleTimer}
      className={`relative aspect-video w-full overflow-hidden select-none bg-black rounded-3xl shadow-2xl ${
        !controlsVisible && isFullscreen ? 'cursor-none' : ''
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={() => {
          if (!videoRef.current) return;
          setTime(videoRef.current.currentTime, videoRef.current.duration);
          if (videoRef.current.buffered.length > 0) {
            setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setTime(0, videoRef.current.duration);
        }}
        onClick={togglePlay}
        playsInline
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Floating HUD Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={activeSpring}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-t from-black/85 via-transparent to-black/60"
          >
            {/* Top Bar */}
            <div className="pointer-events-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="apple-glass-thin flex h-9 w-9 items-center justify-center rounded-full text-white"
                    aria-label="Back to catalog"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="text-base font-bold text-white drop-shadow-md">{title}</h2>
                  {subtitle && <p className="text-xs text-slate-300">{subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Ambilight Toggle (§4.5) */}
                <button
                  onClick={() => setAmbilightEnabled((p) => !p)}
                  className={`apple-glass-thin flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    ambilightEnabled ? 'text-amber-300' : 'text-slate-400'
                  }`}
                  aria-label="Toggle Cinema Ambilight"
                >
                  <Sparkles size={14} className={ambilightEnabled ? 'fill-amber-300/30' : ''} />
                  <span>Ambilight</span>
                </button>

                {/* Subtitles Drawer Toggle */}
                <button
                  onClick={() => setShowSubtitleMenu((p) => !p)}
                  className={`apple-glass-thin flex h-9 w-9 items-center justify-center rounded-full text-white ${
                    showSubtitleMenu ? 'border-amber-400 text-amber-300' : ''
                  }`}
                  aria-label="Subtitles & Audio"
                >
                  <Subtitles size={16} />
                </button>

                {/* Keyboard Shortcut Help */}
                <button
                  onClick={() => setShowShortcutHelp(true)}
                  className="apple-glass-thin flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white"
                  aria-label="Keyboard Shortcuts"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            </div>

            {/* Center Playback Indicator */}
            <div className="pointer-events-auto flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="apple-glass-heavy flex h-18 w-18 items-center justify-center rounded-full text-white shadow-2xl"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={30} className="fill-white" /> : <Play size={30} className="fill-white ml-1" />}
              </motion.button>
            </div>

            {/* Bottom Scrubber & Control Deck */}
            <div className="pointer-events-auto space-y-2">
              <Scrubber
                currentTime={currentTime}
                duration={duration}
                bufferedTime={bufferedTime}
                chapters={chapters}
                previewThumbnail={poster}
                onSeek={(time) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = time;
                    setTime(time, duration);
                  }
                }}
                onSeekingChange={setIsSeeking}
              />

              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleSeek(-10)}
                    className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label="Seek back 10 seconds"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={() => handleSeek(10)}
                    className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label="Seek forward 10 seconds"
                  >
                    <RotateCw size={15} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={15} /> : volume < 0.5 ? <Volume1 size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>

                  <span className="text-xs font-mono text-slate-300">
                    {activeChapter && <strong className="text-amber-300 font-sans mr-2">{activeChapter}</strong>}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePiP}
                    className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label="Picture-in-picture"
                  >
                    <PictureInPicture2 size={15} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="apple-glass-thin flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Cheat Sheet Modal */}
      <AnimatePresence>
        {showShortcutHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springSnappy}
            className="apple-glass-heavy pointer-events-auto absolute inset-12 z-50 overflow-y-auto rounded-3xl p-6 shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Hardware Keyboard Shortcuts (§4.5)
              </h3>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Play / Pause</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">Space / K</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Seek ±10s</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">J / L</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Seek ±5s</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">← / →</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Volume ±5%</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">↑ / ↓</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Fullscreen</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">F</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Mute</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">M</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Jump 0-90%</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">0 - 9</kbd></div>
              <div className="flex justify-between border-b border-white/10 py-1.5"><span className="text-slate-300">Frame step</span><kbd className="apple-glass-thin px-2 py-0.5 rounded font-mono text-amber-300">, / .</kbd></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
