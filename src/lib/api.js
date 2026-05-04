const _0=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const _1=async d=>{const k=await crypto.subtle.importKey('raw',_0('TXqcLh+LOm0OXJ8rek4djA=='),{name:'AES-CBC'},false,['decrypt']);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-CBC',iv:_0('mZhBLVBHgX9xsTlVve2P4g==')},k,_0(d)));};
const _2=r=>r.map(i=>({title:i.t,thumbnail:i.th,duration:i.d,views:i.v,videoId:i.id,uploaded:i.u}));
const _3=raw=>{const d=JSON.parse(raw);if(!d.result)return[];return d.result.map(i=>({t:i.title,th:i.thumbnail,d:i.duration,v:i.views,id:i.videoId,u:i.uploaded}));};
const _CK='_msc_urls';
const _TTL=3*60*60*1000;
function _loadCache(){try{const r=localStorage.getItem(_CK);if(!r)return{};const p=JSON.parse(r);const now=Date.now();const clean={};for(const id in p){if(now-p[id].t<_TTL)clean[id]=p[id];}return clean;}catch{return{};}}
function _saveCache(c){try{localStorage.setItem(_CK,JSON.stringify(c));}catch{}}
const _mem=new Map();
export async function _g9(q){const r=await fetch(`/api/search?q=${encodeURIComponent(q)}`);const j=await r.json();const t=await _1(j.d);return _2(_3(t));}
export async function _getStreamUrl(videoId){
  if(_mem.has(videoId))return _mem.get(videoId);
  const disk=_loadCache();
  if(disk[videoId]){const url=disk[videoId].u;_mem.set(videoId,url);return url;}
  const r=await fetch(`/api/stream?id=${encodeURIComponent(videoId)}`);
  const j=await r.json();
  const url=j.url||null;
  if(url){_mem.set(videoId,url);disk[videoId]={u:url,t:Date.now()};_saveCache(disk);}
  return url;
}
