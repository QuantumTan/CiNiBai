import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Calendar, Clock, ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import {
  formatRuntime,
  getYear,
  formatRating,
} from '../lib/utils';
import { Button } from '../components/ui/Button';
import { CastCard } from '../components/cards/CastCard';
import { MovieCard } from '../components/cards/MovieCard';
import { ScrollContainer } from '../components/ui/ScrollContainer';
import { DetailPageSkeleton } from '../components/ui/Skeleton';
import { useWatchlistStore } from '../store/watchlistStore';
import { SEO } from '../components/common/SEO';
import { useAmbientStore } from '../stores/ambient';

interface DetailPageProps {
  mediaType: 'movie' | 'tv';
}

export function DetailPage({ mediaType }: DetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const movieQuery = useMovieDetails(mediaType === 'movie' ? numericId : 0);
  const tvQuery = useTVDetails(mediaType === 'tv' ? numericId : 0);

  const isLoading = mediaType === 'movie' ? movieQuery.isLoading : tvQuery.isLoading;
  const movie = movieQuery.data;
  const tv = tvQuery.data;

  const [selectedSeason, setSelectedSeason] = useState(1);
  const { data: seasonData } = useTVSeasonDetails(
    mediaType === 'tv' ? numericId : 0,
    selectedSeason
  );

  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();

  const [showTrailer, setShowTrailer] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const trailerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const backdrop = (mediaType === 'movie' ? movie?.backdrop_path : tv?.backdrop_path) ?? null;
  const poster = (mediaType === 'movie' ? movie?.poster_path : tv?.poster_path) ?? null;

  // Dynamically sample dominant palette from media artwork
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

  // Handle trailer modal keyboard trap & escape
  useEffect(() => {
    if (!showTrailer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTrailer(false);
        trailerTriggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrailer]);

  if (isLoading) return <DetailPageSkeleton />;

  // Determine data based on media type
  const title = mediaType === 'movie' ? movie?.title : tv?.name;
  const overview = mediaType === 'movie' ? movie?.overview : tv?.overview;
  const rating = mediaType === 'movie' ? movie?.vote_average : tv?.vote_average;
  const year = mediaType === 'movie' ? getYear(movie?.release_date) : getYear(tv?.first_air_date);
  const genres = mediaType === 'movie' ? movie?.genres : tv?.genres;
  const runtime = mediaType === 'movie' ? movie?.runtime : tv?.episode_run_time?.[0] || null;
  const tagline = mediaType === 'movie' ? movie?.tagline : tv?.tagline;
  const credits = mediaType === 'movie' ? movie?.credits : tv?.credits;
  const videos = mediaType === 'movie' ? movie?.videos : tv?.videos;
  const similar = mediaType === 'movie' ? movie?.similar : tv?.similar;

  const inWatchlist = isInWatchlist(numericId, mediaType);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeItem(numericId, mediaType);
    } else {
      addItem({
        id: numericId,
        type: mediaType,
        title: title || '',
        posterPath: poster || null,
        voteAverage: rating || 0,
        releaseDate: mediaType === 'movie' ? movie?.release_date || '' : tv?.first_air_date || '',
      });
    }
  };

  // Find official or fallback trailer
  const trailer =
    videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');

  const director = credits?.crew.find((c) => c.job === 'Director');

  const posterSrc = poster ? getPosterUrl(poster, 'w500') : null;
  const backdropSrc = backdrop ? getBackdropUrl(backdrop, 'original') : null;

  return (
    <div className="relative">
      <SEO
        title={`${title || 'Title'} ${year ? `(${year})` : ''} - Watch Free Online`}
        description={overview || `Watch ${title} online in HD on CineBai.`}
        image={posterSrc || undefined}
        type={mediaType === 'movie' ? 'video.movie' : 'video.tv_show'}
      />

      {/* Backdrop Scrim Header */}
      <div className="relative h-[60vh] min-h-[380px] max-h-[640px] w-full bg-bg-surface overflow-hidden">
        {backdropSrc ? (
          <img
            src={backdropSrc}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-bg-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base/90 via-bg-base/30 to-transparent" />

        {/* Floating Back Link */}
        <div className="absolute top-4 left-4 z-20 sm:left-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-black/60 backdrop-blur-md border border-border-default px-3.5 py-2 text-xs font-semibold text-text-primary hover:border-border-strong transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
            aria-label="Back to Browse"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Browse</span>
          </Link>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative -mt-36 z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Responsive Poster: visible on mobile thumbnail beside title & desktop 64-width card */}
          <div className="flex-shrink-0 flex items-start gap-4 md:block">
            <div className="w-28 sm:w-36 md:w-64 aspect-[2/3] overflow-hidden rounded-lg border border-border-default shadow-xl bg-poster-fallback flex-shrink-0">
              {posterSrc ? (
                <img
                  src={posterSrc}
                  alt={title || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-bold text-text-muted">
                  {title || 'CineBai'}
                </div>
              )}
            </div>

            {/* Mobile-only Title preview beside thumbnail */}
            <div className="md:hidden flex-1 min-w-0 pt-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary line-clamp-2">
                {title}
              </h1>
              {year && (
                <p className="text-xs text-text-secondary mt-1">
                  {year} {runtime ? `• ${formatRuntime(runtime)}` : ''}
                </p>
              )}
              {rating !== undefined && rating > 0 && (
                <div
                  role="img"
                  aria-label={`Rated ${formatRating(rating)} out of 10`}
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-accent"
                >
                  <span aria-hidden="true">★</span>
                  <span>{formatRating(rating)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions Column */}
          <div className="flex-1 min-w-0">
            {/* Desktop Title */}
            <h1 className="hidden md:block text-3xl lg:text-5xl font-bold font-display tracking-tight text-text-primary">
              {title}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p className="mt-2 text-sm md:text-base italic text-accent font-medium">{tagline}</p>
            )}

            {/* Metadata Row (Year, Runtime, Rating) */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm text-text-secondary">
              {rating !== undefined && rating > 0 && (
                <div
                  role="img"
                  aria-label={`Rated ${formatRating(rating)} out of 10`}
                  className="inline-flex items-center gap-1 rounded-md bg-accent/15 border border-accent/30 px-2.5 py-1 text-xs font-bold text-accent"
                >
                  <span aria-hidden="true">★</span>
                  <span>{formatRating(rating)}</span>
                  <span className="text-text-muted font-normal">/ 10</span>
                </div>
              )}

              {year && (
                <span className="flex items-center gap-1 text-text-secondary">
                  <Calendar size={14} aria-hidden="true" />
                  <span>{year}</span>
                </span>
              )}

              {runtime ? (
                <span className="flex items-center gap-1 text-text-secondary">
                  <Clock size={14} aria-hidden="true" />
                  <span>{formatRuntime(runtime)}</span>
                </span>
              ) : null}

              {mediaType === 'tv' && tv && (
                <span className="text-text-secondary font-medium">
                  {tv.number_of_seasons} {tv.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                </span>
              )}
            </div>

            {/* Genre Chips */}
            {genres && genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full bg-white/5 border border-border-default px-3 py-1 text-xs font-semibold text-text-secondary"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview with Toggle */}
            {overview && (
              <div className="mt-6 max-w-3xl">
                <p
                  className={`text-sm md:text-base leading-relaxed text-text-secondary transition-opacity ${
                    overviewExpanded ? '' : 'line-clamp-3'
                  }`}
                >
                  {overview}
                </p>
                {overview.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setOverviewExpanded((prev) => !prev)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-light cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    <span>{overviewExpanded ? 'Show less' : 'Read more'}</span>
                    {overviewExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            )}

            {/* Director Credit */}
            {director && (
              <p className="mt-4 text-xs md:text-sm text-text-muted">
                Directed by <span className="text-text-primary font-medium">{director.name}</span>
              </p>
            )}

            {/* Action Buttons Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={`/watch/${mediaType}/${numericId}`}>
                <Button variant="primary" className="inline-flex items-center gap-2">
                  <Play size={18} className="fill-current" aria-hidden="true" />
                  <span>Watch Now</span>
                </Button>
              </Link>

              {trailer && (
                <Button
                  ref={trailerTriggerRef}
                  variant="ghost"
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2"
                >
                  <span>Watch Trailer</span>
                </Button>
              )}

              <button
                type="button"
                onClick={toggleWatchlist}
                className={`flex h-11 w-11 items-center justify-center rounded-full border cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  inWatchlist
                    ? 'bg-accent text-on-accent border-accent font-bold'
                    : 'bg-black/60 border-border-default text-text-primary hover:border-border-strong'
                }`}
                aria-pressed={inWatchlist}
                aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Top Cast Section */}
        {credits?.cast && credits.cast.length > 0 && (
          <section aria-labelledby="cast-heading" className="mt-14">
            <h2 id="cast-heading" className="mb-4 text-lg md:text-xl font-semibold text-text-primary tracking-tight">
              Top Cast
            </h2>
            <ScrollContainer>
              {credits.cast.slice(0, 20).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </ScrollContainer>
          </section>
        )}

        {/* Seasons & Episodes Section (TV only) */}
        {mediaType === 'tv' && tv?.seasons && tv.seasons.length > 0 && (
          <section aria-labelledby="episodes-heading" className="mt-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 id="episodes-heading" className="text-lg md:text-xl font-semibold text-text-primary tracking-tight">
                  Episodes
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Select a season and episode to start watching</p>
              </div>

              {/* Season Selector Tabs */}
              <div
                role="tablist"
                aria-label="Season selector"
                className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 p-1 rounded-lg bg-bg-surface border border-border-default"
              >
                {tv.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => {
                    const isSelected = selectedSeason === season.season_number;
                    return (
                      <button
                        key={season.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedSeason(season.season_number)}
                        className={`min-h-[44px] flex-shrink-0 rounded-md px-4 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isSelected
                            ? 'bg-accent text-on-accent shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                      >
                        Season {season.season_number}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Episode List */}
            {seasonData?.episodes && (
              <div className="space-y-3">
                {seasonData.episodes.map((ep) => {
                  const fallbackImage = backdropSrc || posterSrc;
                  const thumbnailSrc = ep.still_path
                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                    : fallbackImage;

                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${numericId}?s=${ep.season_number}&e=${ep.episode_number}`}
                      className="group relative flex flex-col sm:flex-row gap-4 sm:items-center rounded-lg p-3 sm:p-4 bg-bg-surface/60 hover:bg-bg-elevated border border-border-default hover:border-border-strong transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                    >
                      {/* Episode Number (Desktop) */}
                      <span className="hidden sm:block w-8 text-center text-lg font-bold text-text-muted group-hover:text-accent transition-colors flex-shrink-0">
                        {ep.episode_number}
                      </span>

                      {/* Episode Thumbnail with Always-Visible Play Affordance */}
                      <div className="relative flex-shrink-0 w-full sm:w-48 md:w-56 aspect-video overflow-hidden rounded-md bg-poster-fallback border border-border-subtle">
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-102"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-text-muted">
                            EP {ep.episode_number}
                          </div>
                        )}

                        {/* Always-Visible Play Badge */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 border border-white/20 text-text-primary group-hover:scale-105 group-hover:bg-accent group-hover:text-on-accent transition-[transform,background-color,color] duration-150 shadow-md">
                            <Play size={16} className="fill-current ml-0.5" aria-hidden="true" />
                          </div>
                        </div>

                        {/* Runtime Chip */}
                        {ep.runtime ? (
                          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-text-primary">
                            {ep.runtime}m
                          </span>
                        ) : null}
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            title={ep.name}
                            className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent transition-colors truncate"
                          >
                            <span className="sm:hidden mr-1.5 text-text-muted font-normal">
                              {ep.episode_number}.
                            </span>
                            {ep.name}
                          </h3>

                          {ep.vote_average > 0 && (
                            <span
                              role="img"
                              aria-label={`Rated ${formatRating(ep.vote_average)} out of 10`}
                              className="inline-flex items-center gap-1 rounded bg-white/5 border border-border-subtle px-2 py-0.5 text-xs font-semibold text-accent"
                            >
                              <span aria-hidden="true">★</span>
                              <span>{formatRating(ep.vote_average)}</span>
                            </span>
                          )}
                        </div>

                        {ep.overview ? (
                          <p className="mt-1.5 text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
                            {ep.overview}
                          </p>
                        ) : null}

                        <div className="mt-2.5 flex items-center gap-3 text-xs text-text-muted">
                          {ep.air_date && <span>Aired: {ep.air_date}</span>}
                          {ep.runtime && <span>• {ep.runtime} min</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Similar Titles Section */}
        {similar?.results && similar.results.length > 0 && (
          <section aria-labelledby="similar-heading" className="mt-14 mb-8">
            <h2 id="similar-heading" className="mb-4 text-lg md:text-xl font-semibold text-text-primary tracking-tight">
              Similar Titles
            </h2>
            <ScrollContainer role="region" aria-label="Similar Titles">
              {similar.results.map((item) => (
                <MovieCard
                  key={item.id}
                  item={{ ...item, media_type: mediaType }}
                />
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>

      {/* Trailer Modal Dialog */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Trailer: ${title}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => {
              setShowTrailer(false);
              trailerTriggerRef.current?.focus();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold text-text-primary truncate">
                  Trailer — {title}
                </span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => {
                    setShowTrailer(false);
                    trailerTriggerRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md min-h-[44px] bg-white/10 hover:bg-white/20 text-text-primary text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  aria-label="Close trailer dialog"
                >
                  <X size={16} aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border-default bg-black shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                  title={trailer.name}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
