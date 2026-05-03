import crypto from 'crypto';

const K=Buffer.from('4d7a9c2e1f8b3a6d0e5c9f2b7a4e1d8c','hex');
const IV=Buffer.from('9998412d5047817f71b13955bded8fe2','hex');

function enc(data){
  const c=crypto.createCipheriv('aes-128-cbc',K,IV);
  return Buffer.concat([c.update(data,'utf8'),c.final()]).toString('base64');
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=req.query.q||'';
  try{
    const r=await fetch(`https://api.danzy.web.id/api/search/yts?q=${encodeURIComponent(q)}`);
    const t=await r.text();
    res.setHeader('Content-Type','application/json');
    res.status(200).json({d:enc(t)});
  }catch(e){
    res.status(500).json({d:''});
  }
}
