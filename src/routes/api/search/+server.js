import crypto from 'crypto';

export const config = { runtime: 'nodejs20.x' };

const SECRET = 'msc_s3cr3t_g1vy_2026';
const ENC_KEY = Buffer.from('4d7a9c2e1f8b3a6d0e5c9f2b7a4e1d8c', 'hex');
const SIGN_TTL = 15000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function verifyFingerprint(request) {
  const ua = request.headers.get('user-agent') || '';
  const sec = request.headers.get('sec-fetch-dest') || '';
  if (!ua || ua.toLowerCase().includes('curl') || ua.toLowerCase().includes('python') || ua.toLowerCase().includes('wget')) return false;
  if (sec && sec !== 'empty') return false;
  return true;
}
function verifySignature(sig, ts, q) {
  const now = Date.now();
  if (Math.abs(now - parseInt(ts)) > SIGN_TTL) return false;
  const expected = crypto.createHmac('sha256', SECRET).update(`${ts}:${q}`).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex')); } catch { return false; }
}
function encrypt(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return { d: encrypted.toString('base64'), iv: iv.toString('base64') };
}

function findAllKeys(obj, key, results) {
  if (obj === null || typeof obj !== 'object') return;
  if (obj[key] !== undefined) results.push(obj[key]);
  Object.values(obj).forEach(v => findAllKeys(v, key, results));
}

