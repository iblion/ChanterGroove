<<<<<<< HEAD
// ─── Spotify Service ───────────────────────────────────────────────────────
// Uses Spotify Client Credentials flow (no user login needed for previews)
// Set your credentials in .env:
//   SPOTIFY_CLIENT_ID=xxx
//   SPOTIFY_CLIENT_SECRET=xxx

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
=======
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
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

let cachedToken: { token: string; expiresAt: number } | null = null;
<<<<<<< HEAD
=======
let lastSpotifyError = '';
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string;
  previewUrl: string | null;
  year: number;
  genre?: string;
  popularity: number;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
<<<<<<< HEAD
=======
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify credentials are missing');
  }

>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

<<<<<<< HEAD
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Failed to get Spotify token');
=======
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
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
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
<<<<<<< HEAD
=======
  artist?: string;
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
  decadeStart?: number;
  decadeEnd?: number;
  limit?: number;
}): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();
<<<<<<< HEAD
  const { genre = 'afrobeats', decadeStart, decadeEnd, limit = 20 } = options;

  let query = `genre:${genre}`;
  if (decadeStart && decadeEnd) {
    query += ` year:${decadeStart}-${decadeEnd}`;
  }

  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${Math.floor(Math.random() * 50)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Spotify search failed');
  const data = await res.json();

  const tracks: SpotifyTrack[] = data.tracks.items
    .filter((t: any) => t.preview_url) // only tracks with previews
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a: any) => a.name),
      album: t.album.name,
      albumArt: t.album.images[0]?.url || '',
      previewUrl: t.preview_url,
      year: new Date(t.album.release_date).getFullYear(),
      popularity: t.popularity,
    }));

  return shuffleArray(tracks);
=======
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
        `afrobeats${yearFilter}`,
        `year:${safeDecadeStart || 2018}-${safeDecadeEnd || 2025}`,
        'burna boy',
        'wizkid',
        'rema',
        'top hits',
      ];

  for (const query of queries) {
    for (let i = 0; i < 3 && deduped.size < safeLimit; i++) {
      const params = new URLSearchParams({
        q: query.replace(/\s+/g, ' ').trim(),
        type: 'track',
        // Do not force market to improve preview_url availability across regions.
      });
      const url = `${API_BASE}/search?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        lastSpotifyError = `search_error url="${url}" q="${query}": ${msg}`;
        throw new Error(lastSpotifyError);
      }

      const data = await res.json();
      const items = data?.tracks?.items || [];
      for (const t of items) {
        if (!t?.id || deduped.has(t.id)) continue;
        const mappedTrack: SpotifyTrack = {
          id: t.id,
          name: t.name,
          artists: t.artists.map((a: any) => a.name),
          album: t.album.name,
          albumArt: t.album.images[0]?.url || '',
          previewUrl: t.preview_url,
          year: new Date(t.album.release_date).getFullYear(),
          popularity: t.popularity,
        };
        if (!passesFilters(mappedTrack, safeArtist, safeDecadeStart, safeDecadeEnd)) continue;
        deduped.set(t.id, mappedTrack);
      }
    }
  }
  if (deduped.size === 0) {
    lastSpotifyError = 'no_spotify_tracks_found';
    return [];
  }

  const mixed = await fillMissingPreviews(Array.from(deduped.values()), safeLimit);
  if (mixed.length === 0) {
    lastSpotifyError = 'no_preview_tracks_found';
  } else {
    lastSpotifyError = '';
  }

  return shuffleArray(mixed).slice(0, safeLimit);
}

export function getSpotifyLastError(): string {
  return lastSpotifyError;
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
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
<<<<<<< HEAD
=======

async function fillMissingPreviews(tracks: SpotifyTrack[], limit: number): Promise<SpotifyTrack[]> {
  const selected = shuffleArray(tracks).slice(0, Math.max(limit * 2, 25));
  const output: SpotifyTrack[] = [];

  for (const track of selected) {
    if (output.length >= limit) break;

    if (track.previewUrl) {
      output.push(track);
      continue;
    }

    const itunesPreview = await findItunesPreviewUrl(track.name, track.artists[0]);
    if (itunesPreview) {
      output.push({ ...track, previewUrl: itunesPreview });
    }
  }

  return output;
}

function passesFilters(
  track: SpotifyTrack,
  artist?: string,
  decadeStart?: number,
  decadeEnd?: number
): boolean {
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
>>>>>>> 430401b (Wire live music pipeline and improve gameplay UX)
