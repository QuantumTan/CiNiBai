// Video source provider registry
// Uses embed-based providers that accept TMDB IDs

export interface EmbedSource {
  id: string;
  name: string;
  badge?: string;
  getMovieUrl: (tmdbId: number) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number) => string;
}

// Embed providers ranked by speed, uptime, and minimal ads
const providers: EmbedSource[] = [
  {
    id: 'vidlink',
    name: 'VidLink (Ultra Fast)',
    badge: 'Recommended',
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?autoplay=1`,
    getTVUrl: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=1`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed (Multi-Source)',
    badge: 'Fast',
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc Server',
    getMovieUrl: (tmdbId) => `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed Server',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: '2embed',
    name: '2Embed Backup',
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
];

export function getProviders(): EmbedSource[] {
  return providers;
}

export function getDefaultProvider(): EmbedSource {
  return providers[0];
}

export function getProviderById(id: string): EmbedSource | undefined {
  return providers.find((p) => p.id === id);
}

/**
 * Perform a fast client-side ping check to see if a provider's domain is accessible and responsive
 */
export async function testServerConnectivity(url: string, timeoutMs: number = 2500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Use mode: 'no-cors' to ping the domain without CORS preflight failures
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    // If fetch failed completely (DNS issue, timeout, blocked domain), return false
    return false;
  }
}
