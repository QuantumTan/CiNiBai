import { useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { RefractionFilter } from '../components/glass/RefractionFilter';
import { AmbientCanvas } from '../components/ambient/AmbientCanvas';
import { FloatingDock } from '../components/dock/FloatingDock';
import { Shelf } from '../components/media/Shelf';
import { useDominantColors } from '../components/ambient/useDominantColors';
import { detectCapabilities } from '../lib/capabilities';
import type { MediaCardItem } from '../components/media/MediaCard';

const SAMPLE_CONTINUE_WATCHING: MediaCardItem[] = [
  {
    id: 'cw-1',
    title: 'Severance: Season 2',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    voteAverage: 8.9,
    releaseDate: '2025-01-17',
    overview: 'Mark Scout leads a team at Lumon Industries, whose employees have undergone a severance procedure.',
  },
  {
    id: 'cw-2',
    title: 'Dune: Part Two',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    voteAverage: 8.6,
    releaseDate: '2024-03-01',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
  },
  {
    id: 'cw-3',
    title: 'Slow Horses',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    voteAverage: 8.2,
    releaseDate: '2024-09-04',
    overview: 'A dysfunctional team of MI5 agents navigate the espionage world to defend England from sinister forces.',
  },
];

const SAMPLE_CURATED_RAIL: MediaCardItem[] = [
  {
    id: 'cr-1',
    title: 'Blade Runner 2049',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    voteAverage: 8.0,
    releaseDate: '2017-10-06',
    overview: 'Young Blade Runner K unearths a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
  },
  {
    id: 'cr-2',
    title: 'Interstellar (IMAX 70mm)',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    voteAverage: 8.7,
    releaseDate: '2014-11-07',
    overview: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft.',
  },
  {
    id: 'cr-3',
    title: 'The Zone of Interest',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    voteAverage: 7.8,
    releaseDate: '2023-12-15',
    overview: 'Auschwitz commandant Rudolf Höss and his wife Hedwig strive to build a dream life next to the camp.',
  },
  {
    id: 'cr-4',
    title: 'Solaris (Criterion Restored)',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1280',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    voteAverage: 8.0,
    releaseDate: '1972-03-20',
    overview: 'A psychologist is sent to a space station orbiting a mysterious planet to investigate the emotional breakdown of the crew.',
  },
];

export function SpatialStageSample() {
  const { sampleImageUrl } = useDominantColors();

  useEffect(() => {
    detectCapabilities();
    // Sample hero background dominant palette once on mount
    sampleImageUrl('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1280', {
      fallbackPalette: ['#c99a4e', '#1c2438', '#2e1828'],
    });
  }, [sampleImageUrl]);

  return (
    <div className="relative min-h-screen bg-[#060709] text-slate-100 overflow-x-hidden pb-32">
      {/* 1. Global Optical Refraction Filter Mount (§3.6) */}
      <RefractionFilter />

      {/* 2. Living Ambient Canvas Mesh (§4.1) */}
      <AmbientCanvas />

      {/* 3. STAGE (Top 65vh Cinema Billboard) */}
      <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
        {/* Seamless 4K Cinema Teaser Backdrop */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1280"
            alt="Hero Feature"
            className="h-full w-full object-cover scale-[1.02]"
          />
          {/* Progressive Opacity Mask Feather (Linear Blend into Shelves) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060709]/90 via-[#060709]/30 to-transparent pointer-events-none" />
        </div>

        {/* Hero Editorial Lockup */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-12 md:px-12 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="apple-glass-thin rounded px-2 py-0.5 text-[10px] font-bold text-amber-300">
              4K DOLBY VISION
            </span>
            <span className="apple-glass-thin rounded px-2 py-0.5 text-[10px] font-semibold text-slate-200">
              CRITERION REMASTER
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight-title drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mb-3">
            Severance
          </h1>

          <p className="line-clamp-2 text-sm text-slate-300 max-w-xl leading-relaxed mb-6 drop-shadow-md">
            Mark Scout leads a team at Lumon Industries, whose employees have undergone a severance procedure, which surgically divides their memories between their work and personal lives.
          </p>

          {/* Glass Action Deck */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black shadow-xl hover:bg-slate-200 transition-colors">
              <Play size={16} className="fill-black" />
              <span>Resume S2:E1</span>
            </button>

            <button className="apple-glass-thin flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:border-white/40">
              <Info size={16} />
              <span>Series Details</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. SHELVES (Virtualized Kinetic Rails) */}
      <div className="relative z-10 space-y-6">
        {/* Continue Watching with Live Radial Progress Rings */}
        <Shelf
          title="Continue Watching"
          items={SAMPLE_CONTINUE_WATCHING}
          isContinueWatching={true}
          itemSize="md"
        />

        {/* Kinetic Quick-Peek Catalog Rail with Edge-to-Edge Inertia */}
        <Shelf
          title="Curated Masterworks & 4K Restorations"
          items={SAMPLE_CURATED_RAIL}
          itemSize="lg"
        />
      </div>

      {/* 5. Floating visionOS Detached Pill Dock */}
      <FloatingDock />
    </div>
  );
}
