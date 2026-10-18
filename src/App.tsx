import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { detectCapabilities } from './lib/capabilities';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const BrowsePage = lazy(() => import('./pages/BrowsePage').then((m) => ({ default: m.BrowsePage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then((m) => ({ default: m.DetailPage })));
const WatchPage = lazy(() => import('./pages/WatchPage').then((m) => ({ default: m.WatchPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then((m) => ({ default: m.WatchlistPage })));
const AnimePage = lazy(() => import('./pages/AnimePage').then((m) => ({ default: m.AnimePage })));
const NetworkPage = lazy(() => import('./pages/NetworkPage').then((m) => ({ default: m.NetworkPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
    >
      <Loader2 className="animate-spin text-accent mb-2" size={32} aria-hidden="true" />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}

function App() {
  useEffect(() => {
    detectCapabilities();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const transQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');

    const updateAttrs = () => {
      if (document.documentElement) {
        document.documentElement.dataset.reducedMotion = motionQuery.matches ? 'true' : 'false';
        document.documentElement.dataset.reducedTransparency = transQuery.matches ? 'true' : 'false';
      }
    };

    motionQuery.addEventListener('change', updateAttrs);
    transQuery.addEventListener('change', updateAttrs);

    return () => {
      motionQuery.removeEventListener('change', updateAttrs);
      transQuery.removeEventListener('change', updateAttrs);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<BrowsePage mediaType="movie" />} />
                <Route path="/tv" element={<BrowsePage mediaType="tv" />} />
                <Route path="/movie/:id" element={<DetailPage mediaType="movie" />} />
                <Route path="/tv/:id" element={<DetailPage mediaType="tv" />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/network/:network" element={<NetworkPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="/watch/:type/:id" element={<WatchPage />} />
            </Routes>
          </Suspense>
          <Analytics />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
