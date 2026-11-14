import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './components/common/ScrollToTop';
import { detectCapabilities, useCapabilitiesStore } from './lib/capabilities';

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
      staleTime: 5 * 60 * 1000, // 5 min default staleTime
      gcTime: 30 * 60 * 1000, // 30 min cache garbage collection
    },
  },
});

function PageLoader() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 pt-8 md:pt-12 lg:px-8 space-y-6"
    >
      <span className="sr-only">Loading…</span>
      <div className="h-9 w-44 rounded-lg bg-white/5 animate-pulse motion-reduce:animate-none" />
      <div className="aspect-[21/9] max-h-[380px] w-full rounded-2xl bg-white/5 animate-pulse motion-reduce:animate-none" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full rounded-xl bg-white/5 animate-pulse motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    detectCapabilities();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const transQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleCapabilitiesChange = () => {
      useCapabilitiesStore.getState().refresh();
    };

    motionQuery.addEventListener('change', handleCapabilitiesChange);
    colorSchemeQuery.addEventListener('change', handleCapabilitiesChange);
    transQuery.addEventListener('change', handleCapabilitiesChange);
    contrastQuery.addEventListener('change', handleCapabilitiesChange);

    return () => {
      motionQuery.removeEventListener('change', handleCapabilitiesChange);
      colorSchemeQuery.removeEventListener('change', handleCapabilitiesChange);
      transQuery.removeEventListener('change', handleCapabilitiesChange);
      contrastQuery.removeEventListener('change', handleCapabilitiesChange);
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
