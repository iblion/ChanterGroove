import { SpotifyTrack } from './spotify';

// ─── Free audio samples from SoundHelix ──────────────────────────────────
// These are royalty-free placeholder tracks for development.
// Replace with real Spotify previews once credentials are set up.

const SAMPLE_AUDIOS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
];

const ALBUM_ARTS = [
  'https://picsum.photos/seed/afro1/300/300',
  'https://picsum.photos/seed/afro2/300/300',
  'https://picsum.photos/seed/afro3/300/300',
  'https://picsum.photos/seed/afro4/300/300',
  'https://picsum.photos/seed/afro5/300/300',
  'https://picsum.photos/seed/afro6/300/300',
  'https://picsum.photos/seed/afro7/300/300',
  'https://picsum.photos/seed/afro8/300/300',
  'https://picsum.photos/seed/afro9/300/300',
  'https://picsum.photos/seed/afro10/300/300',
];

function audio(i: number) { return SAMPLE_AUDIOS[i % SAMPLE_AUDIOS.length]; }
function art(i: number) { return ALBUM_ARTS[i % ALBUM_ARTS.length]; }

export const MOCK_TRACKS: SpotifyTrack[] = [
  // ─── Afrobeats (25) ─────────────────────────────────────────────────────
  { id: 'af1',  name: 'Essence',         artists: ['Wizkid', 'Tems'],           album: 'Made In Lagos',          albumArt: art(0),  previewUrl: audio(0),  year: 2020, genre: 'afrobeats', popularity: 95 },
  { id: 'af2',  name: 'Ye',              artists: ['Burna Boy'],                album: 'Outside',                albumArt: art(1),  previewUrl: audio(1),  year: 2018, genre: 'afrobeats', popularity: 92 },
  { id: 'af3',  name: 'Love Nwantiti',   artists: ['CKay'],                     album: 'CKay the First',         albumArt: art(2),  previewUrl: audio(2),  year: 2019, genre: 'afrobeats', popularity: 93 },
  { id: 'af4',  name: 'Electricity',     artists: ['Kizz Daniel', 'Davido'],    album: 'Barnabas',               albumArt: art(3),  previewUrl: audio(3),  year: 2022, genre: 'afrobeats', popularity: 87 },
  { id: 'af5',  name: 'Peru',            artists: ['Fireboy DML'],              album: 'Playboy',                albumArt: art(4),  previewUrl: audio(4),  year: 2021, genre: 'afrobeats', popularity: 90 },
  { id: 'af6',  name: 'Deja Vu',         artists: ['Omah Lay'],                 album: 'Boy Alone',              albumArt: art(5),  previewUrl: audio(5),  year: 2022, genre: 'afrobeats', popularity: 83 },
  { id: 'af7',  name: 'Calm Down',       artists: ['Rema'],                     album: 'Rave & Roses',           albumArt: art(6),  previewUrl: audio(6),  year: 2022, genre: 'afrobeats', popularity: 94 },
  { id: 'af8',  name: 'Expensive',       artists: ['Tiwa Savage'],              album: 'Celia',                  albumArt: art(7),  previewUrl: audio(7),  year: 2020, genre: 'afrobeats', popularity: 81 },
  { id: 'af9',  name: 'Last Last',       artists: ['Burna Boy'],                album: 'Love Damini',            albumArt: art(8),  previewUrl: audio(8),  year: 2022, genre: 'afrobeats', popularity: 96 },
  { id: 'af10', name: 'Buga',            artists: ['Kizz Daniel'],              album: 'Buga',                   albumArt: art(9),  previewUrl: audio(9),  year: 2022, genre: 'afrobeats', popularity: 89 },
  { id: 'af11', name: 'Rush',            artists: ['Ayra Starr'],               album: 'The Year I Turned 21',   albumArt: art(0),  previewUrl: audio(10), year: 2023, genre: 'afrobeats', popularity: 91 },
  { id: 'af12', name: 'Terminator',      artists: ['Asake'],                    album: 'Mr Money With the Vibe', albumArt: art(1),  previewUrl: audio(11), year: 2022, genre: 'afrobeats', popularity: 87 },
  { id: 'af13', name: 'Overloading',     artists: ['Omah Lay'],                 album: 'Get Layd',               albumArt: art(2),  previewUrl: audio(12), year: 2021, genre: 'afrobeats', popularity: 82 },
  { id: 'af14', name: 'Coming',          artists: ['Davido'],                   album: 'A Better Time',          albumArt: art(3),  previewUrl: audio(13), year: 2020, genre: 'afrobeats', popularity: 86 },
  { id: 'af15', name: 'True Religion',   artists: ['Rema'],                     album: 'Rave & Roses Ultra',     albumArt: art(4),  previewUrl: audio(14), year: 2023, genre: 'afrobeats', popularity: 88 },
  { id: 'af16', name: 'Joro',            artists: ['Wizkid'],                   album: 'Made In Lagos',          albumArt: art(5),  previewUrl: audio(15), year: 2019, genre: 'afrobeats', popularity: 90 },
  { id: 'af17', name: 'Organise',        artists: ['Asake'],                    album: 'Mr Money With the Vibe', albumArt: art(6),  previewUrl: audio(0),  year: 2022, genre: 'afrobeats', popularity: 88 },
  { id: 'af18', name: 'Charm',           artists: ['Rema'],                     album: 'HEIS',                   albumArt: art(7),  previewUrl: audio(1),  year: 2024, genre: 'afrobeats', popularity: 85 },
  { id: 'af19', name: 'City Boys',       artists: ['Burna Boy'],                album: 'Love Damini',            albumArt: art(8),  previewUrl: audio(2),  year: 2022, genre: 'afrobeats', popularity: 84 },
  { id: 'af20', name: 'Sugarcane',       artists: ['Camidoh'],                  album: 'Sugarcane EP',           albumArt: art(9),  previewUrl: audio(3),  year: 2022, genre: 'afrobeats', popularity: 80 },
  { id: 'af21', name: 'Killed By Love',  artists: ['Davido'],                   album: 'A Good Time',            albumArt: art(0),  previewUrl: audio(4),  year: 2019, genre: 'afrobeats', popularity: 84 },
  { id: 'af22', name: 'Soso',            artists: ['Omah Lay'],                 album: 'Boy Alone',              albumArt: art(1),  previewUrl: audio(5),  year: 2022, genre: 'afrobeats', popularity: 86 },
  { id: 'af23', name: 'Loaded',          artists: ['Tiwa Savage'],              album: 'Celia',                  albumArt: art(2),  previewUrl: audio(6),  year: 2020, genre: 'afrobeats', popularity: 79 },
  { id: 'af24', name: 'Bloody Samaritan', artists: ['Ayra Starr'],              album: '19 & Dangerous',         albumArt: art(3),  previewUrl: audio(7),  year: 2021, genre: 'afrobeats', popularity: 85 },
  { id: 'af25', name: 'Kilometer',       artists: ['Burna Boy'],                album: 'Twice as Tall',          albumArt: art(4),  previewUrl: audio(8),  year: 2020, genre: 'afrobeats', popularity: 83 },

  // ─── Amapiano (10) ──────────────────────────────────────────────────────
  { id: 'am1',  name: 'Mnike',           artists: ['Tyler ICU', 'DJ Malvado'], album: 'Mnike',                  albumArt: art(5),  previewUrl: audio(9),  year: 2023, genre: 'amapiano', popularity: 88 },
  { id: 'am2',  name: 'Ke Star',         artists: ['Focalistic', 'Vigro Deep'],album: 'Ke Star',                albumArt: art(6),  previewUrl: audio(10), year: 2020, genre: 'amapiano', popularity: 85 },
  { id: 'am3',  name: 'Adiwele',         artists: ['Young Stunna'],            album: 'Notumato',               albumArt: art(7),  previewUrl: audio(11), year: 2021, genre: 'amapiano', popularity: 82 },
  { id: 'am4',  name: 'Tanzania',        artists: ['Uncle Waffles'],           album: 'Red Dragon',             albumArt: art(8),  previewUrl: audio(12), year: 2022, genre: 'amapiano', popularity: 86 },
  { id: 'am5',  name: 'Bambelela',       artists: ['DBN Gogo'],               album: 'Bambelela',              albumArt: art(9),  previewUrl: audio(13), year: 2022, genre: 'amapiano', popularity: 80 },
  { id: 'am6',  name: 'Amalanga',        artists: ['Kabza De Small'],          album: 'KOA II',                 albumArt: art(0),  previewUrl: audio(14), year: 2021, genre: 'amapiano', popularity: 84 },
  { id: 'am7',  name: 'Nana Thula',      artists: ['Kabza De Small', 'DJ Maphorisa'], album: 'Scorpion Kings',  albumArt: art(1),  previewUrl: audio(15), year: 2019, genre: 'amapiano', popularity: 83 },
  { id: 'am8',  name: 'Umlando',         artists: ['Toss', '9umba'],          album: 'Umlando',                albumArt: art(2),  previewUrl: audio(0),  year: 2022, genre: 'amapiano', popularity: 81 },
  { id: 'am9',  name: 'Sponono',         artists: ['Kabza De Small'],          album: 'I Am the King of Amapiano', albumArt: art(3), previewUrl: audio(1), year: 2020, genre: 'amapiano', popularity: 82 },
  { id: 'am10', name: 'Water',           artists: ['Tyla'],                    album: 'Tyla',                   albumArt: art(4),  previewUrl: audio(2),  year: 2023, genre: 'amapiano', popularity: 95 },

  // ─── Hip-Hop (10) ───────────────────────────────────────────────────────
  { id: 'hh1',  name: 'HUMBLE.',         artists: ['Kendrick Lamar'],          album: 'DAMN.',                  albumArt: art(5),  previewUrl: audio(3),  year: 2017, genre: 'hiphop', popularity: 96 },
  { id: 'hh2',  name: "God's Plan",      artists: ['Drake'],                   album: 'Scorpion',               albumArt: art(6),  previewUrl: audio(4),  year: 2018, genre: 'hiphop', popularity: 95 },
  { id: 'hh3',  name: 'No Role Modelz',  artists: ['J. Cole'],                 album: '2014 Forest Hills Drive',albumArt: art(7),  previewUrl: audio(5),  year: 2014, genre: 'hiphop', popularity: 93 },
  { id: 'hh4',  name: 'SICKO MODE',      artists: ['Travis Scott'],            album: 'Astroworld',             albumArt: art(8),  previewUrl: audio(6),  year: 2018, genre: 'hiphop', popularity: 94 },
  { id: 'hh5',  name: 'Industry Baby',   artists: ['Lil Nas X', 'Jack Harlow'],album: 'Montero',               albumArt: art(9),  previewUrl: audio(7),  year: 2021, genre: 'hiphop', popularity: 92 },
  { id: 'hh6',  name: 'Money Trees',     artists: ['Kendrick Lamar'],          album: 'good kid m.A.A.d city',  albumArt: art(0),  previewUrl: audio(8),  year: 2012, genre: 'hiphop', popularity: 91 },
  { id: 'hh7',  name: 'Praise The Lord', artists: ['A$AP Rocky'],              album: 'Testing',                albumArt: art(1),  previewUrl: audio(9),  year: 2018, genre: 'hiphop', popularity: 88 },
  { id: 'hh8',  name: 'Mask Off',        artists: ['Future'],                  album: 'FUTURE',                 albumArt: art(2),  previewUrl: audio(10), year: 2017, genre: 'hiphop', popularity: 90 },
  { id: 'hh9',  name: 'Laugh Now Cry Later', artists: ['Drake', 'Lil Durk'],   album: 'Certified Lover Boy',    albumArt: art(3),  previewUrl: audio(11), year: 2020, genre: 'hiphop', popularity: 89 },
  { id: 'hh10', name: 'Not Like Us',     artists: ['Kendrick Lamar'],          album: 'GNX',                    albumArt: art(4),  previewUrl: audio(12), year: 2024, genre: 'hiphop', popularity: 97 },

  // ─── R&B (5) ────────────────────────────────────────────────────────────
  { id: 'rb1',  name: 'Kill Bill',       artists: ['SZA'],                     album: 'SOS',                    albumArt: art(5),  previewUrl: audio(13), year: 2022, genre: 'rnb', popularity: 95 },
  { id: 'rb2',  name: 'Blinding Lights', artists: ['The Weeknd'],              album: 'After Hours',            albumArt: art(6),  previewUrl: audio(14), year: 2020, genre: 'rnb', popularity: 98 },
  { id: 'rb3',  name: 'Free',            artists: ['Tems'],                    album: 'Born In The Wild',       albumArt: art(7),  previewUrl: audio(15), year: 2024, genre: 'rnb', popularity: 84 },
  { id: 'rb4',  name: 'Snooze',          artists: ['SZA'],                     album: 'SOS',                    albumArt: art(8),  previewUrl: audio(0),  year: 2022, genre: 'rnb', popularity: 91 },
  { id: 'rb5',  name: 'Best Part',       artists: ['Daniel Caesar', 'H.E.R.'], album: 'Freudian',              albumArt: art(9),  previewUrl: audio(1),  year: 2017, genre: 'rnb', popularity: 89 },

  // ─── Pop (5) ────────────────────────────────────────────────────────────
  { id: 'pp1',  name: 'Levitating',      artists: ['Dua Lipa'],                album: 'Future Nostalgia',       albumArt: art(0),  previewUrl: audio(2),  year: 2020, genre: 'pop', popularity: 94 },
  { id: 'pp2',  name: 'bad guy',         artists: ['Billie Eilish'],           album: 'WHEN WE ALL FALL ASLEEP',albumArt: art(1),  previewUrl: audio(3),  year: 2019, genre: 'pop', popularity: 93 },
  { id: 'pp3',  name: 'Anti-Hero',       artists: ['Taylor Swift'],            album: 'Midnights',              albumArt: art(2),  previewUrl: audio(4),  year: 2022, genre: 'pop', popularity: 95 },
  { id: 'pp4',  name: 'As It Was',       artists: ['Harry Styles'],            album: "Harry's House",          albumArt: art(3),  previewUrl: audio(5),  year: 2022, genre: 'pop', popularity: 96 },
  { id: 'pp5',  name: 'Flowers',         artists: ['Miley Cyrus'],             album: 'Endless Summer Vacation',albumArt: art(4),  previewUrl: audio(6),  year: 2023, genre: 'pop', popularity: 94 },

  // ─── Dancehall (5) ──────────────────────────────────────────────────────
  { id: 'dh1',  name: 'Lick',            artists: ['Shenseea'],                album: 'Alpha',                  albumArt: art(5),  previewUrl: audio(7),  year: 2022, genre: 'dancehall', popularity: 82 },
  { id: 'dh2',  name: 'Crocodile Teeth', artists: ['Skillibeng'],              album: 'Crocodile Teeth',        albumArt: art(6),  previewUrl: audio(8),  year: 2020, genre: 'dancehall', popularity: 80 },
  { id: 'dh3',  name: 'Easy',            artists: ['Valiant'],                 album: 'Easy',                   albumArt: art(7),  previewUrl: audio(9),  year: 2023, genre: 'dancehall', popularity: 83 },
  { id: 'dh4',  name: 'Dunce Cheque',    artists: ['Valiant'],                 album: 'Dunce Cheque',           albumArt: art(8),  previewUrl: audio(10), year: 2023, genre: 'dancehall', popularity: 81 },
  { id: 'dh5',  name: 'Drift',           artists: ['Teejay'],                  album: 'Drift',                  albumArt: art(9),  previewUrl: audio(11), year: 2022, genre: 'dancehall', popularity: 79 },

  // ─── Afropop (5) ────────────────────────────────────────────────────────
  { id: 'ap1',  name: 'Fall',            artists: ['Davido'],                  album: 'A Good Time',            albumArt: art(0),  previewUrl: audio(12), year: 2017, genre: 'afropop', popularity: 91 },
  { id: 'ap2',  name: 'Come Closer',     artists: ['Wizkid', 'Drake'],         album: 'Sounds from the Other Side', albumArt: art(1), previewUrl: audio(13), year: 2017, genre: 'afropop', popularity: 88 },
  { id: 'ap3',  name: 'Johnny',          artists: ['Yemi Alade'],              album: 'King of Queens',         albumArt: art(2),  previewUrl: audio(14), year: 2014, genre: 'afropop', popularity: 85 },
  { id: 'ap4',  name: 'Dumebi',          artists: ['Rema'],                    album: 'Rema',                   albumArt: art(3),  previewUrl: audio(15), year: 2019, genre: 'afropop', popularity: 87 },
  { id: 'ap5',  name: 'Ojuelegba',       artists: ['Wizkid'],                  album: 'Ayo',                    albumArt: art(4),  previewUrl: audio(0),  year: 2014, genre: 'afropop', popularity: 86 },

  // ─── Extra Burna Boy (3 more → 6 total) ─────────────────────────────────
  { id: 'bb1',  name: 'Anybody',         artists: ['Burna Boy'],               album: 'Outside',                albumArt: art(5),  previewUrl: audio(1),  year: 2018, genre: 'afrobeats', popularity: 88 },
  { id: 'bb2',  name: 'On the Low',      artists: ['Burna Boy'],               album: 'African Giant',          albumArt: art(6),  previewUrl: audio(2),  year: 2019, genre: 'afrobeats', popularity: 90 },
  { id: 'bb3',  name: 'Gbona',           artists: ['Burna Boy'],               album: 'Outside',                albumArt: art(7),  previewUrl: audio(3),  year: 2018, genre: 'afrobeats', popularity: 85 },

  // ─── Extra Wizkid (3 more → 6 total) ────────────────────────────────────
  { id: 'wz1',  name: 'Fever',           artists: ['Wizkid'],                  album: 'Made In Lagos',          albumArt: art(8),  previewUrl: audio(4),  year: 2020, genre: 'afrobeats', popularity: 87 },
  { id: 'wz2',  name: 'Ginger',          artists: ['Wizkid', 'Burna Boy'],     album: 'Made In Lagos',          albumArt: art(9),  previewUrl: audio(5),  year: 2020, genre: 'afrobeats', popularity: 89 },
  { id: 'wz3',  name: 'Soco',            artists: ['Wizkid'],                  album: 'Sounds from the Other Side', albumArt: art(0), previewUrl: audio(6), year: 2018, genre: 'afrobeats', popularity: 86 },

  // ─── Extra Rema (3 more → 6 total) ──────────────────────────────────────
  { id: 'rm1',  name: 'Soundgasm',       artists: ['Rema'],                    album: 'Rave & Roses',           albumArt: art(1),  previewUrl: audio(7),  year: 2022, genre: 'afrobeats', popularity: 84 },
  { id: 'rm2',  name: 'Woman',           artists: ['Rema'],                    album: 'Rave & Roses',           albumArt: art(2),  previewUrl: audio(8),  year: 2022, genre: 'afrobeats', popularity: 83 },
  { id: 'rm3',  name: 'Beamer',          artists: ['Rema'],                    album: 'HEIS',                   albumArt: art(3),  previewUrl: audio(9),  year: 2024, genre: 'afrobeats', popularity: 82 },

  // ─── Extra Davido (3 more → 6 total) ────────────────────────────────────
  { id: 'dv1',  name: 'If',              artists: ['Davido'],                  album: 'A Good Time',            albumArt: art(4),  previewUrl: audio(10), year: 2017, genre: 'afrobeats', popularity: 91 },
  { id: 'dv2',  name: 'FIA',             artists: ['Davido'],                  album: 'A Good Time',            albumArt: art(5),  previewUrl: audio(11), year: 2017, genre: 'afrobeats', popularity: 87 },
  { id: 'dv3',  name: 'Fem',             artists: ['Davido'],                  album: 'A Better Time',          albumArt: art(6),  previewUrl: audio(12), year: 2020, genre: 'afrobeats', popularity: 85 },

  // ─── Extra Kendrick Lamar (3 more → 6 total) ────────────────────────────
  { id: 'kl1',  name: 'DNA.',            artists: ['Kendrick Lamar'],          album: 'DAMN.',                  albumArt: art(7),  previewUrl: audio(13), year: 2017, genre: 'hiphop', popularity: 94 },
  { id: 'kl2',  name: 'Swimming Pools',  artists: ['Kendrick Lamar'],          album: 'good kid m.A.A.d city',  albumArt: art(8),  previewUrl: audio(14), year: 2012, genre: 'hiphop', popularity: 92 },
  { id: 'kl3',  name: 'All The Stars',   artists: ['Kendrick Lamar', 'SZA'],   album: 'Black Panther',          albumArt: art(9),  previewUrl: audio(15), year: 2018, genre: 'hiphop', popularity: 93 },

  // ─── Extra Drake (2 more → 4 total) ─────────────────────────────────────
  { id: 'dk1',  name: 'Hotline Bling',   artists: ['Drake'],                   album: 'Views',                  albumArt: art(0),  previewUrl: audio(0),  year: 2015, genre: 'hiphop', popularity: 96 },
  { id: 'dk2',  name: 'One Dance',       artists: ['Drake', 'Wizkid'],         album: 'Views',                  albumArt: art(1),  previewUrl: audio(1),  year: 2016, genre: 'hiphop', popularity: 97 },
];

