import crypto from 'crypto';

const UA = 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36';
const KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');

async function savetube(videoId) {
  const headers = {
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'user-agent': UA
  };

  const cdnJson = await (await fetch('https://media.savetube.vip/api/random-cdn', { headers })).json();
  const cdn = cdnJson.cdn;

  const infoJson = await (await fetch(`https://${cdn}/v2/info`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` })
  })).json();

  const encrypted = Buffer.from(infoJson.data, 'base64');
  const iv = encrypted.slice(0, 16);
  const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, iv);
  const decrypted = JSON.parse(Buffer.concat([decipher.update(encrypted.slice(16)), decipher.final()]).toString());

  const dlJson = await (await fetch(`https://${cdn}/download`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: videoId, downloadType: 'audio', quality: '128', key: decrypted.key })
  })).json();

  return dlJson.data.downloadUrl;
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
