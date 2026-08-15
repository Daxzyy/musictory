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

const DURATION_TOLERANCE = 3;
const MIN_MATCH_SCORE = 0.35;
const TOP_MATCH_MARGIN = 0.1;

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s) {
  return new Set(normalize(s).split(' ').filter(Boolean));
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function strSim(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const bonus = (na.includes(nb) || nb.includes(na)) ? 0.25 : 0;
  return Math.min(1, jaccard(tokenSet(a), tokenSet(b)) + bonus);
}

function matchScore(cand, title, artist) {
  const titleScore = strSim(cand.trackName, title);
  const artistScore = artist ? strSim(cand.artistName, artist) : 0.5;
  return titleScore * 0.65 + artistScore * 0.35;
}

function pickBestLyrics(candidates, title, artist, duration) {
  const scored = candidates
    .map(c => ({
      c,
      score: matchScore(c, title, artist),
      durDiff: (duration && c.duration) ? Math.abs(c.duration - duration) : null
    }))
    .filter(x => x.score >= MIN_MATCH_SCORE);
  if (!scored.length) return null;

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0].score;
  const topMatches = scored.filter(x => x.score >= bestScore - TOP_MATCH_MARGIN);

  const withinTol = x => x.durDiff === null || x.durDiff <= DURATION_TOLERANCE;
  const byDurThenScore = (a, b) => {
    const da = a.durDiff === null ? 0 : a.durDiff;
    const db = b.durDiff === null ? 0 : b.durDiff;
    if (da !== db) return da - db;
    return b.score - a.score;
  };

  // 1) Best synced lyrics within duration tolerance (or no duration to compare against)
  const syncedInTol = topMatches.filter(x => x.c.syncedLyrics && withinTol(x)).sort(byDurThenScore);
  if (syncedInTol.length) return { type: 'synced', item: syncedInTol[0].c };

  // 2) No synced close enough -> fall back to plain within tolerance
  const plainInTol = topMatches.filter(x => x.c.plainLyrics && withinTol(x)).sort(byDurThenScore);
  if (plainInTol.length) return { type: 'plain', item: plainInTol[0].c };

  // 3) Last resort: nothing close in duration, still avoid the biggest gaps,
  // prefer synced over plain among the best-matching metadata
  const anyLyrics = topMatches.filter(x => x.c.syncedLyrics || x.c.plainLyrics);
  if (!anyLyrics.length) return null;
  anyLyrics.sort((a, b) => {
    const aSynced = a.c.syncedLyrics ? 1 : 0;
    const bSynced = b.c.syncedLyrics ? 1 : 0;
    if (aSynced !== bSynced) return bSynced - aSynced;
    const da = a.durDiff === null ? Infinity : a.durDiff;
    const db = b.durDiff === null ? Infinity : b.durDiff;
    if (da !== db) return da - db;
    return b.score - a.score;
  });
  const pick = anyLyrics[0];
  return { type: pick.c.syncedLyrics ? 'synced' : 'plain', item: pick.c };
}

export async function GET({ url }) {
  const title = (url.searchParams.get('title') || '').trim();
  const artist = (url.searchParams.get('artist') || '').trim();
  const durationParam = url.searchParams.get('duration');
  const duration = durationParam && isFinite(+durationParam) ? +durationParam : null;
  if (!title) return new Response(JSON.stringify({ status: false, message: 'Parameter title wajib diisi' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  try {
    let lyricsData = { type: 'none', lines: [] };
    const q = encodeURIComponent(`${cleanT(title)} ${cleanA(artist)}`.trim());
    const r = await fetch(`https://lrclib.net/api/search?q=${q}`, { headers: { 'User-Agent': UA } });
    const lrc = await r.json();
    if (Array.isArray(lrc) && lrc.length > 0) {
      const best = pickBestLyrics(lrc, cleanT(title), cleanA(artist), duration);
      if (best) {
        if (best.type === 'synced') lyricsData = { type: 'synced', lines: parseSyncedLyrics(best.item.syncedLyrics) };
        else lyricsData = { type: 'plain', lines: parsePlainLyrics(best.item.plainLyrics) };
      }
    }
    return new Response(JSON.stringify({ status: true, result: { title, artist, lyrics: lyricsData } }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ status: false, message: 'Gagal: ' + e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
