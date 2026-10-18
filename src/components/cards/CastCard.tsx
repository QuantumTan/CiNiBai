import { getProfileUrl } from '../../api/tmdb';
import type { TMDBCastMember } from '../../api/tmdb.types';
import { User } from 'lucide-react';

export interface CastCardProps {
  member: TMDBCastMember;
}

export function CastCard({ member }: CastCardProps) {
  const profileSrc = member.profile_path ? getProfileUrl(member.profile_path, 'w185') : null;

  return (
    <div className="group flex-shrink-0 w-28 text-center select-none transition-transform duration-150 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-full mx-auto w-20 h-20 border border-border-default shadow-md bg-bg-elevated group-hover:border-accent transition-colors flex items-center justify-center">
        {profileSrc ? (
          <img
            src={profileSrc}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface text-text-secondary">
            <User size={28} aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
        {member.name}
      </p>
      {member.character && (
        <p className="truncate text-xs text-text-secondary mt-0.5">
          {member.character}
        </p>
      )}
    </div>
  );
}
