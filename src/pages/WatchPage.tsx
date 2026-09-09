import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Maximize, Minimize, Star, Play } from 'lucide-react';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getProviders, getDefaultProvider } from '../api/providers';
import type { EmbedSource } from '../api/providers';

export function WatchPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const numericId = Number(id);
  const mediaType = type as 'movie' | 'tv';

  const season = Number(searchParams.get('s') || '1');
  const episode = Number(searchParams.get('e') || '1');

  const [selectedProvider, setSelectedProvider] = useState<EmbedSource>(getDefaultProvider());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    season
  );

  const title = mediaType === 'movie' ? movieQuery.data?.title : tvQuery.data?.name;
  const providers = getProviders();

  const embedUrl = mediaType === 'movie'
    ? selectedProvider.getMovieUrl(numericId)
    : selectedProvider.getTVUrl(numericId, season, episode);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Top Bar */}
      <div className="glass-dark flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to={`/${mediaType}/${numericId}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Details</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-medium text-text-primary truncate max-w-xs">
            {title}
            {mediaType === 'tv' && (
              <span className="text-text-muted"> -- S{season}:E{episode}</span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="rounded-lg glass p-1.5 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:flex lg:gap-8">
        
        {/* Left Column: Video & Servers */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10 shadow-2xl">
            <iframe
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              title={`${title} - ${selectedProvider.name}`}
              style={{ border: 'none' }}
            />
          </div>

          {/* Servers Section */}
          <div className="mt-4 rounded-xl bg-bg-secondary p-4 ring-1 ring-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-gold min-w-[100px]">
                <Settings size={18} />
                <span className="text-sm font-semibold uppercase tracking-wider">Servers:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => setSelectedProvider(provider)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      provider.name === selectedProvider.name
                        ? 'bg-gold text-black shadow-lg shadow-gold/20'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${provider.name === selectedProvider.name ? 'bg-black' : 'bg-gold/50'}`} />
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-text-muted sm:pl-[116px]">
              If the current server is buffering or shows popups, try switching to another server. AutoEmbed is our default ad-free server.
            </p>
          </div>

          {/* Media Info (Desktop below video, Mobile below) */}
          <div className="mt-8 flex flex-col gap-6 md:flex-row">
            {/* Poster */}
            <div className="hidden w-40 flex-shrink-0 md:block">
              <img 
                src={mediaType === 'movie' ? `https://image.tmdb.org/t/p/w342${movieQuery.data?.poster_path}` : `https://image.tmdb.org/t/p/w342${tvQuery.data?.poster_path}`} 
                alt={title}
                className="w-full rounded-lg shadow-lg ring-1 ring-white/10"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white md:text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-gold" />
                  {mediaType === 'movie' ? movieQuery.data?.vote_average?.toFixed(1) : tvQuery.data?.vote_average?.toFixed(1)}
                </span>
                <span>{mediaType === 'movie' ? movieQuery.data?.release_date?.slice(0,4) : tvQuery.data?.first_air_date?.slice(0,4)}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium uppercase text-white">
                  {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-muted md:text-base">
                {mediaType === 'movie' ? movieQuery.data?.overview : tvQuery.data?.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Episodes (TV Only) */}
        {mediaType === 'tv' && seasonData?.episodes && (
          <div className="mt-8 w-full lg:mt-0 lg:w-[400px] flex-shrink-0">
            <div className="rounded-xl bg-bg-secondary p-4 ring-1 ring-white/5 h-full max-h-[800px] flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Episodes</h3>
                <span className="text-sm font-medium text-gold">Season {season}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {seasonData.episodes.map((ep) => {
                  const isCurrent = ep.episode_number === episode;
                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${numericId}?s=${season}&e=${ep.episode_number}`}
                      className={`flex items-center gap-3 rounded-lg p-2 transition-all ${
                        isCurrent 
                          ? 'bg-gold/10 ring-1 ring-gold/50' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-black/50">
                        {ep.still_path ? (
                          <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">No Image</div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={20} className="fill-gold text-gold" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-medium ${isCurrent ? 'text-gold' : 'text-text-primary'}`}>
                          {ep.episode_number}. {ep.name}
                        </p>
                        <p className="text-xs text-text-muted">{ep.runtime ? `${ep.runtime}m` : 'TBA'}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
