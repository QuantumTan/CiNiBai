/**
 * Reel Context HUD Component (§3.1, §3.2, §6.3)
 * High-legibility scrim backing with WCAG 2.1 AA against white frames,
 * title lockup, season/episode chip, actor tags (separated by ·), and audio waveform.
 */
import { Music2 } from 'lucide-react';
import type { Reel } from '../../lib/reels/types';
import { MicroScrubber } from './MicroScrubber';
import { useSpatialMotion } from '../../lib/motion';

interface ReelContextHUDProps {
  reel: Reel;
  currentTime: number;
  duration: number;
  onSeek: (targetSec: number) => void;
  onActorClick?: (actorName: string) => void;
  captionsActive?: boolean;
}

export function ReelContextHUD({
  reel,
  currentTime,
  duration,
  onSeek,
  onActorClick,
  captionsActive = false,
}: ReelContextHUDProps) {
  const { isReduced } = useSpatialMotion();

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 scrim-bottom pt-20 pb-5 px-5 flex flex-col justify-end pointer-events-none select-none">
      {/* Captions Display (when enabled) */}
      {captionsActive && reel.dialogueQuote && (
        <div className="mb-4 self-center pointer-events-auto max-w-[85%] text-center">
          <span className="apple-glass-thin type-body px-3.5 py-1.5 rounded-xl text-white font-medium shadow-lg backdrop-blur-md">
            {reel.dialogueQuote}
          </span>
        </div>
      )}

      {/* Main Metadata Cluster */}
      <div className="space-y-2 pointer-events-auto max-w-[80%]">
        {/* Source Chip & Season/Episode Tag (Max 3 chips per §3.1 #12) */}
        <div className="flex items-center gap-2">
          <span className="apple-glass-thin type-meta-caps px-2.5 py-0.5 rounded-full text-white/90">
            {reel.source.kind === 'series' && reel.source.season
              ? `S${reel.source.season} · E${reel.source.episode || 1}`
              : 'Feature Film'}
          </span>

          {reel.tags && reel.tags[0] && (
            <span className="type-meta text-white/60">
              {reel.tags[0]}
            </span>
          )}
        </div>

        {/* Title Lockup (§3.2: 28/32, 650 weight, -0.02em tracking) */}
        <h1 className="type-title-lockup text-white leading-tight drop-shadow-sm">
          {reel.source.title}
        </h1>

        {/* Actor Credits (§3.1 #12: plain text separated by ·, no colored chip backgrounds) */}
        {reel.people && reel.people.length > 0 && (
          <p className="type-meta text-white/72 flex items-center flex-wrap gap-1.5">
            {reel.people
              .filter((p) => p.role === 'actor')
              .slice(0, 3)
              .map((person, idx, arr) => (
                <span key={person.id} className="inline-flex items-center">
                  <button
                    onClick={() => onActorClick?.(person.name)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {person.name}
                  </button>
                  {idx < arr.length - 1 && <span className="mx-1 text-white/40">·</span>}
                </span>
              ))}
          </p>
        )}

        {/* Score & Audio Waveform Tag (§6.3) */}
        {reel.score && (
          <div className="inline-flex items-center gap-2 apple-glass-thin px-3 py-1 rounded-full text-white/90">
            <Music2 size={12} strokeWidth={1.5} className="text-white/72 flex-shrink-0" />
            <span className="type-meta text-white/90 truncate max-w-[140px]">
              {reel.score.track}
            </span>

            {/* Micro Waveform Peaks */}
            <div className="flex items-center gap-0.5 h-3">
              {reel.score.waveformPeaks.slice(0, 8).map((peak, idx) => (
                <div
                  key={idx}
                  className="w-[2px] rounded-full bg-white/72"
                  style={{
                    height: `${Math.max(2, Math.round(peak * 12))}px`,
                    animation: isReduced ? 'none' : `pulse 1.2s ease-in-out ${idx * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Liquid Micro-Scrubber (§6.3) */}
      <div className="pt-3 pointer-events-auto">
        <MicroScrubber
          currentTime={currentTime}
          duration={duration}
          bufferedFraction={Math.min(1, (currentTime + 10) / (duration || 1))}
          onSeek={onSeek}
        />
      </div>
    </div>
  );
}
