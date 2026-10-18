import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  FastForward,
  ChevronDown,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getProviders, getDefaultProvider, testServerConnectivity } from '../api/providers';
import type { EmbedSource } from '../api/providers';
import { useAmbientStore } from '../stores/ambient';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import { formatRating, getYear } from '../lib/utils';
import { Button } from '../components/ui/Button';

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
  const [activeSeason, setActiveSeason] = useState(season);
  const [prevSeason, setPrevSeason] = useState(season);

  if (prevSeason !== season) {
    setPrevSeason(season);
    setActiveSeason(season);
  }

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    activeSeason
  );

  const imdbId: string | null =
    mediaType === 'movie'
      ? movieQuery.data?.imdb_id || movieQuery.data?.external_ids?.imdb_id || null
      : tvQuery.data?.external_ids?.imdb_id || null;

  const providers = getProviders(imdbId);
  const [selectedProvider, setSelectedProvider] = useState<EmbedSource>(() =>
    getDefaultProvider(imdbId)
  );
  const activeProvider = providers.some((p) => p.id === selectedProvider.id)
    ? selectedProvider
    : getDefaultProvider(imdbId);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const currentEpisodeRef = useRef<HTMLAnchorElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCheckingServers, setIsCheckingServers] = useState(true);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, 'checking' | 'online' | 'failed'>
  >({});
  const [activeIframeKey, setActiveIframeKey] = useState<number>(0);
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const title = mediaType === 'movie' ? movieQuery.data?.title : tvQuery.data?.name;
  const backdrop = mediaType === 'movie' ? movieQuery.data?.backdrop_path : tvQuery.data?.backdrop_path;
  const poster = mediaType === 'movie' ? movieQuery.data?.poster_path : tvQuery.data?.poster_path;
  const year = mediaType === 'movie' ? getYear(movieQuery.data?.release_date) : getYear(tvQuery.data?.first_air_date);
  const rating = mediaType === 'movie' ? movieQuery.data?.vote_average : tvQuery.data?.vote_average;
  const overview = mediaType === 'movie' ? movieQuery.data?.overview : tvQuery.data?.overview;

  const posterUrl = poster ? getPosterUrl(poster, 'w342') : null;

  // Scroll current episode into view
  useEffect(() => {
    if (currentEpisodeRef.current) {
      currentEpisodeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [episode, activeSeason]);


  // Sample ambient color from media artwork
  useEffect(() => {
    const backdropUrl = backdrop
      ? getBackdropUrl(backdrop, 'w780')
      : poster
      ? getPosterUrl(poster, 'w500')
      : null;
    if (backdropUrl) {
      setColorsFromImage(backdropUrl);
    }
  }, [backdrop, poster, setColorsFromImage]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // PostMessage auto-next
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidlink.pro') return;

      if (event.data && event.data.type === 'ended') {
        if (autoNext && mediaType === 'tv' && seasonData && tvQuery.data) {
          let nextSeason = season;
          let nextEpisode = episode + 1;

          if (nextEpisode > seasonData.episodes.length) {
            const seasons = tvQuery.data.seasons.filter((s) => s.season_number > 0);
            const currentSeasonIndex = seasons.findIndex((s) => s.season_number === season);

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

  const [diagnosticCounter, setDiagnosticCounter] = useState(0);

  // Automated server check & auto-selection
  useEffect(() => {
    let isMounted = true;
    const activeProviders = getProviders(imdbId);
    let foundWorking = false;

    (async () => {
      for (const provider of activeProviders) {
        const testUrl =
          mediaType === 'movie'
            ? provider.getMovieUrl(numericId, imdbId)
            : provider.getTVUrl(numericId, season, episode, imdbId);

        const isOnline = await testServerConnectivity(testUrl, 2200);

        if (!isMounted) return;

        setServerStatuses((prev) => ({
          ...prev,
          [provider.id]: isOnline ? 'online' : 'failed',
        }));

        if (isOnline && !foundWorking) {
          foundWorking = true;
          setSelectedProvider(provider);
          setActiveIframeKey((k) => k + 1);
        }
      }

      if (isMounted) {
        setIsCheckingServers(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [numericId, mediaType, season, episode, imdbId, diagnosticCounter]);

  const embedUrl =
    mediaType === 'movie'
      ? activeProvider.getMovieUrl(numericId, imdbId)
      : activeProvider.getTVUrl(numericId, season, episode, imdbId);

  // Scoped Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current) {
        playerContainerRef.current.requestFullscreen().catch(() => {
          document.documentElement.requestFullscreen();
        });
      }
    } else {
      document.exitFullscreen().catch(() => {});
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

  const allServersFailed =
    !isCheckingServers &&
    providers.every((p) => serverStatuses[p.id] === 'failed');

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <SEO
        title={`Watch ${title || 'Streaming'} ${
          mediaType === 'tv' ? `(S${season}:E${episode})` : ''
        } Online Free`}
        description={`Watch ${title} online in HD on CineBai.`}
      />

      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-bg-surface/90 border-b border-border-default backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to={`/${mediaType}/${numericId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1 px-2 min-h-[44px]"
            aria-label="Back to details page"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Back to Details</span>
          </Link>

          <div className="h-4 w-px bg-border-default" aria-hidden="true" />

          <p className="text-sm font-semibold text-text-primary truncate max-w-xs md:max-w-md">
            {title}
            {mediaType === 'tv' && (
              <span className="text-accent font-bold"> (S{season} : E{episode})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 border border-border-default px-3 py-1 text-xs text-text-secondary">
            <CheckCircle2 size={13} className="text-success" aria-hidden="true" />
            <span>
              Server: <strong className="text-accent font-semibold">{selectedProvider.name}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} aria-hidden="true" /> : <Maximize size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 flex flex-col lg:flex-row lg:gap-8">
        {/* Left Column: Player & Server Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Adblock Recommendation Banner */}
          {showAdblockBanner && (
            <div
              role="region"
              aria-label="Adblock Recommendation"
              className="mb-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-xs sm:text-sm text-text-primary relative"
            >
              <AlertCircle className="mt-0.5 shrink-0 text-warning" size={18} aria-hidden="true" />
              <div className="pr-8 leading-relaxed">
                <strong className="text-warning font-semibold block mb-0.5">
                  Recommendation: Use an Adblocker
                </strong>
                <p className="text-text-secondary">
                  Free third-party embeds may trigger pop-up advertisements. For a smooth experience,
                  we recommend using <strong className="text-text-primary">uBlock Origin</strong> or the <strong className="text-text-primary">Brave Browser</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissAdblockBanner}
                className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Dismiss banner"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Scoped Video Player Container */}
          <div
            ref={playerContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-border-default shadow-xl"
          >
            {/* Health check diagnostic overlay with Skip option */}
            {isCheckingServers && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
                <Loader2 size={36} className="text-accent animate-spin mb-3" aria-hidden="true" />
                <p className="text-base font-semibold text-text-primary">
                  Testing server responsiveness...
                </p>
                <p className="mt-1 text-xs text-text-muted max-w-sm">
                  Checking available mirrors to route you to the fastest online host.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCheckingServers(false)}
                  className="mt-4 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-text-primary transition-colors cursor-pointer min-h-[44px]"
                >
                  Skip Check & Play Now
                </button>
              </div>
            )}

            {/* All servers down fallback error */}
            {allServersFailed ? (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/20 text-error mb-4">
                  <AlertCircle size={28} aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  All streaming servers are currently unresponsive
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-md">
                  External mirror providers may be undergoing maintenance. You can retry testing or
                  manually pick a mirror below.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsCheckingServers(true);
                      setDiagnosticCounter((c) => c + 1);
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    <span>Retry Servers</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsCheckingServers(false);
                      handleManualServerSelect(providers[0]);
                    }}
                  >
                    Force Play Mirror 1
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                key={activeIframeKey}
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                referrerPolicy="origin"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                title={`${title} - ${selectedProvider.name}`}
              />
            )}
          </div>

          {/* Servers Selector Control Panel */}
          <div className="mt-5 rounded-lg bg-bg-surface border border-border-default p-5 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Streaming Servers:
                </span>
              </div>

              {/* Server Buttons with Icon + Status Text */}
              <div
                role="radiogroup"
                aria-label="Available streaming mirrors"
                className="flex flex-wrap items-center gap-2"
              >
                {providers.map((provider) => {
                  const isSelected = provider.id === selectedProvider.id;
                  const status = serverStatuses[provider.id] || 'checking';
                  const isFailed = status === 'failed';

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isFailed}
                      onClick={() => handleManualServerSelect(provider)}
                      className={`min-h-[44px] relative flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'bg-accent text-on-accent shadow-sm'
                          : isFailed
                          ? 'bg-white/5 border border-border-subtle text-text-disabled opacity-50 cursor-not-allowed'
                          : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                      }`}
                      aria-label={`${provider.name} - ${
                        status === 'online'
                          ? 'Online'
                          : status === 'failed'
                          ? 'Unavailable'
                          : 'Checking'
                      }`}
                    >
                      {/* Status Icon */}
                      {status === 'online' ? (
                        <CheckCircle2
                          size={14}
                          className={isSelected ? 'text-on-accent' : 'text-success'}
                          aria-hidden="true"
                        />
                      ) : status === 'failed' ? (
                        <AlertCircle size={14} className="text-error" aria-hidden="true" />
                      ) : (
                        <Loader2
                          size={14}
                          className="animate-spin text-text-muted"
                          aria-hidden="true"
                        />
                      )}

                      <span>{provider.name}</span>

                      {/* Explicit Status Text for Non-Color Blind Access */}
                      <span className="text-xs opacity-75 font-normal">
                        ({status === 'online' ? 'Online' : status === 'failed' ? 'Down' : 'Testing'})
                      </span>
                    </button>
                  );
                })}

                {/* Quick Next Server button */}
                <button
                  type="button"
                  onClick={switchToNextServer}
                  className="min-h-[44px] flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold bg-white/5 border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title="Switch to next available server"
                >
                  <FastForward size={14} aria-hidden="true" />
                  <span>Next Server</span>
                </button>
              </div>

              {/* Auto Next Toggle (TV Only) */}
              {mediaType === 'tv' && (
                <button
                  type="button"
                  onClick={() => setAutoNext(!autoNext)}
                  className={`min-h-[44px] flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    autoNext
                      ? 'bg-accent/20 border border-accent/40 text-accent font-bold'
                      : 'bg-white/5 border border-border-default text-text-muted hover:text-text-secondary'
                  }`}
                  aria-pressed={autoNext}
                  title={autoNext ? 'Auto Play Next Episode: ON' : 'Auto Play Next Episode: OFF'}
                >
                  <FastForward size={13} aria-hidden="true" />
                  <span>Auto Next: {autoNext ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-1 border-t border-border-subtle pt-3 sm:flex-row sm:items-center sm:justify-between text-xs text-text-muted">
              <p>
                <strong className="text-text-secondary">Tip:</strong> The player automatically
                verifies server health and loads the fastest online source.
              </p>
              <p>
                <strong className="text-accent">Auto Next</strong> is supported on VidLink.
              </p>
            </div>
          </div>

          {/* Media Info Section */}
          <div className="mt-8 flex flex-col sm:flex-row gap-6">
            {/* Poster Thumbnail */}
            {posterUrl && (
              <div className="hidden sm:block w-32 md:w-40 flex-shrink-0">
                <img
                  src={posterUrl}
                  alt=""
                  aria-hidden="true"
                  className="w-full aspect-[2/3] rounded-lg border border-border-default shadow-md object-cover"
                />
              </div>
            )}

            {/* Single Semantic H1 for WatchPage */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-text-primary">
                {title}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs md:text-sm text-text-secondary">
                {rating !== undefined && rating > 0 && (
                  <span
                    role="img"
                    aria-label={`Rated ${formatRating(rating)} out of 10`}
                    className="inline-flex items-center gap-1 rounded bg-accent/20 border border-accent/40 px-2 py-0.5 text-xs font-bold text-accent"
                  >
                    <span aria-hidden="true">★</span>
                    <span>{formatRating(rating)}</span>
                  </span>
                )}

                {year && <span>{year}</span>}

                <span className="uppercase text-text-muted font-medium">
                  {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                </span>
              </div>

              {overview && (
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-text-secondary line-clamp-3">
                  {overview}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Episodes with Season Switcher (TV Only) */}
        {mediaType === 'tv' && (
          <aside
            aria-label="Episodes and seasons"
            className="mt-8 w-full lg:mt-0 lg:w-[420px] flex-shrink-0"
          >
            <div className="rounded-lg bg-bg-surface border border-border-default p-4 shadow-xl flex flex-col max-h-[820px]">
              {/* Header with Season Switcher */}
              <div className="mb-4 border-b border-border-subtle pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Episodes</h2>
                  <span className="text-xs text-text-muted">
                    {seasonData?.episodes?.length || 0} episodes
                  </span>
                </div>

                {/* Season Dropdown / Switcher */}
                {tvQuery.data?.seasons && (
                  <div className="relative">
                    <label htmlFor="season-select" className="sr-only">
                      Select Season
                    </label>
                    <select
                      id="season-select"
                      value={activeSeason}
                      onChange={(e) => {
                        const newSeason = Number(e.target.value);
                        setActiveSeason(newSeason);
                      }}
                      className="w-full appearance-none rounded-md bg-white/5 border border-border-default px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer min-h-[44px]"
                    >
                      {tvQuery.data.seasons
                        .filter((s) => s.season_number > 0)
                        .map((s) => (
                          <option key={s.id} value={s.season_number} className="bg-bg-surface text-text-primary">
                            Season {s.season_number} ({s.episode_count} eps)
                          </option>
                        ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              {/* Scrollable Episode List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {seasonData?.episodes?.map((ep) => {
                  const isCurrent = activeSeason === season && ep.episode_number === episode;
                  const thumbSrc = ep.still_path
                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                    : posterUrl;

                  return (
                    <Link
                      key={ep.id}
                      ref={isCurrent ? currentEpisodeRef : null}
                      to={`/watch/tv/${numericId}?s=${activeSeason}&e=${ep.episode_number}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={`group flex items-center gap-3 rounded-md p-2 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isCurrent
                          ? 'bg-accent/20 border border-accent/40 text-text-primary'
                          : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-transparent'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded bg-poster-fallback border border-border-subtle">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-muted">
                            EP {ep.episode_number}
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Play size={16} className="fill-accent text-accent" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      {/* Episode Title & Runtime */}
                      <div className="flex-1 min-w-0">
                        <p
                          title={ep.name}
                          className={`truncate text-xs font-semibold ${
                            isCurrent ? 'text-accent' : 'text-text-primary'
                          }`}
                        >
                          {ep.episode_number}. {ep.name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {ep.runtime ? `${ep.runtime} min` : 'Standard'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
