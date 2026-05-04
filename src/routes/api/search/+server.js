import yts from 'yt-search';

export const config = { runtime: 'nodejs20.x' };

export async function GET({ url }) {
  const q = url.searchParams.get('q') || '';
  if (!q.trim()) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });

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
    return new Response(JSON.stringify(videos), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
