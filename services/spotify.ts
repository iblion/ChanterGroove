import { findItunesPreviewUrl } from './itunes';

// ─── Spotify Service ───────────────────────────────────────────────────────
// Uses Spotify Client Credentials flow (no user login needed for previews)
// Set your credentials in .env:
//   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=xxx
//   EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=xxx

const CLIENT_ID =
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ||
  process.env.SPOTIFY_CLIENT_ID ||
  '';
const CLIENT_SECRET =
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET ||
  process.env.SPOTIFY_CLIENT_SECRET ||
  '';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

let cachedToken: { token: string; expiresAt: number } | null = null;
let lastSpotifyError = '';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string;
  previewUrl: string | null;
  year: number;
  genre?: string;
  artistGenres?: string[];
  popularity: number;
  audioSource?: 'spotify' | 'itunes';
}

export interface TrackFetchResult {
  tracks: SpotifyTrack[];
  source: 'spotify_live' | 'mixed_live' | 'fallback';
  spotifyPreviewCount: number;
  itunesPreviewCount: number;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify credentials are missing');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  let res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  // Fallback to Basic auth if provider rejects credential-in-body.
  if (!res.ok) {
    const basic = encodeBase64(`${CLIENT_ID}:${CLIENT_SECRET}`);
    res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
  }

