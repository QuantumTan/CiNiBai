import { useEffect, useState } from 'react';
import { Check, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import type { Reel } from '../../lib/reels/types';
import { useReelsStore } from '../../stores/reels';
import { ParticleBurst } from './ParticleBurst';

interface ReelActionDockProps {
  reel: Reel;
  onOpenDiscussion: () => void;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function ReelActionDock({ reel, onOpenDiscussion }: ReelActionDockProps) {
  const { isMuted, toggleMute, likedMap, toggleLike } = useReelsStore();
  const [showBurst, setShowBurst] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const isLiked = !!likedMap[reel.id] || reel.viewer.liked;
  const likes = reel.stats.likes + (likedMap[reel.id] ? 1 : 0);

  useEffect(() => {
    if (shareStatus === 'idle') return;
    const timer = window.setTimeout(() => setShareStatus('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [shareStatus]);

  const showTemporaryStatus = (status: 'copied' | 'failed') => {
    setShareStatus(status);
  };

  const handleLike = () => {
    toggleLike(reel.id);
    if (!isLiked) setShowBurst(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/reels?feed=1&reelId=${encodeURIComponent(reel.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: reel.source.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showTemporaryStatus('copied');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showTemporaryStatus('failed');
    }
  };

  const actions = [
    {
      label: isLiked ? 'Unlike reel' : 'Like reel',
      count: formatCount(likes),
      onClick: handleLike,
      icon: <Heart aria-hidden="true" size={25} strokeWidth={2} className={isLiked ? 'fill-[#ff375f] text-[#ff375f]' : ''} />,
      pressed: isLiked,
      burst: true,
    },
    {
      label: 'Open comments',
      count: formatCount(reel.stats.comments),
      onClick: onOpenDiscussion,
      icon: <MessageCircle aria-hidden="true" size={24} strokeWidth={2} />,
    },
    {
      label: 'Share reel',
      count: 'Share',
      onClick: handleShare,
      icon: <Share2 aria-hidden="true" size={23} strokeWidth={2} />,
    },
    {
      label: isMuted ? 'Unmute reels' : 'Mute reels',
      count: isMuted ? 'Tap for sound' : 'Sound on',
      onClick: toggleMute,
      icon: isMuted
        ? <VolumeX aria-hidden="true" size={24} strokeWidth={2} />
        : <Volume2 aria-hidden="true" size={24} strokeWidth={2} />,
      pressed: !isMuted,
    },
  ];

  return (
    <aside
      aria-label="Reel actions"
      className="absolute bottom-[6.6rem] right-2 z-25 flex w-[4.5rem] flex-col items-center gap-2.5 sm:right-3"
    >
      {shareStatus !== 'idle' && (
        <div
          role="status"
          className="absolute right-full top-1/2 mr-2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg bg-black/82 px-3 py-2 text-xs font-semibold text-white"
        >
          {shareStatus === 'copied' && <Check aria-hidden="true" size={14} />}
          {shareStatus === 'copied' ? 'Link copied' : 'Sharing is unavailable'}
        </div>
      )}

      {actions.map((action) => (
        <div key={action.label} className="relative flex w-full flex-col items-center">
          {action.burst && (
            <ParticleBurst active={showBurst} onComplete={() => setShowBurst(false)} />
          )}
          <button
            type="button"
            onClick={action.onClick}
            className="focus-optical grid min-h-11 min-w-11 place-items-center rounded-full bg-black/72 text-white shadow-[0_5px_18px_rgba(0,0,0,0.3)] transition-transform active:scale-90"
            aria-label={action.label}
            aria-pressed={action.pressed}
          >
            {action.icon}
          </button>
          <span className="mt-0.5 max-w-[4.5rem] text-center text-[0.68rem] font-semibold leading-tight text-white [text-shadow:0_1px_3px_#000]">
            {action.count}
          </span>
        </div>
      ))}
    </aside>
  );
}
