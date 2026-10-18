import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';
import { MovieCard } from '../components/cards/MovieCard';
import { useWatchlistStore } from '../store/watchlistStore';
import { useAmbientStore } from '../stores/ambient';
import { getPosterUrl } from '../api/tmdb';

export function WatchlistPage() {
  const { items, clearWatchlist } = useWatchlistStore();
  const setColorsFromImage = useAmbientStore((s) => s.setColorsFromImage);

  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'rating'>('added');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sample ambient color from first watchlist item
  useEffect(() => {
    if (items.length > 0 && items[0]?.posterPath) {
      setColorsFromImage(getPosterUrl(items[0].posterPath, 'w500'));
    }
  }, [items, setColorsFromImage]);

  // Filter & Sort items
  const processedItems = useMemo(() => {
    let result = [...items];

    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
    }
    // 'added' is preserved in storage order (or reversed if prepend)

    return result;
  }, [items, filterType, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8">
      <SEO
        title="My Watchlist - CineBai"
        description="View and manage your saved movies and TV shows to watch later on CineBai."
      />

      {/* Back to Browse link */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1 px-1.5"
          aria-label="Back to browse catalog"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3.5 py-1 text-xs font-semibold text-accent mb-3 shadow-sm">
            <Bookmark size={13} aria-hidden="true" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-text-primary">
            My Watchlist
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {items.length} {items.length === 1 ? 'title' : 'titles'} saved to your library
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-error hover:text-error hover:border-error/40 border-border-default"
            aria-label="Clear all items from watchlist"
          >
            <Trash2 size={15} aria-hidden="true" className="mr-1.5" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md rounded-xl bg-bg-surface border border-border-default p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-md"
              aria-label="Cancel clear dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3 text-warning mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                <AlertTriangle size={20} aria-hidden="true" />
              </div>
              <h2 id="clear-dialog-title" className="text-lg font-bold text-text-primary">
                Clear entire watchlist?
              </h2>
            </div>

            <p className="text-sm text-text-secondary mb-6">
              This will remove all {items.length} saved titles from your local storage. This action
              cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  clearWatchlist();
                  setShowClearConfirm(false);
                }}
                className="bg-error text-white hover:bg-error/90"
              >
                Yes, Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting bar (if items present) */}
      {items.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
          {/* Type Filter */}
          <div role="group" aria-label="Filter watchlist by media type" className="flex items-center gap-1.5">
            <button
              type="button"
              aria-pressed={filterType === 'all'}
              onClick={() => setFilterType('all')}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filterType === 'all'
                  ? 'bg-accent text-on-accent'
                  : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              aria-pressed={filterType === 'movie'}
              onClick={() => setFilterType('movie')}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filterType === 'movie'
                  ? 'bg-accent text-on-accent'
                  : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary'
              }`}
            >
              Movies
            </button>
            <button
              type="button"
              aria-pressed={filterType === 'tv'}
              onClick={() => setFilterType('tv')}
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filterType === 'tv'
                  ? 'bg-accent text-on-accent'
                  : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary'
              }`}
            >
              Series
            </button>
          </div>

          {/* Sort Selector */}
          <div role="radiogroup" aria-label="Sort watchlist" className="flex items-center gap-1.5 text-xs">
            <span className="text-text-secondary font-medium mr-1">Sort:</span>
            {[
              { id: 'added', label: 'Recently Added' },
              { id: 'title', label: 'Title' },
              { id: 'rating', label: 'Rating' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={sortBy === s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`min-h-[44px] px-3 rounded-full text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  sortBy === s.id
                    ? 'bg-accent text-on-accent'
                    : 'bg-white/5 border border-border-default text-text-secondary hover:text-text-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-border-default bg-bg-surface text-center px-4 max-w-md mx-auto my-12 shadow-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-border-default mb-4 text-text-secondary">
            <Bookmark size={30} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold font-display text-text-primary">Your watchlist is empty</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-xs">
            Save movies and TV series by tapping the bookmark icon on any poster to build your queue.
          </p>
          <Link to="/" className="mt-6">
            <Button variant="primary">
              Explore Catalog
            </Button>
          </Link>
        </div>
      ) : processedItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-text-secondary">No items match the selected filter.</p>
          <Button
            variant="ghost"
            onClick={() => setFilterType('all')}
            className="mt-4"
          >
            Show All Items
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {processedItems.map((item) => (
            <MovieCard
              key={`${item.type}-${item.id}`}
              item={{
                id: item.id,
                title: item.title,
                poster_path: item.posterPath,
                vote_average: item.voteAverage,
                release_date: item.releaseDate,
                media_type: item.type,
              } as any}
              size="auto"
            />
          ))}
        </div>
      )}
    </div>
  );
}
