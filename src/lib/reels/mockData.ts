/**
 * Cinematic Reels Mock Catalog & Editorial Data (§3.1, §5.1)
 * Built with authentic film editorial quotes, real-feeling titles, organic counts,
 * clamped dark palettes, and verified video playback pipelines.
 */
import type { Reel, DiscussionComment } from './types';

export const INITIAL_REELS_CATALOG: Reel[] = [
  {
    id: 'reel-oppenheimer-trinity',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L02$r*?b00~q_3of9Fj[00IU-;xu',
    aspect: '9:16',
    durationMs: 74000,
    palette: ['#0f141c', '#1e2430', '#2a3344', '#121720'],
    source: {
      titleId: '872585',
      kind: 'movie',
      title: 'Oppenheimer',
      posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
      startAtMs: 6420000, // 1h 47m 00s
    },
    score: {
      track: 'Can You Hear The Music',
      artist: 'Ludwig Göransson',
      waveformPeaks: [0.15, 0.28, 0.45, 0.62, 0.78, 0.95, 0.82, 0.64, 0.75, 0.88, 1.0, 0.92, 0.71, 0.54, 0.38, 0.62, 0.79, 0.85, 0.64, 0.42, 0.25],
    },
    people: [
      { id: 'p1', name: 'Cillian Murphy', role: 'actor' },
      { id: 'p2', name: 'Christopher Nolan', role: 'director' },
      { id: 'p3', name: 'Emily Blunt', role: 'actor' },
    ],
    stats: {
      likes: 18420,
      comments: 742,
    },
    viewer: {
      liked: false,
      saved: false,
    },
    dialogueQuote: 'Now I am become Death, the destroyer of worlds.',
    tags: ['Trinity Test', 'Climax', 'Ludwig Göransson', '70mm IMAX'],
  },
  {
    id: 'reel-blade-runner-tears',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L5421#of00j[00ay~qj[00ay-;fQ',
    aspect: '9:16',
    durationMs: 82000,
    palette: ['#0d1117', '#151d28', '#1a2636', '#090d14'],
    source: {
      titleId: '335984',
      kind: 'movie',
      title: 'Blade Runner 2049',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      startAtMs: 8240000, // 2h 17m 20s
    },
    score: {
      track: 'Tears In The Rain',
      artist: 'Hans Zimmer & Benjamin Wallfisch',
      waveformPeaks: [0.1, 0.18, 0.25, 0.38, 0.52, 0.68, 0.74, 0.82, 0.88, 0.91, 0.84, 0.76, 0.65, 0.52, 0.41, 0.35, 0.28, 0.22, 0.18, 0.12],
    },
    people: [
      { id: 'p4', name: 'Ryan Gosling', role: 'actor' },
      { id: 'p5', name: 'Denis Villeneuve', role: 'director' },
      { id: 'p6', name: 'Harrison Ford', role: 'actor' },
    ],
    stats: {
      likes: 24108,
      comments: 1120,
    },
    viewer: {
      liked: true,
      saved: true,
    },
    dialogueQuote: 'All those moments will be lost in time, like tears in rain.',
    tags: ['Sea Wall', 'Monologue', 'Roger Deakins', 'Atmospheric'],
  },
  {
    id: 'reel-succession-norway',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L78;1b%M00Rj00t7~qof00of-;WB',
    aspect: '9:16',
    durationMs: 58000,
    palette: ['#121015', '#1d1922', '#2a2232', '#0e0c12'],
    source: {
      titleId: '76331',
      kind: 'series',
      title: 'Succession',
      season: 4,
      episode: 5,
      posterUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
      startAtMs: 2480000, // 41m 20s
    },
    score: {
      track: 'Andante Con Moto - String Quartet',
      artist: 'Nicholas Britell',
      waveformPeaks: [0.2, 0.32, 0.55, 0.72, 0.88, 0.94, 0.86, 0.65, 0.5, 0.68, 0.84, 0.96, 0.88, 0.72, 0.58, 0.42, 0.31, 0.22, 0.15],
    },
    people: [
      { id: 'p7', name: 'Jeremy Strong', role: 'actor' },
      { id: 'p8', name: 'Mark Mylod', role: 'director' },
      { id: 'p9', name: 'Alexander Skarsgård', role: 'actor' },
    ],
    stats: {
      likes: 12408,
      comments: 531,
    },
    viewer: {
      liked: false,
      saved: false,
    },
    dialogueQuote: 'You are a tribute band. I am the future.',
    tags: ['Negotiation', 'Mountain Peak', 'Nicholas Britell', 'Corporate Satire'],
  },
  {
    id: 'reel-whiplash-final-solo',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L25O4v~q0000_3%M%Mof00ay-;Rj',
    aspect: '9:16',
    durationMs: 91000,
    palette: ['#16120b', '#241a0e', '#322312', '#0f0b07'],
    source: {
      titleId: '244786',
      kind: 'movie',
      title: 'Whiplash',
      posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
      startAtMs: 5880000, // 1h 38m 00s
    },
    score: {
      track: 'Caravan - Drum Solo',
      artist: 'Justin Hurwitz',
      waveformPeaks: [0.35, 0.5, 0.7, 0.85, 0.95, 1.0, 0.98, 0.95, 0.9, 0.95, 1.0, 0.98, 0.94, 0.88, 0.75, 0.6, 0.78, 0.92, 1.0, 0.8],
    },
    people: [
      { id: 'p10', name: 'Miles Teller', role: 'actor' },
      { id: 'p11', name: 'J.K. Simmons', role: 'actor' },
      { id: 'p12', name: 'Damien Chazelle', role: 'director' },
    ],
    stats: {
      likes: 31890,
      comments: 1845,
    },
    viewer: {
      liked: false,
      saved: true,
    },
    dialogueQuote: 'There are no two words in the English language more harmful than good job.',
    tags: ['Drum Solo', 'Caravan', 'High Tension', 'Justin Hurwitz'],
  },
  {
    id: 'reel-interstellar-docking',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L01b-k?b00~q_3of9Fj[00IU-;xu',
    aspect: '9:16',
    durationMs: 98000,
    palette: ['#0b1018', '#141c2a', '#1b263b', '#080c13'],
    source: {
      titleId: '157336',
      kind: 'movie',
      title: 'Interstellar',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
      startAtMs: 7680000, // 2h 08m 00s
    },
    score: {
      track: 'No Time For Caution',
      artist: 'Hans Zimmer',
      waveformPeaks: [0.22, 0.38, 0.58, 0.74, 0.88, 0.96, 0.98, 1.0, 0.96, 0.92, 0.88, 0.82, 0.92, 0.98, 1.0, 0.95, 0.86, 0.72, 0.54, 0.32],
    },
    people: [
      { id: 'p13', name: 'Matthew McConaughey', role: 'actor' },
      { id: 'p14', name: 'Anne Hathaway', role: 'actor' },
      { id: 'p2', name: 'Christopher Nolan', role: 'director' },
    ],
    stats: {
      likes: 42100,
      comments: 2410,
    },
    viewer: {
      liked: true,
      saved: true,
    },
    dialogueQuote: 'It is not possible. No, it is necessary.',
    tags: ['Endurance', 'Docking Spin', 'Church Organ', 'Hans Zimmer'],
  },
  {
    id: 'reel-severance-defiant-jazz',
    playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1080&auto=format&fit=crop',
    blurhash: 'L139?G?b00~q_3of9Fj[00IU-;xu',
    aspect: '9:16',
    durationMs: 64000,
    palette: ['#0f1416', '#172225', '#202f34', '#0a0e0f'],
    source: {
      titleId: '95897',
      kind: 'series',
      title: 'Severance',
      season: 1,
      episode: 7,
      posterUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
      startAtMs: 2160000, // 36m 00s
    },
    score: {
      track: 'Defiant Jazz Dance Experience',
      artist: 'Theodore Shapiro',
      waveformPeaks: [0.18, 0.32, 0.54, 0.65, 0.78, 0.82, 0.74, 0.62, 0.72, 0.84, 0.9, 0.82, 0.68, 0.55, 0.44, 0.36, 0.28, 0.2],
    },
    people: [
      { id: 'p15', name: 'Adam Scott', role: 'actor' },
      { id: 'p16', name: 'John Turturro', role: 'actor' },
      { id: 'p17', name: 'Ben Stiller', role: 'director' },
    ],
    stats: {
      likes: 9830,
      comments: 412,
    },
    viewer: {
      liked: false,
      saved: false,
    },
    dialogueQuote: 'Please enjoy each dance step equally, and not one more than the other.',
    tags: ['Lumon Industries', 'Macrodata Refinement', 'Cold Optics'],
  },
];

export const MOCK_DISCUSSIONS: Record<string, DiscussionComment[]> = {
  'reel-oppenheimer-trinity': [
    {
      id: 'c1',
      reelId: 'reel-oppenheimer-trinity',
      author: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: 'The complete silence for 90 seconds before the shockwave hit the observation trench is masterclass filmmaking.',
      timestampMs: 14000,
      likes: 124,
      reaction: '🔥',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'c2',
      reelId: 'reel-oppenheimer-trinity',
      author: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'Göransson accelerating the tempo with the geiger counter tick. Brilliant.',
      timestampMs: 38000,
      likes: 89,
      reaction: '⚡',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'c3',
      reelId: 'reel-oppenheimer-trinity',
      author: 'Devon Hayes',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      text: 'Cillian’s pupils dilating when the flash reflects in his goggles.',
      timestampMs: 52000,
      likes: 47,
      reaction: '👁️',
      createdAt: Date.now() - 3600000,
    },
  ],
  'reel-blade-runner-tears': [
    {
      id: 'c4',
      reelId: 'reel-blade-runner-tears',
      author: 'Aria Sterling',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'Deakins said in an interview he used pure tungsten ring lights on the water tank for this exact reflection.',
      timestampMs: 22000,
      likes: 215,
      reaction: '🎥',
      createdAt: Date.now() - 3600000 * 8,
    },
    {
      id: 'c5',
      reelId: 'reel-blade-runner-tears',
      author: 'Soren Lind',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      text: 'K finally knowing he is a copy, and choosing humanity anyway.',
      timestampMs: 64000,
      likes: 182,
      reaction: '❄️',
      createdAt: Date.now() - 3600000 * 3,
    },
  ],
};
