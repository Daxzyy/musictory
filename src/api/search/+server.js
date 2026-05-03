import crypto from 'crypto';

export const config = { runtime: 'nodejs20.x' };

const K=Buffer.from('4d7a9c2e1f8b3a6d0e5c9f2b7a4e1d8c','hex');
const IV=Buffer.from('9998412d5047817f71b13955bded8fe2','hex');

function enc(data){
  const c=crypto.createCipheriv('aes-128-cbc',K,IV);
  return Buffer.concat([c.update(data,'utf8'),c.final()]).toString('base64');
}

export async function GET({url}){
  const q=url.searchParams.get('q')||'';
  try{
    const r=await fetch(`https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(q)}`);
    const t=await r.text();
    return new Response(JSON.stringify({d:enc(t)}),{
      headers:{'Content-Type':'application/json'}
    });
  }catch(e){
    return new Response(JSON.stringify({e:1}),{status:500,headers:{'Content-Type':'application/json'}});
  }
}
