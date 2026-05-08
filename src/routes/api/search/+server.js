
import yts from 'yt-search';
import crypto from 'crypto';
export const config = { runtime: 'nodejs20.x' };
const SECRET = 'msc_s3cr3t_g1vy_2026';
const ENC_KEY = Buffer.from('4d7a9c2e1f8b3a6d0e5c9f2b7a4e1d8c', 'hex');
const SIGN_TTL = 15000;
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
function parseDurationToSeconds(timestamp) {
  if (!timestamp) return 0;
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}
function isMusicVideo(v) {
  const secs = parseDurationToSeconds(v.timestamp);
  if (secs < 60) return false;
  const title = (v.title || '').toLowerCase();
  const skipWords = ['podcast', 'episode', 'tutorial', 'review', 'unboxing', 'gameplay', 'vlog', 'lecture', 'lesson', 'debate'];
  if (skipWords.some(w => title.includes(w))) return false;
  return true;
}
function cleanTitle(title) {
  if (!title) return title;
  return title
    .replace(/\(\s*official\s+music\s+video\s*\)/gi, '(Official Music)')
    .replace(/\(\s*official\s+audio\s+video\s*\)/gi, '(Official Audio)')
    .replace(/\(\s*official\s+lyric\s+video\s*\)/gi, '(Official)')
    .replace(/\(\s*official\s+video\s*\)/gi, '(Official)')
    .replace(/\(\s*official\s+lyric[s]?\s*\)/gi, '(Official)')
    .replace(/\(\s*music\s+video\s*\)/gi, '')
    .replace(/\(\s*audio\s+video\s*\)/gi, '(Audio)')
    .replace(/\(\s*lyric[s]?\s+video\s*\)/gi, '')
    .replace(/\(\s*video\s+lirik\s*\)/gi, '')
    .replace(/\(\s*lirik\s+video\s*\)/gi, '')
    .replace(/\(\s*lirik\s*\)/gi, '')
    .replace(/\(\s*lyric[s]?\s*\)/gi, '')
    .replace(/\(\s*video\s*\)/gi, '')
    .replace(/\baudio\s+video\b/gi, 'Audio')
    .replace(/\bmusic\s+video\b/gi, '')
    .replace(/\blyric[s]?\s+video\b/gi, '')
    .replace(/\bvideo\s+lirik\b/gi, '')
    .replace(/\blirik\s+video\b/gi, '')
    .replace(/\s*\|\s*(?:lyric[s]?|lirik|video)\b/gi, '')
    .replace(/\s*-\s*(?:lyric[s]?|lirik|video)\b/gi, '')
    .replace(/\blyric[s]?\b/gi, '')
    .replace(/\blirik\b/gi, '')
    .replace(/\bvideo\b/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
    const musicQuery = `${q} lagu audio`;
    const result = await yts(musicQuery);
    const videos = (result.videos || [])
      .filter(isMusicVideo)
      .slice(0, 30)
      .map(v => ({
        title: cleanTitle(v.title),
        thumbnail: v.thumbnail,
        duration: v.timestamp,
        views: v.views ? String(v.views) : '',
        videoId: v.videoId,
        uploaded: v.ago,
        author: v.author?.name || ''
      }));
    const payload = encrypt(videos);
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ e: 1 }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
