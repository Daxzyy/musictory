const _CK = '_msc_urls';
const _TTL = 3 * 60 * 60 * 1000;

function _loadCache() {
  try {
    const r = localStorage.getItem(_CK);
    if (!r) return {};
    const p = JSON.parse(r);
    const now = Date.now();
    const clean = {};
    for (const id in p) { if (now - p[id].t < _TTL) clean[id] = p[id]; }
    return clean;
  } catch { return {}; }
}

function _saveCache(c) {
  try { localStorage.setItem(_CK, JSON.stringify(c)); } catch {}
}

const _mem = new Map();

export async function _g9(q) {
  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const data = await r.json();
  if (!Array.isArray(data)) return [];
  return data;
}

export async function _getStreamUrl(videoId) {
  if (_mem.has(videoId)) return _mem.get(videoId);
  const disk = _loadCache();
  if (disk[videoId]) { const url = disk[videoId].u; _mem.set(videoId, url); return url; }
  const r = await fetch(`/api/stream?id=${encodeURIComponent(videoId)}`);
  const j = await r.json();
  const url = j.url || null;
  if (url) { _mem.set(videoId, url); disk[videoId] = { u: url, t: Date.now() }; _saveCache(disk); }
  return url;
}