// ─── Get mock tracks with optional genre filter ───────────────────────────
export function getMockTracks(limit = 20, genre?: string): SpotifyTrack[] {
  let pool = [...MOCK_TRACKS];
  if (genre) {
    pool = pool.filter(t => t.genre === genre);
  }
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}

// ─── Get a deterministic daily track based on date ────────────────────────
export function getDailyTrack(date?: Date): SpotifyTrack {
  const d = date || new Date();
  const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % MOCK_TRACKS.length;
  return MOCK_TRACKS[index];
}

// ─── Get a daily challenge number (days since launch) ─────────────────────
export function getDailyNumber(date?: Date): number {
  const d = date || new Date();
  const launch = new Date(2026, 3, 25); // April 25, 2026
  const diff = d.getTime() - launch.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Artist Mode helpers ──────────────────────────────────────────────────
export function getTracksByArtist(artist: string): SpotifyTrack[] {
  return MOCK_TRACKS.filter(t =>
    t.artists.some(a => a.toLowerCase() === artist.toLowerCase())
  );
}

export function getAvailableArtists(minTracks = 4): { name: string; count: number; genre: string }[] {
  const artistMap: Record<string, { count: number; genre: string }> = {};
  for (const track of MOCK_TRACKS) {
    for (const artist of track.artists) {
      if (!artistMap[artist]) {
        artistMap[artist] = { count: 0, genre: track.genre || 'afrobeats' };
      }
      artistMap[artist].count++;
    }
  }
  return Object.entries(artistMap)
    .filter(([, data]) => data.count >= minTracks)
    .map(([name, data]) => ({ name, count: data.count, genre: data.genre }))
    .sort((a, b) => b.count - a.count);
}

// ─── Get random wrong choices for speed round ─────────────────────────────
export function getRandomChoices(correctTrack: SpotifyTrack, count = 3): SpotifyTrack[] {
  const others = MOCK_TRACKS.filter(t => t.id !== correctTrack.id);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
