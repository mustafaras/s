#!/usr/bin/env node
// Read-only session context. Never grants permission, changes state or runs product commands.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const state=JSON.parse(read('IIP-STATE.json'));
const reqs=JSON.parse(read('tracking/REQUIREMENTS.json'));
const decisions=JSON.parse(read('tracking/DECISIONS.json'));
const promptFile='UYGULAMA-PROMPTLARI.md', prompts=read(promptFile);
const routes={
  1:[['01-MEVCUT-DURUM.md','Zaten güçlü olanlar'],['05-TEKNIK-SOZLESME.md','Dosya sahipliği']],
  2:[['specs/02-EKRAN-SARTNAMESI.md','Ortak kompozisyon'],['specs/06-BILESEN-KATALOGU.md','Bileşen kabul fişi'],['specs/05-KALITE-SKOR-KARTI.md','Tasarım değerlendirme ölçeği']],
  3:[['05-TEKNIK-SOZLESME.md','Namaz anlam ve veri kararı']],
  4:[['specs/02-EKRAN-SARTNAMESI.md','S01 — Bugün'],['specs/06-BILESEN-KATALOGU.md','C01 — Bölüm gezintisi'],['specs/06-BILESEN-KATALOGU.md','C02 — Editoryal odak kartı']],
  5:[['specs/02-EKRAN-SARTNAMESI.md','S03 — Öncü okuyucusu'],['specs/06-BILESEN-KATALOGU.md','C05 — Okuyucu araç ve eylem alanı']],
  6:[['specs/02-EKRAN-SARTNAMESI.md','S04 — İbadet ana ekranı'],['specs/02-EKRAN-SARTNAMESI.md','S09 — Kıble ve takvim']],
  7:[['specs/02-EKRAN-SARTNAMESI.md','S06 — Zikir odak'],['specs/02-EKRAN-SARTNAMESI.md','S07 — Kur’an çalışma']],
  8:[['07-KALITE-VE-KABUL.md','Bitmiş sayılma koşulu'],['specs/05-KALITE-SKOR-KARTI.md','Erişilebilirlik ve görsel kanıt matrisi']],
  9:[['02-DENEYIM-VE-ISLEV.md','İki aşamalı bilgi mimarisi'],['specs/03-ETKILESIM-SOZLESMELERI.md','Bağlam ve odak']],
  10:[['specs/02-EKRAN-SARTNAMESI.md','S02 — İlham keşfi'],['specs/06-BILESEN-KATALOGU.md','C07 — Arama, filtre ve sonuç']],
  11:[['specs/03-ETKILESIM-SOZLESMELERI.md','Okuyucu durum makinesi'],['specs/03-ETKILESIM-SOZLESMELERI.md','Bağlam ve odak']],
  12:[['specs/03-ETKILESIM-SOZLESMELERI.md','Devam et karar tablosu'],['specs/03-ETKILESIM-SOZLESMELERI.md','Günlük kürasyon']],
  13:[['specs/03-ETKILESIM-SOZLESMELERI.md','Zaman ve cache'],['05-TEKNIK-SOZLESME.md','Ağ ve çevrimdışı']],
  14:[['05-TEKNIK-SOZLESME.md','Namaz anlam ve veri kararı'],['specs/02-EKRAN-SARTNAMESI.md','S05 — Kayıt ayrıntısı']],
  15:[['specs/02-EKRAN-SARTNAMESI.md','S10 — Ritim'],['05-TEKNIK-SOZLESME.md','Namaz anlam ve veri kararı']],
  16:[['specs/04-ICERIK-URETIM-SISTEMI.md','Yayın hattı ve sorumlular'],['04-ICERIK-STRATEJISI.md','İçerik aileleri']],
  17:[['specs/02-EKRAN-SARTNAMESI.md','S08 — Dua ve seçki okuyucusu'],['specs/06-BILESEN-KATALOGU.md','C06 — Kaynak ve içerik türü']],
  18:[['07-KALITE-VE-KABUL.md','Uygulama sırasında komut rehberi'],['specs/05-KALITE-SKOR-KARTI.md','Kullanıcı görev protokolü']],
  19:[['05-TEKNIK-SOZLESME.md','Önerilen kalıcılık matrisi'],['05-TEKNIK-SOZLESME.md','Geri alma ve sürüm']],
  20:[['specs/02-EKRAN-SARTNAMESI.md','S11 — Yer imleri ve yeniden ziyaret'],['specs/03-ETKILESIM-SOZLESMELERI.md','Bağlam ve odak']],
  21:[['specs/02-EKRAN-SARTNAMESI.md','S12 — Yolculuk ve offline yönetimi'],['specs/04-ICERIK-URETIM-SISTEMI.md','Kalite örneklemi ve düzeltme']],
  22:[['05-TEKNIK-SOZLESME.md','Ağ ve çevrimdışı'],['specs/02-EKRAN-SARTNAMESI.md','S12 — Yolculuk ve offline yönetimi']],
  23:[['07-KALITE-VE-KABUL.md','Uygulama sırasında komut rehberi'],['specs/05-KALITE-SKOR-KARTI.md','Performans protokolü']],
  24:[['07-KALITE-VE-KABUL.md','Bitmiş sayılma koşulu'],['05-TEKNIK-SOZLESME.md','Geri alma ve sürüm']]
};
function between(text,name) {
  const a=`<!-- ${name}:START -->`,b=`<!-- ${name}:END -->`;
  if(text.split(a).length!==2 || text.split(b).length!==2 || text.indexOf(b)<text.indexOf(a)) throw Error('Missing/duplicate/reversed block '+name);
  return text.slice(text.indexOf(a)+a.length,text.indexOf(b)).trim();
}
function section(file,title) {
  if(path.isAbsolute(file) || file.split(/[\\/]/).includes('..') || !file.endsWith('.md')) throw Error('Only plan-relative Markdown paths allowed');
  const full=fs.realpathSync(path.join(root,file));
  if(!full.startsWith(root+path.sep)) throw Error('Path outside plan');
  const lines=read(file).split('\n');let start=-1,level=0,end=lines.length,inFence=false;
  for(let i=0;i<lines.length;i++) {
    if(/^```/.test(lines[i])) {inFence=!inFence;continue;}
    if(inFence) continue;
    const h=lines[i].match(/^(#{1,6}) (.+)$/); if(!h)continue;
    if(start<0 && h[2]===title){start=i;level=h[1].length;continue;}
    if(start>=0 && h[1].length<=level){end=i;break;}
  }
  if(start<0)throw Error('Unknown heading '+file+' :: '+title);
  return lines.slice(start,end).join('\n').trim();
}
function check(text=prompts) {
  between(text,'COMMON');
  const found=[...text.matchAll(/<!-- (IIP-\d{2}):START -->/g)].map(m=>m[1]);
  if(JSON.stringify(found)!==JSON.stringify(state.cards.map(c=>c.id)))throw Error('Prompt/card order or coverage drift');
  for(const c of state.cards) {
    between(text,c.id);
    if(!read(c.path).includes('../'+promptFile))throw Error('Card missing canonical prompt link '+c.id);
    for(const [f,h] of routes[Number(c.id.slice(-2))] || [])section(f,h);
  }
}
function brief(id) {
  const c=state.cards.find(c=>c.id===id); if(!c)throw Error('Unknown card '+id);
  const index=state.cards.indexOf(c), earlier=state.cards.slice(0,index).filter(x=>x.status!=='done');
  const map=new Map(state.cards.map(x=>[x.id,x]));
  const selfHandoff=c.handoff || `evidence/${id}/HANDOFF.md`;
  let out=`# ${id} — ${c.title}\n\n`;
  out+=`CWD: /Users/m_ras/Desktop/seyma · Plan ${state.planVersion} · Durum ${c.status} · Sahip ${c.owner||'yok'}\n`;
  out+=`Baseline HEAD: ${state.baselineHead} (canlı HEAD'i ayrıca doğrula).\n`;
  out+=`State'te bu kart yetkisi: ${state.implementationApproval.status==='approved' && state.implementationApproval.cardIds.includes(id) ? 'kayıtlı' : 'yok; güncel kullanıcı talimatı varsa yalnız bu kart için kaydet'}.\n`;
  out+=`Sıra: ${earlier.length ? 'ÖNCE TAMAMLANMAMIŞ: '+earlier.map(x=>x.id+'='+x.status).join(', ')+'; atlama.' : 'Önceki adımlar tamam veya ilk adım.'}\n`;
  if(c.status==='done')out+='BU KART DONE: yeniden uygulama; kanıtı doğrula ve dur.\n';
  if(c.blockedReason)out+='Engel: '+c.blockedReason+'\n';
  out+=`Önkoşullar: ${c.dependsOn.map(x=>x+'='+map.get(x)?.status).join(', ')||'yok'}.\n`;
  out+=`Kendi deviri: ${fs.existsSync(path.join(root,selfHandoff))?selfHandoff:'henüz yok'}.\n`;
  out+=`Gerekirse bağımlı devirler: ${c.dependsOn.map(x=>map.get(x)?.handoff).filter(Boolean).join(', ')||'henüz yok'}.\n\n`;
  out+=between(prompts,'COMMON')+'\n\n'+between(prompts,id)+'\n\n';
  out+='## Canlı görev sınırı\n\n';
  out+=`Üretim: ${c.allowedProductionFiles.join(', ')||'yok'}.\nTest: ${c.allowedTestFiles.join(', ')||'yok'}.\n`;
  out+=`Yazma planı/kilit: ${c.plannedWriteFiles.join(', ')||'yok'} / ${c.locks.join(', ')||'yok'}. Veri yazıcısı: ${c.dataAffecting}; kaynak kilidi: ${c.resourceLocks.join(', ')||'yok'}.\n`;
  out+=`Gerekli gate: ${c.requiredGates.join(', ')}. Kanıt: evidence/${id}/.\n\n`;
  for(const rid of c.requirements) {const r=reqs.find(x=>x.id===rid);out+=`- ${r.id}/${r.testId}: ${r.acceptance}\n  Olumsuz: ${r.negativeCase}\n`;}
  for(const did of c.decisionIds){const d=decisions.find(x=>x.id===did);out+=`- Karar ${did}: ${d?.title} / ${d?.status}; kanıt ${d?.evidence||'yok'}.\n`;}
  out+='\n## Yalnız ilgili başlıkları aç\n\n';
  for(const [f,h] of routes[Number(id.slice(-2))])out+=`- ${f} → ${h}\n`;
  if(id==='IIP-02')out+='- Bu tasarım kartında 12 S ekranı ve 8 C bileşeni de tek tek okunur; geniş kapsam bu karta özgüdür.\n';
  out+='\nBaşlık okuma: `node ilham-ibadet-premium-plan/tools/session-brief.mjs --section DOSYA "BAŞLIK"`. Bunlar plan köküne göre yollardır. Ek kaynak gerekirse yalnız ilgili bölümünü aç.\n';
  out+='\n## Kart komutları\n\n'+section(c.path,'Doğrulama').split('\n\nKomut geçmesi')[0]+'\n';
  out+='\nKapanışta gereken gate şablonlarını oku; 150–250 kelimelik devir hedefle, logları eklerde tut. Yarım işte eksik gate açık kalsın.\n';
  return out;
}
try {
 const args=process.argv.slice(2);
 if(args[0]==='--section' && args.length===3)process.stdout.write(section(args[1],args[2])+'\n');
 else if(args[0]==='--next' && args.length===1) {
   const next=state.cards.find(c=>c.status!=='done');
   process.stdout.write(next ? `${next.id} — ${next.title} (${next.status}); öneri, yetki değildir.\n` : 'Tüm kartlar done; cihaz/yayın durumunu ayrıca kontrol et.\n');
 } else if(args[0]==='--check' && args.length===1) {check();process.stdout.write('PASS: 24 ordered prompts, shared contract, card links and targeted section routes.\n');}
 else if(args[0]==='--self-test' && args.length===1) {
   check();
   const bad=[prompts.replace('<!-- COMMON:END -->',''),prompts.replace('<!-- IIP-01:START -->','<!-- IIP-02:START -->'),prompts.replace('<!-- IIP-24:START -->','<!-- IIP-25:START -->')];
   for(const text of bad){let caught=false;try{check(text);}catch{caught=true;}if(!caught)throw Error('Invalid prompt accepted');}
   for(const [f,h] of [['../AGENTS.md','x'],['specs/02-EKRAN-SARTNAMESI.md','does not exist']]) {let caught=false;try{section(f,h);}catch{caught=true;}if(!caught)throw Error('Invalid section accepted');}
   let caught=false;try{brief('IIP-99');}catch{caught=true;}if(!caught)throw Error('Unknown card accepted');
   process.stdout.write('PASS: prompt order/routes and 6 malformed input rejection tests.\n');
 } else if(args.length===1 && /^IIP-\d{2}$/.test(args[0])) {check();process.stdout.write(brief(args[0]));}
 else throw Error('Usage: session-brief.mjs IIP-01 | --next | --check | --self-test | --section file.md "Exact heading"');
} catch(error){process.stderr.write('FAIL: '+error.message+'\n');process.exitCode=1;}