function toHDThumbnail(url, videoId) {
  if (!url && videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  if (!url) return '';
  let hd = String(url);
  if (hd.includes('googleusercontent.com') || hd.includes('ggpht.com') || hd.includes('ytimg.com')) {
    if (/=w\d+-h\d+/i.test(hd)) hd = hd.replace(/=w\d+-h\d+[^?#]*/i, '=w800-h800-l90-rj');
    else if (/=s\d+/i.test(hd)) hd = hd.replace(/=s\d+[^?#]*/i, '=s800-c-k-c0x00ffffff-no-rj');
    else if (/=w\d+/i.test(hd)) hd = hd.replace(/=w\d+[^?#]*/i, '=w800-h800-l90-rj');
  }
  if (hd.includes('i.ytimg.com/vi/') || hd.includes('img.youtube.com/vi/')) {
    hd = hd.split('?')[0];
    hd = hd.replace(/(hqdefault|mqdefault|sddefault|default)\.jpg/i, 'hqdefault.jpg');
  }
  return hd;
}

function cleanTitle(title) {
  if (!title) return title;
  return title
    .replace(/[\(\[]\s*official\s+music\s+video\s*[\)\]]/gi, '(Official Music)')
    .replace(/[\(\[]\s*official\s+audio\s*[\)\]]/gi, '(Official Audio)')
    .replace(/[\(\[]\s*official\s+lyric[s]?\s+video\s*[\)\]]/gi, '(Official)')
    .replace(/[\(\[]\s*official\s+video\s*[\)\]]/gi, '(Official)')
    .replace(/[\(\[]\s*lyric[s]?\s+video\s*[\)\]]/gi, '')
    .replace(/[\(\[]\s*video\s+lirik\s*[\)\]]/gi, '')
    .replace(/[\(\[]\s*lirik\s*[\)\]]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function durationToColon(text) {
  if (!text) return '';
  const m = String(text).match(/(\d+)\s*(?:menit|min)\s*(?:(\d+)\s*(?:detik|det))?/i);
  if (m) return `${m[1]}:${(m[2] || '00').padStart(2, '0')}`;
  const m2 = String(text).match(/(\d+):(\d+)/);
  if (m2) return `${m2[1]}:${m2[2].padStart(2, '0')}`;
  return '';
}

async function fetchYoutube(query, type) {
  const payload = {
    context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20240101.00.00', hl: 'id', gl: 'ID' } },
    query
  };
  if (type === 'songs') payload.params = 'EgWKAQIIAWoSEAQQAxAFEAkQChAVEBAQERAO';
  else if (type === 'artists') payload.params = 'EgWKAQIgAWoKEAoQCRADEAA=';
  else if (type === 'all') delete payload.params;

  const r = await fetch('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'Origin': 'https://music.youtube.com' },
    body: JSON.stringify(payload)
  });
  return await r.json();
}

function getRunsText(runs) { return Array.isArray(runs) ? runs.map(r => r.text || '').join('') : ''; }

function normalizeQuery(q) {
  return String(q || '').trim().replace(/\s+/g, ' ');
}

function tokenize(q) {
  return normalizeQuery(q)
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\u024f]+/i)
    .filter(Boolean);
}

function relevanceScore(fields, tokens) {
  if (!tokens.length) return 0;
  const haystack = fields.filter(Boolean).join(' ').toLowerCase();
  if (!haystack) return 0;
  let matched = 0;
  for (const t of tokens) if (haystack.includes(t)) matched++;
  let score = matched / tokens.length;
  if (matched === tokens.length) score += 1;
  if (tokens.length > 1 && haystack.includes(tokens.join(' '))) score += 0.5;
  return score;
}

function rankByRelevance(list, tokens, fieldsFn) {
  if (!tokens.length) return list;
  return list
    .map((item, i) => ({ item, i, score: relevanceScore(fieldsFn(item), tokens) }))
    .sort((a, b) => (b.score - a.score) || (a.i - b.i))
    .map(x => x.item);
}

const SONG_WEIGHT_TITLE = 3;
const SONG_WEIGHT_ARTIST = 1.6;
const SONG_WEIGHT_ALBUM = 1;
const SONG_WEIGHT_LYRICS = 2.4;
const SONG_WEIGHT_TOP_RESULT = 5;

function songRelevanceScore(song, tokens, lyricSignals) {
  if (!tokens.length) return 0;
  const titleScore = relevanceScore([song.title], tokens);
  const artistScore = relevanceScore([song.artist], tokens);
  const albumScore = relevanceScore([song.album], tokens);
  const lyricsScore = lyricSignals.get(song.videoId) || 0;
  const topResultScore = song.isTopResult ? 1 : 0;
  return titleScore * SONG_WEIGHT_TITLE
    + artistScore * SONG_WEIGHT_ARTIST
    + albumScore * SONG_WEIGHT_ALBUM
    + lyricsScore * SONG_WEIGHT_LYRICS
    + topResultScore * SONG_WEIGHT_TOP_RESULT;
}

function rankSongsByRelevance(songs, tokens, lyricSignals) {
  if (!tokens.length) return songs;
  return songs
    .map((item, i) => ({ item, i, score: songRelevanceScore(item, tokens, lyricSignals) }))
    .sort((a, b) => (b.score - a.score) || (a.i - b.i))
    .map(x => x.item);
}

const LYRIC_CHECK_LIMIT = 16;
const LYRIC_FETCH_TIMEOUT = 2000;

async function fetchJsonWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: controller.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function lyricsTextOf(entry) {
  return String(entry?.plainLyrics || entry?.syncedLyrics || '');
}

function normalizeForMatch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phraseMatchScore(haystack, tokens) {
  if (!haystack || tokens.length < 2) return 0;
  const fullPhrase = tokens.join(' ');
  if (haystack.includes(fullPhrase)) return 1;
  let bestRun = 0;
  for (let start = 0; start < tokens.length - 1; start++) {
    for (let len = tokens.length - start; len >= 2; len--) {
      const sub = tokens.slice(start, start + len).join(' ');
      if (haystack.includes(sub)) { bestRun = Math.max(bestRun, len); break; }
    }
  }
  return bestRun >= 2 ? bestRun / tokens.length : 0;
}

async function fetchSongLyricScore(song, tokens) {
  if (tokens.length < 2) return 0;
  const trackName = encodeURIComponent(song.title || '');
  const artistName = encodeURIComponent(song.artist || '');
  if (!trackName) return 0;
  const data = await fetchJsonWithTimeout(
    `https://lrclib.net/api/search?track_name=${trackName}&artist_name=${artistName}`,
    LYRIC_FETCH_TIMEOUT
  );
  if (!Array.isArray(data) || data.length === 0) return 0;
  const text = normalizeForMatch(lyricsTextOf(data[0]));
  if (!text) return 0;
  return phraseMatchScore(text, tokens);
}

async function buildLyricSignals(songs, tokens) {
  const signals = new Map();
  if (tokens.length < 2 || songs.length === 0) return signals;
  const seen = new Set();
  const candidates = [];
  for (const s of songs) {
    const key = `${(s.title || '').toLowerCase()}|${(s.artist || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(s);
    if (candidates.length >= LYRIC_CHECK_LIMIT) break;
  }
  const results = await Promise.allSettled(candidates.map(s => fetchSongLyricScore(s, tokens)));
  candidates.forEach((s, i) => {
    const r = results[i];
    signals.set(s.videoId, r.status === 'fulfilled' ? r.value : 0);
  });
  return signals;
}

function extractRows(data) {
  if (!data) return [];
  const items = [];
  findAllKeys(data, 'musicResponsiveListItemRenderer', items);
  findAllKeys(data, 'musicTwoRowItemRenderer', items);
  const seen = {};
  const rows = [];
  for (const item of items) {
    const browseId = item?.navigationEndpoint?.browseEndpoint?.browseId || item?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
    if (!browseId || seen[browseId]) continue;
    seen[browseId] = true;
    let title = '', subtitle = '', thumbs = [];
    if (item.flexColumns) {
      title = getRunsText(item.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
      subtitle = getRunsText(item.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
      thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
    } else if (item.title?.runs) {
      title = getRunsText(item.title.runs);
      subtitle = getRunsText(item.subtitle?.runs);
      thumbs = item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
    } else continue;
    const thumb = toHDThumbnail(thumbs.length ? thumbs[thumbs.length - 1].url : '');
    rows.push({ browseId, title, subtitle, thumb });
  }
  return rows;
}

function rowsToArtists(rows) {
  return rows
    .filter(({ subtitle }) => {
      const s = subtitle.toLowerCase();
      return s.includes('artist') || s.includes('pendengar') || s.includes('audiens') || s.includes('subscriber');
    })
    .map(({ browseId, title, subtitle, thumb }) => ({ id: browseId, title, artist: subtitle, cover: thumb }));
}

function rowsToAlbumsAndPlaylists(rows) {
  const albums = [], playlists = [];
  for (const { browseId, title, subtitle, thumb } of rows) {
    const m = subtitle.match(/^(Album|Single|EP)\s*[•]\s*(.+?)\s*[•]\s*(\d{4})/i);
    if (m) albums.push({ id: browseId, title, artist: m[2].trim(), albumType: m[1], year: m[3], cover: thumb });
    else if (subtitle.toLowerCase().includes('playlist')) playlists.push({ id: browseId, title, artist: subtitle, cover: thumb });
  }
  return { albums, playlists };
}

function extractTopResultSong(data) {
  if (!data) return null;
  const cards = [];
  findAllKeys(data, 'musicCardShelfRenderer', cards);
  if (!cards.length) return null;
  const card = cards[0];
  const videoId =
    card?.onTap?.watchEndpoint?.videoId ||
    card?.buttons?.[0]?.buttonRenderer?.navigationEndpoint?.watchEndpoint?.videoId ||
    card?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId || '';
  if (!videoId) return null;
  const subRuns = card?.subtitle?.runs || [];
  const subtitleText = getRunsText(subRuns).toLowerCase();
  if (!subtitleText.includes('song') && !subtitleText.includes('lagu')) return null;
  const title = getRunsText(card?.title?.runs);
  let artist = '', artistId = '';
  for (const run of subRuns) {
    const browseId = run?.navigationEndpoint?.browseEndpoint?.browseId || '';
    if (browseId.startsWith('UC')) { artist = run.text || ''; artistId = browseId; break; }
  }
  if (!artist) {
    const parts = getRunsText(subRuns).split('•').map(s => s.trim()).filter(Boolean);
    artist = parts.length > 1 ? parts[1] : '';
  }
  const thumbs = card?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const thumbnail = toHDThumbnail(thumbs.length ? thumbs[thumbs.length - 1].url : '', videoId);
  return {
    title: cleanTitle(title),
    videoId,
    thumbnail,
    duration: '',
    author: artist,
    artist,
    artistId,
    album: '',
    albumId: '',
    isTopResult: true
  };
}

function extractSongRows(data) {
  if (!data) return [];
  const out = [];
  const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || [];
  for (const tab of tabs) {
    const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    for (const section of sections) {
      const shelf = section?.musicShelfRenderer;
      const items = shelf?.contents || section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const r = item?.musicResponsiveListItemRenderer;
        if (!r) continue;
        const cols = r.flexColumns || [];
        const title = getRunsText(cols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
        const subRuns = cols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
        let artist = '', artistId = '', album = '', albumId = '';
        for (const run of subRuns) {
          const text = run.text || '';
          const browseId = run?.navigationEndpoint?.browseEndpoint?.browseId || '';
          if (browseId.startsWith('UC')) { artist = text; artistId = browseId; }
          else if (browseId.startsWith('MPRE')) { album = text; albumId = browseId; }
        }
        const accLabel = cols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.accessibility?.accessibilityData?.label || '';
        let duration = durationToColon(accLabel);
        if (!duration) duration = durationToColon(subRuns.map(x => x.text).join(' '));
        const t = subRuns[0]?.text || '';
        if (t === 'Video') continue;
        const videoId = r?.playlistItemData?.videoId || '';
        if (!videoId) continue;
        const thumbs = r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
        const thumbnail = toHDThumbnail(thumbs.length ? thumbs[thumbs.length - 1].url : '', videoId);
        out.push({
          title: cleanTitle(title),
          videoId,
          thumbnail,
          duration,
          author: artist || (subRuns[1]?.text || ''),
          artist: artist || (subRuns[1]?.text || ''),
          artistId,
          album: album || '',
          albumId
        });
      }
    }
  }
  return out;
}

function dedupeBy(list, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const k = keyFn(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

const MIN_MATCH_RATIO = 0.5;

async function performSearch(rawQuery) {
  const query = normalizeQuery(rawQuery);
  const tokens = tokenize(query);

  const [songsData, playlistsData, artistsData, allData] = await Promise.all([
    fetchYoutube(query, 'songs').catch(() => null),
    fetchYoutube(query, 'playlists').catch(() => null),
    fetchYoutube(query, 'artists').catch(() => null),
    fetchYoutube(query, 'all').catch(() => null)
  ]);

  let songs = extractSongRows(songsData);
  let artists = rowsToArtists(extractRows(artistsData));
  const { albums, playlists } = rowsToAlbumsAndPlaylists(extractRows(playlistsData));

  if (tokens.length > 1) {
    const seedToken = tokens[0];

    if (artists.length === 0) {
      const retryData = await fetchYoutube(seedToken, 'artists').catch(() => null);
      const candidates = rowsToArtists(extractRows(retryData));
      artists = candidates.filter(a => relevanceScore([a.title, a.artist], tokens) >= MIN_MATCH_RATIO * tokens.length);
    }

    if (songs.length === 0) {
      const retryData = await fetchYoutube(seedToken, 'songs').catch(() => null);
      const candidates = extractSongRows(retryData);
      songs = candidates.filter(s => relevanceScore([s.title, s.artist, s.album], tokens) >= MIN_MATCH_RATIO * tokens.length);
    }
  }

  const topResultSong = extractTopResultSong(allData);
  const allTabSongs = extractSongRows(allData);
  songs = dedupeBy([...(topResultSong ? [topResultSong] : []), ...songs, ...allTabSongs], s => s.videoId);

  const lyricSignals = await buildLyricSignals(songs, tokens);
  songs = rankSongsByRelevance(songs, tokens, lyricSignals);

  artists = rankByRelevance(dedupeBy(artists, a => a.id), tokens, a => [a.title]);
  const rankedAlbums = rankByRelevance(dedupeBy(albums, a => a.id), tokens, a => [a.title, a.artist]);
  const rankedPlaylists = rankByRelevance(dedupeBy(playlists, p => p.id), tokens, p => [p.title, p.artist]);

  return {
    query,
    totalSongs: songs.length,
    songs: songs.slice(0, 40),
    albums: rankedAlbums.slice(0, 12),
    playlists: rankedPlaylists.slice(0, 12),
    artists: artists.slice(0, 10)
  };
}

export async function GET({ url, request }) {
  const q = url.searchParams.get('q') || '';
  const sig = url.searchParams.get('sig') || '';
  const ts = url.searchParams.get('ts') || '';
  if (!verifyFingerprint(request)) {
    return new Response(JSON.stringify({ e: 1 }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }
  if (!verifySignature(sig, ts, q)) {
    return new Response(JSON.stringify({ e: 1 }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const result = await performSearch(q);
    const payload = encrypt(result);
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ e: 1 }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
