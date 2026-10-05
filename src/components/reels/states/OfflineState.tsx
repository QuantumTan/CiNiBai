/**
 * Offline State Indicator Component (§3.1 #16)
 * Indicates network unavailability while keeping active in-memory clips playable.
 */
import { WifiOff } from 'lucide-react';

export function OfflineState() {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-glass-thin text-white/72 select-none">
      <WifiOff size={13} strokeWidth={1.5} className="text-white/60" />
      <span className="type-meta text-white/72">Offline · Playing Cached Sequences</span>
    </div>
  );
}
