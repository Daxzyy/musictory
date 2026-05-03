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
    const r=await fetch(`https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(q)}`,{
      headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':'application/json, text/plain, */*',
        'Accept-Language':'en-US,en;q=0.9,id;q=0.8',
        'Referer':'https://api.danzy.web.id/',
        'Origin':'https://api.danzy.web.id',
        'Sec-Fetch-Dest':'empty',
        'Sec-Fetch-Mode':'cors',
        'Sec-Fetch-Site':'same-origin',
        'Cache-Control':'no-cache'
      }
    });
    const t=await r.text();
    if(!t.startsWith('{')){
      return new Response(JSON.stringify({e:1,m:t.slice(0,80)}),{status:502,headers:{'Content-Type':'application/json'}});
    }
    return new Response(JSON.stringify({d:enc(t)}),{
      headers:{'Content-Type':'application/json'}
    });
  }catch(e){
    return new Response(JSON.stringify({e:1,m:e.message}),{status:500,headers:{'Content-Type':'application/json'}});
  }
}
