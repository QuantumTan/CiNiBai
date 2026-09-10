import { Link } from 'react-router-dom';
import { MovieCard } from '../cards/MovieCard';
import { ScrollContainer } from '../ui/ScrollContainer';
import { ContentRowSkeleton } from '../ui/Skeleton';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface ContentRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[] | undefined;
  isLoading?: boolean;
  seeMoreLink?: string;
}

export function ContentRow({ title, items, isLoading, seeMoreLink }: ContentRowProps) {
  if (isLoading) {
    return <ContentRowSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">
          <span className="text-gold-gradient">{title}</span>
        </h2>
        {seeMoreLink && (
          <Link
            to={seeMoreLink}
            className="text-sm font-semibold text-gold hover:text-gold-light transition-colors"
          >
            See More
          </Link>
        )}
      </div>
      <ScrollContainer>
        {items.map((item) => (
          <MovieCard key={`${item.id}-${'title' in item ? 'movie' : 'tv'}`} item={item} />
        ))}
      </ScrollContainer>
    </section>
  );
}
