import { Outlet } from 'react-router-dom';
import { FloatingNavDock } from './FloatingNavDock';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08080a]">
      {/* Floating Adaptive Liquid Glass Nav Dock */}
      <FloatingNavDock />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Dock */}
      <BottomNav />

      {/* Safe Spacer for Mobile Bottom Bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}
