import { LiquidMediaRail } from './LiquidMediaRail';
import type { TMDBMovie, TMDBTVShow } from '../../api/tmdb.types';

export interface ContentRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[] | undefined;
  isLoading?: boolean;
  seeMoreLink?: string;
}

export function ContentRow({ title, items, isLoading, seeMoreLink }: ContentRowProps) {
  return (
    <LiquidMediaRail
      title={title}
      items={items}
      isLoading={isLoading}
      seeMoreLink={seeMoreLink}
    />
  );
}
