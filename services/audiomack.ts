/**
 * Optional Audiomack preview fallback (after Spotify → iTunes).
 * Requires OAuth 1.0a consumer credentials from Audiomack Data API registration:
 * https://audiomack.com/data-api/docs
 *
 * If credentials are missing or any step fails, returns null — never throws to callers.
 */
import CryptoJS from 'crypto-js';
import OAuth from 'oauth-1.0a';
import * as FileSystem from 'expo-file-system';

const API_BASE = 'https://api.audiomack.com/v1';

function getCredentials(): { key: string; secret: string } | null {
  const key =
    process.env.EXPO_PUBLIC_AUDIOMACK_CONSUMER_KEY ||
    process.env.AUDIOMACK_CONSUMER_KEY ||
    '';
  const secret =
    process.env.EXPO_PUBLIC_AUDIOMACK_CONSUMER_SECRET ||
    process.env.AUDIOMACK_CONSUMER_SECRET ||
    '';
  if (!key.trim() || !secret.trim()) return null;
  return { key: key.trim(), secret: secret.trim() };
}

function createOAuth(key: string, secret: string): OAuth {
  return new OAuth({
    consumer: { key, secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string: string, signingKey: string) {
      return CryptoJS.HmacSHA1(base_string, signingKey).toString(CryptoJS.enc.Base64);
    },
  });
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const u8 = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < u8.length; i++) {
    hex += ('0' + u8[i].toString(16)).slice(-2);
  }
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hex));
}

async function signedGet(url: string, data: Record<string, string>): Promise<Response> {
  const creds = getCredentials();
  if (!creds) throw new Error('no_audiomack_credentials');
  const oauth = createOAuth(creds.key, creds.secret);
  const request_data: { url: string; method: string; data: Record<string, string> } = {
    url,
    method: 'GET',
    data,
  };
  const authParams = oauth.authorize(request_data);
  const params = new URLSearchParams();
  const merged: Record<string, string> = { ...data };
  for (const [k, v] of Object.entries(authParams)) {
    merged[k] = String(v);
  }
  const sortedKeys = Object.keys(merged).sort();
  for (const k of sortedKeys) {
    params.append(k, merged[k]);
  }
  return fetch(`${url}?${params.toString()}`);
}

function extractSongList(data: unknown): any[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.results)) return d.results as any[];
  const r = d.results as Record<string, unknown> | undefined;
  if (r && typeof r === 'object') {
    if (Array.isArray(r.songs)) return r.songs as any[];
    if (Array.isArray(r.music)) return r.music as any[];
  }
  if (Array.isArray(d.songs)) return d.songs as any[];
  return [];
}

function artistLabel(song: any): string {
  if (song?.artist && typeof song.artist === 'string') return song.artist;
  const u = song?.uploader;
  if (u && typeof u === 'object' && typeof u.name === 'string') return u.name;
  return '';
}

function pickSong(
  songs: any[],
  trackName: string,
  artistName: string | undefined,
  options: { requireArtistMatch?: boolean; requireTrackMatch?: boolean }
): any | null {
  const normalizedTrack = normalize(trackName);
  const normalizedArtist = normalize(artistName || '');
  const requireArtistMatch = options?.requireArtistMatch ?? false;
  const requireTrackMatch = options?.requireTrackMatch ?? true;

  for (const s of songs) {
    const title = typeof s?.title === 'string' ? s.title : '';
    const artist = artistLabel(s);
    const rTrack = normalize(title);
    const rArtist = normalize(artist);
    const trackMatch =
      normalizedTrack &&
      (rTrack.includes(normalizedTrack) ||
        normalizedTrack.includes(rTrack) ||
        rTrack === normalizedTrack);
    const artistMatch =
      !normalizedArtist || (rArtist && rArtist.includes(normalizedArtist));
    if (requireTrackMatch && !trackMatch) continue;
    if (requireArtistMatch && !artistMatch) continue;
    if (s?.id != null) return s;
  }

  const loose = songs.find((s) => s?.id != null);
  return loose || null;
}

async function cachePreviewFile(id: string, buf: ArrayBuffer, contentType: string): Promise<string | null> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) return null;
  const ct = (contentType || '').toLowerCase();
  const ext = ct.includes('mp4') || ct.includes('aac') ? 'm4a' : ct.includes('mpeg') || ct.includes('mp3') ? 'mp3' : 'mp3';
  const base64 = arrayBufferToBase64(buf);
  if (!base64) return null;
  const path = `${dir}am_preview_${id}_${Date.now()}.${ext}`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  return path;
}

/**
 * Optional HTTPS proxy that returns JSON `{ "url": "https://…" }` — lets you hide OAuth secrets on a server.
 * ChanterGroove calls: GET `${proxy}/preview?track=&artist=`
 */
async function tryProxyPreview(trackName: string, artistName?: string): Promise<string | null> {
  const proxy = process.env.EXPO_PUBLIC_AUDIOMACK_PROXY_URL?.replace(/\/$/, '');
  if (!proxy) return null;
  try {
    const u = new URL(`${proxy}/preview`);
    u.searchParams.set('track', trackName);
    if (artistName) u.searchParams.set('artist', artistName);
    const res = await fetch(u.toString());
    if (!res.ok) return null;
    const j = (await res.json()) as { url?: string };
    return typeof j?.url === 'string' && j.url.startsWith('http') ? j.url : null;
  } catch {
    return null;
  }
}

export async function findAudiomackPreviewUrl(
  trackName: string,
  artistName?: string,
  options?: { requireArtistMatch?: boolean; requireTrackMatch?: boolean }
): Promise<string | null> {
  if (!trackName?.trim()) return null;

  const proxied = await tryProxyPreview(trackName, artistName);
  if (proxied) return proxied;

  const creds = getCredentials();
  if (!creds) return null;

  try {
    const term = [trackName, artistName].filter(Boolean).join(' ');
    const searchUrl = `${API_BASE}/search`;
    const searchRes = await signedGet(searchUrl, {
      q: term.trim(),
      show: 'songs',
      limit: '15',
    });

    if (!searchRes.ok) return null;
    const json = await searchRes.json();
    const songs = extractSongList(json);
    const best = pickSong(songs, trackName, artistName, {
      requireArtistMatch: options?.requireArtistMatch ?? true,
      requireTrackMatch: options?.requireTrackMatch ?? true,
    });
    if (!best?.id) return null;
    const id = String(best.id);

    const previewUrlEndpoint = `${API_BASE}/music/preview/${encodeURIComponent(id)}`;
    const previewRes = await signedGet(previewUrlEndpoint, {});

    if (!previewRes.ok) return null;
    const ct = previewRes.headers.get('Content-Type') || 'audio/mpeg';
    const buf = await previewRes.arrayBuffer();
    if (!buf || buf.byteLength < 500) return null;

    const fileUri = await cachePreviewFile(id, buf, ct);
    return fileUri;
  } catch {
    return null;
  }
}
