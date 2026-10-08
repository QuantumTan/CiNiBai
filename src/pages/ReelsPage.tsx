/**
 * DramaBox & ReelShort Live Streaming Platform + Infinite Reels Engine
 * Exact parity with https://reels.7xmtools.com/ & https://apireel.7xm.dev/
 * Integrated into CiNiBai's optical-grade visionOS liquid glass design system.
 */

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDramaBoxStore } from '../stores/dramaboxStore';
import { dramaboxApi } from '../lib/reels/dramaboxApi';
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
  const { activeTab, setActiveTab, openPlayerModal } = useDramaBoxStore();
  const [searchParams] = useSearchParams();
  const hasLoadedUrlDramaRef = useRef<string | null>(null);

  // Sync with URL params if provided (?tab=all-movies, etc.)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as DramaViewTab;
    if (tabParam && ['home', 'all-movies', 'new-release', 'history', 'infinite-feed'].includes(tabParam)) {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    } else if (searchParams.get('feed') === '1' || searchParams.get('infinite') === '1') {
      if (activeTab !== 'infinite-feed') {
        setActiveTab('infinite-feed');
      }
    }
  }, [searchParams, activeTab, setActiveTab]);

  // Support direct drama linking via ?drama={id} or ?seriesId={id}
  useEffect(() => {
    const dramaId =
      searchParams.get('drama') ||
      searchParams.get('seriesId') ||
      searchParams.get('id');

    if (!dramaId || hasLoadedUrlDramaRef.current === dramaId) return;
    hasLoadedUrlDramaRef.current = dramaId;

    const epParam = searchParams.get('ep') || searchParams.get('episode');
    const targetEpisodeIndex = epParam ? Math.max(1, parseInt(epParam, 10)) : 1;

    // Fetch live series metadata from apireel.7xm.dev and immediately open player
    dramaboxApi.getSeriesDetail(dramaId, undefined, true).then((detail) => {
      if (detail && detail.series) {
        openPlayerModal(detail.series, targetEpisodeIndex);
      } else {
        // Fallback: search trending or construct minimal series object
        dramaboxApi.getTrendingSeries().then((trending) => {
          const match = trending.find((s) => s.id === dramaId);
          if (match) {
            openPlayerModal(match, targetEpisodeIndex);
          } else {
            openPlayerModal(
              {
                id: dramaId,
                title: 'DramaBox Series',
                cover_pic: '',
                description: 'Live streaming mini-series',
                chapter_count: 50,
                read_count: 500000,
                collect_count: 15000,
                theme: ['Trending'],
              },
              targetEpisodeIndex
            );
          }
        });
      }
    });
  }, [searchParams, openPlayerModal]);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#f4f4f7] selection:bg-rose-500/30 selection:text-white">
      <SEO
        title="DramaBox & Reels - Short Drama Cinema & Live Streams - CiNiBai"
        description="Stream real-time trending mini-series, billionaire dramas, werewolf romances, and iconic cinema sequences in optical visionOS liquid glass."
      />

      {activeTab !== 'infinite-feed' && <DramaNavbar />}

      {/* Main Tab Content */}
      <main className="w-full">
        {activeTab === 'home' && <DramaHomeView />}
        {activeTab === 'all-movies' && <DramaAllMoviesView />}
        {activeTab === 'new-release' && <DramaNewReleaseView />}
        {activeTab === 'history' && <DramaHistoryView />}
        {activeTab === 'infinite-feed' && (
          <div className="fixed inset-0 z-40 w-full h-[100dvh] overflow-hidden bg-[#060709]">
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
