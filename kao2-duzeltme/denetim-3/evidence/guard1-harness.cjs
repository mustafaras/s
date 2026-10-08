// Denetim-3 Guard 1 davranış sınaması: pushNow() yolu, sahte fetch, gerçek ağ yok.
var fs=require('fs'),path=require('path');
var root=process.argv[2]; var syncSrc=fs.readFileSync(path.join(root,'sync.js'),'utf8');
if (typeof TextEncoder==='undefined'){ global.TextEncoder=require('util').TextEncoder; }
function res(s,o){return {ok:s>=200&&s<300,status:s,json:()=>Promise.resolve(o),text:()=>Promise.resolve(JSON.stringify(o)),headers:{get:()=>null}};}
function days(n){var d={};for(var i=0;i<n;i++){d[new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10)]={mood:'iyi',i:i};}return d;}
async function run(name,loc){
  var _ls={},calls=[];
  global.localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(_ls,k)?_ls[k]:null,setItem:(k,v)=>{_ls[k]=String(v)},removeItem:k=>{delete _ls[k]},clear:()=>{_ls={}}};
  global.window={addEventListener(){},SeySync:null}; global.document={getElementById:()=>null}; global.location=loc;
  global.fetch=function(url,opts){var m=(opts&&opts.method)||'GET';calls.push({url:String(url),m:m,body:opts&&opts.body});
    if(String(url).indexOf('contents/data/latest.json')>=0&&m==='GET'){var r={days:days(3),settings:{}};return Promise.resolve(res(200,{sha:'s',content:Buffer.from(JSON.stringify(r)).toString('base64'),encoding:'base64'}));}
    if(m==='GET') return Promise.resolve(res(404,{message:'nf'}));
    return Promise.resolve(res(200,{content:{sha:'n'},commit:{sha:'c'}}));};
  var local={onboarded:true,lastOpenedDate:'2026-01-20',days:days(20),settings:{ghToken:'FAKE_TOKEN_D3',ghRepo:'ornek/veri',openaiKey:'FAKE_OPENAI_D3',syncUrl:'https://gizli.example'}};
  _ls['seyma-reset-v1']=JSON.stringify(local);
  eval(syncSrc);
  try{ await global.window.SeySync.pushNow(); }catch(e){}
  await new Promise(r=>setTimeout(r,200));
  var puts=calls.filter(c=>c.m==='PUT');
  var leak=puts.some(p=>{try{var b=JSON.parse(p.body);var t=Buffer.from(b.content||'','base64').toString('utf8');return /FAKE_TOKEN_D3|FAKE_OPENAI_D3|gizli\.example/.test(t);}catch(e){return false}});
  var leakPaths=puts.filter(p=>{try{var b=JSON.parse(p.body);return /FAKE_TOKEN_D3|FAKE_OPENAI_D3|gizli\.example/.test(Buffer.from(b.content||'','base64').toString('utf8'));}catch(e){return false}}).map(p=>p.url.replace(/^.*contents\//,'').replace(/\?.*/,''));
  console.log(JSON.stringify({senaryo:name,ağÇağrısı:calls.length,PUT:puts.length,putYolları:puts.map(p=>p.url.replace(/^.*contents\//,'')),gizliSızanYollar:leakPaths}));
  return {n:calls.length,leak:leak};
}
(async()=>{
  var r=[];
  r.push(await run('localhost',{protocol:'http:',hostname:'localhost',search:''}));
  r.push(await run('127.0.0.1',{protocol:'http:',hostname:'127.0.0.1',search:''}));
  r.push(await run('::1',{protocol:'http:',hostname:'::1',search:''}));
  r.push(await run('file:',{protocol:'file:',hostname:'',search:''}));
  r.push(await run('mac.local',{protocol:'http:',hostname:'mac.local',search:''}));
  var prod=await run('KONTROL üretim',{protocol:'https:',hostname:'mustafaras.github.io',search:''});
  console.log('Guard 1 (5 yerel köken → 0 ağ çağrısı):', r.every(x=>x.n===0)?'PASS':'FAIL');
  console.log('Pozitif kontrol (üretim kökeni ağa çıkar):', prod.n>0?'PASS':'FAIL');
  console.log('Gizli alan (ghToken/openaiKey/syncUrl) hiçbir PUT gövdesinde yok:', !prod.leak?'PASS':'FAIL');
})();
