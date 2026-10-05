export interface ReelEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  videoUrl: string;
  videoType: 'mp4' | 'youtube' | 'hls';
  thumbnail: string;
  likes: number;
  commentsCount: number;
}

export interface ReelDrama {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  coverImage: string;
  verticalPoster: string;
  totalEpisodes: number;
  tags: string[];
  platform: 'ReelShort' | 'DramaBox' | 'ShortMax';
  rating: number;
  views: string;
  episodes: ReelEpisode[];
}

export const CURATED_REELS: ReelDrama[] = [
  {
    id: 'billionaire-husband',
    title: 'The Double Life of My Billionaire Husband',
    tagline: 'He married her as a penniless ex-con, but he owns the city.',
    synopsis: 'To pay for her mother’s life-saving surgery, Natalie agrees to marry Sebastian, an estranged ex-convict shunned by society. Little does she know, he is secretly the elusive trillionaire CEO of the Klein Conglomerate who only married her to escape a family feud.',
    coverImage: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1080&q=80',
    verticalPoster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=720&q=80',
    totalEpisodes: 48,
    tags: ['Billionaire', 'Secret Identity', 'Romance', 'Revenge'],
    platform: 'ReelShort',
    rating: 9.6,
    views: '542M',
    episodes: [
      {
        id: 'bh-ep-1',
        episodeNumber: 1,
        title: 'The Sham Marriage',
        duration: '1:52',
        videoUrl: 'https://www.youtube-nocookie.com/embed/S20C3_qJqX4?autoplay=1&mute=0&controls=0&loop=1&playlist=S20C3_qJqX4&playsinline=1&rel=0&modestbranding=1',
        videoType: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&q=80',
        likes: 142800,
        commentsCount: 3820,
      },
      {
        id: 'bh-ep-2',
        episodeNumber: 2,
        title: 'Dinner with the In-Laws',
        duration: '1:45',
        videoUrl: 'https://www.youtube-nocookie.com/embed/bN5H3o8z490?autoplay=1&mute=0&controls=0&loop=1&playlist=bN5H3o8z490&playsinline=1&rel=0&modestbranding=1',
        videoType: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=80',
        likes: 128400,
        commentsCount: 2910,
      },
      {
        id: 'bh-ep-3',
        episodeNumber: 3,
        title: 'The Black Amex Card',
        duration: '2:04',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=480&q=80',
        likes: 119500,
        commentsCount: 2450,
      },
    ],
  },
  {
    id: 'forbidden-alpha',
    title: 'Fated to My Forbidden Alpha',
    tagline: 'Exiled as a rogue, claimed by the most ruthless wolf alive.',
    synopsis: 'Betrayed by her birth pack and cast out into the winter wilderness, Selene expects death. Instead, she awakens in the fortress of Jackson—the legendary Blood Moon Alpha whom all packs fear. When their eyes meet, the ancient mate bond ignites.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&q=80',
    verticalPoster: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=720&q=80',
    totalEpisodes: 52,
    tags: ['Werewolf', 'Alpha', 'Supernatural', 'Fantasy Romance'],
    platform: 'ReelShort',
    rating: 9.8,
    views: '418M',
    episodes: [
      {
        id: 'fa-ep-1',
        episodeNumber: 1,
        title: 'The Rogue’s Exile',
        duration: '2:10',
        videoUrl: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw?autoplay=1&mute=0&controls=0&loop=1&playlist=jNQXAC9IVRw&playsinline=1&rel=0&modestbranding=1',
        videoType: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=480&q=80',
        likes: 198500,
        commentsCount: 5120,
      },
      {
        id: 'fa-ep-2',
        episodeNumber: 2,
        title: 'The Mate Bond Ignites',
        duration: '1:58',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=480&q=80',
        likes: 165400,
        commentsCount: 4200,
      },
    ],
  },
  {
    id: 'billionaire-heiress',
    title: 'Never Divorce a Secret Billionaire Heiress',
    tagline: 'Three years as a quiet housewife was enough. The queen is back.',
    synopsis: 'For three years, Chloe endured humiliation from her husband’s arrogant family while disguising her true wealth. When he asks for a divorce to pursue a gold-digger, Chloe signs without hesitation—and walks straight into the boardroom of the trillion-dollar group she owns.',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1080&q=80',
    verticalPoster: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=720&q=80',
    totalEpisodes: 60,
    tags: ['Billionaire', 'Strong Female Lead', 'Revenge', 'Drama'],
    platform: 'ReelShort',
    rating: 9.7,
    views: '610M',
    episodes: [
      {
        id: 'heiress-ep-1',
        episodeNumber: 1,
        title: 'The Divorce Agreement',
        duration: '1:48',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=480&q=80',
        likes: 245000,
        commentsCount: 6890,
      },
      {
        id: 'heiress-ep-2',
        episodeNumber: 2,
        title: 'The Gala Unmasking',
        duration: '2:05',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=480&q=80',
        likes: 218000,
        commentsCount: 5410,
      },
    ],
  },
  {
    id: 'mafia-king',
    title: 'Bound by Debt to the Mafia King',
    tagline: 'Her father’s debt bought her freedom away. But who will save him from her?',
    synopsis: 'Elena thought her life was quiet until her father bet on borrowed mob money and vanished. To clear the ledger, Matteo Moretti—the ruthless capo of Chicago—claims Elena as his personal collateral.',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&q=80',
    verticalPoster: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=720&q=80',
    totalEpisodes: 42,
    tags: ['Mafia', 'Dark Romance', 'Suspense', 'Enemies to Lovers'],
    platform: 'ReelShort',
    rating: 9.5,
    views: '320M',
    episodes: [
      {
        id: 'mk-ep-1',
        episodeNumber: 1,
        title: 'Midnight Reckoning',
        duration: '2:15',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&q=80',
        likes: 189000,
        commentsCount: 3950,
      },
    ],
  },
  {
    id: 'fatal-attraction-ceo',
    title: 'Fatal Attraction to Mr. President',
    tagline: 'Keep your enemies close, and your new CEO even closer.',
    synopsis: 'To clear her framed family name, investigative accountant Vivian accepts a role as personal executive assistant to ruthless conglomerate leader Zachary Vance. But in the skyscraper of secrets, every glance is a battle.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&q=80',
    verticalPoster: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=720&q=80',
    totalEpisodes: 45,
    tags: ['CEO', 'Office Romance', 'Thriller', 'Mystery'],
    platform: 'DramaBox',
    rating: 9.4,
    views: '280M',
    episodes: [
      {
        id: 'fa-ceo-1',
        episodeNumber: 1,
        title: 'The 50th Floor Interview',
        duration: '1:55',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        videoType: 'mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=80',
        likes: 154000,
        commentsCount: 2980,
      },
    ],
  },
];

/**
 * Extensible API Adapter to fetch reel dramas
 * Can be swapped or configured to call external scraper endpoints (like DramaBos or FreeReels API)
 */
export async function getReelsFeed(): Promise<ReelDrama[]> {
  // Simulating async network fetch with instant local fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CURATED_REELS);
    }, 150);
  });
}

export async function getReelDramaById(id: string): Promise<ReelDrama | null> {
  const all = await getReelsFeed();
  return all.find((d) => d.id === id) || null;
}
