import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Maximize, Minimize, Star, Play, CheckCircle2, ShieldCheck, Zap, FastForward, AlertTriangle, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getProviders, getDefaultProvider, testServerConnectivity } from '../api/providers';
import type { EmbedSource } from '../api/providers';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';

export function WatchPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [autoNext, setAutoNext] = useState(true);
  const [showAdblockBanner, setShowAdblockBanner] = useState(() => {
    return localStorage.getItem('hideAdblockBanner') !== 'true';
  });
  const numericId = Number(id);
  const mediaType = type as 'movie' | 'tv';

  const dismissAdblockBanner = () => {
    setShowAdblockBanner(false);
    localStorage.setItem('hideAdblockBanner', 'true');
  };

  const season = Number(searchParams.get('s') || '1');
  const episode = Number(searchParams.get('e') || '1');

  const providers = getProviders();
  const [selectedProvider, setSelectedProvider] = useState<EmbedSource>(getDefaultProvider());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCheckingServers, setIsCheckingServers] = useState(true);
  const [serverStatuses, setServerStatuses] = useState<Record<string, 'checking' | 'online' | 'failed'>>({});
  const [activeIframeKey, setActiveIframeKey] = useState<number>(0);
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    season
  );

  const title = mediaType === 'movie' ? movieQuery.data?.title : tvQuery.data?.name;
  const backdrop = mediaType === 'movie' ? movieQuery.data?.backdrop_path : tvQuery.data?.backdrop_path;
  const poster = mediaType === 'movie' ? movieQuery.data?.poster_path : tvQuery.data?.poster_path;

  // Sample ambient color from media artwork
  useEffect(() => {
    const backdropUrl = backdrop ? getBackdropUrl(backdrop, 'w780') : (poster ? getPosterUrl(poster, 'w500') : null);
    if (backdropUrl) {
      extractAndSetAmbientColor(backdropUrl);
    }
  }, [backdrop, poster, extractAndSetAmbientColor]);

  // Handle postMessage events for Auto Next (only supported on VidLink)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check origin
      if (event.origin !== 'https://vidlink.pro') return;

      if (event.data && event.data.type === 'ended') {
        if (autoNext && mediaType === 'tv' && seasonData && tvQuery.data) {
          let nextSeason = season;
          let nextEpisode = episode + 1;

          if (nextEpisode > seasonData.episodes.length) {
            const seasons = tvQuery.data.seasons.filter(s => s.season_number > 0);
            const currentSeasonIndex = seasons.findIndex(s => s.season_number === season);
            
            if (currentSeasonIndex !== -1 && currentSeasonIndex < seasons.length - 1) {
              nextSeason = seasons[currentSeasonIndex + 1].season_number;
              nextEpisode = 1;
            } else {
              return;
            }
          }
          navigate(`/watch/tv/${numericId}?s=${nextSeason}&e=${nextEpisode}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [autoNext, mediaType, season, episode, seasonData, tvQuery.data, numericId, navigate]);

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
      <SEO
        title={`Watch ${title || 'Streaming'} ${mediaType === 'tv' ? `(S${season}:E${episode})` : ''} Online Free`}
        description={`Watch ${title} online for free in HD on CineBai.`}
      />
      {/* Top Bar */}
      <div className="apple-glass-heavy sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            to={`/${mediaType}/${numericId}`}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Details</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
            {title}
            {mediaType === 'tv' && (
              <span className="text-amber-300 font-bold"> (S{season} : E{episode})</span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Auto-Server indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full apple-glass-thin px-3.5 py-1 text-xs text-slate-300 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Auto-Checked: <strong className="text-amber-300">{selectedProvider.name.split(' ')[0]}</strong></span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded-full apple-glass-thin p-2 text-slate-300 hover:text-white transition-colors shadow-sm"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 flex flex-col lg:flex-row lg:gap-8 pb-36">
        
        {/* Left Column: Video & Servers */}
        <div className="flex-1 flex flex-col">
          
          {/* Adblock Recommendation Banner */}
          {showAdblockBanner && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200/90 shadow-lg relative">
              <AlertTriangle className="mt-0.5 flex-shrink-0 text-amber-400" size={18} />
              <div className="pr-6">
                <strong className="text-amber-300 font-semibold block mb-1">Recommendation: Use an Adblocker</strong>
                <p>
                  Because this site relies on free third-party streaming links, video players may contain pop-up ads when clicked. 
                  For a clean, ad-free experience, we highly recommend installing the <strong className="text-white">uBlock Origin</strong> extension or using the <strong className="text-white">Brave Browser</strong>.
                </p>
              </div>
              <button 
                onClick={dismissAdblockBanner}
                className="absolute top-3 right-3 p-1 text-amber-300/70 hover:text-amber-300 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Video Player */}
          <div className="ios-card-glass relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
            {isCheckingServers && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-amber-400/20 border-t-amber-400" />
                  <Zap size={22} className="absolute text-amber-400 animate-pulse" />
                </div>
                <p className="text-base font-semibold text-white">Testing & Locating Working Server...</p>
                <p className="mt-1 text-xs text-slate-400">Filtering out down streams & selecting fastest host</p>
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
          <div className="mt-5 rounded-3xl apple-glass-regular p-6 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Settings size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">Servers:</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
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
                      className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'ios-active-lens text-white shadow-md'
                          : 'apple-glass-thin text-slate-300 hover:text-white'
                      }`}
                    >
                      {/* Status indicator dot */}
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected
                            ? 'bg-amber-300 animate-pulse'
                            : status === 'online'
                            ? 'bg-emerald-400'
                            : status === 'failed'
                            ? 'bg-red-400'
                            : 'bg-amber-400'
                        }`}
                      />

                      <span>{provider.name}</span>

                      {provider.badge && !isSelected && (
                        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                          {provider.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Quick Next Server button */}
                <button
                  onClick={switchToNextServer}
                  className="apple-glass-thin flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Switch to next available server"
                >
                  <FastForward size={14} />
                  <span>Next Server</span>
                </button>
              </div>

              {/* Auto Next Toggle (TV Only) */}
              {mediaType === 'tv' && (
                <button
                  onClick={() => setAutoNext(!autoNext)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
                    autoNext
                      ? 'ios-active-lens text-amber-200'
                      : 'apple-glass-thin text-slate-300 hover:text-white'
                  }`}
                  title={autoNext ? 'Auto Play Next Episode: ON' : 'Auto Play Next Episode: OFF'}
                >
                  <FastForward size={13} />
                  <span>Auto Next: {autoNext ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
              <p>
                <strong className="text-slate-200">Tip:</strong> The app automatically pings all servers on load and connects you to the fastest online host.
              </p>
              <p className="text-slate-400">
                <strong className="text-amber-400">Auto Next</strong> is supported on the VidLink server.
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
                className="w-full rounded-2xl shadow-2xl ring-1 ring-white/15 object-cover"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {title}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-300">
                <span className="apple-glass-thin flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-amber-300">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {mediaType === 'movie' ? movieQuery.data?.vote_average?.toFixed(1) : tvQuery.data?.vote_average?.toFixed(1)}
                </span>
                <span className="apple-glass-thin rounded-full px-2.5 py-1 font-medium text-slate-300">
                  {mediaType === 'movie' ? movieQuery.data?.release_date?.slice(0,4) : tvQuery.data?.first_air_date?.slice(0,4)}
                </span>
                <span className="apple-glass-thin rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider text-slate-200">
                  {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base max-w-3xl">
                {mediaType === 'movie' ? movieQuery.data?.overview : tvQuery.data?.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Episodes (TV Only) */}
        {mediaType === 'tv' && seasonData?.episodes && (
          <div className="mt-8 w-full lg:mt-0 lg:w-[420px] flex-shrink-0">
            <div className="rounded-3xl apple-glass-regular p-5 shadow-2xl h-full max-h-[820px] flex flex-col">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white tracking-tight">Episodes</h3>
                <span className="apple-glass-thin text-xs font-semibold text-amber-300 px-3 py-1 rounded-full">
                  Season {season} ({seasonData.episodes.length} Episodes)
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                {seasonData.episodes.map((ep) => {
                  const isCurrent = ep.episode_number === episode;
                  const seriesBackdrop = tvQuery.data?.backdrop_path ? getBackdropUrl(tvQuery.data.backdrop_path, 'w780') : null;
                  const thumbSrc = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : seriesBackdrop;

                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${numericId}?s=${season}&e=${ep.episode_number}`}
                      className={`group flex items-center gap-3 rounded-2xl p-2.5 transition-all ${
                        isCurrent 
                          ? 'ios-active-lens text-white shadow-lg' 
                          : 'apple-glass-thin text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-black/60 ring-1 ring-white/10">
                        {thumbSrc ? (
                          <img src={thumbSrc} alt={ep.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500 bg-slate-900">
                            EP {ep.episode_number}
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <Play size={18} className="fill-amber-300 text-amber-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-amber-200' : 'text-slate-100 group-hover:text-white'}`}>
                          {ep.episode_number}. {ep.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{ep.runtime ? `${ep.runtime} min` : 'Standard'}</p>
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
