# CineBai — calm, cinema-first home for finding what to watch next.

[![Live App](https://img.shields.io/badge/Live-cinibai.vercel.app-gold?style=flat-square)](https://cinibai.vercel.app)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square)](https://tailwindcss.com/)

Live Deployment: [https://cinibai.vercel.app](https://cinibai.vercel.app)

---

## About CineBai

CineBai is a calm, cinema-first discovery application built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS 4**. It leverages comprehensive metadata from **The Movie Database (TMDB)**—including high-resolution posters, backdrop artwork, community ratings, detailed cast and crew credits, and episode guides—to provide an editorial discovery experience.

### Core Features
- **Cinematic Discovery**: Editorial hero carousel, weekly and daily trending releases, critically acclaimed films, and anime spotlights.
- **Deep Exploration**: Browse feature films and television series with multi-criteria sorting (popularity, rating, release dates) and genre filtering.
- **Studio Catalogs**: Curated studio networks (Netflix, Amazon Prime Video, Disney+, Apple TV+, Hulu, HBO Max) featuring signature atmospheric lighting.
- **Instant Search**: Debounced multi-search with category filtering, pagination, and trending search suggestions.
- **Personal Watchlist**: Locally persisted queue (up to 500 titles) with automatic deduplication, sorting, filtering, and screen-reader announcements.
- **Media Information & Detail**: Comprehensive title summaries, runtime, director information, cast rails, trailers, and similar recommendations.
- **Adaptive Ambient Canvas**: Dynamic background illumination sampling dominant palette colors from title artwork, with full support for `prefers-reduced-motion` and hardware tier constraints.

> [!NOTE]
> CineBai is a catalog discovery guide and personal watchlist manager. It is not a streaming platform and does not host or broadcast video files.

---

## Tech Stack

- **Framework**: React 19, TypeScript
- **Build Tool**: Vite 6 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS 4, custom glassmorphism tokens, and responsive layout primitives
- **Class Utilities**: `clsx` + `tailwind-merge` (`cn` helper)
- **State Management**: Zustand with `persist` middleware (consolidated in `src/stores/`)
- **Server Cache & Data Fetching**: TanStack Query (`@tanstack/react-query`) with automatic query caching
- **Icons**: Lucide React
- **Animations**: Framer Motion with reduced-motion fallbacks

---

## Folder Structure

```text
c:/Users/ACER/Desktop/CiNiBai/
├── docs/
│   └── ARCHITECTURE.md          # Architectural patterns, data flow, & design system
├── public/
│   ├── favicon.svg              # App favicon
│   ├── og.jpg                   # Open Graph & Twitter social card image
│   └── manifest.json            # PWA manifest
├── src/
│   ├── api/                     # TMDB API client, mock fallback data, types, & providers
│   ├── assets/                  # Static design assets
│   ├── components/              # Canonical UI components
│   │   ├── ambient/             # Ambient canvas background system
│   │   ├── cards/               # Canonical MovieCard & CastCard
│   │   ├── common/              # SEO metadata & ErrorBoundary
│   │   ├── home/                # CinematicHero & ContentRow rails
│   │   ├── layout/              # FloatingDock, Navigation, & Footer
│   │   ├── player/              # LiquidVideoPlayer component
│   │   └── ui/                  # Accessible buttons, inputs, & skeleton loaders
│   ├── hooks/                   # React Query data hooks (useTMDB)
│   ├── lib/                     # Color math, image formatting, & device capabilities
│   ├── pages/                   # Code-split application routes
│   │   ├── AnimePage.tsx        # Curated Japanese animation
│   │   ├── BrowsePage.tsx       # Movie & TV show catalogs
│   │   ├── DetailPage.tsx       # Title overview, cast, & recommendations
│   │   ├── HomePage.tsx         # Spotlight hero & discovery rails
│   │   ├── NetworkPage.tsx      # Studio network catalogs
│   │   ├── NotFoundPage.tsx     # 404 recovery page
│   │   ├── SearchPage.tsx       # Debounced search & discovery
│   │   ├── WatchlistPage.tsx    # Saved queue management
│   │   └── WatchPage.tsx        # Player interface
│   ├── stores/                  # Consolidated Zustand state stores
│   │   ├── ambient.ts           # Dynamic illumination store
│   │   ├── player.ts            # Player controls & progress state
│   │   └── watchlistStore.ts    # Persisted watchlist store (capped at 500 items)
│   ├── styles/                  # Apple-glass materials & hardware tier styles
│   ├── App.tsx                  # Root layout, router, & Suspense fallbacks
│   ├── index.css                # Tailwind v4 @theme design tokens
│   └── main.tsx                 # React DOM mount point
├── .env.example                 # Environment configuration template
├── package.json                 # Project dependencies & scripts
└── vite.config.ts               # Vite build configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or compatible package manager

### Environment Setup
See `.env.example` to configure your local environment variables:
```bash
cp .env.example .env
```
Provide your TMDB Read Access Token (v4 auth) in `.env`:
```env
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token_here
```
*(If no token is supplied, CineBai automatically falls back to bundled mock catalog data for local evaluation.)*

### Installation & Scripts

Install project dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Run static analysis and linting:
```bash
npm run lint
```

Execute unit test suite:
```bash
npm run test
```

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by [TMDB](https://www.themoviedb.org/).

<a href="https://www.themoviedb.org/">
  <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca4c88bafe5dcb6f8a62a4c6bc55cd9cc82f2e38e4b54.svg" alt="TMDB Logo" width="120" />
</a>
