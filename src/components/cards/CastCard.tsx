import { getProfileUrl } from '../../api/tmdb';
import type { TMDBCastMember } from '../../api/tmdb.types';

export interface CastCardProps {
  member: TMDBCastMember;
}

export function CastCard({ member }: CastCardProps) {
  return (
    <div className="flex-shrink-0 w-[120px] text-center">
      <div className="overflow-hidden rounded-full mx-auto w-20 h-20">
        <img
          src={getProfileUrl(member.profile_path)}
          alt={member.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <p className="mt-2 truncate text-sm font-medium text-text-primary">{member.name}</p>
      <p className="truncate text-xs text-text-muted">{member.character}</p>
    </div>
  );
}
