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
const MIN_MATCH_SCORE = 0.3;
const TOP_MATCH_MARGIN = 0.12;

// "feat."/"ft."/"featuring" show up inconsistently - sometimes in the title,
// sometimes tacked onto the artist field, spelled differently depending on
// the source. Canonicalizing them lets a request like
// title="X (feat. B)" artist="A" match a candidate stored as
// trackName="X" artistName="A ft. B", since we compare title+artist as one
// combined identity rather than two separate fields.
function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(featuring|feat\.?|ft\.?)\b/g, 'feat')
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

function isSubset(small, big) {
  if (!small.size) return false;
  for (const t of small) if (!big.has(t)) return false;
  return true;
}

// Score how well a candidate's (trackName + artistName) identity matches the
// requested (title + artist), as one combined bag of words. This avoids the
// failure mode where an exact-artist-but-wrong-song candidate outscores an
// exact-song candidate whose artist field is formatted differently (e.g.
// "Justin Bieber" vs "Justin Bieber ft. Nicki Minaj" for a featured track).
function identityScore(cand, title, artist) {
  const reqTokens = tokenSet(`${title} ${artist}`);
  const candTokens = tokenSet(`${cand.trackName} ${cand.artistName}`);
  const j = jaccard(reqTokens, candTokens);
  const bonus = (isSubset(candTokens, reqTokens) || isSubset(reqTokens, candTokens)) ? 0.15 : 0;
  return Math.min(1, j + bonus);
}

function pickBestLyrics(candidates, title, artist, duration) {
  const scored = candidates
    .filter(c => c.plainLyrics || c.syncedLyrics)
    .map(c => ({
      c,
      score: identityScore(c, title, artist),
      durDiff: (duration && c.duration) ? Math.abs(c.duration - duration) : null
    }))
    .filter(x => x.score >= MIN_MATCH_SCORE);
  if (!scored.length) return null;

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0].score;
  // Candidates whose title+artist match is essentially tied for best.
  const finalists = scored.filter(x => x.score >= bestScore - TOP_MATCH_MARGIN);

  // Only one candidate clearly has the right title+artist: trust the text
  // match and use it (synced if available) even if the requested duration
  // is off - duration passed in can itself be wrong (wrong video length,
  // rounding, etc.), and a single dominant text match is stronger evidence
  // than a duration number of uncertain accuracy.
  if (finalists.length === 1) {
    const f = finalists[0];
    return { type: f.c.syncedLyrics ? 'synced' : 'plain', item: f.c };
  }

  // Multiple candidates are an equally good title+artist match (e.g. several
  // uploads of the same song) - duration is what disambiguates between them.
  const withinTol = x => x.durDiff === null || x.durDiff <= DURATION_TOLERANCE;
  const byDurThenScore = (a, b) => {
    const da = a.durDiff === null ? Infinity : a.durDiff;
    const db = b.durDiff === null ? Infinity : b.durDiff;
    if (da !== db) return da - db;
    return b.score - a.score;
  };

  const syncedInTol = finalists.filter(x => x.c.syncedLyrics && withinTol(x)).sort(byDurThenScore);
  if (syncedInTol.length) return { type: 'synced', item: syncedInTol[0].c };

  const plainInTol = finalists.filter(x => x.c.plainLyrics && withinTol(x)).sort(byDurThenScore);
  if (plainInTol.length) return { type: 'plain', item: plainInTol[0].c };

  // Nobody among the finalists is within tolerance - avoid the biggest gaps,
  // prefer synced over plain among the remaining best-matching metadata.
  finalists.sort((a, b) => {
    const aSynced = a.c.syncedLyrics ? 1 : 0;
    const bSynced = b.c.syncedLyrics ? 1 : 0;
    if (aSynced !== bSynced) return bSynced - aSynced;
    return byDurThenScore(a, b);
  });
  const pick = finalists[0];
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
