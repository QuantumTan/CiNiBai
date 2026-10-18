import { Link } from 'react-router-dom';
import { Home, Compass, AlertCircle } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32 text-center lg:px-8">
      <SEO
        title="Page Not Found - CineBai"
        description="The page you are looking for does not exist on CineBai."
      />

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 border border-accent/40 text-accent mb-6">
        <AlertCircle size={32} aria-hidden="true" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">404 Error</p>
      <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-text-primary">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm sm:text-base text-text-secondary max-w-md mx-auto">
        The title or page you requested could not be located. It might have been moved or doesn't exist.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button variant="primary" className="inline-flex items-center gap-2">
            <Home size={16} aria-hidden="true" />
            <span>Go Home</span>
          </Button>
        </Link>
        <Link to="/movies">
          <Button variant="ghost" className="inline-flex items-center gap-2">
            <Compass size={16} aria-hidden="true" />
            <span>Explore Movies</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
