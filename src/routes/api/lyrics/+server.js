export const config = { runtime: 'nodejs20.x' };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36';

function cleanT(t) {
  return String(t || '').replace(/(\(.*(official|lyric|video|audio).*\)|\[.*(official|lyric|video|audio).*\]|-.*(official|lyric|video|audio).*)/gi, '').trim();
}
function cleanA(a) { return String(a || '').replace(/- Topic/gi, '').trim(); }

function parseSyncedLyrics(s) {
  const lines = [];
  const p = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]\s*(.*)/;
  for (const l of s.split('\n')) {
    const m = l.trim().match(p);
    if (m) {
      let ms = 0;
      if (m[3]) ms = m[3].length === 3 ? parseInt(m[3]) / 1000 : parseInt(m[3]) / 100;
      lines.push({ time: Math.round((parseInt(m[1]) * 60 + parseInt(m[2]) + ms) * 100) / 100, text: m[4].trim() || '• • •' });
    }
  }
  return lines;
}
function parsePlainLyrics(p) {
  return p.split('\n').map(t => t.trim()).filter(Boolean).map(t => ({ time: -1, text: t }));
}

export async function GET({ url }) {
  const title = (url.searchParams.get('title') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();
  if (!title) return new Response(JSON.stringify({ status: false, message: 'Parameter title wajib diisi' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  try {
    let lyricsData = { type: 'none', lines: [] };
    const q = encodeURIComponent(`${cleanT(title)} ${cleanA(artist)}`.trim());
    const r = await fetch(`https://lrclib.net/api/search?q=${q}`, { headers: { 'User-Agent': UA } });
    const lrc = await r.json();
    if (Array.isArray(lrc) && lrc.length > 0) {
      const b = lrc.find(x => x.syncedLyrics) || lrc[0];
      if (b.syncedLyrics) lyricsData = { type: 'synced', lines: parseSyncedLyrics(b.syncedLyrics) };
      else if (b.plainLyrics) lyricsData = { type: 'plain', lines: parsePlainLyrics(b.plainLyrics) };
    }
    return new Response(JSON.stringify({ status: true, result: { title, artist, lyrics: lyricsData } }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ status: false, message: 'Gagal: ' + e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
