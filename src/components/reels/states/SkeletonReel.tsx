/**
 * Skeleton Reel State Component (§3.1 #16)
 * Pre-renders exact 9:16 stage dimensions with calm obsidian shimmer to prevent any CLS.
 */

export function SkeletonReel() {
  return (
    <div 
      className="relative w-full h-full max-w-[440px] aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-950 border border-white/[0.08] flex flex-col justify-between p-6 select-none animate-pulse"
      aria-hidden="true"
    >
      {/* Top placeholder badge */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded-full bg-white/[0.08]" />
        <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
      </div>

      {/* Right dock placeholder */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-white/[0.08]" />
        <div className="h-11 w-11 rounded-full bg-white/[0.08]" />
        <div className="h-11 w-11 rounded-full bg-white/[0.08]" />
        <div className="h-11 w-11 rounded-full bg-white/[0.08]" />
      </div>

      {/* Bottom HUD placeholder */}
      <div className="space-y-3 max-w-[70%]">
        <div className="h-4 w-32 rounded bg-white/[0.08]" />
        <div className="h-6 w-48 rounded bg-white/[0.12]" />
        <div className="h-3 w-40 rounded bg-white/[0.06]" />
        <div className="h-1 w-full rounded-full bg-white/[0.08] mt-2" />
      </div>
    </div>
  );
}
