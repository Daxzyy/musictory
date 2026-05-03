const _3=raw=>{const d=JSON.parse(raw);if(!d.result)return[];return d.result.map(i=>({title:i.title,thumbnail:i.thumbnail,duration:i.duration,views:i.views,videoId:i.videoId,uploaded:i.uploaded}));};
export async function _g9(q){const r=await fetch(`https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(q)}`);const t=await r.text();return _3(t);}
