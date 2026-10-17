// Reels & Short Drama Stream Provider Registry
// Modeled 1-to-1 with CineBai's Movie/TV providers (src/api/providers.ts)

export interface ReelStreamProvider {
  id: 'hls-direct' | 'official-embed' | 'cloud-mirror';
  name: string;
  badge?: string;
  description: string;
}

export const REEL_PROVIDERS: ReelStreamProvider[] = [
  {
    id: 'hls-direct',
    name: 'ReelCDN (Direct HLS)',
    badge: 'Recommended',
    description: 'High-speed native .m3u8 streaming with visionOS playback controls',
  },
  {
    id: 'official-embed',
    name: 'Official Web Stream',
    badge: 'Multi-Episode',
    description: 'Official continuous web player for this short drama series',
  },
  {
    id: 'cloud-mirror',
    name: 'Cloud Mirror CDN',
    badge: 'Backup',
    description: 'High-availability fallback streaming mirror',
  },
];

export function getReelProviders(): ReelStreamProvider[] {
  return REEL_PROVIDERS;
}

export function getDefaultReelProvider(): ReelStreamProvider {
  return REEL_PROVIDERS[0];
}

/**
 * Checks if a given stream URL is an embed web player or direct media file
 */
export function isEmbedUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.includes('/embed/') ||
    url.includes('reelshort.com/en/embed') ||
    url.includes('dramabox.com') ||
    url.includes('player.') ||
    url.endsWith('.html') ||
    !url.includes('.m3u8') && !url.includes('.mp4')
  );
}

/**
 * Generates an official embed URL for a given series and chapter
 */
export function getOfficialEmbedUrl(bookId: string, chapterId: string = '1y6ssuu6'): string {
  const cleanId = bookId.replace(/^db-/, '');
  return `https://www.reelshort.com/embed/${cleanId}-${chapterId}`;
}
