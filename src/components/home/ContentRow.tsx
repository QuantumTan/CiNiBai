import { MovieCard } from '../cards/MovieCard';
import { ScrollContainer } from '../ui/ScrollContainer';
import { ContentRowSkeleton } from '../ui/Skeleton';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface ContentRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[] | undefined;
  isLoading?: boolean;
}

export function ContentRow({ title, items, isLoading }: ContentRowProps) {
  if (isLoading) {
    return <ContentRowSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-text-primary md:text-2xl">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      <ScrollContainer>
        {items.map((item) => (
          <MovieCard key={`${item.id}-${'title' in item ? 'movie' : 'tv'}`} item={item} />
        ))}
      </ScrollContainer>
    </section>
  );
}
