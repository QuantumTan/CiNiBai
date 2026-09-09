import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { DetailPage } from './pages/DetailPage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AnimePage } from './pages/AnimePage';
import { NetworkPage } from './pages/NetworkPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
          </Route>
          <Route path="/watch/:type/:id" element={<WatchPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
