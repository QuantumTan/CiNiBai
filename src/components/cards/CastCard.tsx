import { getProfileUrl } from '../../api/tmdb';
import type { TMDBCastMember } from '../../api/tmdb.types';

export interface CastCardProps {
  member: TMDBCastMember;
}

export function CastCard({ member }: CastCardProps) {
  return (
    <div className="group flex-shrink-0 w-[120px] text-center select-none transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-full mx-auto w-20 h-20 border border-white/20 shadow-lg bg-[#0e1017] group-hover:border-amber-400/60 transition-colors">
        <img
          src={getProfileUrl(member.profile_path)}
          alt={member.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none" />
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">{member.name}</p>
      <p className="truncate text-[11px] text-slate-400">{member.character}</p>
    </div>
  );
}
