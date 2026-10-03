#!/usr/bin/env node
// K2F-24 ek tur: L2 (gerçek alan uzmanı) inceleme paketini üretir. Salt-okur girdi: donmuş KAO içerik modülleri,
// texts.tr.json, prayer-lemma-map.json. Çıktı: kao2-duzeltme/evidence/K2F-24/L2-PAKET.md. Belirlenimci; Arapça harf yazmaz
// (varsa hata). `--check`: dosya üretilenle bayt-eş değilse çıkış 1 (hiçbir şey yazmaz). Bu paket ONAY DEĞİLDİR.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const at = (rel) => path.join(ROOT, rel);
const OUT = at('kao2-duzeltme/evidence/K2F-24/L2-PAKET.md');
const box = vm.createContext({ window: {} });
for (const n of ['Lexicon','Grammar','ShortSurahs']) vm.runInContext(fs.readFileSync(at(`app/content/quran${n}V1.js`),'utf8'), box);
const { QuranLexiconV1: lex, QuranShortSurahsV1: sh, QuranGrammarV1: gr } = box.window;
const texts = JSON.parse(fs.readFileSync(at('docs/kuran-ogreniyorum/kao2/content/texts.tr.json'),'utf8'));
const mapJson = JSON.parse(fs.readFileSync(at('docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json'),'utf8'));
const words = new Map(); sh.prayerTexts.forEach(t=>t.words.forEach(w=>{ if(w.lemmaId.startsWith('lp_')&&!words.has(w.lemmaId)) words.set(w.lemmaId,{...w,prayers:[]}); if(words.has(w.lemmaId) && !words.get(w.lemmaId).prayers.includes(t.id)) words.get(w.lemmaId).prayers.push(t.id); }));
const lemmaOf = (stem) => lex.lemmas.filter(l=>l.id.startsWith(stem)).map(l=>l.id);
const mean = (id) => (lex.byId(id).meanings||[]).join(' / ');
const un = {
 lp_1673d5aec4: ['fiil; sözlükte lemması yok','Okunuş/anlam (“yücedir”) doğru mu? Bu fiil için ders sözlüğüne lemma eklenmeli mi?'],
 lp_b1bf6df603: ['fiil; sözlükte lemması yok','Okunuş/anlam (“bereketlidir”) doğru mu? Lemma eklenmeli mi?'],
 lp_436fccf6c0: ['müennes çoğul; tekil lemması sözlükte yok','Anlam (“hürmetler”) doğru mu? Tekil lemma (tahiyye) eklenmeli mi?'],
 lp_6e8c2964fc: ['kırık/müennes çoğul; tekil lemma sözlükte var ('+lemmaOf('l_Salaw').join(', ')+') ama ek ayıklamayla üretilemez','Bu kelime salât lemmasına bağlanabilir mi? Evetse hangi lemma?'],
 lp_98e5be5669: ['kırık çoğul (kul); tekil lemma var ('+lemmaOf('l_Eabod').join(', ')+') ama ek ayıklamayla üretilemez','“kullarının” ifadesi kul lemmasına (ismî) bağlanabilir mi? (Fiil “kulluk etti” lemmasına bağlanmamalı.)'],
 lp_c7d096cadc: ['İKİ ADAY: kul (isim) / kulluk etti (fiil) — belirsiz; eşleme bilerek YOK','“kuludur” için doğru lemma hangisi? (Beklenen: isim; kesin karar uzmandan.)'],
 lp_692bba530a: ['birleşik yazım (li + Allah); lemma var ('+lemmaOf('l_ll_ah').join(', ')+') ama yazım kuralı tek kelimelik','Bu kelime Allah lemmasına bağlanabilir mi?'],
 lp_f0473a3990: ['nidâ biçimi (Allah + m); lemma var ('+lemmaOf('l_ll_ah').join(', ')+') ama kural tek kelimelik','Bu kelime Allah lemmasına bağlanabilir mi?'],
 lp_ccce7cf12f: ['elatif (en yüce); lemma sözlükte yok','Anlam (“en yüce”) doğru mu? Lemma eklenmeli mi?'],
 lp_d9d03c781d: ['fiil 1. tekil (“şahitlik ederim”); lemma var ('+lemmaOf('l_ahida').join(', ')+') ama e- önekli kalıp elatifle karışır → kural eklenmedi','Bu kelime “tanık oldu, şahit oldu” fiil lemmasının bir biçimi midir, o lemmaya bağlanabilir mi?'],
 lp_db3e429022: ['fiil 1. tekil (“şahitlik ederim”); lemma var ('+lemmaOf('l_ahida').join(', ')+') ama e- önekli kalıp elatifle karışır → kural eklenmedi','Bu kelime “tanık oldu, şahit oldu” fiil lemmasının bir biçimi midir, o lemmaya bağlanabilir mi?'],
 lp_f5843446b4: ['lemma sözlükte yok','Anlam (“şanın”) doğru mu? Lemma eklenmeli mi?'],
 lp_f70c1a5dcf: ['özel ad; sözlükte yok','Okunuş/anlam doğru mu? Özel ad lemması gerekli mi?'],
};
const matchedIds = Object.keys(mapJson.map);
const unmatched = [...words.keys()].filter(id=>!(id in mapJson.map)).sort();
const missing = unmatched.filter(id=>!un[id]); if (missing.length) throw new Error('sınıflandırma eksik: '+missing);
const L=[];
L.push('# K2F-24 ek tur — L2 inceleme paketi (gerçek alan uzmanı için)', '',
'> **Bu paket bir ONAY DEĞİLDİR.** Yapay zekâ (Claude) hazırladı; hiçbir kutu işaretlenmedi, hiçbir `expert` düzeyi yazılmadı. Karar kullanıcıdadır (ya da kullanıcının getireceği alan uzmanında).',
'> Arapça içermez: kelimeler kimlik + okunuş + Türkçe anlamla anılır. Bakış sırasında uygulamadaki/araçtaki Arapça metne ilgili dosyadan bakılır.', '',
'## Nasıl kullanılır (tek oturum)', '',
'1. Bölüm A–B’yi sırayla oku; her satırdaki **Soru**’ya evet/hayır/düzeltme yaz (bu dosyada ya da yanıt olarak).',
'2. Uzman “uygun” derse: ilgili inceleme sayfasında L2 kutusunu `[x]` yap (bölüm B). Eşleme düzeltmesi (bölüm A) araç kuralı/sözlük değişikliği gerektirir → yeni bir kapsam onayıyla ele alınır; elle eşleme tablosu yazılmaz.',
'3. Bitince şunu yaz: **“L2 işaretlendi”** (ya da hangi maddelerin reddedildiğini listele). Yanıt yoksa kapı kapanmaz.', '');
L.push('## A. Namaz metni ↔ sözlük lemması eşlemesi', '',
'Dosya: `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md` (araç çıktısı) · veri: `docs/kuran-ogreniyorum/kao2/content/prayer-lemma-map.json` · metinler: `QuranShortSurahsV1.prayerTexts` (' + sh.prayerTexts.map(t=>t.id).join(', ') + ').', '',
`Toplam ${words.size} benzersiz namaz kelimesi: **${matchedIds.length} eşlendi**, **${unmatched.length} eşlenmedi**. Eşlenmeyenler uygulamada “açık” görünür; hiçbir lemmaya bağlı değildir.`, '',
'### A1. Eşlenmeyen kelimeler — hangisi bağlanmalı, hangisi lemma ister?', '',
'| Kimlik | Okunuş | Anlam | Metin | Neden eşlenmedi | Uzmana soru |','|---|---|---|---|---|---|');
for (const id of unmatched){ const w=words.get(id); L.push(`| ${id} | ${w.pronunciation} | ${w.tr} | ${w.prayers.join(', ')} | ${un[id][0]} | ${un[id][1]} |`); }
L.push('', '### A2. Eşlenen kelimeler — eşleme anlamca doğru mu?', '', 'Kural: harekesiz iskelet + yaygın önek/zamir eki (+ düzenli çoğul) ayıklanmış tam eşitlik, tek aday. Her satır için soru: **Bu namaz kelimesi gösterilen sözlük lemmasının bir biçimi midir?**', '',
'| Kimlik | Okunuş | Anlam | Hedef lemma | Lemma anlamı | Metin |','|---|---|---|---|---|---|');
for (const id of matchedIds.sort()){ const w=words.get(id); const t=mapJson.map[id]; L.push(`| ${id} | ${w.pronunciation} | ${w.tr} | ${t} | ${mean(t)} | ${w.prayers.join(', ')} |`); }
const sec=(title, file, rows, q) => { L.push('', title, '', `Dosya: \`${file}\`. Soru: ${q}`, '', '| Kimlik | Başlık | Mevcut düzey |','|---|---|---|'); rows.forEach(r=>L.push(`| ${r[0]} | ${r[1]} | ${r[2]} |`)); };
const R=/Kur|Fâtiha|Fatiha|namaz|Namaz|âyet|sûre|Peygamber|Allah|Rab|Besmele|salât|dua|âhiret|cennet|cehennem|melek|vahiy|Kâbe|kıble/i;
const religiousUnit = (k) => /^u0[123]\./.test(k);  // Fâtiha, namaz, üç kısa sûre: içeriği baştan dinî metin
const pick=(bucket)=>Object.entries(texts[bucket]).filter(([k,e])=>(bucket==='lessons'&&religiousUnit(k))||Object.values(e).some(v=>typeof v==='string'&&R.test(v)));
L.push('', '## B. Dinî bağlamlı ünite ve ders metinleri', '', 'Seçim ölçütü: Ünite 1–3 dersleri her zaman; diğerleri için aracın dinî-bağlam deseni (`RELIGIOUS`, `tools/kao2-curriculum-build.mjs`) metinde geçiyor. Uzman listeye madde ekleyebilir/çıkarabilir.');
sec('### B1. Ünite metinleri (vaat + “neden önemli”)','docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md  → “Üniteler” bölümü, her ünitenin ikinci kutusu (L2)',
  pick('units').map(([k,e])=>[`u${k}`,(e.title||'—'),e.review.level+(e.review.sources?` · kaynak: ${e.review.sources.join(', ')}`:'')]),'Dinî ifade doğru, saygılı ve kaynağıyla uyumlu mu? (kutu: ünite satırındaki ikinci kutu)');
