import { cn } from '../../lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-lg bg-white/5 motion-reduce:animate-none',
        className
      )}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-full" aria-hidden="true">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="mt-2.5 px-0.5 space-y-1">
        <Skeleton className="h-4 w-3/4 rounded-sm" />
        <Skeleton className="h-3 w-1/2 rounded-sm" />
      </div>
    </div>
  );
}

export function ContentRowSkeleton() {
  return (
    <div className="space-y-3.5 my-8" aria-busy="true">
      <span className="sr-only">Loading content row...</span>
      <div className="flex items-center justify-between px-1 min-h-[44px]">
        <Skeleton className="h-7 w-48 rounded-md" />
      </div>
      <div className="relative -mx-4 px-4 overflow-hidden" aria-hidden="true">
        <div className="flex items-start gap-4 py-4 pl-4 pr-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[160px] sm:w-[185px] flex-shrink-0">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading media details...</span>
      <Skeleton className="w-full aspect-video md:aspect-[21/9] max-h-[560px] rounded-none" />
      <div className="mx-auto max-w-7xl px-4 py-8" aria-hidden="true">
        <Skeleton className="h-10 w-full max-w-sm rounded-md" />
        <Skeleton className="mt-4 h-5 w-48 rounded-md" />
        <Skeleton className="mt-6 h-24 w-full max-w-2xl rounded-md" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] min-h-[380px] max-h-[480px] w-full bg-bg-surface flex items-end px-6 pb-6 sm:pb-8 md:px-12 lg:px-20" aria-busy="true">
      <span className="sr-only">Loading featured showcase...</span>
      <div className="max-w-2xl space-y-4 w-full" aria-hidden="true">
        <Skeleton className="h-10 sm:h-12 w-3/4 rounded-md" />
        <Skeleton className="h-4 sm:h-5 w-1/3 rounded-md" />
        <Skeleton className="h-16 sm:h-20 w-full rounded-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
