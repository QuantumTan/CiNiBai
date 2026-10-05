/**
 * DramaBox Home View
 * 1-to-1 match with https://reels.7xmtools.com/ Home page:
 * - Full-width Trending No. 1 Spotlight Hero
 * - Curated themed shelves: Trending Now, Billionaires, Werewolf/Alphas, Rebirth & Power, Romance
 */

import { useEffect, useState } from 'react';
import { dramaboxApi } from '../../lib/reels/dramaboxApi';
import type { DramaSeries } from '../../lib/reels/dramaboxTypes';
import { DramaHeroBanner } from './DramaHeroBanner';
import { DramaSeriesShelf } from './DramaSeriesShelf';

export function DramaHomeView() {
  const [trending, setTrending] = useState<DramaSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    dramaboxApi.getTrendingSeries().then((data) => {
      if (isCurrent) {
        setTrending(data);
        setIsLoading(false);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (isLoading || trending.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="w-full h-[480px] bg-white/[0.04] rounded-3xl" />
        <div className="h-6 w-48 bg-white/[0.06] rounded-lg" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-44 aspect-[2/3] rounded-2xl bg-white/[0.03] flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const spotlight = trending[0];

  // Partition trending items into themed shelves matching 7xmtools categorization
  const trendingNow = trending.slice(0, 16);

  const billionaires = trending.filter(
    (s) =>
      s.theme?.some((t) => /billionaire|ceo|money|rich/i.test(t)) ||
      /billionaire|ceo|heiress|marriage|groom|contract/i.test(s.title)
  );

  const werewolfAndFantasy = trending.filter(
    (s) =>
      s.theme?.some((t) => /werewolf|alpha|vampire|magic|god/i.test(t)) ||
      /alpha|luna|werewolf|god|dragon|beast/i.test(s.title)
  );

  const rebirthAndRevenge = trending.filter(
    (s) =>
      s.theme?.some((t) => /revenge|rebirth|urban/i.test(t)) ||
      /reborn|revenge|caged|king|dead|ex-husband/i.test(s.title)
  );

  const romanceAndSweet = trending.filter(
    (s) =>
      !billionaires.includes(s) &&
      !werewolfAndFantasy.includes(s) &&
      !rebirthAndRevenge.includes(s)
  );

  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* 1. Hero Banner Spotlight */}
      <DramaHeroBanner series={spotlight} />

      {/* 2. Shelves */}
      <DramaSeriesShelf
        title="Trending Now"
        subtitle="Most watched mini-series episodes this week"
        items={trendingNow}
      />

      {billionaires.length > 0 && (
        <DramaSeriesShelf
          title="Billionaires & CEO Romance"
          subtitle="Contract marriages, ruthless CEOs, and secret heiresses"
          items={billionaires}
        />
      )}

      {werewolfAndFantasy.length > 0 && (
        <DramaSeriesShelf
          title="Werewolf & Urban Fantasy"
          subtitle="Alphas, forgotten bloodlines, and mythical awakenings"
          items={werewolfAndFantasy}
        />
      )}

      {rebirthAndRevenge.length > 0 && (
        <DramaSeriesShelf
          title="Rebirth & Urban Revenge"
          subtitle="Second chances, payback, and ruthless comebacks"
          items={rebirthAndRevenge}
        />
      )}

      {romanceAndSweet.length > 0 && (
        <DramaSeriesShelf
          title="High Stakes & Passion"
          subtitle="Thrilling plot twists and dramatic romance"
          items={romanceAndSweet.slice(0, 16)}
        />
      )}
    </div>
  );
}
