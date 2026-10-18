import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingDock } from '../dock/FloatingDock';
import { Footer } from './Footer';
import { RefractionFilter } from '../glass/RefractionFilter';
import { AmbientCanvas } from '../ambient/AmbientCanvas';

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-bg-base text-text-primary">
      {/* Skip to Content for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-on-accent focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Skip to content
      </a>

      {/* Global Ambient Atmospheric Mesh Canvas */}
      <AmbientCanvas />

      {/* Global SVG Refraction Displacement Filter */}
      <RefractionFilter />

      {/* Spatial Top Navbar */}
      <Navbar />

      {/* Main Content Area with unified bottom clearance for floating navigation */}
      <main id="main" tabIndex={-1} className="relative z-10 flex-1 pb-24 pb-[env(safe-area-inset-bottom)] focus:outline-none">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Dock & Desktop Spatial Floating Dock */}
      <FloatingDock />
    </div>
  );
}
