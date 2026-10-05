// K2F-35 ek: iki ağaç arasında (cari vs taban commit) aynı makinede, serpiştirilmiş yükleme süresi A/B ölçümü.
// Kullanım: git worktree add --detach $TMPDIR/base 07802fa6; node kao2-duzeltme/tools/perf-ab.cjs . $TMPDIR/base
const fs=require('fs'),path=require('path'),vm=require('vm'),{performance}=require('perf_hooks'),zlib=require('zlib');
function load(root){
  const legacy=['Lexicon','Grammar','ShortSurahs','Phonics'].map(n=>`app/content/quran${n}V1.js`).concat(['app/content/quranCurriculumV2.js']);
  const rt=fs.readdirSync(path.join(root,'app/core')).filter(f=>/^quranLearn.*\.js$/.test(f)).sort((a,b)=>(a==='quranLearn.js')-(b==='quranLearn.js')||a.localeCompare(b)).map(f=>`app/core/${f}`);
  return legacy.concat(rt).map(f=>fs.readFileSync(path.join(root,f),'utf8'));
}
const A=load(process.argv[2]),B=load(process.argv[3]);
const run=src=>{const box=vm.createContext({window:{}});const t=performance.now();for(const s of src)vm.runInContext(s,box);return performance.now()-t;};
const sA=[],sB=[];
for(let i=0;i<60;i++){ if(i%2){sA.push(run(A));sB.push(run(B));}else{sB.push(run(B));sA.push(run(A));} }
const p=(a,q)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.ceil(a.length*q)-1];};
const med=a=>p(a,0.5), best3=a=>a.slice().sort((x,y)=>x-y)[1];
console.log('current  p50 %s p95 %s best3 %s',med(sA).toFixed(2),p(sA,.95).toFixed(2),best3(sA).toFixed(2));
console.log('baseline p50 %s p95 %s best3 %s',med(sB).toFixed(2),p(sB,.95).toFixed(2),best3(sB).toFixed(2));
console.log('ratio best3 %s  p50 %s  p95 %s',(best3(sA)/best3(sB)).toFixed(3),(med(sA)/med(sB)).toFixed(3),(p(sA,.95)/p(sB,.95)).toFixed(3));
