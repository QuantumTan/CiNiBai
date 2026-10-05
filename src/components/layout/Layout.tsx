import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingNavDock } from './FloatingNavDock';
import { Footer } from './Footer';
import { RefractionFilter } from '../glass/RefractionFilter';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08080a]">
      {/* Global SVG Refraction Displacement Filter */}
      <RefractionFilter />

      {/* Spatial Liquid Glass Top Navbar */}
      <Navbar />

      {/* Main Content Area with bottom clearance for mobile navigation */}
      <main className="flex-1 pb-20 md:pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Adaptive iOS / visionOS Liquid Glass Nav Dock */}
      <FloatingNavDock />
    </div>
  );
}
