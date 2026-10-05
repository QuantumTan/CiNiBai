/**
 * Reels Page Route Component (§8)
 * Path: src/app/(browse)/reels/page.tsx
 * Mounts the Infinite Reels Engine with optical-grade spatial visionOS design.
 */
import { ReelsFeed } from '../../../components/reels/ReelsFeed';

export default function ReelsPage() {
  return (
    <main className="w-full h-full min-h-screen bg-[#060709] overflow-hidden">
      <ReelsFeed />
    </main>
  );
}
