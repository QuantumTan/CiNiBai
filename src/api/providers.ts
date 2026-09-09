// Video source provider registry
// Uses embed-based providers that accept TMDB IDs

export interface EmbedSource {
  name: string;
  getMovieUrl: (tmdbId: number) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number) => string;
}

// Embed providers -- these serve video via iframe
const providers: EmbedSource[] = [
  {
    name: 'AutoEmbed',
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    name: 'VidSrc Net',
    getMovieUrl: (tmdbId) => `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    name: 'SmashyStream',
    getMovieUrl: (tmdbId) => `https://player.smashy.stream/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    name: 'SuperEmbed',
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
];

export function getProviders(): EmbedSource[] {
  return providers;
}

export function getDefaultProvider(): EmbedSource {
  return providers[0];
}

export function getProviderByName(name: string): EmbedSource | undefined {
  return providers.find((p) => p.name === name);
}
