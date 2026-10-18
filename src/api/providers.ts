// High-availability multi-mirror embed provider registry

export const PROVIDER_IDS = {
  VIDLINK: 'mirror-1',
  CINESRC: 'mirror-2',
  VIDSRC_SU: 'mirror-3',
  VIDSRC_VIP: 'mirror-4',
  AUTOEMBED: 'mirror-5',
  VIDSRC_TO: 'mirror-6',
  MULTIEMBED: 'mirror-7',
  TWO_EMBED: 'mirror-8',
  SMASHY: 'mirror-9',
  // Legacy aliases
  VIDSRC: 'mirror-6',
  VIDSRC_CC: 'mirror-4',
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

// Active, tested streaming embed mirrors ranked by stability and minimal intrusive overlays
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
    id: PROVIDER_IDS.VIDSRC_SU,
    name: 'Mirror 3 (VidSrc SU)',
    badge: 'Ultra HD',
    host: 'vidsrc.su',
    getMovieUrl: (tmdbId) => `https://vidsrc.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_VIP,
    name: 'Mirror 4 (VidSrc VIP)',
    badge: 'Multi-Sub',
    host: 'vidsrc.me',
    getMovieUrl: (tmdbId, imdbId) =>
      `https://vidsrc.me/embed/movie?tmdb=${tmdbId}${imdbId ? `&imdb=${imdbId}` : ''}`,
    getTVUrl: (tmdbId, season, episode, imdbId) =>
      `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}${imdbId ? `&imdb=${imdbId}` : ''}`,
  },
  {
    id: PROVIDER_IDS.AUTOEMBED,
    name: 'Mirror 5 (AutoEmbed)',
    badge: 'Multi-Source',
    host: 'autoembed.co',
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_TO,
    name: 'Mirror 6 (VidSrc TO)',
    badge: 'HD',
    host: 'vidsrc.to',
    getMovieUrl: (tmdbId, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/movie/${tmdbId}?autoplay=${autoPlay ? 1 : 0}`,
    getTVUrl: (tmdbId, season, episode, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}?autoplay=${autoPlay ? 1 : 0}`,
  },
  {
    id: PROVIDER_IDS.MULTIEMBED,
    name: 'Mirror 7 (MultiEmbed)',
    badge: 'Aggregator',
    host: 'multiembed.mov',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: PROVIDER_IDS.TWO_EMBED,
    name: 'Mirror 8 (2Embed)',
    badge: 'Backup',
    host: '2embed.cc',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: PROVIDER_IDS.SMASHY,
    name: 'Mirror 9 (SmashyStream)',
    badge: 'Direct',
    host: 'embed.smashystream.com',
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
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
 * Optional non-blocking client-side health ping.
 * Adblockers and CORS policies often block client-side fetch calls while iframes
 * load without hindrance. This should never gate or disable user playback.
 */
export async function testServerConnectivity(url: string, timeoutMs: number = 2200): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}
