/**
 * Inline Error State Component (§1, §5.3, §3.1 #16)
 * Displayed inline at the end of the feed when a page fetch fails,
 * leaving existing loaded items fully scrollable with backoff retry capability.
 */
import { RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div className="w-full max-w-[440px] p-6 mx-auto my-6 apple-glass-regular rounded-2xl flex flex-col items-center text-center space-y-3">
      <div className="h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/72">
        <RotateCcw size={16} strokeWidth={1.5} className={isRetrying ? 'animate-spin' : ''} />
      </div>

      <div className="space-y-1">
        <p className="type-label text-white/90">Feed Connection Paused</p>
        <p className="type-meta text-white/48">
          {message || 'Unable to stream next sequence. Previously loaded clips remain ready.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="apple-glass-thin type-label px-4 py-2 rounded-full text-white/80 hover:text-white transition-all disabled:opacity-50 focus-optical cursor-pointer"
      >
        {isRetrying ? 'Reconnecting...' : 'Retry Next Clip'}
      </button>
    </div>
  );
}
