const _0=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const _1=async d=>{const k=await crypto.subtle.importKey('raw',_0('TXqcLh+LOm0OXJ8rek4djA=='),{name:'AES-CBC'},false,['decrypt']);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-CBC',iv:_0('mZhBLVBHgX9xsTlVve2P4g==')},k,_0(d)));};
const _2=r=>r.map(i=>({title:i.t,thumbnail:i.th,duration:i.d,views:i.v,videoId:i.id,uploaded:i.u}));
const _3=raw=>{const d=JSON.parse(raw);if(!d.result)return[];return d.result.map(i=>({t:i.title,th:i.thumbnail,d:i.duration,v:i.views,id:i.videoId,u:i.uploaded}));};
export async function _g9(q){const r=await fetch(`/api/search?q=${encodeURIComponent(q)}`);const j=await r.json();const t=await _1(j.d);return _2(_3(t));}