sec('### B2. Ders metinleri','docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md  → “Dersler” tabloları (tek “onay” kutusu; L1/L2 ayrımı yok — uzman onayı bu kutuya işlenirse L1 ile karışır, ayrım sende)',
  pick('lessons').map(([k,e])=>[k,(e.title||'—'),e.review.level]),'Başlık/hedef/anlatım dinen doğru ve uygun mu?');
sec('### B3. Gramer kavramı metinleri (çözümlü örnek + hata açıklaması)','docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-18.md  → ilgili kavramın ikinci kutusu (L2)',
  pick('concepts').map(([k,e])=>[k,(gr.byId(k)||{}).title||'—',e.review.level]),'Örnekteki dinî içerik doğru mu?');
L.push('', '## C. Bu paketin kapsamadığı / dürüstçe açık olanlar', '',
'- Seçim: Ünite 1–3 dersleri (baştan dinî metin) + aracın dinî-bağlam deseni (`RELIGIOUS`) metinde geçen diğer ünite/ders/kavramlar. Desene takılmayan ama dinî bağlam taşıyan metin olabilir; uzman madde ekleyebilir.',
'- Mevcut `sourced` onayları kullanıcı devriyle yapay zekâ incelemesidir; bu paket onları **uzman onayına yükseltmez**.',
'- Telaffuz sesi (katman A kayıt), 20 `draft` sûre tanıtımı (KR-5) ve cihaz doğrulaması ayrı kapılardır.', '');
const text=L.join('\n');
if (/[\u0600-\u06ff]/.test(text)) throw new Error('Arapça harf sızdı');
if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  if (current !== text) { console.error('l2-paket-build: FAIL — L2-PAKET.md üretilenle bayt-eş değil (araçla yeniden üret)'); process.exit(1); }
  console.log(`l2-paket-build: PASS (--check · ${unmatched.length} eşlenmeyen · ${matchedIds.length} eşlenen)`);
} else {
  fs.writeFileSync(OUT, text);
  console.log(`l2-paket-build: ${OUT} · ${unmatched.length} eşlenmeyen · ${matchedIds.length} eşlenen`);
}
