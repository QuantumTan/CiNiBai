import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[180px]">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/2" />
    </div>
  );
}

export function ContentRowSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-[70vh] w-full" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="mt-4 h-5 w-64" />
        <Skeleton className="mt-6 h-24 w-full max-w-3xl" />
      </div>
    </div>
  );
}
