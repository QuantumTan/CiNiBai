import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Calendar, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMovieDetails, useTVDetails, useTVSeasonDetails } from '../hooks/useTMDB';
import { getBackdropUrl, getPosterUrl } from '../api/tmdb';
import {
  formatRuntime,
  getYear,
  formatRating,
} from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { CastCard } from '../components/cards/CastCard';
import { MovieCard } from '../components/cards/MovieCard';
import { ScrollContainer } from '../components/ui/ScrollContainer';
import { DetailPageSkeleton } from '../components/ui/Skeleton';
import { useWatchlistStore } from '../store/watchlistStore';
import { SEO } from '../components/common/SEO';
import { useAmbientCanvas } from '../context/AmbientCanvasContext';

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
  const { extractAndSetAmbientColor } = useAmbientCanvas();

  const backdrop = (mediaType === 'movie' ? movie?.backdrop_path : tv?.backdrop_path) ?? null;
  const poster = (mediaType === 'movie' ? movie?.poster_path : tv?.poster_path) ?? null;

  // Dynamically sample dominant palette from media artwork
  useEffect(() => {
    const backdropUrl = backdrop ? getBackdropUrl(backdrop, 'w780') : (poster ? getPosterUrl(poster, 'w500') : null);
    if (backdropUrl) {
      extractAndSetAmbientColor(backdropUrl);
    }
  }, [backdrop, poster, extractAndSetAmbientColor]);

  if (isLoading) return <DetailPageSkeleton />;

  // Determine data based on media type
  const title = mediaType === 'movie' ? movie?.title : tv?.name;
  const overview = mediaType === 'movie' ? movie?.overview : tv?.overview;
  const rating = mediaType === 'movie' ? movie?.vote_average : tv?.vote_average;
  const year = mediaType === 'movie' ? getYear(movie?.release_date) : getYear(tv?.first_air_date);
  const genres = mediaType === 'movie' ? movie?.genres : tv?.genres;
  const runtime = mediaType === 'movie' ? movie?.runtime : (tv?.episode_run_time?.[0] || null);
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

  // Find trailer
  const trailer = videos?.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) || videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');


  const director = credits?.crew.find((c) => c.job === 'Director');

  // Schema.org structured data for Google
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
    name: title,
    description: overview,
    image: poster ? getPosterUrl(poster, 'w500') : undefined,
    datePublished: mediaType === 'movie' ? movie?.release_date : tv?.first_air_date,
    genre: genres?.map((g) => g.name),
    ...(rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        bestRating: '10',
        worstRating: '1',
        ratingCount: mediaType === 'movie' ? movie?.vote_count : tv?.vote_count,
      },
    } : {}),
    ...(director ? {
      director: {
        '@type': 'Person',
        name: director.name,
      },
    } : {}),
  };

  return (
    <div>
      <SEO
        title={`${title || 'Movie'} ${year ? `(${year})` : ''} - Watch Free Online`}
        description={overview || `Watch ${title} online for free in HD on CineBai.`}
        image={poster ? getPosterUrl(poster, 'w500') : undefined}
        type={mediaType === 'movie' ? 'video.movie' : 'video.tv_show'}
        schema={schemaData}
      />
      {/* Backdrop Hero */}
      <div className="relative h-[70vh] min-h-[400px] w-full">
        <img
          src={getBackdropUrl(backdrop, 'original')}
          alt={title || ''}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-48 z-10 mx-auto max-w-7xl px-4 lg:px-8 pb-40">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden flex-shrink-0 md:block"
          >
            <img
              src={getPosterUrl(poster, 'w500')}
              alt={title || ''}
              className="w-64 rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            {/* Title */}
            <h1
              className="text-3xl font-black text-white md:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p className="mt-2 text-base italic text-gold">{tagline}</p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {rating !== undefined && <Rating value={rating} size="md" />}
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {year}
                </span>
              )}
              {runtime ? (
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {formatRuntime(runtime)}
                </span>
              ) : null}
              {mediaType === 'tv' && tv && (
                <span>{tv.number_of_seasons} Season{tv.number_of_seasons !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Genres */}
            {genres && genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span
                    key={g.id}
                    className="apple-glass-thin rounded-full px-3 py-1 text-xs font-semibold text-slate-300 shadow-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="mt-6 max-w-2xl leading-relaxed text-slate-300">
              {overview}
            </p>

            {/* Director */}
            {director && (
              <p className="mt-4 text-sm text-slate-400">
                Directed by <span className="text-white font-medium">{director.name}</span>
              </p>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={`/watch/${mediaType}/${numericId}`}>
                <Button variant="gold" size="lg" className="rounded-full px-8 py-3.5 font-bold shadow-xl">
                  <Play size={20} className="fill-current" /> Watch Now
                </Button>
              </Link>
              {trailer && (
                <Button variant="outline" size="lg" onClick={() => setShowTrailer(true)} className="apple-glass-regular rounded-full px-6 py-3.5 font-semibold text-white shadow-lg hover:border-amber-400/50">
                  Watch Trailer
                </Button>
              )}
              <button
                onClick={toggleWatchlist}
                className={`rounded-full p-3.5 transition-all duration-200 shadow-md ${
                  inWatchlist
                    ? 'bg-amber-400 text-black shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                    : 'apple-glass-regular text-white hover:border-amber-400/50'
                }`}
                aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Cast */}
        {credits?.cast && credits.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-white tracking-tight">Top Cast</h2>
            <ScrollContainer>
              {credits.cast.slice(0, 20).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </ScrollContainer>
          </section>
        )}

        {/* Seasons (TV only) */}
        {mediaType === 'tv' && tv?.seasons && tv.seasons.length > 0 && (
          <section className="mt-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Episodes</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select a season and episode to start watching</p>
              </div>

              {/* Season selector */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar p-1 rounded-full bg-white/[0.04] border border-white/10">
                {tv.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        selectedSeason === season.season_number
                          ? 'ios-active-lens text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
              </div>
            </div>

            {/* Episode list */}
            {seasonData?.episodes && (
              <div className="space-y-3">
                {seasonData.episodes.map((ep) => {
                  const fallbackImage = backdrop ? getBackdropUrl(backdrop, 'w780') : poster ? getPosterUrl(poster, 'w500') : null;
                  const thumbnailSrc = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : fallbackImage;

                  return (
                    <Link
                      key={ep.id}
                      to={`/watch/tv/${numericId}?s=${ep.season_number}&e=${ep.episode_number}`}
                      className="group relative flex flex-col sm:flex-row gap-4 sm:items-center rounded-2xl p-3 sm:p-4 bg-white/[0.025] hover:bg-white/[0.07] border border-white/5 hover:border-white/20 transition-all duration-200"
                    >
                      {/* Episode Number (Desktop) */}
                      <span className="hidden sm:block w-8 text-center text-xl font-bold text-slate-500 group-hover:text-amber-300 transition-colors flex-shrink-0">
                        {ep.episode_number}
                      </span>

                      {/* Episode Thumbnail */}
                      <div className="relative flex-shrink-0 w-full sm:w-48 md:w-56 aspect-video overflow-hidden rounded-xl bg-neutral-900 shadow-md ring-1 ring-white/10">
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={ep.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-500">EP {ep.episode_number}</span>
                          </div>
                        )}

                        {/* Ambient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Runtime Chip */}
                        {ep.runtime ? (
                          <span className="apple-glass-thin absolute bottom-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
                            {ep.runtime}m
                          </span>
                        ) : null}

                        {/* Hover Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl text-black">
                            <Play size={16} className="fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                            <span className="sm:hidden mr-1.5 text-slate-400 font-normal">{ep.episode_number}.</span>
                            {ep.name}
                          </h3>
                          {ep.vote_average > 0 && (
                            <span className="apple-glass-thin flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              {formatRating(ep.vote_average)}
                            </span>
                          )}
                        </div>

                        {ep.overview ? (
                          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {ep.overview}
                          </p>
                        ) : null}

                        <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 font-medium">
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

        {/* Similar */}
        {similar?.results && similar.results.length > 0 && (
          <section className="mt-12 pb-36">
            <h2 className="mb-4 text-xl font-bold text-gold-gradient">Similar Titles</h2>
            <ScrollContainer>
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

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTrailer(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gold transition-colors text-sm"
            >
              Close
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
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
    </div>
  );
}
