// ─── Spotify Service ───────────────────────────────────────────────────────
// Uses Spotify Client Credentials flow (no user login needed for previews)
// Set your credentials in .env:
//   SPOTIFY_CLIENT_ID=xxx
//   SPOTIFY_CLIENT_SECRET=xxx

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

let cachedToken: { token: string; expiresAt: number } | null = null;

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
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

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
  decadeStart?: number;
  decadeEnd?: number;
  limit?: number;
}): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();
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