  if (!res.ok) {
    const msg = await res.text();
    lastSpotifyError = `token_error: ${msg}`;
    throw new Error(`Failed to get Spotify token: ${msg}`);
  }
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// ─── Fetch Tracks ──────────────────────────────────────────────────────────
export async function fetchTracksForGame(options: {
  genre?: string;
  artist?: string;
  decadeStart?: number;
  decadeEnd?: number;
  limit?: number;
}): Promise<SpotifyTrack[]> {
  const result = await fetchTracksForGameDetailed(options);
  return result.tracks;
}

export async function fetchTracksForGameDetailed(options: {
  genre?: string;
  artist?: string;
  decadeStart?: number;
  decadeEnd?: number;
  limit?: number;
}): Promise<TrackFetchResult> {
  const token = await getAccessToken();
  const { genre = 'afrobeats', artist, decadeStart, decadeEnd, limit = 20 } = options;
  const requestedLimit = Number.isFinite(limit) ? Math.floor(limit) : 20;
  const safeLimit = Math.min(50, Math.max(1, requestedLimit));
  const deduped = new Map<string, SpotifyTrack>();
  const safeGenre = String(genre).replace(/[^\w-]/g, '').toLowerCase() || 'afrobeats';
  const safeArtist = (artist || '').trim();
  const safeDecadeStart = Number.isFinite(decadeStart) ? Number(decadeStart) : undefined;
  const safeDecadeEnd = Number.isFinite(decadeEnd) ? Number(decadeEnd) : undefined;
  const yearFilter =
    safeDecadeStart && safeDecadeEnd ? ` year:${safeDecadeStart}-${safeDecadeEnd}` : '';
  const queries = safeArtist
    ? [
        `artist:"${safeArtist}"${yearFilter}`,
        `${safeArtist}${yearFilter}`,
        `artist:${safeArtist}`,
        safeArtist,
      ]
    : [
        `genre:${safeGenre}${yearFilter}`,
        `${safeGenre}${yearFilter}`,
        // Removed the bare year-range query — it leaked unrelated genres
        // (e.g. K-pop, country) when artist genre metadata was sparse.
      ];

  // Paginate properly across queries. Each iteration of the inner loop
  // advances the `offset` so we don't re-fetch the same page (which previously
  // triple-counted against Spotify's rate limit for identical results).
  // Also: 429 responses are now handled gracefully — we honor `Retry-After`
  // and bail out of the live source rather than throwing, so the caller can
  // fall back to the offline pool instead of crashing.
  let rateLimited = false;
  outer: for (const query of queries) {
    for (let page = 0; page < 3 && deduped.size < safeLimit; page++) {
      const params = new URLSearchParams({
        q: query.replace(/\s+/g, ' ').trim(),
        type: 'track',
        limit: '50',
        offset: String(page * 50),
      });
      const url = `${API_BASE}/search?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After')) || 0;
        lastSpotifyError = `rate_limited retry_after=${retryAfter}s`;
        rateLimited = true;
        break outer;
      }

      if (!res.ok) {
        const msg = await res.text();
        lastSpotifyError = `search_error url="${url}" q="${query}": ${msg}`;
        // Don't throw — try the next query. Many "errors" are 400s for
        // genre tags Spotify doesn't recognize; the next query may succeed.
        break;
      }

      const data = await res.json();
      const items = data?.tracks?.items || [];
      if (items.length === 0) break; // no more results for this query

      const artistIds = Array.from(
        new Set(
          items
            .map((t: any) => t?.artists?.[0]?.id)
            .filter(Boolean)
        )
      ) as string[];
      const artistGenreMap = await fetchArtistGenres(token, artistIds);
      for (const t of items) {
        if (!t?.id || deduped.has(t.id)) continue;
        const primaryArtistId = t?.artists?.[0]?.id || '';
        const mappedTrack: SpotifyTrack = {
          id: t.id,
          name: t.name,
          artists: t.artists.map((a: any) => a.name),
          album: t.album.name,
          albumArt: t.album.images[0]?.url || '',
          previewUrl: t.preview_url,
          year: new Date(t.album.release_date).getFullYear(),
          genre: safeGenre,
          artistGenres: artistGenreMap[primaryArtistId] || [],
          popularity: t.popularity,
        };
        if (!passesFilters(mappedTrack, safeGenre, safeArtist, safeDecadeStart, safeDecadeEnd)) continue;
        deduped.set(t.id, mappedTrack);
      }
    }
    if (rateLimited) break;
  }
  if (deduped.size === 0) {
    lastSpotifyError = 'no_spotify_tracks_found';
    return {
      tracks: [],
      source: 'fallback',
      spotifyPreviewCount: 0,
      itunesPreviewCount: 0,
    };
  }

  const mixed = await fillMissingPreviews(
    Array.from(deduped.values()),
    safeLimit,
    safeGenre,
    safeArtist
  );
  const spotifyPreviewCount = mixed.filter((t) => t.audioSource === 'spotify').length;
  const itunesPreviewCount = mixed.filter((t) => t.audioSource === 'itunes').length;
  if (mixed.length === 0) {
    lastSpotifyError = 'no_preview_tracks_found';
  } else {
    lastSpotifyError = '';
  }

  return {
    tracks: shuffleArray(mixed).slice(0, safeLimit),
    source: itunesPreviewCount > 0 ? 'mixed_live' : 'spotify_live',
    spotifyPreviewCount,
    itunesPreviewCount,
  };
}

export function getSpotifyLastError(): string {
  return lastSpotifyError;
}

// ─── Search for autocomplete ───────────────────────────────────────────────
export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  if (!query || query.length < 2) return [];
  const token = await getAccessToken();

  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return data.tracks.items.map((t: any) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a: any) => a.name),
    album: t.album.name,
    albumArt: t.album.images[0]?.url || '',
    previewUrl: t.preview_url,
    year: new Date(t.album.release_date).getFullYear(),
    popularity: t.popularity,
  }));
}

// ─── Generate wrong answer choices ────────────────────────────────────────
export function generateChoices(correct: SpotifyTrack, pool: SpotifyTrack[]): SpotifyTrack[] {
  const wrong = pool
    .filter((t) => t.id !== correct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return shuffleArray([correct, ...wrong]);
}

// ─── Utils ─────────────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── Public iTunes enrichment ─────────────────────────────────────────────
// Replace placeholder previewUrls (e.g. SoundHelix samples in MOCK_TRACKS)
// with real iTunes preview URLs for the actual song. Used by Speed Mode and
// any other path that wants to play *real* clips from a curated mock pool
// without relying on Spotify search returning previews.
//
// Strategy:
//   • For each track, look up an iTunes preview via track + artist.
//   • If a real preview is found, replace previewUrl and tag as 'itunes'.
//   • If not, drop the track (we'd rather have fewer real-music tracks
//     than play SoundHelix tones). Caller can pass a larger pool to
//     compensate.
//   • Run lookups concurrently with a small fan-out cap so we don't
//     hammer the iTunes endpoint.
export async function enrichTracksWithItunesPreviews(
  tracks: SpotifyTrack[],
  limit: number,
  options: { concurrency?: number; requireArtistMatch?: boolean } = {}
): Promise<SpotifyTrack[]> {
  const { concurrency = 4, requireArtistMatch = true } = options;
  const pool = shuffleArray(tracks).slice(0, Math.max(limit * 3, 30));
  const out: SpotifyTrack[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < pool.length && out.length < limit) {
      const track = pool[cursor++];
      if (!track) continue;
      try {
        const preview = await findItunesPreviewUrl(track.name, track.artists[0], {
          requireArtistMatch,
          requireTrackMatch: true,
        });
        if (preview && out.length < limit) {
          out.push({
            ...track,
            previewUrl: preview,
            audioSource: 'itunes',
          });
        }
      } catch {}
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, 6)) }, () =>
    worker()
  );
  await Promise.all(workers);
  return out;
}

async function fillMissingPreviews(
  tracks: SpotifyTrack[],
  limit: number,
  genre?: string,
  artist?: string
): Promise<SpotifyTrack[]> {
  const selected = shuffleArray(tracks).slice(0, Math.max(limit * 2, 25));
  const output: SpotifyTrack[] = [];

  for (const track of selected) {
    if (output.length >= limit) break;

    if (track.previewUrl) {
      output.push({ ...track, genre: track.genre || genre, audioSource: 'spotify' });
      continue;
    }

    const itunesPreview = await findItunesPreviewUrl(track.name, track.artists[0], {
      requireArtistMatch: !!artist,
      requireTrackMatch: true,
    });
    if (itunesPreview) {
      output.push({
        ...track,
        genre: track.genre || genre,
        previewUrl: itunesPreview,
        audioSource: 'itunes',
      });
    }
  }

  return output;
}

function passesFilters(
  track: SpotifyTrack,
  genre?: string,
  artist?: string,
  decadeStart?: number,
  decadeEnd?: number
): boolean {
  if (genre && !artist) {
    // In strict genre mode, require Spotify artist-genre confirmation.
    // If genre metadata is missing, reject to prevent cross-genre leakage.
    const genres = track.artistGenres || [];
    if (genres.length === 0) {
      if (!passesArtistAllowlistFallback(track, genre)) return false;
    } else if (!matchesGenre(genres, genre)) {
      return false;
    }
  }
  if (artist) {
    const needle = artist.toLowerCase();
    const artistMatch = track.artists.some((a) => a.toLowerCase().includes(needle));
    if (!artistMatch) return false;
  }
  if (decadeStart && decadeEnd) {
    if (track.year < decadeStart || track.year > decadeEnd) return false;
  }
  return true;
}

function matchesGenre(artistGenres: string[], wantedGenre: string): boolean {
  const normalizedWanted = wantedGenre.toLowerCase();
  const aliases: Record<string, string[]> = {
    afrobeats: ['afrobeats', 'afrobeat', 'naija', 'nigerian pop', 'afro pop', 'afroswing', 'afrofusion', 'afro r&b', 'afro dancehall'],
    afropop: ['afropop', 'afro pop', 'nigerian pop', 'afrofusion', 'afroswing'],
    amapiano: ['amapiano', 'south african house'],
    hiphop: ['hip hop', 'hip-hop', 'rap', 'trap'],
    rap: ['rap', 'hip hop', 'hip-hop', 'trap'],
    rnb: ['r&b', 'rnb', 'soul', 'neo soul'],
    pop: ['pop'],
    dancehall: ['dancehall'],
    rock: ['rock'],
    jazz: ['jazz'],
    fuji: ['fuji', 'yoruba', 'apala', 'were'],
    highlife: ['highlife', 'palm wine', 'afrobeat', 'ghanaian'],
    juju: ['juju', 'yoruba', 'afrobeat'],
    gospel: ['gospel', 'worship', 'christian', 'praise'],
    reggae: ['reggae', 'roots reggae', 'dub', 'dancehall', 'rocksteady'],
    'hausa-hiphop': ['hausa', 'arewa', 'northern', 'african hip hop'],
    'bongo-flava': ['bongo flava', 'tanzanian', 'swahili', 'african'],
    'coupe-decale': ['coupe decale', 'ivorian', 'zouglou', 'african dance'],
  };
  const needles = aliases[normalizedWanted] || [normalizedWanted];
  const haystack = artistGenres.map((g) => g.toLowerCase());
  return haystack.some((g) => needles.some((n) => g.includes(n)));
}

function passesArtistAllowlistFallback(track: SpotifyTrack, genre: string): boolean {
  const primaryArtist = (track.artists?.[0] || '').toLowerCase();
  if (!primaryArtist) return false;

  const allowlist: Record<string, string[]> = {
    afrobeats: [
      'wizkid', 'burna boy', 'davido', 'rema', 'tems', 'asake', 'fireboy dml',
      'omah lay', 'ayra starr', 'tiwa savage', 'ckay', 'kizz daniel', 'joeboy',
      'victony', 'oxlade', 'ladipoe', 'pheelz', 'tekno', 'mr eazi', 'yemi alade',
      'patoranking', '2baba', '2face', 'olamide', 'wande coal', 'dbanj',
      'simi', 'ruger', 'bnxn', 'buju', 'crayon', 'magixx', 'reekado banks',
      'phyno', 'flavour', 'p-square', 'psquare',
    ],
    afropop: [
      'wizkid', 'davido', 'rema', 'tiwa savage', 'joeboy', 'yemi alade', 'tekno',
      'kizz daniel', 'fireboy dml', 'simi', 'mr eazi', 'patoranking', '2baba',
    ],
    amapiano: [
      'tyla', 'kabza de small', 'dj maphorisa', 'young stunna', 'focalistic',
      'uncle waffles', 'dbn gogo', 'vigro deep', 'major league djz',
      'mellow & sleazy', 'tyler icu',
    ],
    fuji: [
      'sikiru ayinde barrister', 'kwam 1', 'pasuma', 'wasiu alabi pasuma',
      'obesere', 'saheed osupa', 'adewale ayuba', 'sule alao malaika',
    ],
    highlife: [
      'flavour', 'phyno', 'sir victor uwaifo', 'osibisa', 'prince nico mbarga',
      'daddy lumba', 'sarkodie', 'ebo taylor', 'rex lawson',
    ],
    juju: [
      'king sunny ade', 'ebenezer obey', 'sir shina peters',
      'sunny ade', 'i. k. dairo',
    ],
    gospel: [
      'sinach', 'mercy chinwo', 'frank edwards', 'nathaniel bassey',
      'tope alabi', 'cece winans', 'elevation worship', 'hillsong',
      'don moen', 'dunsin oyekan', 'tasha cobbs',
    ],
    reggae: [
      'bob marley', 'damian marley', 'ziggy marley', 'jr gong', 'chronixx',
      'buju banton', 'burning spear', 'jimmy cliff', 'peter tosh',
      'protoje', 'koffee', 'shenseea',
    ],
    'hausa-hiphop': [
      'classiq', 'ziriums', 'deezell', 'lil prince', 'morell',
    ],
    'bongo-flava': [
      'diamond platnumz', 'harmonize', 'rayvanny', 'ali kiba', 'zuchu',
      'mbosso', 'jay melody',
    ],
    'coupe-decale': [
      'magic system', 'dj arafat', 'serge beynaud', 'debordo leekunfa',
      'safarel obiang', 'shado chris', 'dj mix', 'dj eloh',
    ],
  };

  const artists = allowlist[genre.toLowerCase()];
  if (!artists || artists.length === 0) return false;
  return artists.some((name) => primaryArtist.includes(name));
}

async function fetchArtistGenres(
  token: string,
  artistIds: string[]
): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  if (artistIds.length === 0) return out;
  const chunks: string[][] = [];
  for (let i = 0; i < artistIds.length; i += 50) {
    chunks.push(artistIds.slice(i, i + 50));
  }
  for (const chunk of chunks) {
    const url = `${API_BASE}/artists?ids=${chunk.join(',')}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    const artists = data?.artists || [];
    for (const artist of artists) {
      out[artist.id] = Array.isArray(artist.genres) ? artist.genres : [];
    }
  }
  return out;
}

function encodeBase64(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < input.length) {
    const chr1 = input.charCodeAt(i++);
    const chr2 = input.charCodeAt(i++);
    const chr3 = input.charCodeAt(i++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (Number.isNaN(chr2)) {
      enc3 = 64;
      enc4 = 64;
    } else if (Number.isNaN(chr3)) {
      enc4 = 64;
    }

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      chars.charAt(enc3) +
      chars.charAt(enc4);
  }
  return output;
}
