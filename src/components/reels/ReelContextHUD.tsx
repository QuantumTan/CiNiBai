import { useMemo, useState } from 'react';
import { Music2 } from 'lucide-react';
import type { Reel } from '../../lib/reels/types';
import { MicroScrubber } from './MicroScrubber';

interface ReelContextHUDProps {
  reel: Reel;
  currentTime: number;
  duration: number;
  onSeek: (targetSec: number) => void;
  captionsActive?: boolean;
}

export function ReelContextHUD({
  reel,
  currentTime,
  duration,
  onSeek,
  captionsActive = false,
}: ReelContextHUDProps) {
  const [isFollowing, setIsFollowing] = useState(!!reel.feedItem?.author.isFollowed);
  const [isExpanded, setIsExpanded] = useState(false);
  const feed = reel.feedItem;
  const username = feed?.author.username || 'ReelShort';
  const avatar = feed?.author.avatarUrl;
  const caption = useMemo(() => {
    const raw = feed?.caption || reel.dialogueQuote || '';
    const [, ...description] = raw.split('\n');
    return description.join(' ').trim() || raw;
  }, [feed?.caption, reel.dialogueQuote]);

  return (
    <div className="scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-24 sm:px-5">
      {captionsActive && caption && (
        <p className="pointer-events-auto mb-4 max-w-[80%] self-center rounded-lg bg-black/82 px-3 py-2 text-center text-sm font-medium leading-snug text-white">
          {caption}
        </p>
      )}

      <div className="pointer-events-auto max-w-[calc(100%-4.8rem)] space-y-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/70"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e5b869] text-sm font-bold text-black ring-1 ring-white/70"
            >
              {username.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-bold text-white [text-shadow:0_1px_3px_#000]">
            @{username}
          </span>
          <button
            type="button"
            onClick={() => setIsFollowing((value) => !value)}
            className={`focus-optical min-h-11 rounded-lg px-3 text-xs font-bold transition-colors ${
              isFollowing
                ? 'bg-white/18 text-white'
                : 'bg-white text-black hover:bg-[#f2f2f2]'
            }`}
            aria-pressed={isFollowing}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <div>
          <h1 className="line-clamp-2 text-[clamp(1.05rem,4.6vw,1.35rem)] font-bold leading-tight tracking-[-0.02em] text-white [text-shadow:0_2px_6px_#000]">
            {reel.source.title}
          </h1>
          {caption && (
            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              className={`focus-optical mt-1 block min-h-11 max-w-full text-left text-sm leading-snug text-white [text-shadow:0_1px_4px_#000] ${
                isExpanded ? '' : 'line-clamp-2'
              }`}
              aria-expanded={isExpanded}
            >
              {caption}
              {!isExpanded && caption.length > 90 && (
                <span className="ml-1 font-bold">more</span>
              )}
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-white">
          <Music2 aria-hidden="true" size={15} strokeWidth={2} className="shrink-0" />
          <span className="truncate">
            {feed?.musicTitle || `Original audio · ${username}`}
          </span>
        </div>
      </div>

      <div className="pointer-events-auto pt-2">
        <MicroScrubber
          currentTime={currentTime}
          duration={duration}
          bufferedFraction={Math.min(1, (currentTime + 8) / (duration || 1))}
          onSeek={onSeek}
        />
      </div>
    </div>
  );
}
