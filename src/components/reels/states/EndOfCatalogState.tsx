/**
 * Discovery Loop / End-of-Catalog Indicator (§5.4)
 * Shows a calm in-system badge when replaying community favorites via the Discovery Loop.
 */
import { Compass } from 'lucide-react';

export function EndOfCatalogState() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full apple-glass-thin border border-white/[0.06] text-white/60">
        <Compass size={12} strokeWidth={1.5} className="text-white/60" />
        <span className="type-meta text-white/60">Replaying Curated Sequences</span>
      </div>
    </div>
  );
}
