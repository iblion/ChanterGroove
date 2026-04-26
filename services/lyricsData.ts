export type LyricsChallenge = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: 'afrobeats' | 'hiphop' | 'pop';
  lines: string[];
};

export const LYRICS_CHALLENGES: LyricsChallenge[] = [
  {
    id: 'ly1',
    title: 'Essence',
    artist: 'Wizkid',
    year: 2020,
    genre: 'afrobeats',
    lines: ['You do not need no other body', 'Only you fit hold my body', 'Say na me dey mess up your mind'],
  },
  {
    id: 'ly2',
    title: 'Calm Down',
    artist: 'Rema',
    year: 2022,
    genre: 'afrobeats',
    lines: ['Baby calm down, calm down', 'Girl this your body e put my heart for lockdown', 'For lockdown, for lockdown'],
  },
  {
    id: 'ly3',
    title: 'Last Last',
    artist: 'Burna Boy',
    year: 2022,
    genre: 'afrobeats',
    lines: ['I put my life into my job and I know I am in trouble', 'She manipulate my love', 'Everybody go chop breakfast'],
  },
  {
    id: 'ly4',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    year: 2017,
    genre: 'hiphop',
    lines: ['Nobody pray for me', 'Sit down, be humble', 'My left stroke just went viral'],
  },
  {
    id: 'ly5',
    title: "God's Plan",
    artist: 'Drake',
    year: 2018,
    genre: 'hiphop',
    lines: ['I hold back, sometimes I won’t', 'I feel good, sometimes I don’t', 'They wishin and wishin and wishin'],
  },
  {
    id: 'ly6',
    title: 'Levitating',
    artist: 'Dua Lipa',
    year: 2020,
    genre: 'pop',
    lines: ['If you wanna run away with me', 'I had a premonition that we fell into a rhythm', 'You, moonlight, you are my starlight'],
  },
  {
    id: 'ly7',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    year: 2023,
    genre: 'pop',
    lines: ['I can buy myself flowers', 'Write my name in the sand', 'Talk to myself for hours'],
  },
];

export function getLyricsByGenre(genre: 'all' | 'afrobeats' | 'hiphop' | 'pop'): LyricsChallenge[] {
  if (genre === 'all') return [...LYRICS_CHALLENGES];
  return LYRICS_CHALLENGES.filter((c) => c.genre === genre);
}

export function getDailyLyricsChallenge(date = new Date()): LyricsChallenge {
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % LYRICS_CHALLENGES.length;
  return LYRICS_CHALLENGES[idx];
}
