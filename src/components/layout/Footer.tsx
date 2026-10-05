import { SITE_NAME } from '../../lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#060709]/80 backdrop-blur-md pb-28 md:pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">
              {SITE_NAME}
            </span>
            <span className="apple-glass-thin rounded-full px-2.5 py-0.5 text-[10px] uppercase font-semibold text-amber-300">
              Spatial Edition
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
          </div>

          <div className="text-slate-500 font-medium">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
