export const PREMIERE = {
  title: 'Receipt Apocalypse',
  residentId: 'CC026',
  duration: 14.8,
  video: '/assets/cinema/cancel-city-premiere.mp4',
  poster: '/assets/cinema/premiere-poster.webp',
  captions: '/assets/cinema/premiere-en.vtt',
  chapters: [
    {id: 'city', title: 'Another normal day', time: 0, image: '/assets/cinema/chapter-city.webp'},
    {id: 'pack', title: 'Contains: problems', time: 2.25, image: '/assets/cinema/chapter-pack.webp'},
    {id: 'karen', title: 'Final boss unlocked', time: 4.8, image: '/assets/cinema/chapter-karen.webp'},
    {id: 'special', title: 'Receipt apocalypse', time: 6.25, image: '/assets/cinema/chapter-special.webp'},
    {id: 'verdict', title: 'Thread locked', time: 10.2, image: '/assets/cinema/chapter-verdict.webp'},
  ],
} as const;
