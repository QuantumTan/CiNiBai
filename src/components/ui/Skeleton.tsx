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
      <Skeleton className="mt-2 h-4 w-3/4 rounded-sm" />
      <Skeleton className="mt-1 h-3 w-1/2 rounded-sm" />
    </div>
  );
}

export function ContentRowSkeleton() {
  return (
    <div className="space-y-4 my-8" aria-busy="true">
      <span className="sr-only">Loading content row...</span>
      <Skeleton className="h-7 w-48 rounded-md" />
      <div className="flex gap-4 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[160px] sm:w-[185px] flex-shrink-0">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading media details...</span>
      <Skeleton className="h-[50vh] sm:h-[60vh] md:h-[70vh] w-full rounded-none" />
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
    <div className="h-[70vh] min-h-[420px] max-h-[720px] w-full bg-bg-surface flex items-end p-8 md:p-16" aria-busy="true">
      <span className="sr-only">Loading featured showcase...</span>
      <div className="max-w-2xl space-y-4 w-full" aria-hidden="true">
        <Skeleton className="h-12 w-3/4 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
