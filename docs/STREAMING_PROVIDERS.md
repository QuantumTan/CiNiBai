# CineBai Streaming & Embed Provider Architecture

This document outlines the external embed mirrors, resolver patterns, and anime/catalog extractor APIs considered or integrated into CineBai.

---

## 1. Integrated Embed Mirrors (Zero-Key Iframe Resolvers)

CineBai uses sandboxed `<iframe>` embed resolvers that map standard **TMDB IDs** (and optional IMDb IDs) directly to video player frames without storing video binaries or requiring client-side API credentials.

### Active Mirror Lineup (`src/api/providers.ts`)

| Mirror ID | Provider Name | Host Domain | Route Pattern (Movie / TV) |
| :--- | :--- | :--- | :--- |
| `mirror-1` | **VidLink** (Default) | `vidlink.pro` | `/movie/{tmdbId}`<br>`/tv/{tmdbId}/{s}/{e}?nextbutton=true` |
| `mirror-2` | **CineSrc** | `cinesrc.st` | `/embed/movie/{tmdbId}`<br>`/embed/tv/{tmdbId}?s={s}&e={e}` |
| `mirror-3` | **VidSrc SU** | `vidsrc.su` | `/embed/movie/{tmdbId}`<br>`/embed/tv/{tmdbId}/{s}/{e}` |
| `mirror-4` | **VidSrc VIP** | `vidsrc.me` | `/embed/movie?tmdb={tmdbId}`<br>`/embed/tv?tmdb={tmdbId}&season={s}&episode={e}` |
| `mirror-5` | **AutoEmbed** | `autoembed.co` | `/movie/tmdb/{tmdbId}`<br>`/tv/tmdb/{tmdbId}-{s}-{e}` |
| `mirror-6` | **VidSrc TO** | `vidsrc.to` | `/embed/movie/{tmdbId}`<br>`/embed/tv/{tmdbId}/{s}/{e}` |
| `mirror-7` | **MultiEmbed** | `multiembed.mov` | `/?video_id={tmdbId}&tmdb=1`<br>`/?video_id={tmdbId}&tmdb=1&s={s}&e={e}` |
| `mirror-8` | **2Embed** | `2embed.cc` | `/embed/{tmdbId}`<br>`/embedtv/{tmdbId}&s={s}&e={e}` |
| `mirror-9` | **SmashyStream** | `embed.smashystream.com` | `/playere.php?tmdb={tmdbId}`<br>`/playere.php?tmdb={tmdbId}&season={s}&episode={e}` |
| `mirror-10` | **Videasy** | `player.videasy.net` | `/movie/{tmdbId}`<br>`/tv/{tmdbId}/{s}/{e}` |
| `mirror-11` | **VidFast** | `vidfast.pro` | `/movie/{tmdbId}`<br>`/tv/{tmdbId}/{s}/{e}` |
| `mirror-12` | **VidSpark** | `vidspark.to` | `/movie/{tmdbId}`<br>`/tv/{tmdbId}/{s}/{e}` |
| `mirror-13` | **EmbedWave** | `embedwave.cc` | `/movie/{tmdbId}`<br>`/tv/{tmdbId}/{s}/{e}` |
| `mirror-14` | **RiveStream** | `rivestream.live` | `/embed?type=movie&id={tmdbId}`<br>`/embed?type=tv&id={tmdbId}&season={s}&episode={e}` |
| `mirror-15` | **GoDrivePlayer** | `godriveplayer.com` | `/player.php?type=movie&tmdb={tmdbId}`<br>`/player.php?type=series&tmdb={tmdbId}&season={s}&episode={e}` |
| `mirror-16` | **P-Stream** | `iframe.pstream.org` | `/embed/tmdb-movie/{tmdbId}`<br>`/embed/tmdb-tv/{tmdbId}/{s}/{e}` |

---

## 2. Additional Embed Resolvers & Fallbacks Evaluated

- **VidZee** (`player.vidzee.wtf`): Lightweight embed for select catalogue titles.
- **AutoEmbed Alternative** (`player.autoembed.cc`): Alternate mirror for AutoEmbed.
- **Vidora** (`vidora.su`): Secondary mirror operating under the VidSrc cluster.
- **VidFix** (`vidfix.cc`), **Filmku**, **BlackVid**: Secondary regional embeds.
- **StreamTape / StreamWish / VidHide / Filemoon**: Underlying cloud storage hosts typically resolved via the scrapers above rather than standalone direct TMDB lookups.

---

## 3. Extractor & Anime APIs (Catalogue & Stream Aggregators)

Unlike iframe embeds, these providers are **API-first / scraping libraries** that return raw stream URLs (`.m3u8` HLS or `.mp4`), subtitle tracks, and episode lists.

### Candidate APIs

1. **Consumet API** (`api.consumet.org` / `consumet.ts` / `@consumet/extensions`):
   - Multi-provider scraper library supporting anime (Gogoanime, Zoro/Aniwatch, AnimePahe), manga, movies, and light novels.
   - Outputs JSON structures containing episode lists and HLS streams.
2. **Anify API**:
   - Comprehensive anime/manga aggregator database with mapping between AniList, MyAnimeList (MAL), Kitsu, and TMDB.
   - Provides episode timestamps (intro/outro skip) and multi-resolution video streams.
3. **Enime API**:
   - Open-source anime API linking AniList IDs to video sources.
4. **Miruro API**:
   - Modern anime streaming client/backend built on top of Consumet/Anify providers.
5. **VidAPI.xyz**:
   - Video API aggregation service for streaming lookups.
6. **AniCrack / AniWatch Aggregators**:
   - Scraper manifests targeting HiAnime/AniWatch mirror endpoints.
7. **StreamingCommunity API**:
   - Multilingual provider API for European catalogue titles.
8. **movie-web / Sudo-Flix Providers** (`@movie-web/providers`):
   - Client-side TypeScript scrapers for community video hosts with extension/proxy support.
9. **Stremio Consumet Addon**:
   - Stremio-compatible protocol addon bridging Consumet anime scrapers.

### Architectural Requirements for Integrating Extractor APIs

To implement direct HLS / extractor APIs in CineBai without breaking the lightweight, static client architecture:
1. **CORS / Referer Reverse Proxy**:
   - Third-party HLS hosts (e.g. Megacloud, VidCloud, StreamTape) require strict `Referer` and `Origin` headers that browsers cannot set on standard `fetch()` or `<video>` elements. A lightweight edge proxy (e.g. Vercel Serverless Function or Cloudflare Worker) is required.
2. **ID Mapping Layer**:
   - TMDB IDs must be mapped to AniList / MAL IDs using services like Anify or Armature before querying anime-specific providers.
3. **Native HLS Video Player**:
   - A dedicated player using `hls.js` or standard video element with custom media controls (play/pause, resolution selector, audio track selection, audio subtitles) replacing the sandboxed iframe view.
