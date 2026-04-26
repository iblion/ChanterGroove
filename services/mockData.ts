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

  // ─── Fuji (10) ──────────────────────────────────────────────────────────
  // Yoruba percussive Islamic-derived genre pioneered by Sikiru Ayinde Barrister
  // in late 1960s Lagos; carried forward by KWAM 1, Pasuma, Obesere, Saheed Osupa.
  { id: 'fj1',  name: 'Fuji Garbage',    artists: ['Sikiru Ayinde Barrister'], album: 'Fuji Garbage',           albumArt: art(2),  previewUrl: audio(2),  year: 1991, genre: 'fuji', popularity: 78 },
  { id: 'fj2',  name: 'Iwa',             artists: ['Sikiru Ayinde Barrister'], album: 'Iwa',                    albumArt: art(3),  previewUrl: audio(3),  year: 1985, genre: 'fuji', popularity: 75 },
  { id: 'fj3',  name: 'Fuji Reggae',     artists: ['Sikiru Ayinde Barrister'], album: 'Fuji Reggae',            albumArt: art(4),  previewUrl: audio(4),  year: 1988, genre: 'fuji', popularity: 73 },
  { id: 'fj4',  name: 'America to Vagas', artists: ['KWAM 1'],                 album: 'America to Vagas',       albumArt: art(5),  previewUrl: audio(5),  year: 1996, genre: 'fuji', popularity: 80 },
  { id: 'fj5',  name: 'Ka Lo Po Mo',     artists: ['KWAM 1'],                  album: 'Royal Mass',             albumArt: art(6),  previewUrl: audio(6),  year: 1998, genre: 'fuji', popularity: 77 },
  { id: 'fj6',  name: 'Consolidation',   artists: ['KWAM 1'],                  album: 'Consolidation',          albumArt: art(7),  previewUrl: audio(7),  year: 2003, genre: 'fuji', popularity: 76 },
  { id: 'fj7',  name: 'Ijo Olomi',       artists: ['Pasuma'],                  album: 'Recognition',            albumArt: art(8),  previewUrl: audio(8),  year: 2002, genre: 'fuji', popularity: 79 },
  { id: 'fj8',  name: 'Orobokibo',       artists: ['Pasuma'],                  album: 'Orobokibo',              albumArt: art(9),  previewUrl: audio(9),  year: 2017, genre: 'fuji', popularity: 81 },
  { id: 'fj9',  name: 'Egungun Be Careful', artists: ['Obesere'],              album: 'Asakasa',                albumArt: art(0),  previewUrl: audio(10), year: 2002, genre: 'fuji', popularity: 84 },
  { id: 'fj10', name: 'Story Continues', artists: ['Saheed Osupa'],            album: 'Saviour',                albumArt: art(1),  previewUrl: audio(11), year: 2010, genre: 'fuji', popularity: 75 },
  { id: 'fj11', name: 'Mr Money',        artists: ['Sikiru Ayinde Barrister'], album: 'Mr Money',               albumArt: art(2),  previewUrl: audio(12), year: 1990, genre: 'fuji', popularity: 74 },
  { id: 'fj12', name: 'New Fuji Garbage', artists: ['Sikiru Ayinde Barrister'],album: 'New Fuji Garbage',       albumArt: art(3),  previewUrl: audio(13), year: 1993, genre: 'fuji', popularity: 76 },
  { id: 'fj13', name: 'Olalomi',         artists: ['KWAM 1'],                  album: 'Olalomi',                albumArt: art(4),  previewUrl: audio(14), year: 2000, genre: 'fuji', popularity: 75 },
  { id: 'fj14', name: 'E Ko Easy',       artists: ['Pasuma'],                  album: 'E Ko Easy',              albumArt: art(5),  previewUrl: audio(15), year: 2009, genre: 'fuji', popularity: 78 },
  { id: 'fj15', name: 'Talazo',          artists: ['Adewale Ayuba'],           album: 'Bubble',                 albumArt: art(6),  previewUrl: audio(0),  year: 1992, genre: 'fuji', popularity: 77 },

  // ─── Extra Asake (3 more → 5 total) ─────────────────────────────────────
  { id: 'as1',  name: 'Lonely At The Top', artists: ['Asake'],                 album: 'Work of Art',            albumArt: art(2),  previewUrl: audio(12), year: 2023, genre: 'afrobeats', popularity: 89 },
  { id: 'as2',  name: 'Joha',            artists: ['Asake'],                   album: 'Mr Money With the Vibe', albumArt: art(3),  previewUrl: audio(13), year: 2022, genre: 'afrobeats', popularity: 86 },
  { id: 'as3',  name: 'Sungba',          artists: ['Asake', 'Burna Boy'],      album: 'Mr Money With the Vibe', albumArt: art(4),  previewUrl: audio(14), year: 2022, genre: 'afrobeats', popularity: 90 },

  // ─── Extra Tems (3 more → 5 total) ──────────────────────────────────────
  { id: 'tm1',  name: 'Higher',          artists: ['Tems'],                    album: 'For Broken Ears',        albumArt: art(5),  previewUrl: audio(15), year: 2020, genre: 'afrobeats', popularity: 86 },
  { id: 'tm2',  name: 'Crazy Tings',     artists: ['Tems'],                    album: 'If Orange Was a Place',  albumArt: art(6),  previewUrl: audio(0),  year: 2021, genre: 'afrobeats', popularity: 85 },
  { id: 'tm3',  name: 'Me & U',          artists: ['Tems'],                    album: 'Born In The Wild',       albumArt: art(7),  previewUrl: audio(1),  year: 2024, genre: 'afrobeats', popularity: 88 },

  // ─── Extra Tiwa Savage (3 more → 5 total) ───────────────────────────────
  { id: 'ts1',  name: 'Somebody\u0027s Son', artists: ['Tiwa Savage', 'Brandy'], album: 'Water & Garri',        albumArt: art(8),  previewUrl: audio(2),  year: 2021, genre: 'afrobeats', popularity: 84 },
  { id: 'ts2',  name: 'Koroba',          artists: ['Tiwa Savage'],             album: 'Celia',                  albumArt: art(9),  previewUrl: audio(3),  year: 2020, genre: 'afrobeats', popularity: 82 },
  { id: 'ts3',  name: 'Stamina',         artists: ['Tiwa Savage', 'Ayra Starr', 'Young Jonn'], album: 'Stamina', albumArt: art(0), previewUrl: audio(4), year: 2024, genre: 'afrobeats', popularity: 85 },

  // ─── Extra Ayra Starr (3 more → 5 total) ────────────────────────────────
  { id: 'ay1',  name: 'Sability',        artists: ['Ayra Starr'],              album: 'The Year I Turned 21',   albumArt: art(1),  previewUrl: audio(5),  year: 2024, genre: 'afrobeats', popularity: 88 },
  { id: 'ay2',  name: 'Commas',          artists: ['Ayra Starr'],              album: 'The Year I Turned 21',   albumArt: art(2),  previewUrl: audio(6),  year: 2023, genre: 'afrobeats', popularity: 84 },
  { id: 'ay3',  name: 'Beggie Beggie',   artists: ['Ayra Starr', 'CKay'],      album: '19 & Dangerous',         albumArt: art(3),  previewUrl: audio(7),  year: 2021, genre: 'afrobeats', popularity: 83 },

  // ─── Extra Kizz Daniel (3 more → 5 total) ───────────────────────────────
  { id: 'kd1',  name: 'Cough (Odo)',     artists: ['Kizz Daniel'],             album: 'Cough',                  albumArt: art(4),  previewUrl: audio(8),  year: 2022, genre: 'afrobeats', popularity: 86 },
  { id: 'kd2',  name: 'RTID',            artists: ['Kizz Daniel'],             album: 'RTID',                   albumArt: art(5),  previewUrl: audio(9),  year: 2023, genre: 'afrobeats', popularity: 82 },
  { id: 'kd3',  name: 'Twe Twe',         artists: ['Kizz Daniel'],             album: 'Twe Twe',                albumArt: art(6),  previewUrl: audio(10), year: 2023, genre: 'afrobeats', popularity: 87 },

  // ─── Extra Fireboy DML (3 more → 4 total) ───────────────────────────────
  { id: 'fb1',  name: 'Bandana',         artists: ['Fireboy DML', 'Asake'],    album: 'Playboy',                albumArt: art(7),  previewUrl: audio(11), year: 2022, genre: 'afrobeats', popularity: 88 },
  { id: 'fb2',  name: 'Vibration',       artists: ['Fireboy DML'],             album: 'Apollo',                 albumArt: art(8),  previewUrl: audio(12), year: 2020, genre: 'afrobeats', popularity: 81 },
  { id: 'fb3',  name: 'Playboy',         artists: ['Fireboy DML'],             album: 'Playboy',                albumArt: art(9),  previewUrl: audio(13), year: 2022, genre: 'afrobeats', popularity: 84 },

  // ─── Extra CKay (3 more → 4 total) ──────────────────────────────────────
  { id: 'ck1',  name: 'Felony',          artists: ['CKay'],                    album: 'Sad Romance',            albumArt: art(0),  previewUrl: audio(14), year: 2022, genre: 'afrobeats', popularity: 80 },
  { id: 'ck2',  name: 'Emiliana',        artists: ['CKay'],                    album: 'Sad Romance',            albumArt: art(1),  previewUrl: audio(15), year: 2022, genre: 'afrobeats', popularity: 82 },
  { id: 'ck3',  name: 'Watawi',          artists: ['CKay', 'Davido', 'Focalistic'], album: 'Sad Romance',       albumArt: art(2),  previewUrl: audio(0),  year: 2022, genre: 'afrobeats', popularity: 83 },

  // ─── Joeboy (4) ─────────────────────────────────────────────────────────
  { id: 'jb1',  name: 'Beginning',       artists: ['Joeboy'],                  album: 'Somewhere Between Beauty & Magic', albumArt: art(3), previewUrl: audio(1), year: 2020, genre: 'afrobeats', popularity: 84 },
  { id: 'jb2',  name: 'Sip (Alcohol)',   artists: ['Joeboy'],                  album: 'Sip',                    albumArt: art(4),  previewUrl: audio(2),  year: 2021, genre: 'afrobeats', popularity: 85 },
  { id: 'jb3',  name: 'Baby',            artists: ['Joeboy'],                  album: 'Love & Light',           albumArt: art(5),  previewUrl: audio(3),  year: 2019, genre: 'afrobeats', popularity: 86 },
  { id: 'jb4',  name: 'Body & Soul',     artists: ['Joeboy'],                  album: 'Body & Soul',            albumArt: art(6),  previewUrl: audio(4),  year: 2023, genre: 'afrobeats', popularity: 80 },

  // ─── Mr Eazi (4) ────────────────────────────────────────────────────────
  { id: 'me1',  name: 'Pour Me Water',   artists: ['Mr Eazi'],                 album: 'Lagos to London',        albumArt: art(7),  previewUrl: audio(5),  year: 2018, genre: 'afrobeats', popularity: 82 },
  { id: 'me2',  name: 'Skin Tight',      artists: ['Mr Eazi', 'Efya'],         album: 'Life Is Eazi Vol. 1',    albumArt: art(8),  previewUrl: audio(6),  year: 2017, genre: 'afrobeats', popularity: 80 },
  { id: 'me3',  name: 'Leg Over',        artists: ['Mr Eazi'],                 album: 'Life Is Eazi Vol. 1',    albumArt: art(9),  previewUrl: audio(7),  year: 2017, genre: 'afrobeats', popularity: 84 },
  { id: 'me4',  name: 'Tony Montana',    artists: ['Mr Eazi'],                 album: 'Tony Montana',           albumArt: art(0),  previewUrl: audio(8),  year: 2024, genre: 'afrobeats', popularity: 78 },

  // ─── Patoranking (4) ────────────────────────────────────────────────────
  { id: 'pt1',  name: 'No Kissing Baby', artists: ['Patoranking', 'Sarkodie'], album: 'God Over Everything',    albumArt: art(1),  previewUrl: audio(9),  year: 2016, genre: 'afrobeats', popularity: 82 },
  { id: 'pt2',  name: 'Abule',           artists: ['Patoranking'],             album: 'Three',                  albumArt: art(2),  previewUrl: audio(10), year: 2020, genre: 'afrobeats', popularity: 83 },
  { id: 'pt3',  name: 'Available',       artists: ['Patoranking'],             album: 'Wilmer',                 albumArt: art(3),  previewUrl: audio(11), year: 2019, genre: 'afrobeats', popularity: 81 },
  { id: 'pt4',  name: 'Higher',          artists: ['Patoranking'],             album: 'Higher',                 albumArt: art(4),  previewUrl: audio(12), year: 2024, genre: 'afrobeats', popularity: 79 },

  // ─── 2Baba (4 — Afrobeats legend) ───────────────────────────────────────
  { id: 'tb1',  name: 'African Queen',   artists: ['2Baba'],                   album: 'Face 2 Face',            albumArt: art(5),  previewUrl: audio(13), year: 2004, genre: 'afrobeats', popularity: 90 },
  { id: 'tb2',  name: 'Implication',     artists: ['2Baba'],                   album: 'Grass to Grace',         albumArt: art(6),  previewUrl: audio(14), year: 2006, genre: 'afrobeats', popularity: 84 },
  { id: 'tb3',  name: 'Only Me',         artists: ['2Baba'],                   album: 'The Ascension',          albumArt: art(7),  previewUrl: audio(15), year: 2014, genre: 'afrobeats', popularity: 82 },
  { id: 'tb4',  name: 'Oyi',             artists: ['2Baba'],                   album: 'Away & Beyond',          albumArt: art(8),  previewUrl: audio(0),  year: 2009, genre: 'afrobeats', popularity: 81 },

  // ─── Extra SZA (1 more → 4 total) ───────────────────────────────────────
  { id: 'sz1',  name: 'Good Days',       artists: ['SZA'],                     album: 'SOS',                    albumArt: art(9),  previewUrl: audio(1),  year: 2020, genre: 'rnb', popularity: 92 },

  // ─── Extra Fuji (15 more → 30 total) ────────────────────────────────────
  { id: 'fj16', name: 'Garbage Reloaded', artists: ['Sikiru Ayinde Barrister'], album: 'Reloaded',              albumArt: art(0),  previewUrl: audio(2),  year: 2002, genre: 'fuji', popularity: 73 },
  { id: 'fj17', name: 'Current Affairs',  artists: ['Sikiru Ayinde Barrister'], album: 'Current Affairs',       albumArt: art(1),  previewUrl: audio(3),  year: 1995, genre: 'fuji', popularity: 72 },
  { id: 'fj18', name: 'Fuji Vibration',   artists: ['KWAM 1'],                  album: 'Fuji Vibration',        albumArt: art(2),  previewUrl: audio(4),  year: 2005, genre: 'fuji', popularity: 78 },
  { id: 'fj19', name: 'Eko Phenomenon',   artists: ['KWAM 1'],                  album: 'Eko Phenomenon',        albumArt: art(3),  previewUrl: audio(5),  year: 2008, genre: 'fuji', popularity: 76 },
  { id: 'fj20', name: 'Mr Vibration',     artists: ['Pasuma'],                  album: 'Mr Vibration',          albumArt: art(4),  previewUrl: audio(6),  year: 2014, genre: 'fuji', popularity: 79 },
  { id: 'fj21', name: 'Recognition',      artists: ['Pasuma'],                  album: 'Recognition',           albumArt: art(5),  previewUrl: audio(7),  year: 1998, genre: 'fuji', popularity: 75 },
  { id: 'fj22', name: 'Asakasa',          artists: ['Obesere'],                 album: 'Asakasa',               albumArt: art(6),  previewUrl: audio(8),  year: 2002, genre: 'fuji', popularity: 80 },
  { id: 'fj23', name: 'Egba Mi O',        artists: ['Obesere'],                 album: 'Egba Mi O',             albumArt: art(7),  previewUrl: audio(9),  year: 2005, genre: 'fuji', popularity: 76 },
  { id: 'fj24', name: 'Saviour',          artists: ['Saheed Osupa'],            album: 'Saviour',               albumArt: art(8),  previewUrl: audio(10), year: 2007, genre: 'fuji', popularity: 74 },
  { id: 'fj25', name: 'Ija Eepa',         artists: ['Saheed Osupa'],            album: 'Ija Eepa',              albumArt: art(9),  previewUrl: audio(11), year: 2003, genre: 'fuji', popularity: 73 },
  { id: 'fj26', name: 'Bubble',           artists: ['Adewale Ayuba'],           album: 'Bubble',                albumArt: art(0),  previewUrl: audio(12), year: 1997, genre: 'fuji', popularity: 78 },
  { id: 'fj27', name: 'Fuji Satisfaction', artists: ['Adewale Ayuba'],          album: 'Fuji Satisfaction',     albumArt: art(1),  previewUrl: audio(13), year: 2000, genre: 'fuji', popularity: 76 },
  { id: 'fj28', name: 'Esa Ma Miss Road', artists: ['Wasiu Alabi Pasuma'],      album: 'Esa Ma Miss Road',      albumArt: art(2),  previewUrl: audio(14), year: 2010, genre: 'fuji', popularity: 75 },
  { id: 'fj29', name: 'Fuji Garbage Vol 2', artists: ['Sikiru Ayinde Barrister'], album: 'Fuji Garbage Vol 2', albumArt: art(3),  previewUrl: audio(15), year: 1992, genre: 'fuji', popularity: 71 },
  { id: 'fj30', name: 'Open & Close',     artists: ['KWAM 1'],                  album: 'Open & Close',          albumArt: art(4),  previewUrl: audio(0),  year: 2012, genre: 'fuji', popularity: 73 },

  // ─── Highlife (10) ──────────────────────────────────────────────────────
  // Ghanaian/Nigerian guitar-band tradition; influenced everything from Afrobeat to Afrobeats.
  { id: 'hl1',  name: 'Sweet Mother',     artists: ['Prince Nico Mbarga'],      album: 'Sweet Mother',          albumArt: art(5),  previewUrl: audio(1),  year: 1976, genre: 'highlife', popularity: 92 },
  { id: 'hl2',  name: 'Yamore',           artists: ['Salif Keita', 'Cesaria Evora'], album: 'Moffou',           albumArt: art(6),  previewUrl: audio(2),  year: 2002, genre: 'highlife', popularity: 78 },
  { id: 'hl3',  name: 'Joromi',           artists: ['Sir Victor Uwaifo'],       album: 'Joromi',                albumArt: art(7),  previewUrl: audio(3),  year: 1969, genre: 'highlife', popularity: 80 },
  { id: 'hl4',  name: 'Sakoma',           artists: ['Osibisa'],                 album: 'Woyaya',                albumArt: art(8),  previewUrl: audio(4),  year: 1971, genre: 'highlife', popularity: 76 },
  { id: 'hl5',  name: 'Adure',            artists: ['Flavour'],                 album: 'Uplifted',              albumArt: art(9),  previewUrl: audio(5),  year: 2010, genre: 'highlife', popularity: 84 },
  { id: 'hl6',  name: 'Ada Ada',          artists: ['Flavour'],                 album: 'Thankful',              albumArt: art(0),  previewUrl: audio(6),  year: 2014, genre: 'highlife', popularity: 86 },
  { id: 'hl7',  name: 'Time No Dey',      artists: ['Flavour'],                 album: 'Flavour of Africa',     albumArt: art(1),  previewUrl: audio(7),  year: 2021, genre: 'highlife', popularity: 82 },
  { id: 'hl8',  name: 'Onye',             artists: ['Phyno', 'Flavour'],        album: 'Deal With It',          albumArt: art(2),  previewUrl: audio(8),  year: 2019, genre: 'highlife', popularity: 81 },
  { id: 'hl9',  name: 'Otoolege',         artists: ['Sarkodie', 'Castro'],      album: 'Sarkology',             albumArt: art(3),  previewUrl: audio(9),  year: 2014, genre: 'highlife', popularity: 80 },
  { id: 'hl10', name: 'Daddy Lumba Special', artists: ['Daddy Lumba'],          album: 'Aben Wo Ha',            albumArt: art(4),  previewUrl: audio(10), year: 1998, genre: 'highlife', popularity: 79 },

  // ─── Juju (8) ───────────────────────────────────────────────────────────
  // Yoruba talking-drum + electric guitar tradition; King Sunny Ade & Ebenezer Obey.
  { id: 'jj1',  name: 'Synchro System',   artists: ['King Sunny Ade'],          album: 'Synchro System',        albumArt: art(5),  previewUrl: audio(11), year: 1983, genre: 'juju', popularity: 82 },
  { id: 'jj2',  name: '365 Is My Number', artists: ['King Sunny Ade'],          album: '365 Is My Number',      albumArt: art(6),  previewUrl: audio(12), year: 1980, genre: 'juju', popularity: 78 },
  { id: 'jj3',  name: 'Ja Funmi',         artists: ['King Sunny Ade'],          album: 'Juju Music',            albumArt: art(7),  previewUrl: audio(13), year: 1982, genre: 'juju', popularity: 76 },
  { id: 'jj4',  name: 'E Sa Ma Miss Road', artists: ['Ebenezer Obey'],          album: 'Miliki Sound',          albumArt: art(8),  previewUrl: audio(14), year: 1979, genre: 'juju', popularity: 77 },
  { id: 'jj5',  name: 'Board Members',    artists: ['Ebenezer Obey'],           album: 'Board Members',         albumArt: art(9),  previewUrl: audio(15), year: 1976, genre: 'juju', popularity: 74 },
  { id: 'jj6',  name: 'Aimasiko',         artists: ['Ebenezer Obey'],           album: 'Aimasiko',              albumArt: art(0),  previewUrl: audio(0),  year: 1981, genre: 'juju', popularity: 75 },
  { id: 'jj7',  name: 'My Dear',          artists: ['King Sunny Ade'],          album: 'Aura',                  albumArt: art(1),  previewUrl: audio(1),  year: 1984, genre: 'juju', popularity: 73 },
  { id: 'jj8',  name: 'Mo Ti Mo',         artists: ['Sir Shina Peters'],        album: 'Ace',                   albumArt: art(2),  previewUrl: audio(2),  year: 1989, genre: 'juju', popularity: 76 },

  // ─── Gospel (10) ────────────────────────────────────────────────────────
  // Mix of African and global gospel — Sinach, Frank Edwards, Hillsong, Mercy Chinwo.
  { id: 'gs1',  name: 'Way Maker',        artists: ['Sinach'],                  album: 'Way Maker',             albumArt: art(3),  previewUrl: audio(3),  year: 2015, genre: 'gospel', popularity: 92 },
  { id: 'gs2',  name: 'I Know Who I Am',  artists: ['Sinach'],                  album: 'I Know Who I Am',       albumArt: art(4),  previewUrl: audio(4),  year: 2012, genre: 'gospel', popularity: 84 },
  { id: 'gs3',  name: 'Excess Love',      artists: ['Mercy Chinwo'],            album: 'Excess Love',           albumArt: art(5),  previewUrl: audio(5),  year: 2018, genre: 'gospel', popularity: 88 },
  { id: 'gs4',  name: 'Akamdinelu',       artists: ['Mercy Chinwo'],            album: 'Satisfied',             albumArt: art(6),  previewUrl: audio(6),  year: 2020, genre: 'gospel', popularity: 85 },
  { id: 'gs5',  name: 'Praise',           artists: ['Elevation Worship'],       album: 'CAN YOU IMAGINE?',      albumArt: art(7),  previewUrl: audio(7),  year: 2023, genre: 'gospel', popularity: 87 },
  { id: 'gs6',  name: 'Goodness of God',  artists: ['CeCe Winans'],             album: 'Believe For It',        albumArt: art(8),  previewUrl: audio(8),  year: 2021, genre: 'gospel', popularity: 86 },
  { id: 'gs7',  name: 'Halleluyah Amen',  artists: ['Frank Edwards'],           album: 'Genesis',               albumArt: art(9),  previewUrl: audio(9),  year: 2019, genre: 'gospel', popularity: 80 },
  { id: 'gs8',  name: 'Imela',            artists: ['Nathaniel Bassey', 'Enitan Adaba'], album: 'This God Is Too Good', albumArt: art(0), previewUrl: audio(10), year: 2014, genre: 'gospel', popularity: 82 },
  { id: 'gs9',  name: 'Olowogbogboro',    artists: ['Nathaniel Bassey'],        album: 'You Reign',             albumArt: art(1),  previewUrl: audio(11), year: 2017, genre: 'gospel', popularity: 81 },
  { id: 'gs10', name: 'I Made A Mistake', artists: ['Tope Alabi'],              album: 'I Made A Mistake',      albumArt: art(2),  previewUrl: audio(12), year: 2021, genre: 'gospel', popularity: 78 },

  // ─── Reggae (10) ────────────────────────────────────────────────────────
  { id: 'rg1',  name: 'No Woman No Cry',  artists: ['Bob Marley & The Wailers'], album: 'Natty Dread',          albumArt: art(3),  previewUrl: audio(13), year: 1974, genre: 'reggae', popularity: 96 },
  { id: 'rg2',  name: 'Three Little Birds', artists: ['Bob Marley & The Wailers'], album: 'Exodus',             albumArt: art(4),  previewUrl: audio(14), year: 1977, genre: 'reggae', popularity: 95 },
  { id: 'rg3',  name: 'Could You Be Loved', artists: ['Bob Marley & The Wailers'], album: 'Uprising',           albumArt: art(5),  previewUrl: audio(15), year: 1980, genre: 'reggae', popularity: 94 },
  { id: 'rg4',  name: 'Welcome to Jamrock', artists: ['Damian Marley'],         album: 'Welcome to Jamrock',    albumArt: art(6),  previewUrl: audio(0),  year: 2005, genre: 'reggae', popularity: 90 },
  { id: 'rg5',  name: 'Burnin and Lootin', artists: ['Bob Marley & The Wailers'], album: 'Burnin\u0027',        albumArt: art(7),  previewUrl: audio(1),  year: 1973, genre: 'reggae', popularity: 86 },
  { id: 'rg6',  name: 'Many More Roads',  artists: ['Chronixx'],                album: 'Chronology',            albumArt: art(8),  previewUrl: audio(2),  year: 2017, genre: 'reggae', popularity: 82 },
  { id: 'rg7',  name: 'Stir It Up',       artists: ['Bob Marley & The Wailers'], album: 'Catch a Fire',         albumArt: art(9),  previewUrl: audio(3),  year: 1973, genre: 'reggae', popularity: 89 },
  { id: 'rg8',  name: 'Africa Unite',     artists: ['Bob Marley & The Wailers'], album: 'Survival',             albumArt: art(0),  previewUrl: audio(4),  year: 1979, genre: 'reggae', popularity: 84 },
  { id: 'rg9',  name: 'Murderer',         artists: ['Buju Banton'],             album: 'Til Shiloh',            albumArt: art(1),  previewUrl: audio(5),  year: 1995, genre: 'reggae', popularity: 81 },
  { id: 'rg10', name: 'Untold Stories',   artists: ['Buju Banton'],             album: 'Til Shiloh',            albumArt: art(2),  previewUrl: audio(6),  year: 1995, genre: 'reggae', popularity: 83 },

  // ─── Hausa Hip-Hop (8) ──────────────────────────────────────────────────
  // Northern Nigerian rap; Classiq, Ziriums, Deezell, Lil Prince, Morell.
  { id: 'hh101', name: 'Tsegumi',         artists: ['Classiq'],                 album: 'Mr Sufuri',             albumArt: art(3),  previewUrl: audio(7),  year: 2017, genre: 'hausa-hiphop', popularity: 72 },
  { id: 'hh102', name: 'Kogin Kwarara',   artists: ['Classiq', 'Phyno'],        album: 'Single',                albumArt: art(4),  previewUrl: audio(8),  year: 2019, genre: 'hausa-hiphop', popularity: 75 },
  { id: 'hh103', name: 'Wakar Soyayya',   artists: ['Ziriums'],                 album: 'Hausa Hip Hop',         albumArt: art(5),  previewUrl: audio(9),  year: 2014, genre: 'hausa-hiphop', popularity: 70 },
  { id: 'hh104', name: 'Anuwa',           artists: ['Deezell'],                 album: 'Northern Anthem',       albumArt: art(6),  previewUrl: audio(10), year: 2020, genre: 'hausa-hiphop', popularity: 73 },
  { id: 'hh105', name: 'Sarauta',         artists: ['Lil Prince'],              album: 'Sarauta',               albumArt: art(7),  previewUrl: audio(11), year: 2018, genre: 'hausa-hiphop', popularity: 68 },
  { id: 'hh106', name: 'Tabbatar',        artists: ['Morell'],                  album: 'Tabbatar',              albumArt: art(8),  previewUrl: audio(12), year: 2021, genre: 'hausa-hiphop', popularity: 70 },
  { id: 'hh107', name: 'Arewa Anthem',    artists: ['Classiq', 'Deezell'],      album: 'Arewa Anthem',          albumArt: art(9),  previewUrl: audio(13), year: 2022, genre: 'hausa-hiphop', popularity: 74 },
  { id: 'hh108', name: 'Sakarai',         artists: ['Morell'],                  album: 'Sakarai',               albumArt: art(0),  previewUrl: audio(14), year: 2019, genre: 'hausa-hiphop', popularity: 71 },

  // ─── Bongo Flava (10) ───────────────────────────────────────────────────
  // Tanzanian pop; Diamond Platnumz, Harmonize, Rayvanny, Ali Kiba, Zuchu.
  { id: 'bf1',  name: 'Jeje',             artists: ['Diamond Platnumz'],        album: 'A Boy from Tandale',    albumArt: art(1),  previewUrl: audio(15), year: 2018, genre: 'bongo-flava', popularity: 85 },
  { id: 'bf2',  name: 'Tetema',           artists: ['Rayvanny', 'Diamond Platnumz'], album: 'Tetema',           albumArt: art(2),  previewUrl: audio(0),  year: 2019, genre: 'bongo-flava', popularity: 88 },
  { id: 'bf3',  name: 'Inama',            artists: ['Diamond Platnumz', 'Fally Ipupa'], album: 'A Boy from Tandale', albumArt: art(3), previewUrl: audio(1), year: 2018, genre: 'bongo-flava', popularity: 84 },
  { id: 'bf4',  name: 'Iyena',            artists: ['Diamond Platnumz'],        album: 'Iyena',                 albumArt: art(4),  previewUrl: audio(2),  year: 2020, genre: 'bongo-flava', popularity: 82 },
  { id: 'bf5',  name: 'Kainama',          artists: ['Harmonize', 'Diamond Platnumz', 'Burna Boy'], album: 'Afro East', albumArt: art(5), previewUrl: audio(3), year: 2018, genre: 'bongo-flava', popularity: 86 },
  { id: 'bf6',  name: 'Uno',              artists: ['Harmonize'],               album: 'Afro East',             albumArt: art(6),  previewUrl: audio(4),  year: 2019, genre: 'bongo-flava', popularity: 80 },
  { id: 'bf7',  name: 'Sisi Kwa Sisi',    artists: ['Ali Kiba'],                album: 'Mvumo wa Radi',         albumArt: art(7),  previewUrl: audio(5),  year: 2017, genre: 'bongo-flava', popularity: 78 },
  { id: 'bf8',  name: 'Seduce Me',        artists: ['Ali Kiba'],                album: 'Seduce Me',             albumArt: art(8),  previewUrl: audio(6),  year: 2016, genre: 'bongo-flava', popularity: 79 },
  { id: 'bf9',  name: 'Sukari',           artists: ['Zuchu'],                   album: 'I Am Zuchu',            albumArt: art(9),  previewUrl: audio(7),  year: 2020, genre: 'bongo-flava', popularity: 81 },
  { id: 'bf10', name: 'Cheche',           artists: ['Zuchu'],                   album: 'Cheche',                albumArt: art(0),  previewUrl: audio(8),  year: 2022, genre: 'bongo-flava', popularity: 80 },

  // ─── Coupé-Décalé (8) ───────────────────────────────────────────────────
  // Ivorian dance music; DJ Arafat, Serge Beynaud, Debordo Leekunfa, Magic System.
  { id: 'cd1',  name: 'Premier Gaou',     artists: ['Magic System'],            album: '1er Gaou',              albumArt: art(1),  previewUrl: audio(9),  year: 1999, genre: 'coupe-decale', popularity: 87 },
  { id: 'cd2',  name: 'Magic in the Air', artists: ['Magic System', 'Chawki'],  album: 'Africainement Votre',   albumArt: art(2),  previewUrl: audio(10), year: 2014, genre: 'coupe-decale', popularity: 85 },
  { id: 'cd3',  name: 'Moto Moto',        artists: ['DJ Arafat'],               album: 'Moto Moto',             albumArt: art(3),  previewUrl: audio(11), year: 2017, genre: 'coupe-decale', popularity: 80 },
  { id: 'cd4',  name: 'Dosabado',         artists: ['DJ Arafat'],               album: 'Renaissance',           albumArt: art(4),  previewUrl: audio(12), year: 2018, genre: 'coupe-decale', popularity: 78 },
  { id: 'cd5',  name: 'Sans Faille',      artists: ['Serge Beynaud'],           album: 'Sans Faille',           albumArt: art(5),  previewUrl: audio(13), year: 2017, genre: 'coupe-decale', popularity: 76 },
  { id: 'cd6',  name: 'Talancan',         artists: ['Serge Beynaud'],           album: 'Talancan',              albumArt: art(6),  previewUrl: audio(14), year: 2015, genre: 'coupe-decale', popularity: 75 },
  { id: 'cd7',  name: 'Bobaraba',         artists: ['DJ Mix', 'DJ Eloh'],       album: 'Bobaraba',              albumArt: art(7),  previewUrl: audio(15), year: 2008, genre: 'coupe-decale', popularity: 77 },
  { id: 'cd8',  name: 'Dechouquetage',    artists: ['Debordo Leekunfa'],        album: 'Dechouquetage',         albumArt: art(8),  previewUrl: audio(0),  year: 2016, genre: 'coupe-decale', popularity: 74 },
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
