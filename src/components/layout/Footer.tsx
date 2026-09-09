import { SITE_NAME } from '../../lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span
              className="text-gold-gradient text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {SITE_NAME}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-text-muted">
            <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
          </div>

          <div className="text-sm text-text-muted">
            {currentYear} {SITE_NAME}
          </div>
        </div>
      </div>
    </footer>
  );
}
