/**
 * DramaBox & ReelShort Live Streaming Platform + Infinite Reels Engine
 * Exact parity with https://reels.7xmtools.com/ & https://apireel.7xm.dev/
 * Integrated into CiNiBai's optical-grade visionOS liquid glass design system.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDramaBoxStore } from '../stores/dramaboxStore';
import { DramaNavbar } from '../components/dramabox/DramaNavbar';
import { DramaHomeView } from '../components/dramabox/DramaHomeView';
import { DramaAllMoviesView } from '../components/dramabox/DramaAllMoviesView';
import { DramaNewReleaseView } from '../components/dramabox/DramaNewReleaseView';
import { DramaHistoryView } from '../components/dramabox/DramaHistoryView';
import { DramaPlayerModal } from '../components/dramabox/DramaPlayerModal';
import { DramaAuthModal } from '../components/dramabox/DramaAuthModal';
import { DramaSearchModal } from '../components/dramabox/DramaSearchModal';
import { ReelsFeed } from '../components/reels/ReelsFeed';
import { SEO } from '../components/common/SEO';
import type { DramaViewTab } from '../lib/reels/dramaboxTypes';

export function ReelsPage() {
  const { activeTab, setActiveTab } = useDramaBoxStore();
  const [searchParams] = useSearchParams();

  // Sync with URL params if provided (?tab=all-movies, etc.)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as DramaViewTab;
    if (tabParam && ['home', 'all-movies', 'new-release', 'history', 'infinite-feed'].includes(tabParam)) {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, activeTab, setActiveTab]);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f4f4f7] selection:bg-rose-500/30 selection:text-white">
      <SEO
        title="DramaBox & Reels - Short Drama Cinema & Live Streams - CiNiBai"
        description="Stream real-time trending mini-series, billionaire dramas, werewolf romances, and iconic cinema sequences in optical visionOS liquid glass."
      />

      {/* DramaBox Sticky Navbar */}
      <DramaNavbar />

      {/* Main Tab Content */}
      <main className="w-full">
        {activeTab === 'home' && <DramaHomeView />}
        {activeTab === 'all-movies' && <DramaAllMoviesView />}
        {activeTab === 'new-release' && <DramaNewReleaseView />}
        {activeTab === 'history' && <DramaHistoryView />}
        {activeTab === 'infinite-feed' && (
          <div className="relative w-full h-[calc(100dvh-4rem)] overflow-hidden">
            <ReelsFeed />
          </div>
        )}
      </main>

      {/* Global Interactive Modals */}
      <DramaPlayerModal />
      <DramaAuthModal />
      <DramaSearchModal />
    </div>
  );
}
