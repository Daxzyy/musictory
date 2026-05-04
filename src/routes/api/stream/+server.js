export const config = { runtime: 'nodejs20.x' };

export async function GET({ url }) {
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'no id' }), { status: 400 });

  const ytUrl = `https://www.youtube.com/watch?v=${id}`;
  const r = await fetch(`https://api.danzy.web.id/api/download/ytmp3?url=${encodeURIComponent(ytUrl)}`);
  const j = await r.json();

  if (!j.status || !j.data?.downloadUrl) {
    return new Response(JSON.stringify({ error: 'failed' }), { status: 500 });
  }

  return new Response(JSON.stringify({ url: j.data.downloadUrl }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
