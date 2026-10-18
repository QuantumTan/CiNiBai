import { SITE_NAME } from '../../lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-bg-surface/80 backdrop-blur-md py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-text-primary text-base font-display">
              {SITE_NAME}
            </span>
            <span className="rounded-full bg-accent/20 border border-accent/40 px-2.5 py-0.5 text-xs font-semibold text-accent">
              Spatial Edition
            </span>
          </div>

          <div className="flex items-center text-text-secondary text-center md:text-left">
            <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
          </div>

          <div className="text-text-secondary">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
