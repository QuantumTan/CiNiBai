import { Outlet } from 'react-router-dom';
import { FloatingNavDock } from './FloatingNavDock';
import { Footer } from './Footer';
import { RefractionFilter } from '../glass/RefractionFilter';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08080a]">
      {/* Global SVG Refraction Displacement Filter */}
      <RefractionFilter />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Adaptive iOS / visionOS Liquid Glass Nav Dock */}
      <FloatingNavDock />
    </div>
  );
}
