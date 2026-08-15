import crypto from 'crypto';

export const config = { runtime: 'nodejs20.x' };

const UA = 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36';
const KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');

const CDNS = ['cdn405.savetube.vip', 'cdn403.savetube.vip', 'cdn401.savetube.vip'];
const ATTEMPT_TIMEOUT = 10000;

async function fetchJsonWithTimeout(url, opts, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: controller.signal });
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function savetube(videoId) {
  const headers = {
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'user-agent': UA
  };
  const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Same approach as the original /api/ytplay (and ArcelMusic, which calls
  // that same endpoint): try a fixed pool of CDNs, up to 2 attempts each,
  // and return as soon as one succeeds. No extra CDN-lookup round trip
  // before this — that's pure added latency on every single play.
  for (const cdn of CDNS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const infoJson = await fetchJsonWithTimeout(`https://${cdn}/v2/info`, {
          method: 'POST', headers, body: JSON.stringify({ url: fullUrl })
        }, ATTEMPT_TIMEOUT);

        const encryptedData = infoJson?.data;
        if (!encryptedData) continue;

        const encrypted = Buffer.from(encryptedData, 'base64');
        const iv = encrypted.slice(0, 16);
        const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, iv);
        const decrypted = JSON.parse(Buffer.concat([decipher.update(encrypted.slice(16)), decipher.final()]).toString());

        const dlJson = await fetchJsonWithTimeout(`https://${cdn}/download`, {
          method: 'POST', headers,
          body: JSON.stringify({ id: videoId, downloadType: 'audio', quality: '128', key: decrypted.key })
        }, ATTEMPT_TIMEOUT);

        const downloadUrl = dlJson?.data?.downloadUrl || dlJson?.downloadUrl;
        if (downloadUrl) return downloadUrl;
      } catch (e) {
        // this attempt/CDN failed or timed out — fall through and try the next one
      }
    }
  }
  return null;
}

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'no id' }), { status: 400 });

  try {
    const downloadUrl = await savetube(id);
    if (!downloadUrl) return new Response(JSON.stringify({ error: 'failed' }), { status: 500 });
    return new Response(JSON.stringify({ url: downloadUrl }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
