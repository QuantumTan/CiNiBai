import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Maximize, Minimize, Star, Play, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getProviders, getDefaultProvider, testServerConnectivity } from '../api/providers';
import type { EmbedSource } from '../api/providers';

export function WatchPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const numericId = Number(id);
  const mediaType = type as 'movie' | 'tv';

  const season = Number(searchParams.get('s') || '1');
  const episode = Number(searchParams.get('e') || '1');

  const providers = getProviders();
  const [selectedProvider, setSelectedProvider] = useState<EmbedSource>(getDefaultProvider());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCheckingServers, setIsCheckingServers] = useState(true);
  const [serverStatuses, setServerStatuses] = useState<Record<string, 'checking' | 'online' | 'failed'>>({});
  const [activeIframeKey, setActiveIframeKey] = useState<number>(0);

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    season
  );

  const title = mediaType === 'movie' ? movieQuery.data?.title : tvQuery.data?.name;

  // Automated server check & auto-selection on mount
  useEffect(() => {
    let isMounted = true;

    async function runServerDiagnostics() {
      setIsCheckingServers(true);
      const initialStatuses: Record<string, 'checking' | 'online' | 'failed'> = {};
      providers.forEach((p) => {
        initialStatuses[p.id] = 'checking';
      });
      setServerStatuses(initialStatuses);

      let foundWorking = false;

      for (const provider of providers) {
        const testUrl = mediaType === 'movie'
          ? provider.getMovieUrl(numericId)
          : provider.getTVUrl(numericId, season, episode);

        const isOnline = await testServerConnectivity(testUrl, 2000);

        if (!isMounted) return;

        setServerStatuses((prev) => ({
          ...prev,
          [provider.id]: isOnline ? 'online' : 'failed',
        }));

        // Automatically select the first fast, responsive server
        if (isOnline && !foundWorking) {
          foundWorking = true;
          setSelectedProvider(provider);
          setActiveIframeKey((k) => k + 1);
        }
      }

      if (isMounted) {
        setIsCheckingServers(false);
      }
    }

    runServerDiagnostics();

    return () => {
      isMounted = false;
    };
  }, [numericId, mediaType, season, episode]);

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

  const handleManualServerSelect = (provider: EmbedSource) => {
    setSelectedProvider(provider);
    setActiveIframeKey((k) => k + 1);
  };

  const switchToNextServer = () => {
    const currentIndex = providers.findIndex((p) => p.id === selectedProvider.id);
    const nextIndex = (currentIndex + 1) % providers.length;
    handleManualServerSelect(providers[nextIndex]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Top Bar */}
      <div className="glass-dark flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link
            to={`/${mediaType}/${numericId}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Details</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-medium text-text-primary truncate max-w-xs md:max-w-md">
            {title}
            {mediaType === 'tv' && (
              <span className="text-gold font-semibold"> (S{season} : E{episode})</span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Auto-Server indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-text-secondary ring-1 ring-white/10">
            <ShieldCheck size={14} className="text-green-400" />
            <span>Auto-Checked: <strong className="text-gold">{selectedProvider.name.split(' ')[0]}</strong></span>
          </div>

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
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-2xl">
            {isCheckingServers && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-gold/20 border-t-gold" />
                  <Zap size={22} className="absolute text-gold animate-pulse" />
                </div>
                <p className="text-base font-semibold text-white">Testing & Locating Working Server...</p>
                <p className="mt-1 text-xs text-text-muted">Filtering out down streams & selecting fastest host</p>
              </div>
            )}

            <iframe
              key={activeIframeKey}
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              title={`${title} - ${selectedProvider.name}`}
              style={{ border: 'none' }}
            />
          </div>

          {/* Servers Section */}
          <div className="mt-4 rounded-2xl bg-bg-secondary p-5 ring-1 ring-white/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gold">
                  <Settings size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">Servers:</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 size={13} />
                  <span>Auto-Selected</span>
                </div>
              </div>

              {/* Server Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {providers.map((provider) => {
                  const isSelected = provider.id === selectedProvider.id;
                  const status = serverStatuses[provider.id];

                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleManualServerSelect(provider)}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-gold text-black shadow-lg shadow-gold/25 ring-2 ring-gold'
                          : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white ring-1 ring-white/10'
                      }`}
                    >
                      {/* Status indicator dot */}
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected
                            ? 'bg-black animate-pulse'
                            : status === 'online'
                            ? 'bg-green-400'
                            : status === 'failed'
                            ? 'bg-red-400'
                            : 'bg-yellow-400'
                        }`}
                      />

                      <span>{provider.name}</span>

                      {provider.badge && !isSelected && (
                        <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gold">
                          {provider.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Quick Next Server button */}
                <button
                  onClick={switchToNextServer}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-white/15 transition-all"
                  title="Switch to next available server"
                >
                  <RefreshCw size={13} />
                  <span>Next Server</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-white/5 pt-3 sm:flex-row sm:items-center sm:justify-between text-xs text-text-muted">
              <p>
                <strong className="text-text-secondary">Tip:</strong> The app automatically pings all servers on load and connects you to the fastest online host.
              </p>
              <p className="text-text-muted">
                If playback stalls, tap <strong className="text-gold">Next Server</strong> to instantly switch stream sources.
              </p>
            </div>
          </div>

          {/* Media Info */}
          <div className="mt-8 flex flex-col gap-6 md:flex-row">
            {/* Poster */}
            <div className="hidden w-40 flex-shrink-0 md:block">
              <img 
                src={mediaType === 'movie' ? `https://image.tmdb.org/t/p/w342${movieQuery.data?.poster_path}` : `https://image.tmdb.org/t/p/w342${tvQuery.data?.poster_path}`} 
                alt={title}
                className="w-full rounded-xl shadow-lg ring-1 ring-white/10 object-cover"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white md:text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1 text-gold font-semibold">
                  <Star size={14} className="fill-gold" />
                  {mediaType === 'movie' ? movieQuery.data?.vote_average?.toFixed(1) : tvQuery.data?.vote_average?.toFixed(1)}
                </span>
                <span>{mediaType === 'movie' ? movieQuery.data?.release_date?.slice(0,4) : tvQuery.data?.first_air_date?.slice(0,4)}</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase text-white">
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
            <div className="rounded-2xl bg-bg-secondary p-4 ring-1 ring-white/10 h-full max-h-[800px] flex flex-col">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Episodes</h3>
                <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                  Season {season} ({seasonData.episodes.length} Episodes)
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {seasonData.episodes.map((ep) => {
                  const isCurrent = ep.episode_number === episode;
                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${numericId}?s=${season}&e=${ep.episode_number}`}
                      className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${
                        isCurrent 
                          ? 'bg-gold/15 ring-1 ring-gold shadow-md' 
                          : 'hover:bg-white/5 ring-1 ring-transparent'
                      }`}
                    >
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-black/50">
                        {ep.still_path ? (
                          <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">No Image</div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Play size={20} className="fill-gold text-gold" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-gold' : 'text-text-primary'}`}>
                          {ep.episode_number}. {ep.name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{ep.runtime ? `${ep.runtime} min` : 'Standard'}</p>
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
