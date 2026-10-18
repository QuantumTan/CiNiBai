// Provider IDs as constants
export const PROVIDER_IDS = {
  VIDLINK: 'mirror-1',
  CINESRC: 'mirror-2',
  VIDSRC: 'mirror-3',
  VIDSRC_CC: 'mirror-4',
  AUTOEMBED: 'mirror-5',
} as const;

export interface EmbedSource {
  id: string;
  name: string;
  badge?: string;
  host: string;
  needsImdbId?: boolean;
  getMovieUrl: (tmdbId: number, imdbId?: string | null, autoPlay?: boolean) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number, imdbId?: string | null, autoPlay?: boolean) => string;
}

// Mirrors ranked by playback responsiveness, buffer rate, and minimal overlays
const providers: EmbedSource[] = [
  {
    id: PROVIDER_IDS.VIDLINK,
    name: 'Mirror 1 (VidLink)',
    badge: 'Recommended',
    host: 'vidlink.pro',
    getMovieUrl: (tmdbId, _imdbId, autoPlay = true) =>
      `https://vidlink.pro/movie/${tmdbId}?autoplay=${autoPlay ? 'true' : 'false'}`,
    getTVUrl: (tmdbId, season, episode, _imdbId, autoPlay = true) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=${autoPlay ? 'true' : 'false'}&nextbutton=true`,
  },
  {
    id: PROVIDER_IDS.CINESRC,
    name: 'Mirror 2 (CineSrc)',
    badge: 'Fast',
    host: 'cinesrc.st',
    getMovieUrl: (tmdbId) => `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC,
    name: 'Mirror 3 (VidSrc)',
    host: 'vidsrc.to',
    getMovieUrl: (tmdbId, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/movie/${tmdbId}?autoplay=${autoPlay ? 1 : 0}`,
    getTVUrl: (tmdbId, season, episode, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}?autoplay=${autoPlay ? 1 : 0}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_CC,
    name: 'Mirror 4 (VidSrc CC)',
    host: 'vidsrc.cc',
    needsImdbId: true,
    getMovieUrl: (tmdbId, imdbId, autoPlay = false) =>
      `https://vidsrc.cc/v2/embed/movie/${imdbId || tmdbId}?poster=true&autoPlay=${autoPlay ? 'true' : 'false'}`,
    getTVUrl: (tmdbId, season, episode, imdbId, autoPlay = false) =>
      `https://vidsrc.cc/v2/embed/tv/${imdbId || tmdbId}/${season}/${episode}?poster=true&autoPlay=${autoPlay ? 'true' : 'false'}`,
  },
  {
    id: PROVIDER_IDS.AUTOEMBED,
    name: 'Mirror 5 (AutoEmbed)',
    host: 'player.autoembed.cc',
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
];

export function getProviders(imdbId?: string | null): EmbedSource[] {
  if (!imdbId) {
    return providers.filter((p) => !p.needsImdbId);
  }
  return providers;
}

export function getDefaultProvider(imdbId?: string | null): EmbedSource {
  const activeProviders = getProviders(imdbId);
  return activeProviders[0] || providers[0];
}

export function getProviderById(id: string, imdbId?: string | null): EmbedSource | undefined {
  const activeProviders = getProviders(imdbId);
  return activeProviders.find((p) => p.id === id);
}

/**
 * Fast client-side health ping to verify whether an embed domain is accessible
 */
export async function testServerConnectivity(url: string, timeoutMs: number = 2200): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}
