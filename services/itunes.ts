export async function findItunesPreviewUrl(
  trackName: string,
  artistName?: string
): Promise<string | null> {
  const term = [trackName, artistName].filter(Boolean).join(' ');
  if (!term.trim()) return null;

  const params = new URLSearchParams({
    term,
    entity: 'song',
    limit: '10',
  });

  const url = `https://itunes.apple.com/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  if (results.length === 0) return null;

  const normalizedTrack = normalize(trackName);
  const normalizedArtist = normalize(artistName || '');

  // Prefer best textual match, otherwise first result with preview.
  const best = results.find((r: any) => {
    const rTrack = normalize(r?.trackName || '');
    const rArtist = normalize(r?.artistName || '');
    const trackMatch = normalizedTrack && rTrack.includes(normalizedTrack);
    const artistMatch =
      !normalizedArtist || (rArtist && rArtist.includes(normalizedArtist));
    return trackMatch && artistMatch && r?.previewUrl;
  });

  if (best?.previewUrl) return best.previewUrl;
  const fallback = results.find((r: any) => !!r?.previewUrl);
  return fallback?.previewUrl || null;
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
