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
    const result = await yts(q);
    const videos = (result.videos || []).slice(0, 15).map(v => ({
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      views: v.views ? String(v.views) : '',
      videoId: v.videoId,
      uploaded: v.ago
    }));
    const payload = encrypt(videos);
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ e: 1 }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
