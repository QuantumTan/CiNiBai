// High-availability multi-mirror embed provider registry

export const PROVIDER_IDS = {
  VIDEASY: 'mirror-1',
  VIDLINK: 'mirror-2',
  AUTOEMBED: 'mirror-3',
  VIDSRC_TO: 'mirror-4',
  VIDSRC_SU: 'mirror-5',
  VIDFAST: 'mirror-6',
  EMBEDWAVE: 'mirror-7',
  RIVESTREAM: 'mirror-8',
  MULTIEMBED: 'mirror-9',
  TWO_EMBED: 'mirror-10',
  SMASHY: 'mirror-11',
  VIDSPARK: 'mirror-12',
  VIDSRC_VIP: 'mirror-13',
  GODRIVE: 'mirror-14',
  PSTREAM: 'mirror-15',
  CINESRC: 'mirror-16',
  // Legacy aliases
  VIDSRC: 'mirror-4',
  VIDSRC_CC: 'mirror-13',
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

// Streaming embed mirror list ranked by reliability & speed
const providers: EmbedSource[] = [
  {
    id: PROVIDER_IDS.VIDEASY,
    name: 'Mirror 1 (Videasy - Best)',
    host: 'player.videasy.net',
    getMovieUrl: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDLINK,
    name: 'Mirror 2 (VidLink)',
    host: 'vidlink.pro',
    getMovieUrl: (tmdbId, _imdbId, autoPlay = true) =>
      `https://vidlink.pro/movie/${tmdbId}?autoplay=${autoPlay ? 'true' : 'false'}`,
    getTVUrl: (tmdbId, season, episode, _imdbId, autoPlay = true) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=${autoPlay ? 'true' : 'false'}&nextbutton=true`,
  },
  {
    id: PROVIDER_IDS.AUTOEMBED,
    name: 'Mirror 3 (AutoEmbed)',
    host: 'autoembed.co',
    getMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_TO,
    name: 'Mirror 4 (VidSrc TO)',
    host: 'vidsrc.to',
    getMovieUrl: (tmdbId, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/movie/${tmdbId}?autoplay=${autoPlay ? 1 : 0}`,
    getTVUrl: (tmdbId, season, episode, _imdbId, autoPlay = true) =>
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}?autoplay=${autoPlay ? 1 : 0}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_SU,
    name: 'Mirror 5 (VidSrc SU)',
    host: 'vidsrc.su',
    getMovieUrl: (tmdbId) => `https://vidsrc.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDFAST,
    name: 'Mirror 6 (VidFast)',
    host: 'vidfast.pro',
    getMovieUrl: (tmdbId) => `https://vidfast.pro/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.EMBEDWAVE,
    name: 'Mirror 7 (EmbedWave)',
    host: 'embedwave.cc',
    getMovieUrl: (tmdbId) => `https://embedwave.cc/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embedwave.cc/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.RIVESTREAM,
    name: 'Mirror 8 (RiveStream)',
    host: 'rivestream.live',
    getMovieUrl: (tmdbId) => `https://rivestream.live/embed?type=movie&id=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://rivestream.live/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: PROVIDER_IDS.MULTIEMBED,
    name: 'Mirror 9 (MultiEmbed)',
    host: 'multiembed.mov',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: PROVIDER_IDS.TWO_EMBED,
    name: 'Mirror 10 (2Embed)',
    host: '2embed.cc',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: PROVIDER_IDS.SMASHY,
    name: 'Mirror 11 (SmashyStream)',
    host: 'embed.smashystream.com',
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSPARK,
    name: 'Mirror 12 (VidSpark)',
    host: 'vidspark.to',
    getMovieUrl: (tmdbId) => `https://vidspark.to/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidspark.to/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.VIDSRC_VIP,
    name: 'Mirror 13 (VidSrc VIP)',
    host: 'vidsrc.me',
    getMovieUrl: (tmdbId, imdbId) =>
      `https://vidsrc.me/embed/movie?tmdb=${tmdbId}${imdbId ? `&imdb=${imdbId}` : ''}`,
    getTVUrl: (tmdbId, season, episode, imdbId) =>
      `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}${imdbId ? `&imdb=${imdbId}` : ''}`,
  },
  {
    id: PROVIDER_IDS.GODRIVE,
    name: 'Mirror 14 (GoDrivePlayer)',
    host: 'godriveplayer.com',
    getMovieUrl: (tmdbId) => `https://godriveplayer.com/player.php?type=movie&tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://godriveplayer.com/player.php?type=series&tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: PROVIDER_IDS.PSTREAM,
    name: 'Mirror 15 (P-Stream)',
    host: 'iframe.pstream.org',
    getMovieUrl: (tmdbId) => `https://iframe.pstream.org/embed/tmdb-movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://iframe.pstream.org/embed/tmdb-tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: PROVIDER_IDS.CINESRC,
    name: 'Mirror 16 (CineSrc)',
    host: 'cinesrc.st',
    getMovieUrl: (tmdbId) => `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
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
