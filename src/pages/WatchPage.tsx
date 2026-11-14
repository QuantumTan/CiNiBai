import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Sparkles,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import {
  PROVIDER_IDS,
  getProviders,
  getDefaultProvider,
} from '../api/providers';
import type { EmbedSource } from '../api/providers';
import { useAmbientStore } from '../stores/ambient';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import { formatRating, getYear } from '../lib/utils';

const IFRAME_LOAD_TIMEOUT_MS = 8000;

type MirrorStatus = 'ready' | 'checking' | 'online' | 'failed';
type IframeErrorReason = 'timeout' | 'cancelled' | 'error';

function getStatusLabel(status: MirrorStatus): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'failed':
      return 'Unavailable';
    case 'checking':
      return 'Connecting…';
    default:
      return 'Ready';
  }
}

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

  const parsedSeason = Number(searchParams.get('s'));
  const parsedEpisode = Number(searchParams.get('e'));
  const season = Number.isFinite(parsedSeason) && parsedSeason >= 1 ? Math.floor(parsedSeason) : 1;
  const episode = Number.isFinite(parsedEpisode) && parsedEpisode >= 1 ? Math.floor(parsedEpisode) : 1;

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    season
  );

  const imdbId: string | null =
    mediaType === 'movie'
      ? movieQuery.data?.imdb_id || movieQuery.data?.external_ids?.imdb_id || null
      : tvQuery.data?.external_ids?.imdb_id || null;

  const imdbIdRef = useRef<string | null>(imdbId);
  const routeGenerationRef = useRef<number>(0);

  useEffect(() => {
    imdbIdRef.current = imdbId;
  }, [imdbId]);

  useEffect(() => {
    routeGenerationRef.current += 1;
    const currentGen = routeGenerationRef.current;
    return () => {
      if (routeGenerationRef.current === currentGen) {
        routeGenerationRef.current += 1;
      }
    };
  }, [mediaType, numericId, season, episode]);

  const providers = getProviders(imdbId);

  // Load preferred provider from localStorage if available
  const [selectedProvider, setSelectedProvider] = useState<EmbedSource>(() => {
    const savedId = localStorage.getItem('cinebai_preferred_provider');
    if (savedId) {
      const match = providers.find((p) => p.id === savedId);
      if (match) return match;
    }
    return getDefaultProvider(imdbId);
  });

  const activeProvider = providers.some((p) => p.id === selectedProvider.id)
    ? selectedProvider
    : getDefaultProvider(imdbId);

  const isDefaultMirror = activeProvider.id === PROVIDER_IDS.VIDLINK;

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const currentEpisodeRef = useRef<HTMLAnchorElement | null>(null);
  const episodeListRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenNote, setFullscreenNote] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<IframeErrorReason | null>(null);
  const [activeIframeKey, setActiveIframeKey] = useState<number>(0);
  const [serverStatuses, setServerStatuses] = useState<Record<string, MirrorStatus>>({});

  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const title = mediaType === 'movie' ? movieQuery.data?.title : tvQuery.data?.name;
  const backdrop = mediaType === 'movie' ? movieQuery.data?.backdrop_path : tvQuery.data?.backdrop_path;
  const poster = mediaType === 'movie' ? movieQuery.data?.poster_path : tvQuery.data?.poster_path;
  const year = mediaType === 'movie' ? getYear(movieQuery.data?.release_date) : getYear(tvQuery.data?.first_air_date);
  const rating = mediaType === 'movie' ? movieQuery.data?.vote_average : tvQuery.data?.vote_average;
  const overview = mediaType === 'movie' ? movieQuery.data?.overview : tvQuery.data?.overview;

  const posterUrl = poster ? getPosterUrl(poster, 'w342') : null;

  const embedUrl =
    mediaType === 'movie'
      ? activeProvider.getMovieUrl(numericId, imdbId)
      : activeProvider.getTVUrl(numericId, season, episode, imdbId);

  const routeKey = `${mediaType}:${numericId}:${season}:${episode}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (prevRouteKey !== routeKey) {
    setPrevRouteKey(routeKey);
    setServerStatuses({});
    setIsIframeLoading(true);
    setIframeError(null);
  }

  const [prevEmbedUrl, setPrevEmbedUrl] = useState(embedUrl);
  if (prevEmbedUrl !== embedUrl) {
    setPrevEmbedUrl(embedUrl);
    setIsIframeLoading(true);
    setIframeError(null);
  }

  const allMirrorsFailed =
    providers.length > 0 &&
    Object.keys(serverStatuses).length === providers.length &&
    providers.every((p) => serverStatuses[p.id] === 'failed');

  const hasAlternateMirror = providers.length > 1;

  const handleManualServerSelect = useCallback((provider: EmbedSource) => {
    setSelectedProvider(provider);
    localStorage.setItem('cinebai_preferred_provider', provider.id);
    setIframeError(null);
    setIsIframeLoading(true);
    setActiveIframeKey((k) => k + 1);
  }, []);

  const switchToNextServer = useCallback(() => {
    if (providers.length <= 1) return;
    const currentIndex = providers.findIndex((p) => p.id === activeProvider.id);
    const nextIndex = (currentIndex + 1) % providers.length;
    handleManualServerSelect(providers[nextIndex]);
  }, [providers, activeProvider.id, handleManualServerSelect]);

  // 8000 ms timeout for active iframe load: automatically tries next mirror if unresponsive
  useEffect(() => {
    if (!isIframeLoading || allMirrorsFailed || iframeError !== null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsIframeLoading(false);
      setIframeError('timeout');
      setServerStatuses((prev) => ({
        ...prev,
        [activeProvider.id]: 'failed',
      }));

      // Automatically advance to the next best mirror on timeout!
      if (providers.length > 1) {
        const currentIndex = providers.findIndex((p) => p.id === activeProvider.id);
        const nextIndex = (currentIndex + 1) % providers.length;
        handleManualServerSelect(providers[nextIndex]);
      }
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isIframeLoading, allMirrorsFailed, iframeError, activeProvider.id, activeIframeKey, embedUrl, providers, handleManualServerSelect]);

  // Grace timer: automatically unblock the player view after 2.5s so user can click play
  // even if cross-origin analytics/trackers keep the outer iframe onLoad pending
  useEffect(() => {
    if (!isIframeLoading) return;
    const timer = window.setTimeout(() => {
      setIsIframeLoading(false);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [isIframeLoading, activeIframeKey]);

  // Scroll current episode into view when episode, season, or fetched episodes update
  useEffect(() => {
    const epEl = currentEpisodeRef.current;
    const listEl = episodeListRef.current;
    if (!epEl || !listEl) return;

    const epRect = epEl.getBoundingClientRect();
    const listRect = listEl.getBoundingClientRect();
    if (listRect.height === 0 || epRect.top < listRect.top || epRect.bottom > listRect.bottom) {
      epEl.scrollIntoView({ block: 'nearest' });
    }
  }, [episode, season, seasonData]);

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

  // Fullscreen change & error listeners scoped strictly to playerContainerRef
  useEffect(() => {
    const handleFullscreenChange = () => {
      const scopedFullscreen =
        playerContainerRef.current !== null &&
        document.fullscreenElement === playerContainerRef.current;
      setIsFullscreen(scopedFullscreen);
      if (scopedFullscreen) {
        setFullscreenNote(null);
      }
    };

    const handleFullscreenError = () => {
      setIsFullscreen(false);
      setFullscreenNote(
        'Fullscreen is unavailable in this browser or context. Try the fullscreen button inside the video player.'
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('fullscreenerror', handleFullscreenError);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('fullscreenerror', handleFullscreenError);
    };
  }, []);

  // PostMessage auto-next for VidLink (Mirror 1 only)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidlink.pro') return;

      if (event.data && event.data.type === 'ended') {
        if (autoNext && isDefaultMirror && mediaType === 'tv' && seasonData && tvQuery.data) {
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
  }, [autoNext, isDefaultMirror, mediaType, season, episode, seasonData, tvQuery.data, numericId, navigate]);

  // Scoped Fullscreen (player container only, no documentElement fallback)
  const toggleFullscreen = async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (typeof container.requestFullscreen !== 'function') {
        setFullscreenNote(
          'Fullscreen is not supported in this browser. Try the fullscreen button inside the video player.'
        );
        return;
      }
      try {
        await container.requestFullscreen();
        setFullscreenNote(null);
      } catch {
        setIsFullscreen(false);
        setFullscreenNote(
          'Fullscreen could not be activated for the player container. Try the fullscreen button inside the video player.'
        );
      }
    } else if (typeof document.exitFullscreen === 'function') {
      try {
        await document.exitFullscreen();
      } catch {
        setIsFullscreen(document.fullscreenElement === container);
      }
    }
  };

  const reloadCurrentServer = useCallback(() => {
    setIframeError(null);
    setIsIframeLoading(true);
    setActiveIframeKey((k) => k + 1);
  }, []);

  const retryAllMirrors = useCallback(() => {
    setServerStatuses({});
    setIframeError(null);
    setIsIframeLoading(true);
    setActiveIframeKey((k) => k + 1);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsIframeLoading(false);
    setServerStatuses((prev) => ({
      ...prev,
      [activeProvider.id]: 'online',
    }));
    try {
      localStorage.setItem('cinebai_preferred_provider', activeProvider.id);
    } catch {
      // ignore
    }
  }, [activeProvider.id]);

  const handleIframeError = useCallback(() => {
    setIsIframeLoading(false);
    setIframeError('error');
    setServerStatuses((prev) => ({
      ...prev,
      [activeProvider.id]: 'failed',
    }));
    // Auto-advance to the next best mirror when an error occurs
    if (providers.length > 1) {
      const currentIndex = providers.findIndex((p) => p.id === activeProvider.id);
      const nextIndex = (currentIndex + 1) % providers.length;
      handleManualServerSelect(providers[nextIndex]);
    }
  }, [activeProvider.id, providers, handleManualServerSelect]);

  // Keyboard shortcuts: 'Esc' exits scoped fullscreen; 's'/'S' cycles mirrors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        playerContainerRef.current !== null &&
        document.fullscreenElement === playerContainerRef.current &&
        typeof document.exitFullscreen === 'function'
      ) {
        document.exitFullscreen().catch(() => {});
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const isExcludedElement = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const tag = el.tagName?.toUpperCase();
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          tag === 'BUTTON' ||
          el.isContentEditable
        ) {
          return true;
        }
        return Boolean(
          typeof el.closest === 'function' &&
            el.closest('button, select, input, textarea, [contenteditable="true"]')
        );
      };

      const target = e.target as HTMLElement | null;
      const activeEl = document.activeElement as HTMLElement | null;
      if (isExcludedElement(target) || isExcludedElement(activeEl)) {
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        switchToNextServer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchToNextServer]);

  const activeStatus: MirrorStatus = isIframeLoading
    ? 'checking'
    : (serverStatuses[activeProvider.id] ?? 'online');
  const showMirrorError =
    !allMirrorsFailed &&
    (iframeError !== null || (!isIframeLoading && activeStatus === 'failed'));

  const mirrorErrorHeading =
    iframeError === 'cancelled'
      ? `Stopped loading ${activeProvider.name}`
      : iframeError === 'timeout'
      ? `${activeProvider.name} timed out`
      : `${activeProvider.name} is unavailable`;

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <SEO
        title={`${title || 'Player'} ${
          mediaType === 'tv' ? `(S${season}:E${episode})` : ''
        } - Player View`}
        description={`View episode and playback interface for ${title} on CineBai.`}
        url={`https://cinibai.vercel.app/watch/${mediaType}/${numericId}${mediaType === 'tv' ? `?s=${season}&e=${episode}` : ''}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
          name: title,
          description: `Playback interface for ${title} on CineBai.`,
          url: `https://cinibai.vercel.app/watch/${mediaType}/${numericId}${mediaType === 'tv' ? `?s=${season}&e=${episode}` : ''}`,
        }}
      />

      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-bg-surface/90 border-b border-border-default backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link
            to={`/${mediaType}/${numericId}`}
            className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1 px-2 min-h-[44px]"
            aria-label="Back to Details"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Details</span>
          </Link>

          <div className="h-4 w-px bg-border-default shrink-0" aria-hidden="true" />

          <p className="min-w-0 truncate text-sm font-semibold text-text-primary">
            {title}
            {mediaType === 'tv' && (
              <span className="text-accent font-bold"> (S{season} : E{episode})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quick status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 border border-border-default px-3 py-1 text-xs text-text-secondary">
            {allMirrorsFailed || showMirrorError ? (
              <AlertCircle size={13} className="text-error shrink-0" aria-hidden="true" />
            ) : activeStatus === 'online' && !isIframeLoading ? (
              <CheckCircle2 size={13} className="text-success shrink-0" aria-hidden="true" />
            ) : (
              <Loader2
                size={13}
                className="text-accent animate-spin motion-reduce:animate-none shrink-0"
                aria-hidden="true"
              />
            )}
            <span>
              Server:{' '}
              <strong className="text-accent font-semibold">{activeProvider.name}</strong>{' '}
              <span className="text-text-secondary">
                (
                {allMirrorsFailed
                  ? 'Unavailable'
                  : iframeError === 'cancelled'
                  ? 'Cancelled'
                  : iframeError === 'timeout'
                  ? 'Timed out'
                  : isIframeLoading && activeStatus === 'failed'
                  ? 'Checking…'
                  : getStatusLabel(activeStatus)}
                )
              </span>
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
              <div className="pr-10 leading-relaxed">
                <strong className="text-warning font-semibold block mb-0.5">
                  Recommendation: Use an Adblocker
                </strong>
                <p className="text-text-secondary">
                  Free third-party streaming embeds may trigger pop-up advertisements. For the best experience,
                  we recommend using <strong className="text-text-primary">uBlock Origin</strong> or the <strong className="text-text-primary">Brave Browser</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissAdblockBanner}
                className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Dismiss banner"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Scoped Video Player Container */}
          <div
            ref={playerContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-border-default shadow-2xl"
          >
            {allMirrorsFailed ? (
              <div
                role="alert"
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg-surface/95 p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 border border-error/30 text-error mb-3">
                  <AlertCircle size={24} aria-hidden="true" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  All streaming mirrors failed to load
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-text-secondary max-w-md">
                  None of the streaming mirrors responded. Check your connection or adblocker settings, or retry below.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={retryAllMirrors}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-accent text-on-accent hover:bg-accent-light px-4 py-2 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <Link
                    to={`/${mediaType}/${numericId}`}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/15 border border-border-default px-4 py-2 text-xs font-semibold text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    <span>Back to Details</span>
                  </Link>
                </div>
              </div>
            ) : showMirrorError ? (
              <div
                role="alert"
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg-surface/95 p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 border border-error/30 text-error mb-3">
                  <AlertCircle size={24} aria-hidden="true" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  {mirrorErrorHeading}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-text-secondary max-w-md">
                  You can retry this mirror, pick another mirror below, or return to details.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={reloadCurrentServer}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-accent text-on-accent hover:bg-accent-light px-4 py-2 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  {hasAlternateMirror && (
                    <button
                      type="button"
                      onClick={switchToNextServer}
                      className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/15 border border-border-default px-4 py-2 text-xs font-semibold text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <FastForward size={14} aria-hidden="true" />
                      <span>Next Mirror</span>
                    </button>
                  )}
                  <Link
                    to={`/${mediaType}/${numericId}`}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-white/5 hover:bg-white/10 border border-border-default px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    <span>Back to Details</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {isIframeLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center transition-opacity duration-300">
                    <Loader2 size={36} className="text-accent animate-spin motion-reduce:animate-none mb-3" aria-hidden="true" />
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-sm font-semibold text-text-primary"
                    >
                      Connecting to {activeProvider.name}...
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Loading stream. Unblocking player in a moment...
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={switchToNextServer}
                        className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md bg-accent text-on-accent hover:bg-accent-hover px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        title="Skip to next mirror immediately"
                      >
                        <FastForward size={13} aria-hidden="true" />
                        <span>Next Mirror (S)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsIframeLoading(false)}
                        className="min-h-[40px] inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 border border-border-default px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Dismiss Overlay
                      </button>
                    </div>
                  </div>
                )}

                <iframe
                  key={activeIframeKey}
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  referrerPolicy="origin"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  title={`${title || 'Video Player'} - ${activeProvider.name}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </>
            )}
          </div>

          {/* Inline Fullscreen Failure Note */}
          {fullscreenNote && (
            <div
              role="status"
              aria-live="polite"
              className="mt-3 flex items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-text-primary"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={15} className="text-warning shrink-0" aria-hidden="true" />
                <span>{fullscreenNote}</span>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenNote(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
                aria-label="Dismiss fullscreen note"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Instant Server Switcher & Mirror Selector Toolbar */}
          <div className="mt-5 rounded-lg bg-bg-surface border border-border-default p-5 shadow-md">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Streaming Mirrors:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const best = getDefaultProvider(imdbId);
                      handleManualServerSelect(best);
                    }}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      activeProvider.id === PROVIDER_IDS.VIDEASY
                        ? 'bg-accent text-on-accent font-bold shadow-sm'
                        : 'bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25'
                    }`}
                    title="Switch directly to Mirror 1 (Videasy) - best rated mirror"
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    <span>Best Mirror</span>
                  </button>

                  <button
                    type="button"
                    onClick={reloadCurrentServer}
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold bg-white/5 border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    title="Reload current server"
                  >
                    <RefreshCw size={13} aria-hidden="true" />
                    <span>Reload Mirror</span>
                  </button>

                  <button
                    type="button"
                    onClick={switchToNextServer}
                    disabled={!hasAlternateMirror}
                    aria-disabled={!hasAlternateMirror || undefined}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      hasAlternateMirror
                        ? 'bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 cursor-pointer'
                        : 'bg-white/5 border border-border-subtle text-text-disabled opacity-60 cursor-not-allowed'
                    }`}
                    title="Switch to next mirror (Shortcut: S)"
                  >
                    <FastForward size={14} aria-hidden="true" />
                    <span>Next Mirror <kbd className="ml-1 text-[10px] font-mono opacity-80 bg-white/10 px-1 py-0.5 rounded">S</kbd></span>
                  </button>

                  {/* Auto Next Toggle (TV Only, Mirror 1 only) */}
                  {mediaType === 'tv' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDefaultMirror) return;
                        setAutoNext((prev) => !prev);
                      }}
                      disabled={!isDefaultMirror}
                      aria-disabled={!isDefaultMirror || undefined}
                      className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        !isDefaultMirror
                          ? 'bg-white/5 border border-border-subtle text-text-disabled opacity-60 cursor-not-allowed'
                          : autoNext
                          ? 'bg-success/20 border border-success/40 text-success font-bold cursor-pointer'
                          : 'bg-white/5 border border-border-default text-text-muted hover:text-text-secondary cursor-pointer'
                      }`}
                      aria-pressed={isDefaultMirror ? autoNext : false}
                      title={
                        isDefaultMirror
                          ? autoNext
                            ? 'Auto Play Next Episode: ON'
                            : 'Auto Play Next Episode: OFF'
                          : 'Auto Next works on Mirror 1 (VidLink) only'
                      }
                    >
                      <FastForward size={13} aria-hidden="true" />
                      <span>
                        Auto Next: {!isDefaultMirror ? 'Mirror 1 only' : autoNext ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                If a server buffers or stops, try another mirror below or press{' '}
                <strong className="text-text-primary">S</strong>.
              </p>

              {/* Server Buttons with Honest Status */}
              <div
                role="radiogroup"
                aria-label="Available streaming mirrors"
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                {providers.map((provider) => {
                  const isSelected = provider.id === activeProvider.id;
                  const isFailed = serverStatuses[provider.id] === 'failed';
                  const isOnline = isSelected && !isIframeLoading && !isFailed;
                  const isLoading = isSelected && isIframeLoading;

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleManualServerSelect(provider)}
                      className={`min-h-[44px] relative flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'bg-accent text-on-accent shadow-md'
                          : isFailed
                          ? 'bg-white/5 border border-error/30 text-text-muted hover:text-text-primary hover:border-error/60'
                          : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-white/10'
                      }`}
                      aria-label={`${provider.name}${isSelected ? (isLoading ? ' - Connecting' : isOnline ? ' - Online' : ' - Active') : isFailed ? ' - Unavailable' : ''}`}
                    >
                      {isSelected ? (
                        isLoading ? (
                          <Loader2
                            size={14}
                            className="animate-spin motion-reduce:animate-none shrink-0 text-on-accent"
                            aria-hidden="true"
                          />
                        ) : isFailed ? (
                          <AlertCircle
                            size={14}
                            className="text-on-accent shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <CheckCircle2
                            size={14}
                            className="text-on-accent shrink-0"
                            aria-hidden="true"
                          />
                        )
                      ) : isFailed ? (
                        <AlertCircle
                          size={14}
                          className="text-error shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Play
                          size={13}
                          className="text-text-muted shrink-0"
                          aria-hidden="true"
                        />
                      )}

                      <span>{provider.name}</span>

                      {isSelected && (
                        <span className="text-[11px] font-bold text-on-accent/90">
                          ({isLoading ? 'Connecting…' : isFailed ? 'Failed' : 'Online'})
                        </span>
                      )}
                      {!isSelected && isFailed && (
                        <span className="text-[11px] font-medium text-error">
                          (Unavailable)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-text-secondary pt-2 border-t border-border-subtle gap-2">
                {mediaType === 'tv' ? (
                  <p>Auto Next works on Mirror 1 (VidLink) only.</p>
                ) : (
                  <p>External embeds are hosted by third-party providers.</p>
                )}
                <p>
                  Active host: <strong className="text-text-secondary">{activeProvider.host}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Media Info Section */}
          <div className="mt-8 grid grid-cols-[7rem_minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)] md:grid-cols-[10rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6 gap-y-3 items-start">
            {/* Poster Thumbnail (w-28 on mobile, same pattern as Detail) */}
            <div className="w-28 sm:w-32 md:w-40 aspect-[2/3] overflow-hidden rounded-lg border border-border-default shadow-md bg-poster-fallback flex-shrink-0 sm:row-span-2 relative">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center p-2 text-center text-xs font-bold text-text-secondary">
                  {title || 'CineBai'}
                </div>
              )}
            </div>

            {/* Semantic H1 & Metadata for WatchPage */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight text-text-primary">
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

                <span className="uppercase text-text-secondary font-medium">
                  {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                </span>
              </div>
            </div>

            {overview && (
              <p className="col-span-2 sm:col-span-1 sm:col-start-2 text-xs sm:text-sm leading-relaxed text-text-secondary line-clamp-3">
                {overview}
              </p>
            )}
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
                  <span className="text-xs text-text-secondary">
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
                      value={season}
                      onChange={(e) => {
                        const newSeason = Number(e.target.value);
                        navigate(`/watch/tv/${numericId}?s=${newSeason}&e=1`);
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
              <div ref={episodeListRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
                {seasonData?.episodes?.map((ep) => {
                  const isCurrent = ep.season_number === season && ep.episode_number === episode;
                  const thumbSrc = ep.still_path
                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                    : posterUrl;

                  return (
                    <Link
                      key={ep.id}
                      ref={isCurrent ? currentEpisodeRef : null}
                      to={`/watch/tv/${numericId}?s=${season}&e=${ep.episode_number}`}
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
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-secondary">
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
                        <p className="text-xs text-text-secondary mt-0.5">
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
