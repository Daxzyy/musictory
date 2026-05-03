export async function _g9(q){
  const r=await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const j=await r.json();
  console.log('SERVER RESPONSE:', JSON.stringify(j));
  if(j.e) throw new Error('upstream blocked: ' + (j.m||'unknown'));
  if(!j.d) throw new Error('no data: ' + JSON.stringify(j));
  return [];
}
