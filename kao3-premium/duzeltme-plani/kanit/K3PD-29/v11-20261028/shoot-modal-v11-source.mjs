// usage: node shoot-modal.mjs <root> <outDir> <profileName> [width] [dark] [inset]
// K3PD-29 · Gerçek iki tema + geometri + zor glif görsel QA çekimi.
//
// Kontrollü yerel QA: sunucu YOK, token YOK, forceSync YOK; origin yalnız 127.0.0.1:9000
// (sync.js Guard 1). cdp.mjs dış istekleri CDP Fetch ile keser; bu dosya ağa çıkmaz.
//
// F-11'in düzeltmesi (K3P-00/07/26 + A6 açıkları):
//   • Tema artık etiket değil ÖLÇÜM: her profil (ana VE onboarding) için App.setTheme(false|true)
//     çağrılır, root `data-theme` ve computed `--quran-surface`/`--quran-ink` okunur; beklenene
//     uymuyorsa çekim BAŞARISIZDIR (atlanmaz, SKIP'e yutulmaz).
//   • HER görüntü için tek manifest satırı yazılır: profil/tema/viewport/sahne/screenshot/log/
//     issues/sha256. Satır sayısı = PNG sayısı = log satırı sayısı; eşleşmezse exit 1.
//   • Onboarding ayrı profil olarak ölçülür (eskiden teması hiç seçilmiyordu).
//   • CTA geometrisi (K3PD-21 sözleşmesi) aynı aşamanın ardışık render'larında ölçülür.
//   • 30 zor glif dizisi doğrulanmış içerikten (gorsel-qa-manifest.mjs) seçilir; her dizi
//     tek bir okunabilir kırpım + font yükleme kanıtı olarak kaydedilir.
import { launch } from './cdp.mjs';
import { glyphSeries, imageSize, manifestRow, sha256File, sha256Text, THEME_TOKENS } from './gorsel-qa-manifest.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const [root, out, prof, widthArg, darkArg, insetArg] = process.argv.slice(2);
if (!root || !out || !prof) {
  console.error('Kullanım: node shoot-modal.mjs <root> <outDir> <profileName> [width|--glif-only] [dark] [inset]');
  process.exit(2);
}
const GLYPH_ONLY = widthArg === '--glif-only';
const width = GLYPH_ONLY ? 460 : (Number(widthArg) || 390);
// Tema argümanı: 'dark'|'1'|'true' → koyu; 'light'|'0'|'false'|yok → açık.
// (Eskiden her truthy değer koyu sayılıyordu; 'light' yazınca koyu çekiyordu — yanlış kanıt.)
const dark = darkArg === 'dark' || darkArg === '1' || darkArg === 'true';
const safeAreaBottom = Number(insetArg) || 0;
const themeName = dark ? 'dark' : 'light';
const viewport = { width, height: 844, safeAreaBottom };
// Kanıt görüntü biçimi. Ölçüm (390 px, 73 görünüm): PNG 8,9 MB → WebP q90 1,3 MB.
// 6 kombinasyon PNG ile 50 MB tutardı; deponun makul kalması için WebP q90 kullanılır.
// Metin keskinliği korunur (kayıpsız alternatif 5,2 MB; q90 fark görsel olarak ayırt edilemez).
const SHOT_FORMAT = 'webp';
const SHOT_QUALITY = 90;
const SHOT_EXT = `.${SHOT_FORMAT}`;

fs.mkdirSync(out, { recursive: true });
// Kanıt dizini her koşumda taze olmalı: eski görüntülerle karışırsa sayım/hash yalan söyler.
// NOT: macOS'ta aynı ada ikinci kez yazmak "ad 2.webp" üretebiliyor (Finder/Chrome dosya
// çakışması). Bu yüzden `.png/.webp` ile BİTEN her dosya silinir — " 2.webp" de dâhil.
for (const name of fs.readdirSync(out)) {
  if (/\.(png|webp)$/i.test(name)) fs.unlinkSync(path.join(out, name));
}
// Kalıntı "kopya" dosyaları da temizle (ad ortasında boşluk + sayı).
// macOS aynı ada yazarken "ad 2.webp" üretir; yalnız görüntüleri değil manifest/log/issues
// kopyalarını da temizlemek gerekir, aksi hâlde `--dogrula` disk sayımında kırmızı olur.
const DUP_NAME_RE = / \d+\.(png|webp|json|txt)$/i;
for (const name of fs.readdirSync(out)) {
  if (DUP_NAME_RE.test(name)) fs.unlinkSync(path.join(out, name));
}

// ── Geçici tarayıcı profilleri: OTOMATİK temizlik ─────────────────────────────────────────────
// Önceden profiller elle siliniyordu; yarıda kalan bir koşum os.tmpdir() içinde çöp
// bırakıyor ve aynı ad yeniden kullanıldığında çekim kilitlenebiliyordu (denetim
// bulgusu F11). Profiller bu koşumun `prof` önekiyle üretilir; çıkışta (başarı/başarısızlık
// fark etmez) ve başlangıçta aynı önekli artıklar silinir.
const PROFILE_PREFIXES = [prof, `${prof}-onb`, `${prof}-glif`];
function sweepProfiles() {
  const tmp = os.tmpdir();
  const removed = [];
  for (const name of fs.readdirSync(tmp)) {
    // Yalnız BU koşumun ad alanı: başka araçların dizinlerine dokunulmaz.
    if (!PROFILE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}-`) || name.startsWith(`${prefix}.`))) continue;
    try {
      const full = path.join(tmp, name);
      if (!fs.statSync(full).isDirectory()) continue;
      fs.rmSync(full, { recursive: true, force: true, maxRetries: 3 });
      removed.push(name);
    } catch (error) {
      // Silinemeyen profil bir uyarıdır; çekim sonucunu geçersiz kılmaz.
      console.error(`UYARI geçici profil silinemedi: ${name} (${error && error.message ? error.message : error})`);
    }
  }
  return removed;
}
const profilesSweptAtStart = sweepProfiles();
process.on('exit', () => { try { sweepProfiles(); } catch {} });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { try { sweepProfiles(); } catch {} process.exit(130); });
}

const sourceInventory = { files: Object.create(null), conflicts: [] };
const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844, insets: safeAreaBottom ? { bottom: safeAreaBottom } : null, scale: 1, sourceInventory });
// ≤8 px kuralı: AYNI sahnenin (aynı aşama + aynı görev/içerik örneği) ardışık render'larında
// birincil eylem aynı y'de kalmalı. Farklı görev örneklerinin y'leri doğal olarak farklıdır
// (içerik yüksekliği değişir); onları tek kovaya toplamak yanlış pozitif üretir.
const sceneYs = [];
const noteYs = (scene, stage, first, second) => {
  const ys = [first.layoutY, second.layoutY];
  let maxDelta = 0;
  for (let i = 1; i < ys.length; i += 1) maxDelta = Math.max(maxDelta, Math.abs(ys[i] - ys[i - 1]));
  const viewportYs = [first.y, second.y], scrollTops = [first.scrollTop, second.scrollTop];
  maxDelta = Math.max(maxDelta, Math.abs(viewportYs[1] - viewportYs[0]));
  sceneYs.push({ scene, stage, viewport: `${viewport.width}x${viewport.height}+${viewport.safeAreaBottom}`, samples: ys.length, layoutYs: ys, maxDelta, viewportYs, scrollTops });
};
const manifest = [];
// `log` YALNIZ sahne satırlarını taşır (görüntü başına 1). Koşum üstbilgisi ayrı dizide:
// aksi hâlde "log satırı = görüntü sayısı" eşliği yanlış sayı verir.
const log = [];
const runLog = [];
// İKİ AYRI KANAL — metin aramasıyla sınıflandırma YOK:
//   failures : ölçüm/çekim kırılması → kanıt geçersiz → exit 1 (varsayılan)
//   findings : üretimde ölçülen gerçek kusur → kanıt geçerli → exit 0 + FINDING
// Yeni bir kontrol eklerken VARSAYILAN `failures`'tır; yalnız gerçekten "ürün kusuru" olan
// durumlar açıkça `findings`'e yazılır. Böylece fail-closed varsayılan korunur.
const failures = [];
const findings = [];
async function gotoReady(page, url) {
  await page.goto(url);
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const ready = await page.eval(`typeof window.createDefaultData === 'function' && typeof App !== 'undefined' && typeof ui !== 'undefined'`);
    if (ready) return;
    await page.wait(250);
  }
  throw new Error('uygulama başlangıcı 30 saniyede tamamlanmadı');
}
const sceneFontReady = (page) => page.eval(`(async function(){
  await document.fonts.load('16px "K3P Scheherazade"', 'ب');
  await document.fonts.ready;
  var loaded=false; document.fonts.forEach(function(face){
    if (face.family.replace(/["']/g,'') === 'K3P Scheherazade' && face.status === 'loaded') loaded=true;
  });
  return loaded && document.fonts.check('16px "K3P Scheherazade"', 'ب');
})()`);
// Görüntüdeki yüzeyin bütün görünür ve kaydırma alanındaki kontrol kutuları.
// Kullanıcı girdisi/değeri okunmaz; görünmeyen kontroller ölçümden silinmez.
const sceneActions = (page) => page.eval(`JSON.stringify((function(){
  var glyph=document.querySelector('#k3pd29-glyph-sheet');
  var dialog=document.querySelector('[role=dialog]'),onb=document.querySelector('[data-onboarding-theme]');
  var root=glyph||dialog||onb||document.getElementById('app')||document.body;
  var scope=glyph?'glyph':dialog?'dialog':onb?'onboarding':'app';
  var controls=[].slice.call(root.querySelectorAll(':is(button,a[href],summary,[role=button]):not(input):not(select):not(textarea),.kao-roots-search > input[type=search]'));
  return {scope:scope,viewport:{width:innerWidth,height:innerHeight},actions:controls.map(function(el,i){
    var r=el.getBoundingClientRect(),cs=getComputedStyle(el),left=r.left,top=r.top,right=r.right,bottom=r.bottom;
    for(var p=el.parentElement;p;p=p.parentElement){var s=getComputedStyle(p),q=p.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(s.overflowX)){left=Math.max(left,q.left);right=Math.min(right,q.right)}if(/(hidden|clip|auto|scroll)/.test(s.overflowY)){top=Math.max(top,q.top);bottom=Math.min(bottom,q.bottom)}}
    left=Math.max(left,0);right=Math.min(right,innerWidth);top=Math.max(top,0);bottom=Math.min(bottom,innerHeight);
    var rendered=cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'&&r.width>0&&r.height>0;
    var visible=rendered&&right>left&&bottom>top;
    var hits=visible?[[0.5,0.5],[0.15,0.15],[0.85,0.15],[0.15,0.85],[0.85,0.85]].map(function(pt){var hit=document.elementFromPoint(left+(right-left)*pt[0],top+(bottom-top)*pt[1]);return !!hit&&(hit===el||el.contains(hit))}):[];
    var covered=visible&&hits.some(function(ok){return !ok});
    var contentOverlaps=[];
    if(visible)[].forEach.call(root.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,span,small,strong,em'),function(other){
      if(other===el||el.contains(other)||other.contains(el)||other.closest('button,a[href],summary,[role=button]'))return;
      var os=getComputedStyle(other),o=other.getBoundingClientRect();if(os.display==='none'||os.visibility==='hidden'||os.opacity==='0'||!o.width||!o.height)return;
      if(![].some.call(other.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()}))return;
      var l=o.left,t=o.top,rr=o.right,bb=o.bottom;
      for(var a=other.parentElement;a;a=a.parentElement){var st=getComputedStyle(a),ar=a.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(st.overflowX)){l=Math.max(l,ar.left);rr=Math.min(rr,ar.right)}if(/(hidden|clip|auto|scroll)/.test(st.overflowY)){t=Math.max(t,ar.top);bb=Math.min(bb,ar.bottom)}}
      var ix=Math.min(right,rr)-Math.max(left,l),iy=Math.min(bottom,bb)-Math.max(top,t);
      if(ix>1&&iy>1)contentOverlaps.push({tag:other.tagName,x:Math.round(l),y:Math.round(t),width:Math.round(rr-l),height:Math.round(bb-t),overlapPx:Math.round(Math.min(ix,iy))});
    });
    return {index:i,tag:el.tagName,cls:String(el.className||'').slice(0,80),x:Math.round(r.left),y:Math.round(r.top),width:Math.round(r.width),height:Math.round(r.height),clipLeft:Math.round(left),clipTop:Math.round(top),clipRight:Math.round(right),clipBottom:Math.round(bottom),rendered:rendered,visible:visible,fullyVisible:visible&&left<=r.left+1&&right>=r.right-1&&top<=r.top+1&&bottom>=r.bottom-1,covered:covered,hits:hits,disabled:!!el.disabled,contentOverlaps:contentOverlaps};
  })};
})())`);

const ORIGIN = 'http://127.0.0.1:9000';

// ── Sahne taraması (taşma/kırpılma) ───────────────────────────────────────────────────────────
// Yerel kaydırma alanı (bilerek kaydırılabilir) ile sayfa/diyalog taşması AYRI raporlanır.
const SCAN = `(function(){
  var d=document.querySelector('[role=dialog]');
  var scope=d||document.getElementById('app')||document.body;
  var dr=scope.getBoundingClientRect(), out=[];
  function pathOf(el){ var n=el.tagName.toLowerCase(), c=(el.getAttribute('class')||'').trim().split(/\\s+/).slice(0,2).join('.'); return n+(c?'.'+c:''); }
  function hasText(el){ return (el.textContent||'').replace(/\\s+/g,'').length>0; }
  function localScroll(el){ for(var p=el.parentElement;p&&p!==scope;p=p.parentElement){ var cs=getComputedStyle(p); if(/(auto|scroll)/.test(cs.overflowX)) return true; } return false; }
  function add(kind,el,extra){ out.push({kind:kind, el:pathOf(el), text:(el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40), extra:extra||''}); }
  var all=scope.querySelectorAll('*:not(input):not(select):not(textarea)');
  for(var i=0;i<all.length;i++){
    var el=all[i], cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') continue;
    var r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) continue;
    // Ekran okuyucuya özel, bilerek 1 px'e kırpılmış etiketler kusur değildir:
    // app/styles.css .sey-header-action span ve .sey-header-save__label için
    // position:absolute;width:1px;height:1px;clip:rect(0,0,0,0) uygular.
    // CSS yalnız .sey-header-action span ve .sey-header-save__label için clip:rect uygular;
    // muafiyet o alt-ağaca değil, yalnız o span'lere verilir.
    if(el.closest('.kao-sr-only') || el.matches('.sey-header-save__label') || el.matches('.sey-header-action span')) continue;
    if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg') continue;
    var ownT=[].some.call(el.childNodes,function(n){return n.nodeType===3&&n.textContent.trim().length>0;});
    if(!localScroll(el)&&(r.right>dr.right+1||r.left<dr.left-1)&&ownT&&el.children.length===0) add('DIŞARI-TAŞAR',el,'right='+Math.round(r.right)+' scope='+Math.round(dr.right));
    if(/(auto|scroll)/.test(cs.overflowX)&&el.scrollWidth>el.clientWidth+1&&el!==scope) add('KAYDIRMALI-ALAN(bilgi)',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    var clipX=/(hidden|clip)/.test(cs.overflowX), clipY=/(hidden|clip)/.test(cs.overflowY);
    // Yalnız METNİN KENDİSİ kırpılıyorsa kusur say. Dekoratif katmanlar (parıltı gradyanları,
    // filigran emoji, maskeli arka planlar) bilerek taşar ve children.length > 0 olan
    // kapsayıcılarda yanlış pozitif üretir. Bu yüzden: kendi doğrudan metin düğümü olan ve
    // element çocuğu OLMAYAN yapraklar ölçülür.
    var ownText=[].some.call(el.childNodes,function(n){return n.nodeType===3&&n.textContent.trim().length>0;});
    var isLeafText=ownText&&el.children.length===0;
    // KÖR NOKTA (denetim bulgusu F11): yalnız children.length===0 yapraklarını ölçmek
    // p > strong > "kırpılan metin" durumunu kaçırır. Metin düğümü taşıyan (kendi metni
    // olan) her öğe ölçülür; iç çocukların taşması ebeveyninkine yansır.
    var hasOwnTextNode=ownText;
    // Bilerek kısaltılan metin (text-overflow:ellipsis / satır sınırı) kayıp değildir:
    // kullanıcıya "…" ile sinyal verilir. Ayrı bilgi olarak kaydedilir, kusur sayılmaz.
    var intentionalTruncate = cs.textOverflow==='ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp!=='none');
    if(hasOwnTextNode&&clipX&&el.scrollWidth>el.clientWidth+1&&el.getAttribute('role')!=='progressbar') add(intentionalTruncate?'KISALTILMIS-METIN(bilgi)':'YATAY-KIRPILIR',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    if(hasOwnTextNode&&clipY&&el.scrollHeight>el.clientHeight+1&&el.getAttribute('role')!=='progressbar') add(intentionalTruncate?'KISALTILMIS-METIN(bilgi)':'DİKEY-KIRPILIR',el,'sh='+el.scrollHeight+' ch='+el.clientHeight);
    // GERÇEK METİN KIRPILMASI: Range ile ölçülür. Bir metin düğümünün satır kutuları
    // ebeveynin kırpma kutusunu aşıyorsa metin gerçekten görünmüyordur — children.length
    // kaç olursa olsun. Bu, yapıdan bağımsız tek güvenilir ölçümdür.
    if(hasOwnTextNode&&(clipX||clipY)){
      var rg=document.createRange(), clippedText=false;
      for(var ci=0;ci<el.childNodes.length;ci++){
        var nd=el.childNodes[ci];
        if(nd.nodeType!==3||!nd.textContent.trim()) continue;
        rg.selectNodeContents(nd);
        var rects=rg.getClientRects();
        for(var ri=0;ri<rects.length;ri++){
          var rr=rects[ri];
          if(rr.width>0&&rr.height>0&&(rr.right>r.right+1||rr.left<r.left-1||rr.bottom>r.bottom+1||rr.top<r.top-1)){clippedText=true;break;}
        }
        if(clippedText) break;
      }
      if(clippedText&&!intentionalTruncate) add('METIN-KIRPILIR',el,'range-taşması');
    }
  }
  var de=document.documentElement;
  if(de.scrollWidth>de.clientWidth+1) out.push({kind:'SAYFA-TAŞMASI', el:'html', text:'', extra:'sw='+de.scrollWidth+' cw='+de.clientWidth});
  if(d){ var body=d.querySelector('.kao-body'); if(body&&body.scrollWidth>body.clientWidth+1) out.push({kind:'DİYALOG-YATAY-KAYDIRMA(bilgi)', el:'.kao-body', text:'', extra:'sw='+body.scrollWidth+' cw='+body.clientWidth}); }
  return out;
})()`;

// Yalnız gerçek hata sayılan türler; kaydırmalı alanlar bilgi olarak manifeste girer.
const HARD_ISSUES = new Set(['DIŞARI-TAŞAR', 'YATAY-KIRPILIR', 'DİKEY-KIRPILIR', 'METIN-KIRPILIR', 'SAYFA-TAŞMASI']);

const THEME_STATE = `(function(){
  var r=document.getElementById('root'), cs=getComputedStyle(r);
  return JSON.stringify({
    dataTheme: r.getAttribute('data-theme'),
    surface: cs.getPropertyValue('--quran-surface').trim(),
    ink: cs.getPropertyValue('--quran-ink').trim(),
    onb: (document.querySelector('[data-onboarding-theme]')||{getAttribute:function(){return null}}).getAttribute('data-onboarding-theme')
  });
})()`;

function themeProblems(state, expected) {
  const want = THEME_TOKENS[expected];
  const problems = [];
  if (state.dataTheme !== want.dataTheme) problems.push(`root data-theme '${state.dataTheme}' ≠ '${want.dataTheme}'`);
  if (String(state.surface).toLowerCase() !== want.surface.toLowerCase()) problems.push(`--quran-surface '${state.surface}' ≠ '${want.surface}'`);
  if (String(state.ink).toLowerCase() !== want.ink.toLowerCase()) problems.push(`--quran-ink '${state.ink}' ≠ '${want.ink}'`);
  // Onboarding yüzeyi varsa kendi teması da root ile aynı olmalı.
  if (state.onb && state.onb !== want.dataTheme) problems.push(`onboarding data-onboarding-theme '${state.onb}' ≠ '${want.dataTheme}'`);
  return problems;
}

// ── CTA geometrisi (K3PD-21 sözleşmesi: aşama → birincil eylem) ────────────────────────────────
const CTA_SELECTOR = {
  goal: '.kao-lesson[data-lesson-stage="goal"] > .kao-lesson-next',
  intro: '.kao-lesson[data-lesson-stage="intro"] > .kao-lesson-next',
  concept: '.kao-lesson[data-lesson-stage="concept"] > .kao-lesson-next',
  // DİKKAT: `.kao-choices` bir KAPSAYICIDIR (122–467 px). Kapsayıcıyı birincil eylem saymak
  // ≥44 px kuralını 17/42 satırda totolojik kılıyordu (denetim bulgusu F8). Bu yüzden
  // kapsayıcı yerine İÇİNDEKİ ilk etkileşimli öğe ölçülür.
  //   ölçüm: `.kao-choices` kapsayıcısı (yerleşim/örtüşme bağlamı)
  //   hedef : `.kao-choices button` ilk düğme (gerçek dokunma hedefi ≥44 px)
  practice: '.kao-task.is-practice .kao-choices button:not(:disabled)',
  feedback: '.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue',
  apply: '.kao-lesson[data-lesson-stage="apply"] > .kao-lesson-next',
  summary: '.kao-lesson[data-lesson-stage="summary"] > .kao-lesson-next',
  // Üretim `partEnd` aşamasını `budget` olarak çizer (quranLearn.js kaoLesson modeli).
  partEnd: '.kao-lesson[data-lesson-stage="budget"] > .kao-lesson-next',
  budget: '.kao-lesson[data-lesson-stage="budget"] > .kao-lesson-next',
  // Ustalık read öğesi uygulamada apply DOM aşamasıyla çizilir.
  read: '.kao-lesson[data-lesson-stage="apply"] > .kao-lesson-next'
};

const CTA_PROBE = (page) => async (stage) => {
  const selector = CTA_SELECTOR[stage];
  if (!selector) return null;
  const raw = await page.eval(`(function(){
    var scopeRoot=document.querySelector('[role=dialog]')||document.getElementById('app')||document.body;
    var sel=${JSON.stringify(selector)};
    var el=document.querySelector(sel);
    var d=document.querySelector('[role=dialog]');
    if(!el) return JSON.stringify({selector:sel, present:false});
    var r=el.getBoundingClientRect(), dr=d?d.getBoundingClientRect():{left:0,right:${width},top:0,bottom:844};
    var scroller=d?d.querySelector('.kao-body'):null;
    var scrollTop=scroller?scroller.scrollTop:0;
    var cx=Math.min(Math.max(r.left+r.width/2, 0), dr.right-1), cy=Math.min(Math.max(r.top+r.height/2, 0), dr.bottom-1);
    function describe(x){ var q=x.getBoundingClientRect(); return {tag:x.tagName, cls:(x.className||'').toString().slice(0,50), y:Math.round(q.top), h:Math.round(q.height), pos:getComputedStyle(x).position, z:getComputedStyle(x).zIndex}; }

    // (a) EYLEM GÖRÜNÜRLÜĞÜ: eylem noktasındaki en üst öğe eylemin kendisi/çocuğu/atası mı?
    //     Değilse eylem başka bir şeyle ÖRTÜLMÜŞTÜR (gerçek kusur).
    var hit=document.elementFromPoint(cx, cy);
    var covered=!(hit===el||el.contains(hit)||(hit&&hit.contains(el)));
    var coverStack=covered?[].map.call((document.elementsFromPoint(cx,cy)||[]).slice(0,4),describe):[];

    // (b) İÇERİK ÖRTÜLMESİ (K3PD-21 mustNotCoverContent): yapışkan eylem, altındaki İÇERİĞİ
    //     kapatmamalı. Eylem alanının içine giren, eylemle akraba OLMAYAN ve metin taşıyan
    //     komşu öğeler sayılır. Kardeş eylem düğmeleri (aynı aşamanın ikincil eylemi) içerik
    //     sayılmaz; onlar ayrı bir "kontrol çakışması" olarak raporlanır.
    var CONTROLS='button,a[href],input,select,textarea,[role=button],summary';
    var stageScope=document.querySelector('[data-lesson-stage]')||document.querySelector('#kao-task')||scopeRoot;
    var overlapsContent=[], overlapsControl=[];
    var candidates=[].slice.call(stageScope.querySelectorAll('*:not(input):not(select):not(textarea)'));
    for(var i=0;i<candidates.length;i++){
      var other=candidates[i];
      if(other===el||el.contains(other)||other.contains(el)) continue;
      var closed=false;
      for(var ancestor=other.parentElement;ancestor&&ancestor!==stageScope;ancestor=ancestor.parentElement){
        if(ancestor.tagName==='DETAILS'&&!ancestor.open){var summary=ancestor.querySelector(':scope > summary');if(!summary||!summary.contains(other)){closed=true;break;}}
      }
      if(closed) continue;
      var cs=getComputedStyle(other);
      if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') continue;
      var or_=other.getBoundingClientRect();
      if(or_.width===0||or_.height===0) continue;
      // Bir öğenin boyalı alanı, kaydırma veya kırpma yapan bütün atalarının
      // görünür kutusuyla sınırlıdır. Kutu dışında kalan metin CTA'yı örtmez.
      var left=or_.left,right=or_.right,top=or_.top,bottom=or_.bottom;
      for(var clip=other.parentElement;clip&&clip!==stageScope;clip=clip.parentElement){
        var clipStyle=getComputedStyle(clip),clipRect=clip.getBoundingClientRect();
        if(/(hidden|clip|auto|scroll)/.test(clipStyle.overflowX)){left=Math.max(left,clipRect.left);right=Math.min(right,clipRect.right);}
        if(/(hidden|clip|auto|scroll)/.test(clipStyle.overflowY)){top=Math.max(top,clipRect.top);bottom=Math.min(bottom,clipRect.bottom);}
      }
      var ix=Math.min(r.right,right)-Math.max(r.left,left);
      var iy=Math.min(r.bottom,bottom)-Math.max(r.top,top);
      if(ix<=1||iy<=1) continue;
      var isControl=other.matches(CONTROLS)||!!other.closest(CONTROLS);
      // Yalnız KENDİ metni olan (çocuksuz metin düğümü taşıyan) öğeler "içerik" sayılır.
      var ownText=[].some.call(other.childNodes,function(n){return n.nodeType===3&&n.textContent.trim().length>0;});
      if(isControl){ overlapsControl.push(Object.assign(describe(other),{overlapPx:Math.round(Math.min(ix,iy))})); }
      else if(ownText||/^(P|H1|H2|H3|H4|H5|H6|LI|SPAN|SMALL|STRONG|EM|CODE)$/.test(other.tagName)){
        overlapsContent.push(Object.assign(describe(other),{overlapPx:Math.round(Math.min(ix,iy)), txt:(other.textContent||'').trim().slice(0,32)}));
      }
    }
    // Klavye odağı: öğe (veya ilk odaklanabilir çocuğu) etkin ve görünür olmalı.
    var focusable=el.matches('button,a[href],[tabindex]')?el:el.querySelector(':is(button,a[href],[tabindex]):not(input):not(select):not(textarea)');
    var focusReachable=!!focusable&&!focusable.disabled&&focusable.getBoundingClientRect().width>0;
    // Odak veya kaydırma uygulanmadan önce hedefin bütün kırpıcı atalar içinde tam
    // görünmesi gerekir; focus() sonrasında düzelmiş görünüm bu ölçümün yerine geçmez.
    var clipVisible=true,clipRects=[];
    for(var clipEl=el.parentElement;clipEl;clipEl=clipEl.parentElement){
      var clipCss=getComputedStyle(clipEl),clipBox=clipEl.getBoundingClientRect();
      var clipX=/(hidden|clip|auto|scroll)/.test(clipCss.overflowX),clipY=/(hidden|clip|auto|scroll)/.test(clipCss.overflowY);
      if(clipX||clipY)clipRects.push({left:Math.round(clipBox.left),top:Math.round(clipBox.top),right:Math.round(clipBox.right),bottom:Math.round(clipBox.bottom),clipX:clipX,clipY:clipY});
      if(/(hidden|clip|auto|scroll)/.test(clipCss.overflowY))clipVisible=clipVisible&&r.top>=clipBox.top-1&&r.bottom<=clipBox.bottom+1;
      if(/(hidden|clip|auto|scroll)/.test(clipCss.overflowX))clipVisible=clipVisible&&r.left>=clipBox.left-1&&r.right<=clipBox.right+1;
    }
    return JSON.stringify({selector:sel, present:true, x:Math.round(r.left), y:Math.round(r.top), width:Math.round(r.width), height:Math.round(r.height),
      // Yerleşim konumu (kaydırmadan bağımsız): ≤8 px kararlılık ölçüsü bunu kullanır.
      layoutY: Math.round(r.top + scrollTop), scrollTop: Math.round(scrollTop),
      // GÖRÜNÜRLÜK İKİ EKSENDE (18. denetim F18-1): yatay eksen de hesaba katılır; aksi hâlde
      // yatayda ekran dışındaki bir eylem 'visible:true' yazılıyor ve hiçbir kapı görmüyordu.
      // NOT: bu blok bir TEMPLATE LITERAL içinde; yorumlarda ters tırnak KULLANILMAZ.
      visible: r.width>0&&r.height>0&&r.top>=dr.top-1&&r.bottom<=dr.bottom+1&&r.left>=dr.left-1&&r.right<=dr.right+1&&clipVisible,
      // Sözleşme alanı: eylem içeriği örtüyor mu?
      overlapCovered: overlapsContent.length>0,  // bilgi: yapışkan eylem altındaki kaydırılan içerik
      hiddenBy: covered, coverStack: coverStack,
      overlapsContent: overlapsContent.slice(0,4), overlapsControl: overlapsControl.slice(0,4),
      scroll: scroller?{scrollTop:Math.round(scroller.scrollTop),scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight,localScroll:scroller.scrollHeight>scroller.clientHeight+1}:null,
      focusReachable:focusReachable, clipJson:JSON.stringify(clipRects), dialogRight:Math.round(dr.right), dialogBottom:Math.round(dr.bottom)});
  })()`);
  return JSON.parse(raw);
};

// ── Sahne kimliği: görev türü ────────────────────────────────────────────────────────────────
// Önceden sahne adı `gorev-${task.kind}` idi; `kind` yalnız BAZI görev üreticilerinde tanımlı
// olduğu için 17 pratik sahnesinin 15'i `lNN-gorev-undefined` oluyordu — yani sahne kimliği
// sahneleri ayırt etmiyordu (denetim bulgusu F9). `kind` yoksa `type`, o da yoksa `errorClass`
// kullanılır; hiçbiri yoksa bu bir ÖLÇÜM KIRILMASIDIR (uydurma kimlik yazılmaz).
function practiceKind(task) {
  const kind = task && (task.kind || task.type || task.errorClass);
  if (!kind || typeof kind !== 'string') throw new Error(`görev türü okunamadı (sahne kimliği üretilemez): ${JSON.stringify({ hasKind: !!(task && task.kind), hasType: !!(task && task.type), hasErrorClass: !!(task && task.errorClass) })}`);
  return kind;
}

const ctaFindings = [];function recordCta(scene, stage, cta) {
  if (!cta) return;
  // ── ÖLÇÜM KIRILMASI → `failures` dizisi → exit 1 ────────────────────────────────────────────
  // Bunlar "üretimde kusur bulundu" değil, "ölçüm yapılamadı"dır: sözleşmenin kendisi
  // uygulanamıyorsa kanıt üretilmiş sayılmaz. Sınıflandırma YOKTUR: hangi diziye yazıldığı
  // doğrudan çıkış kodunu belirler (bkz. dosya başındaki `failures` / `findings` tanımı).
  if (cta.present === false) { failures.push(`${scene}: CTA seçicisi DOM'da yok (${cta.selector})`); return; }
  if (cta.height < 44) failures.push(`${scene}: CTA dokunma hedefi ${cta.height}px < 44px`);
  if (!cta.visible) failures.push(`${scene}: CTA görünür değil`);
  // GERÇEK KUSUR 1: eylem kendi noktasında başka bir öğe tarafından örtülüyor.
  if (cta.hiddenBy) findings.push(`${scene}: CTA başka bir öğe altında kalıyor — üstteki: ${(cta.coverStack || []).map((item) => `${item.tag}.${String(item.cls).split(' ')[0]}(y=${item.y},h=${item.h},${item.pos})`).join(' < ')}`);
  if (cta.overlapCovered) findings.push(`${scene}: CTA görünür içeriği örtüyor`);
  // GERÇEK KUSUR 2: aynı aşamanın başka bir kontrolü eylemin üstüne biniyor.
  const controlCollisions = (cta.overlapsControl || []).filter((item) => item.overlapPx >= 8);
  if (controlCollisions.length) findings.push(`${scene}: CTA başka bir kontrolle çakışıyor — ${controlCollisions.map((item) => `${item.tag}.${String(item.cls).split(' ')[0]}(y=${item.y},h=${item.h},örtüşme=${item.overlapPx}px)`).join(' ; ')}`);
  // İçerik erişilebilirliği: kart "yerel scroll alanı ile sayfa taşmasını ayır" diyor.
  // Yerel kaydırma (scrollHeight > clientHeight) MEŞRUDUR ve kusur değildir; yalnızca
  // sayfa/diyalog taşması kusurdur (SCAN'de SAYFA-TAŞMASI / DİŞARI-TAŞAR olarak yakalanır).
  if (!cta.focusReachable) failures.push(`${scene}: CTA klavye odağına ulaşmıyor`);
  ctaFindings.push({ scene, stage, ...cta });
}

async function testTab(page, selector) {
  await page.eval(`(function(){var el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('klavye hedefi yok');window.__qaFocusBefore=document.activeElement;window.__qaScrollBefore=[].map.call(document.querySelectorAll('.kao-body,.kao-lesson-content,.kao-choices'),function(e){return [e,e.scrollTop]});el.focus();return true})()`);
  await page.tab({ shift: true });
  const leftTarget = await page.eval(`document.activeElement!==document.querySelector(${JSON.stringify(selector)})`);
  await page.tab();
  const result = JSON.parse(await page.eval(`JSON.stringify((function(){var el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect();var visible=r.top>=0&&r.left>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1;for(var p=el.parentElement;p;p=p.parentElement){var cs=getComputedStyle(p),pr=p.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(cs.overflowY))visible=visible&&r.top>=pr.top-1&&r.bottom<=pr.bottom+1;if(/(hidden|clip|auto|scroll)/.test(cs.overflowX))visible=visible&&r.left>=pr.left-1&&r.right<=pr.right+1}return {focused:document.activeElement===el,visible:visible}})())`));
  await page.eval(`(function(){if(window.__qaFocusBefore&&window.__qaFocusBefore.isConnected)window.__qaFocusBefore.focus({preventScroll:true});else if(document.activeElement)document.activeElement.blur();(window.__qaScrollBefore||[]).forEach(function(x){if(x[0].isConnected)x[0].scrollTop=x[1]});delete window.__qaFocusBefore;delete window.__qaScrollBefore;return true})()`);
  return { leftTarget, ...result };
}

/**
 * Tek görüntü + tek manifest satırı. Hata SKIP'e yutulmaz: doğrudan fırlatır (exit 1).
 */
async function snap(page, rowBase, js = null, { dump = 120 } = {}) {
  if (js) await page.eval(js);
  await page.wait(500);
  const fontReady = await sceneFontReady(page);
  if (!fontReady) failures.push(`${rowBase.scene}: font yüklenmedi`);
  const actionsJson = await sceneActions(page);
  // Kaydırma BAŞA ALINMAZ: uzun içerikte yerel kaydırma meşrudur ve uygulama birincil eylemi
  // kendisi görünür alana kaydırır. Kaydırmayı zorla sıfırlamak ölçümü bozar (CTA'yı ekran
  // dışına iter). Gerçek scrollTop değeri manifest satırına yazılır.
  const shotName = `${rowBase.scene}${SHOT_EXT}`;
  // Dosya adı çakışırsa sessizce üzerine yazmak kanıtı bozar; çakışma hatadır.
  if (manifest.some((row) => row.screenshot === shotName)) throw new Error(`yinelenen sahne kimliği: ${rowBase.scene}`);
  await page.shot(path.join(out, shotName), { format: SHOT_FORMAT, quality: SHOT_QUALITY });
  // Yakalama ölçeği ÖLÇÜLÜR: görüntünün gerçek piksel genişliği ÷ viewport genişliği.
  // Manifeste sabit bir sayı yazmak "2 ≠ 2" totolojisi üretiyordu (denetim bulgusu F5).
  const shotAbs = path.join(out, shotName);
  const shotInfo = imageSize(shotAbs);
  if (!shotInfo.ok) throw new Error(`çekim okunamadı: ${shotName} (${shotInfo.reason})`);
  const captureScale = shotInfo.width / width;
  if (!Number.isFinite(captureScale) || captureScale <= 0) throw new Error(`yakalama ölçeği hesaplanamadı: ${shotName}`);

  const scan = await page.eval(SCAN);
  const hard = scan.filter((item) => HARD_ISSUES.has(item.kind));
  const info = scan.filter((item) => !HARD_ISSUES.has(item.kind));
  if (hard.length) failures.push(`${rowBase.scene}: ${hard.length} sert taşma/kırpılma (${hard.map((item) => item.kind).join(',')})`);

  const theme = JSON.parse(await page.eval(THEME_STATE));
  const themeIssue = themeProblems(theme, themeName);
  if (themeIssue.length) failures.push(`${rowBase.scene}: tema doğrulanmadı (${themeIssue.join('; ')})`);

  const summary = await page.eval(`(function(){
    var s=(document.querySelector('[role=dialog]')||document.getElementById('app')||document.body);
    return (s.innerText||'').replace(/\\s+/g,' ').trim().slice(0,${dump});
  })()`);

  // CTA ölçümü LOG SATIRINDAN ÖNCE alınır (10. denetim F10-5): çakışma sayısı log satırına
  // yazılarak `overlapsControl` beyanı diskteki bağımsız tanığa çapalanır. Önceden bulgu,
  // doğrulamanın sonra karşılaştırdığı AYNI diziden türetiliyordu; listeyi boşaltmak kapalı
  // bir döngüydü ve kartın tek açık üretim kusuru tek düzenlemeyle silinebiliyordu.
  const cta = rowBase.ctaStage ? await CTA_PROBE(page)(rowBase.ctaStage) : null;
  const collisions = cta && Array.isArray(cta.overlapsControl)
    ? cta.overlapsControl.filter((item) => item && typeof item.overlapPx === 'number' && item.overlapPx >= 8)
    : [];
  const maxOverlapPx = collisions.reduce((max, item) => Math.max(max, Math.round(item.overlapPx)), 0);
  // `hidden=` (11. denetim F11-2): örtülme de çakışma gibi log'a yazılır. Önceden yalnız
  // manifestteki `cta.hiddenBy` boolean'ı vardı; `false` yapıp `coverStack`/bulguyu silmek
  // tek düzenlemeyle kartın açık üretim kusurunu gizliyordu.
  const hiddenFlag = !!(cta && cta.hiddenBy);
  // HAM DEĞER yazılır (15. denetim F15-4): önceden `min(cta.height, coverStack[0].h)`
  // yazılıyordu ama doğrulayıcı ham `coverStack[0].h` bekliyordu; eylemdan YÜKSEK bir
  // örtücü (ör. yapışkan bir SECTION) olduğunda araç kendi çıktısını reddediyordu.
  const hiddenPx = hiddenFlag && Array.isArray(cta.coverStack) && cta.coverStack.length
    ? Math.round(cta.coverStack[0].h || 0) : 0;
  // SERT BULGU TÜRLERİ LOG'A (12. denetim F12-1): önceden yalnız iki tür (`YATAY-KIRPILIR`,
  // `SAYFA-TAŞMASI`) tek bir `overflowX=` boolean'ına indirgeniyor ve o alan da doğrulayıcı
  // tarafından HİÇ okunmuyordu. Kalan üç sert türün (`DIŞARI-TAŞAR`, `DİKEY-KIRPILIR`,
  // `METIN-KIRPILIR`) log'da hiçbir tanığı yoktu; `rows[].issues` beyanı tek kaynaktı.
  // Artık sert türlerin tamamı `hard=` olarak yazılır ve doğrulayıcı `issues` ile eşler.
  const hardKinds = [...new Set(hard.map((item) => item.kind))].sort();
  // HEDEF/FOKUS TANIKLARI (17. denetim F17-1): `height`/`width`/`focusReachable` manifestte
  // beyan olarak duruyordu; log'a da yazılır ki tek alanla 12→50 / 20→350 / false→true
  // yapılamasın. CTA yoksa `-1` (ölçüm yok) yazılır.
  const ctaW = cta && typeof cta.width === 'number' ? Math.round(cta.width) : -1;
  const ctaH = cta && typeof cta.height === 'number' ? Math.round(cta.height) : -1;
  // YATAY EKSEN TANIKLARI (18. denetim F18-1): `x`/`dialogRight` de log'a yazılır.
  const ctaX = cta && typeof cta.x === 'number' ? Math.round(cta.x) : -1;
  const ctaR = cta && typeof cta.dialogRight === 'number' ? Math.round(cta.dialogRight) : -1;
  const focusFlag = cta ? Boolean(cta.focusReachable) : false;
  // SOZLESME ALANLARININ TANIKLARI (20. denetim F20-1): `cta.selector`, `overlapsContent`,
  // `scroll.localScroll` manifestte BEYAN olarak duruyordu ve EVIDENCE bunlari dogrulanmis
  // gercek gibi aktariyordu; hicbir kapi okumuyordu. Artik log'a yazilir ve capalanir.
  // `sel=` secicinin sha256 onekidir (tam secici log'a yazilmaz: log okunur kalsin).
  const ctaSel = cta && typeof cta.selector === 'string' && cta.selector ? sha256Text(cta.selector).slice(0, 12) : '-1';
  // DUSEY EKSEN TANIKLARI (25. denetim F26-2): sozlesme `ctaY=`/`ctaLay=`/`ctaScr=` diye
  // UYDURMA taniklar adlandiriyordu; log'da hic yoklardi (0 occurrence) ve `cta.y`,
  // `cta.layoutY`, `cta.scroll.scrollTop` serbestce degistirilebiliyordu. Artik yazilirlar.
  const ctaY = cta && typeof cta.y === 'number' ? Math.round(cta.y) : -1;
  const ctaLay = cta && typeof cta.layoutY === 'number' ? Math.round(cta.layoutY) : -1;
  const ctaScr = cta && typeof cta.scrollTop === 'number' ? Math.round(cta.scrollTop) : -1;
  const ctaCovN = cta && Array.isArray(cta.overlapsContent) ? cta.overlapsContent.length : -1;
  const ctaLscroll = cta && cta.scroll && typeof cta.scroll.localScroll === 'boolean' ? cta.scroll.localScroll : null;
  // ICERIK-ORTULME BUYUKLUGU ve COVERSTACK BASI (21. denetim F21-3): `overlapsContent[].overlapPx`
  // ve `coverStack[0].y/.cls` beyandi; tek alanla 43->1 / y 764->0 yapilabiliyordu.
  const ctaCovPx = cta && Array.isArray(cta.overlapsContent) && cta.overlapsContent.length
    ? Math.max(...cta.overlapsContent.map((item) => Math.round(item.overlapPx || 0))) : 0;
  const ctaCoverY = cta && Array.isArray(cta.coverStack) && cta.coverStack.length
    ? Math.round(cta.coverStack[0].y || 0) : -1;
  // ICERIK/COVER LISTE OZETLERI (21. denetim F21-3 devami): tek tek buyukluk yazmak yetmedi —
  // ayni listede iki kayit ayni `overlapPx` tasiyorsa `covPx=` maksimumu degismiyordu. Tum
  // kayitlarin ozeti yazilir; herhangi bir alan degisirse ozet degisir.
  const normList = (list) => (Array.isArray(list) ? list : []).map((item) => `${item.tag}|${item.cls}|${item.y}|${item.h}|${item.pos || ''}|${item.z || ''}|${item.overlapPx === undefined ? '' : item.overlapPx}|${item.txt || ''}`);
  const ctaCovHash = cta && Array.isArray(cta.overlapsContent) && cta.overlapsContent.length
    ? sha256Text(normList(cta.overlapsContent).join('\n')).slice(0, 12) : '-1';
  const ctaCoverHash = cta && Array.isArray(cta.coverStack) && cta.coverStack.length
    ? sha256Text(normList(cta.coverStack).join('\n')).slice(0, 12) : '-1';
  const clipHash = cta && typeof cta.clipJson === 'string' ? sha256Text(cta.clipJson) : '-1';
  const logLine = `${rowBase.scene}: theme=${theme.dataTheme} surface=${theme.surface} vw=${width} vh=${viewport.height} inset=${safeAreaBottom} fontReady=${fontReady} actionsH=${sha256Text(actionsJson)} clipH=${clipHash} hidden=${hiddenFlag} hiddenPx=${hiddenPx} collisions=${collisions.length} collisionPx=${maxOverlapPx} ctaW=${ctaW} ctaH=${ctaH} ctaX=${ctaX} ctaY=${ctaY} ctaR=${ctaR} ctaLay=${ctaLay} ctaScr=${ctaScr} focus=${focusFlag} sel=${ctaSel} covN=${ctaCovN} covPx=${ctaCovPx} covH=${ctaCovHash} coverY=${ctaCoverY} coverH=${ctaCoverHash} lscroll=${ctaLscroll === null ? 'na' : ctaLscroll} overflowX=${hard.some((item) => item.kind === 'YATAY-KIRPILIR' || item.kind === 'SAYFA-TAŞMASI')} hard=${hardKinds.length ? hardKinds.join(',') : 'yok'} | ${summary}`;
  log.push(logLine);

  if (rowBase.ctaStage) recordCta(rowBase.scene, rowBase.ctaStage, cta);
  // ARDIŞIK RENDER KARARLILIĞI (K3PD-21 ≤8 px): ölçülen HER CTA satırı için kayıt zorunlu.
  // Önceden 42 CTA satırının 17'si (tüm feedback panelleri) hiç kaydedilmiyordu; `ctaReport`
  // 25 kayıt taşırken 42 satır CTA iddia ediyordu (denetim bulgusu F2). Aynı aşama aynı
  // render'da yeniden çizilir (tema aynı değerle sabitlenir) ve y-konumu karşılaştırılır.
  // Fallback YOK: ikinci ölçüm alınamazsa 0 px uydurulmaz, ölçüm kırılması sayılır.
  if (cta && cta.present) {
    const selector = CTA_SELECTOR[rowBase.ctaStage];
    const keyboardFirst = await testTab(page, selector);
    await page.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
    await page.wait(450);
    const again = await CTA_PROBE(page)(rowBase.ctaStage);
    if (!again || !again.present) failures.push(`${rowBase.scene}: CTA yeniden ölçülemedi (ardışık render probe boş)`);
    else {
      noteYs(rowBase.scene, rowBase.ctaStage, cta, again);
      const repeatJson = JSON.stringify(again);
      runLog.push(`cta-repeat:${rowBase.scene} y=${again.y} scroll=${again.scrollTop} sha=${sha256Text(repeatJson)}`);
      const keyboard = await testTab(page, selector);
      sceneYs[sceneYs.length - 1].repeatJson = repeatJson;
      sceneYs[sceneYs.length - 1].keyboardFirst = keyboardFirst;
      sceneYs[sceneYs.length - 1].keyboard = keyboard;
      runLog.push(`cta-keyboard:${rowBase.scene} left=${keyboard.leftTarget} focused=${keyboard.focused} visible=${keyboard.visible}`);
      runLog.push(`cta-keyboard-first:${rowBase.scene} left=${keyboardFirst.leftTarget} focused=${keyboardFirst.focused} visible=${keyboardFirst.visible}`);
      if (![keyboardFirst, keyboard].every((probe) => probe.leftTarget && probe.focused && probe.visible)) failures.push(`${rowBase.scene}: Shift+Tab/Tab hedefe ulaşmadı veya odak görünür değil`);
    }
  }

  manifest.push(manifestRow({
    profile: rowBase.profile,
    // ETİKET ÖLÇÜMDEN GELİR (10. denetim F10-1): önceden `themeName` (istenen tema) yazılıyordu;
    // yani etiket de bir beyandı. Artık satırın teması ÖLÇÜLEN `data-theme`'dir. Uyuşmazlık
    // zaten `themeProblems` ile `failures`'a yazılır; bu, ikinci bir beyan katmanını kaldırır.
    theme: theme.dataTheme,
    viewport,
    captureScale,
    scene: rowBase.scene,
    sceneKind: rowBase.sceneKind,
    screenshot: shotName,
    log: [logLine],
    issues: [
      ...info.map((item) => `${item.kind} | ${item.el} | ${item.text} | ${item.extra}`),
      ...hard.map((item) => `SERT:${item.kind} | ${item.el} | ${item.text} | ${item.extra}`),
    ],
    sha256: sha256File(shotAbs),
    verifiedTheme: theme,
    actionsJson,
    cta
  }));
  return { theme, cta, hard, info };
}

// ── Ön koşul: origin + forceSync; gizli alanlara erişilmez ──────────────────────────────────
await gotoReady(b, `${ORIGIN}/index.html?v3done=1`);
const originCheck = JSON.parse(await b.eval(`JSON.stringify({origin:location.origin, force:localStorage.getItem('seyma-sync-force'), href:location.search})`));
if (originCheck.origin !== ORIGIN) throw new Error(`origin ${originCheck.origin} ≠ ${ORIGIN}`);
if (originCheck.force === '1') throw new Error('seyma-sync-force ayarlı: bu araç force-sync kullanmaz');
if (/[?&]forceSync=1/.test(originCheck.href)) throw new Error('?forceSync=1 kullanılamaz');
if (safeAreaBottom && (!b.safeAreaApplied || b.safeAreaApplied.bottom !== safeAreaBottom)) throw new Error(`safe-area insets uygulanmadı (${JSON.stringify(b.safeAreaApplied)})`);
runLog.push(`origin: ${originCheck.origin} force:${originCheck.force} safeAreaBottom:${safeAreaBottom}`);
runLog.push(`schemaVersion:${GLYPH_ONLY ? 3 : 11}`);
// Geçici profil temizliği makbuzu: elle silme yerine araç kendi artıklarını toplar.
runLog.push(`tmp-profil: temizlendi=${profilesSweptAtStart.length}${profilesSweptAtStart.length ? ` (${profilesSweptAtStart.join(', ')})` : ''} önek=${PROFILE_PREFIXES.join('|')}`);

// ── Tema: çekimden ÖNCE sabitlenir ve doğrulanır ──────────────────────────────────────────────
await b.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
await b.wait(500);
const themeCheck = JSON.parse(await b.eval(THEME_STATE));
const themeCheckProblems = themeProblems(themeCheck, themeName);
runLog.push(`tema: ${JSON.stringify({ expected: themeName, ...themeCheck })}`);
if (themeCheckProblems.length) {
  console.error(`TEMA DOĞRULANMADI (${themeName}): ${themeCheckProblems.join('; ')}`);
  await b.close();
  process.exit(1);
}

if (!GLYPH_ONLY) {
// ── Sentetik ana profil durumu ────────────────────────────────────────────────────────────────
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await gotoReady(b, `${ORIGIN}/index.html?v3done=1`);
// Sayfa yeniden yüklendiğinde tema tercihi localStorage'dan gelir; yine de açıkça SABİTLE.
await b.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
await b.wait(400);
await b.eval(`(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data);
  q.onboarding.doneAt='2026-09-20T00:00:00.000Z'; q.onboarding.start='level1';
  // Otomatik geçiş KAPALI: doğru cevabın geri bildirim paneli kaybolmadan yakalanabilsin.
  // (Ayarlar kullanıcı tercihidir; burada yalnız sentetik çekim durumu sabitlenir.)
  q.settings.autoAdvance=false;
  var u1=window.QuranCurriculumV2.units[0];
  var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});
  q.milestones.besmele='2026-09-21T00:00:00.000Z'; q.milestones.fatiha='2026-09-22T00:00:00.000Z';
  for(var i=1;i<=6;i++){var d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);q.daily[d]={answered:20,correct:16,new:2,reviewed:18,ms:20*9000}}
  return true})()`);

// ── Ana profil: 15 görünüm ────────────────────────────────────────────────────────────────────
await b.eval(`SeymaQuranLearn.kaoOpen('home')`);
const VIEWS = ['home', 'units', 'unit', 'word', 'reader', 'settings', 'phonics', 'ayah', 'prayer', 'stats', 'gate', 'grammar', 'concept', 'roots', 'sources'];
let n = 0;
for (const view of VIEWS) {
  n += 1;
  const js = view === 'unit' ? `SeymaQuranLearn.kaoNav('unit',1)`
    : view === 'word' ? `(function(){var m=window.QuranCurriculumV2.lemmaToLesson,id=Object.keys(m).filter(function(k){return true})[0];SeymaQuranLearn.kaoNav('word',id)})()`
      : view === 'reader' ? `SeymaQuranLearn.kaoNav('reader',112)`
        : view === 'concept' ? `SeymaQuranLearn.kaoNav('concept',window.QuranGrammarV1.concepts[0].id)`
          : `SeymaQuranLearn.kaoSetView('${view}')`;
  await snap(b, { profile: 'ana', scene: `v${String(n).padStart(2, '0')}-${view}`, sceneKind: 'view' }, js, { dump: 110 });
}

// ── Ana profil: ders oynatıcı aşamaları + CTA geometrisi ──────────────────────────────────────
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoLesson('start','u01.03')`);
let k = 0;

while (k < 120) {
  const st = JSON.parse(await b.eval(`JSON.stringify((function(){var s=ui.kaoLesson;if(!s)return {done:true};var it=s.plan[s.at];return {phase:s.phase,kind:it&&it.kind,done:false}})())`));
  if (st.done) break;
  k += 1;

  if (st.phase === 'practice') {
    const task = JSON.parse(await b.eval(`JSON.stringify((function(){var q=ui.kaoQueue[ui.kaoTaskIndex];var t=ui.kaoTasks[q.id];return {id:t.id,kind:t.kind,type:t.type,errorClass:t.errorClass,choices:t.choices.map(function(c){return {id:c.choiceId,correct:c.correct,ordinal:c.ordinal}})}})())`));
    const pKind = practiceKind(task);
    await snap(b, { profile: 'ana', scene: `l${String(k).padStart(2, '0')}-gorev-${pKind}`, sceneKind: 'practice', ctaStage: 'practice' }, null, { dump: 130 });
    if (pKind === 'order') {
      for (const choice of task.choices.slice().sort((a, z) => a.ordinal - z.ordinal)) await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(choice.id)})`);
    } else {
      const pick = (k % 2 ? task.choices.find((choice) => choice.correct) : task.choices.find((choice) => !choice.correct)) || task.choices[0];
      await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(pick.id)})`);
    }
    await b.wait(350);
    await snap(b, { profile: 'ana', scene: `l${String(k).padStart(2, '0')}-panel-${k % 2 ? 'dogru' : 'yanlis'}`, sceneKind: 'feedback', ctaStage: 'feedback' }, null, { dump: 150 });
    await b.eval(`App.kaoContinue()`);
    await b.wait(250);
    continue;
  }

  const stage = st.kind || st.phase;
  await snap(b, { profile: 'ana', scene: `l${String(k).padStart(2, '0')}-${stage}`, sceneKind: 'lesson', ctaStage: CTA_SELECTOR[stage] ? stage : null }, null, { dump: 130 });
  if (stage === 'summary' || stage === 'partEnd') break;
  await b.eval(`App.kaoLesson('next')`);
  await b.wait(220);
}
// İki ek senaryo, aynı gerçek ders durumuna sentetik plan öğesi koyarak ölçülür.
// Üretimde read → apply ve partEnd → budget DOM aşamasıdır; sahne adı bunu saklamaz.
await b.eval(`(function(){var s=ui.kaoLesson;if(!s)throw Error('ders durumu yok');
  s.__qaSaved=s.plan[s.at];var a=s.plan.find(function(x){return x.kind==='apply'});
  s.plan[s.at]={kind:'read',anchors:['surah:112'],words:a&&a.words||[]};App.setTheme(${dark ? 'true' : 'false'});return true})()`);
await snap(b, { profile:'ana', scene:'l98-read', sceneKind:'lesson', ctaStage:'apply' });
await b.eval(`(function(){var s=ui.kaoLesson;s.plan[s.at]={kind:'partEnd',requiredMinutes:3,remainingMs:0,source:'history'};App.setTheme(${dark ? 'true' : 'false'});return true})()`);
await snap(b, { profile:'ana', scene:'l99-partEnd', sceneKind:'lesson', ctaStage:'budget' });
await b.eval(`(function(){var s=ui.kaoLesson;s.plan[s.at]=s.__qaSaved;delete s.__qaSaved;return true})()`);
await b.eval(`App.kaoLesson('finish')`);

// K3PD-21: aynı görev türlerini yalnız normal ders planında rastgele belirmelerine
// bırakma. Gerçek üreticiden doğrulanmış build/cloze örnekleriyle iki ek sahne ölç.
for (const [variant, stability] of [['build', 12], ['cloze', 40]]) {
  await b.eval(`(function(){SeymaQuranLearn.kaoSetView('home');App.kaoLesson('start','u01.03');var q=SeymaQuranLearn.ensureQuranLearn(data),api=SeymaQuranLearn;
    for(var l of QuranLexiconV1.lemmas){if(!l.verified)continue;for(var dir of ['ar>tr','tr>ar']){var cid='w:'+l.id+':'+dir;
      q.cards[cid]={state:'review',s:${stability},reps:8,due:'2026-09-29T00:00:00.000Z'};
      if(SeymaQuranLearnFlow.ladderArm(cid)!=='A')continue;
      var task=api.kaoBuildTask({id:'k3pd29-${variant}-'+cid,cardId:cid,isNew:false},data,{seed:'k3pd29-${variant}'});
      if(task&&task.kind===${JSON.stringify(variant)}&&(${JSON.stringify(variant)}!=='build'||task.choices.filter(function(c){return c.correct}).length>=3)){
        ui.kaoLesson.phase='practice';ui.kaoQueue=[{id:task.id,cardId:task.cardId,isNew:false}];ui.kaoTasks={};ui.kaoTasks[task.id]=task;ui.kaoTaskIndex=0;ui.kaoTaskStartedAt=Date.now();ui.kaoPanel={open:false};ui.kaoOrderDraft=[];App.setTheme(${dark ? 'true' : 'false'});return true;
      }
    }}throw Error('${variant} görev üretilemedi')})()`);
  await snap(b, { profile:'ana', scene:`l${variant === 'build' ? '96' : '97'}-gorev-${variant}`, sceneKind:'practice', ctaStage:'practice' });
  await b.eval(`App.kaoLesson('exit')`);
}

// ── Seviye 0 ───────────────────────────────────────────────────────────────────────────────────
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoS0('start','${process.env.KAO_QA_S0 || 's0.02'}')`);
for (let i = 1; i <= 4; i += 1) {
  await snap(b, { profile: 'ana', scene: `s0-asama-${i}`, sceneKind: 's0' }, null, { dump: 110 });
  const picked = await b.eval(`(function(){var d=ui.kaoS0&&ui.kaoS0.drill;if(d&&d.picked===null){var q=d.items[d.index];App.kaoS0('answer',q.choices.filter(function(c){return c.correct})[0].id);return 'answer'}return 'next'})()`);
  if (picked === 'answer') {
    await snap(b, { profile: 'ana', scene: `s0-asama-${i}-cevap`, sceneKind: 's0' }, null, { dump: 110 });
  }
  await b.eval(`App.kaoS0('next')`);
  await b.wait(200);
}

// ── Ayarlar alt + ustalık ─────────────────────────────────────────────────────────────────────
await b.eval(`SeymaQuranLearn.kaoSetView('settings')`);
await b.eval(`(function(){var s=document.querySelector('.kao-body');if(s)s.scrollTop=s.scrollHeight;return true})()`);
await snap(b, { profile: 'ana', scene: 'z1-ayarlar-alt', sceneKind: 'view' }, null, { dump: 110 });
await b.eval(`(function(){var q=SeymaQuranLearn.ensureQuranLearn(data);window.QuranCurriculumV2.units[0].lessons.forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}})})()`);
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoLesson('start',1)`);
await snap(b, { profile: 'ana', scene: 'z2-ustalik-baslangic', sceneKind: 'mastery' }, null, { dump: 130 });
await b.eval(`App.kaoLesson('exit')`);
await snap(b, { profile: 'ana', scene: 'z3-tekrar-sonrasi-ana', sceneKind: 'view' }, null, { dump: 130 });

// ── Onboarding profili (AYRI profil, AYNI sabit tema) ─────────────────────────────────────────
// F-11: onboarding teması eskiden hiç seçilmiyordu. Burada onboarding kendi boş profilinde
// yalnız bu koşumun temasıyla çekilir; iki tema kapsamı çağıran döngüde üretilir.
await b.close();

const ob = await launch(root, path.join(os.tmpdir(), `${prof}-onb`), { width, height: 844, insets: safeAreaBottom ? { bottom: safeAreaBottom } : null, scale: 1, sourceInventory });
try {
  const obSnap = async (scene, { expectDialog = false, postStart = false } = {}) => {
    await ob.wait(450);
    const fontReady = await sceneFontReady(ob);
    if (!fontReady) failures.push(`${scene}: font yüklenmedi`);
    const actionsJson = await sceneActions(ob);
    const shotName = `${scene}${SHOT_EXT}`;
    if (manifest.some((row) => row.screenshot === shotName)) throw new Error(`yinelenen sahne kimliği: ${scene}`);
    await ob.shot(path.join(out, shotName), { format: SHOT_FORMAT, quality: SHOT_QUALITY });
    const shotAbsOb = path.join(out, shotName);
    const shotInfoOb = imageSize(shotAbsOb);
    if (!shotInfoOb.ok) throw new Error(`çekim okunamadı: ${shotName} (${shotInfoOb.reason})`);
    const captureScale = shotInfoOb.width / width;
    const scan = await ob.eval(SCAN);
    const hard = scan.filter((item) => HARD_ISSUES.has(item.kind));
    const info = scan.filter((item) => !HARD_ISSUES.has(item.kind));
    if (hard.length) failures.push(`${scene}: ${hard.length} sert taşma/kırpılma (${hard.map((item) => item.kind).join(',')})`);
    const theme = JSON.parse(await ob.eval(THEME_STATE));
    const themeIssue = themeProblems(theme, themeName);
    if (themeIssue.length) failures.push(`${scene}: tema doğrulanmadı (${themeIssue.join('; ')})`);
    // ÇEKİLEN YÜZEY: o1 tam ekran karşılama katmanı, o2 başlangıç sonrası ana
    // uygulama, o3–o7 ise diyalog içindeki KAO onboarding yüzeyidir.
    // Önceden özet `#app` üzerinden alınıyordu, yani ARKADAKİ uygulamayı anlatıyordu ve
    // yedi onboarding sahnesinin beşi bayt-eş aynı log satırını üretiyordu — log, sahneyi
    // ayırt etmiyordu (denetim bulgusu F4). Önce diyalog, sonra onboarding katmanı,
    // en son #app; hangisinin ölçüldüğü log satırına ve manifest satırına yazılır.
    const surface = await ob.eval(`(function(){
      var d=document.querySelector('[role=dialog]');
      var o=document.querySelector('[data-onboarding-theme]');
      var s=d||o||document.getElementById('app')||document.body;
      var t=(s.innerText||'').replace(/\\s+/g,' ').trim();
      return JSON.stringify({node:d?'dialog':(o?'onboarding':'app'), text:t.slice(0,150), full:t});
    })()`);
    const surfaceInfo = JSON.parse(surface);
    // Çekilen yüzey gerçekten onboarding olmalı; arkadaki uygulama çekilmişse bu bir hatadır.
    if (expectDialog && surfaceInfo.node === 'app') failures.push(`${scene}: çekilen yüzey onboarding katmanı değil (app) — katman açılmamış`);
    const surfaceHash = sha256Text(surfaceInfo.full);
    const obHardKinds = [...new Set(hard.map((item) => item.kind))].sort();
    // `onb=` (20. denetim F20-1): `verifiedTheme.onb` (data-onboarding-theme) manifestte beyandi
    // ve `onboarding yuzeyi:` satiri log.txt'te duruyordu ama HICBIR kapi ikisini baglamiyordu.
    // Artik her onboarding satiri kendi `onb=` degerini tasir ve beyanla eslesmek zorundadir.
    const onbAttr = theme.onb || 'yok';
    const logLine = `${scene}: theme=${theme.dataTheme} surface=${theme.surface} vw=${width} vh=${viewport.height} inset=${safeAreaBottom} fontReady=${fontReady} actionsH=${sha256Text(actionsJson)} hidden=false hiddenPx=0 collisions=0 collisionPx=0 ctaW=-1 ctaH=-1 ctaX=-1 ctaY=-1 ctaR=-1 ctaLay=-1 ctaScr=-1 focus=false sel=-1 covN=-1 covPx=0 covH=-1 coverY=-1 coverH=-1 lscroll=na node=${surfaceInfo.node} text=${surfaceHash.slice(0, 12)} onb=${onbAttr} overflowX=${hard.some((item) => item.kind === 'YATAY-KIRPILIR' || item.kind === 'SAYFA-TAŞMASI')} hard=${obHardKinds.length ? obHardKinds.join(',') : 'yok'} | ${surfaceInfo.text}`;
    log.push(logLine);
    manifest.push(manifestRow({
      profile: 'onboarding', theme: theme.dataTheme, viewport, captureScale, scene, sceneKind: postStart ? 'view' : 'onboarding',
      screenshot: shotName, log: [logLine],
      issues: [
        ...info.map((item) => `${item.kind} | ${item.el} | ${item.text} | ${item.extra}`),
        ...hard.map((item) => `SERT:${item.kind} | ${item.el} | ${item.text} | ${item.extra}`),
      ],
      sha256: sha256File(shotAbsOb), verifiedTheme: theme, actionsJson, cta: null
    }));
  };

  await gotoReady(ob, `${ORIGIN}/index.html?v3done=1`);
  const obOrigin = JSON.parse(await ob.eval(`JSON.stringify({origin:location.origin, force:localStorage.getItem('seyma-sync-force'), href:location.search})`));
  if (obOrigin.origin !== ORIGIN) throw new Error(`onboarding origin ${obOrigin.origin} ≠ ${ORIGIN}`);
  if (obOrigin.force === '1') throw new Error('onboarding profilinde seyma-sync-force ayarlı');
  if (/[?&]forceSync=1/.test(obOrigin.href)) throw new Error('onboarding profilinde ?forceSync=1 kullanılamaz');
  runLog.push(`onboarding origin: ${obOrigin.origin} force:${obOrigin.force} safeAreaBottom:${safeAreaBottom}`);

  // Onboarding yüzeyi: taze veri (onboarding tamamlanmamış) + kapılar geçilmiş.
  await ob.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
  await gotoReady(ob, `${ORIGIN}/index.html?v3done=1`);
  await ob.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
  await ob.wait(500);
  const obCheck = JSON.parse(await ob.eval(THEME_STATE));
  const obProblems = themeProblems(obCheck, themeName);
  if (obProblems.length) {
    console.error(`ONBOARDING TEMA DOĞRULANMADI (${themeName}): ${obProblems.join('; ')}`);
    failures.push(`onboarding tema: ${obProblems.join('; ')}`);
  }
  // KRİTİK SIRA: render() önce `needsAuth()` kapısına bakar. `authUnlocked` YALNIZ
  // render sonrasında yazılırsa ekran kilit kapısında kalır ve onboarding hiç çekilmez
  // (eski çekimlerde tam olarak bu oluyordu). Bu yüzden bayraklar render'dan ÖNCE yazılır.
  await ob.eval(`ui.authUnlocked=true; ui.locationGateState='granted'; ui.forceStart=true; true`);
  await ob.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
  await ob.wait(600);
  // Onboarding yüzeyinin gerçekten çizildiğini doğrula; çizilmediyse çekim başarısızdır.
  const onbRendered = await ob.eval(`(function(){
    return JSON.stringify({
      onboardingTheme: (document.querySelector('[data-onboarding-theme]')||{getAttribute:function(){return null}}).getAttribute('data-onboarding-theme'),
      rootTheme: document.getElementById('root').getAttribute('data-theme')
    });
  })()`);
  const onbState = JSON.parse(onbRendered);
  runLog.push(`onboarding yüzeyi: ${JSON.stringify(onbState)}`);
  if (!onbState.onboardingTheme) failures.push('onboarding: data-onboarding-theme bulunamadı (onboarding yüzeyi çizilmedi)');
  else if (onbState.onboardingTheme !== themeName) failures.push(`onboarding: yüzey teması '${onbState.onboardingTheme}' ≠ '${themeName}'`);
  await obSnap('o1-ilk-acilis-1', { expectDialog: false });
  await ob.eval(`(function(){var el=document.querySelector('[data-onboarding-theme]'); if(el){var btn=el.querySelector('button[onclick*="App.start"]'); if(btn) btn.click();} return true;})()`);
  await ob.wait(700);
  await obSnap('o2-baslangic-sonrasi-ana', { postStart: true });
  // KAO onboarding akışı ayrı yüzeydir; burada da tema doğrulanır.
  await ob.eval(`ui.authUnlocked=true; ui.locationGateState='granted'; ui.forceStart=false; SeymaQuranLearn.kaoOpen('home'); true`);
  await ob.wait(700);
  await obSnap('o3-kao-ilk-acilis-1', { expectDialog: true });
  await ob.eval(`App.kaoOnboard('next')`); await ob.wait(450);
  await obSnap('o4-kao-ilk-acilis-2', { expectDialog: true });
  await ob.eval(`App.kaoOnboard('choose','slow')`); await ob.wait(550);
  await obSnap('o5-yerlestirme-okuma', { expectDialog: true });
  const placement = JSON.parse(await ob.eval(`JSON.stringify(SeymaQuranLearn.kaoPlacementTasks())`));
  for (const task of placement.reading) await ob.eval(`App.kaoOnboard('answer', ${JSON.stringify(task.answer)})`);
  await ob.wait(450);
  await obSnap('o6-yerlestirme-dinleme', { expectDialog: true });
  for (const task of placement.listening) await ob.eval(`App.kaoOnboard('answer', ${JSON.stringify(task.answer)})`);
  await ob.wait(450);
  await obSnap('o7-kao-ilk-acilis-3', { expectDialog: true });
} finally {
  await ob.close();
}
}

// ── 30 zor glif: font yükleme kanıtı + tek okunabilir kırpım ────────────────────────────────────
// ÖNEMLİ: bu bir "önce/sonra" karşılaştırması DEĞİLDİR. Aynı yeni görünümü iki kez çekmek
// önce/sonra kanıtı sayılmaz (kart hard stop). Karşılaştırma referansı ayrı araçla, gerçek eski
// build'den üretilir; bu bölüm yalnız GÜNCEL durumu ve gerçek font yüklemesini kanıtlar.
let glyphEvidence = null;
{
  const gb = await launch(root, path.join(os.tmpdir(), `${prof}-glif`), { width: 460, height: 844, scale: 2, sourceInventory });
  try {
    await gotoReady(gb, `${ORIGIN}/index.html?v3done=1`);
    await gb.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
    await gotoReady(gb, `${ORIGIN}/index.html?v3done=1`);
    await gb.eval(`ui.authUnlocked=true; ui.locationGateState='granted'; App.setTheme(${dark ? 'true' : 'false'}); true`);
    await gb.wait(700);
    const { series, lexiconVersion, surahVersion } = glyphSeries();
    const sample = series.map((item) => item.ar).join(' ');

    // Font yükleme kanıtı: gerçek @font-face kaydı, gerçek woff2 isteği, gerçek metrik farkı.
    const fontProof = JSON.parse(await gb.eval(`(async function(){
      var sample=${JSON.stringify(sample)};
      await document.fonts.load('44px "K3P Scheherazade"', sample);
      await document.fonts.ready;
      var faces=[]; document.fonts.forEach(function(f){ faces.push({family:f.family, status:f.status, weight:f.weight, unicodeRange:f.unicodeRange}); });
      var requests=performance.getEntriesByType('resource').filter(function(e){return /woff2/.test(e.name)}).map(function(e){return {name:e.name, transferSize:e.transferSize}});
      var probe=document.createElement('span');
      probe.style.cssText='position:fixed;left:0;top:0;font:44px "K3P Scheherazade";white-space:nowrap;visibility:hidden';
      probe.textContent=sample; document.body.appendChild(probe);
      var withFont=Math.round(probe.getBoundingClientRect().width);
      probe.style.font='44px monospace';
      var withFallback=Math.round(probe.getBoundingClientRect().width);
      probe.remove();
      return JSON.stringify({faces:faces, requests:requests, check:document.fonts.check('44px "K3P Scheherazade"', sample), withFont:withFont, withFallback:withFallback, distinct:Math.abs(withFont-withFallback)>20});
    })()`));
    const loaded = fontProof.faces.some((face) => String(face.family).replace(/"/g, '') === 'K3P Scheherazade' && face.status === 'loaded');
    const woff2Seen = fontProof.requests.some((req) => /ScheherazadeNew-Regular\.k3p\.woff2/.test(req.name));
    if (!GLYPH_ONLY) {
      // GÜNCEL build: gerçek font yüklemesi ZORUNLU kanıt.
      if (!loaded) failures.push('glif: "K3P Scheherazade" yüklenmiş durumda değil');
      if (!woff2Seen) failures.push('glif: woff2 ağ isteği gözlenmedi');
      if (!fontProof.distinct) failures.push('glif: font metrikleri fallback ile aynı — gerçek yükleme kanıtlanamadı');
      if (!fontProof.check) failures.push('glif: document.fonts.check false');
    } else {
      // ESKİ build referansı (c9dd5962^): font-face HENÜZ YOK. Bu yüzden yükleme beklenmez;
      // gözlenen durum dürüstçe kaydedilir. Eski görünümün kendi fallback'iyle çizilmesi normaldir.
      runLog.push(`glif-referans: font loaded=${loaded} woff2=${fontProof.requests.length} distinct=${fontProof.distinct} check=${fontProof.check}`);
    }

    // 30 diziyi TEK sayfada, aynı ölçekte çiz.
    const css = [
      `#k3pd29-glyph-sheet{position:absolute!important;top:0;left:0;width:100%;height:auto;z-index:2147483647;overflow:visible;`,
      `background:${dark ? '#0B0B0F' : '#FFFFFF'};color:${dark ? '#F2F2F7' : '#111111'};`,
      `font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:6px 14px;box-sizing:border-box;isolation:isolate}`,
      `.k3pd29-g{display:flex;align-items:center;gap:14px;padding:9px 6px;border-bottom:1px solid ${dark ? '#2A2A33' : '#E5E5EA'}}`,
      `.k3pd29-i{width:26px;color:#8E8E93;font:600 12px/1 ui-monospace,monospace}`,
      `.k3pd29-a{flex:1;font-family:"K3P Scheherazade",serif;font-size:40px;line-height:1.7;direction:rtl}`,
      `.k3pd29-g code{color:#8E8E93;font:11px/1 ui-monospace,monospace}`,
      `html,body{margin:0!important;padding:0!important;background:${dark ? '#0B0B0F' : '#FFFFFF'}!important}`,
      `body>*:not(#k3pd29-glyph-sheet){visibility:hidden!important}`
    ].join('');
    const rowsHtml = series.map((item) => `<div class="k3pd29-g"><span class="k3pd29-i">${item.index}</span><span class="k3pd29-a" lang="ar" dir="rtl">${item.ar}</span><code>${item.sha256.slice(0, 12)}</code></div>`).join('');
    await gb.eval(`(function(){
      var el=document.createElement('div'); el.id='k3pd29-glyph-sheet'; el.setAttribute('dir','ltr');
      // DİKKAT: position:fixed + inset:0 yüksekliği viewport'a kilitler; 30 satır taşar ve
      // kırpımın altında uygulama görünür. Mutlak konum + otomatik yükseklik kullanılır.
      el.style.cssText='position:absolute;top:0;left:0;width:100%;height:auto;z-index:2147483647;overflow:visible;background:'+ (${dark} ? "'#0B0B0F'" : "'#FFFFFF'") +';color:'+ (${dark} ? "'#F2F2F7'" : "'#111111'") +';font-family:-apple-system,sans-serif;padding:6px 14px;box-sizing:border-box';
      el.innerHTML=${JSON.stringify(`<style>${css}</style>` + rowsHtml)};
      document.body.appendChild(el);
      // KRİTİK: gövde yüksekliği viewport'ta kalırsa 10. satırdan sonrası BOYANMAZ ve kırpım
      // boş çıkar. Belge yüksekliği sayfanın tamamına ayarlanır, sonra ölçülür.
      var h=Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.height='auto';
      document.documentElement.style.overflow='visible';
      document.body.style.height='auto';
      document.body.style.minHeight=h+'px';
      window.scrollTo(0,0);
      return h;
    })()`);
    await gb.wait(800);

    await gb.wait(300);
    // 1) Ölç: sayfanın tam yüksekliği (kırpımdan önce).
    const preMetrics = JSON.parse(await gb.eval(`(function(){
      var el=document.getElementById('k3pd29-glyph-sheet');
      return JSON.stringify({sheetHeight:Math.ceil(el.getBoundingClientRect().height), docH:document.documentElement.scrollHeight});
    })()`));
    // 2) Görüntü alanını sayfa yüksekliğine çıkar: Chrome yalnız viewport kadar boyar.
    await gb.setViewportSize(460, Math.min(preMetrics.sheetHeight, 8000));
    await gb.wait(600);
    const sheetMetrics = JSON.parse(await gb.eval(`(function(){
      var el=document.getElementById('k3pd29-glyph-sheet');
      var ars=[].map.call(el.querySelectorAll('.k3pd29-a'),function(x){var r=x.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)}});
      var rect=el.getBoundingClientRect();
      return JSON.stringify({rows:ars.length, minH:Math.min.apply(null,ars.map(function(a){return a.h})), maxH:Math.max.apply(null,ars.map(function(a){return a.h})),
        firstTop:ars[0].top, lastTop:ars[ars.length-1].top,
        sheetHeight:Math.ceil(rect.height), scrollH:el.scrollHeight, clientH:el.clientHeight, sw:el.scrollWidth, cw:el.clientWidth,
        docH:document.documentElement.scrollHeight, bodyH:document.body.scrollHeight});
    })()`));
    if (sheetMetrics.rows !== 30) failures.push(`glif: sayfada ${sheetMetrics.rows} dizi çizildi (30 bekleniyordu)`);
    if (sheetMetrics.sw > sheetMetrics.cw + 1) failures.push('glif: sayfa yatay taşıyor');
    // Kart: "Kontaktaki küçük önizlemeyi tek başına glif kabulü sayma; rawlar veya eşdeğer
    // okunabilir kırpımlar/hashler korunsun." Bu yüzden 30 dizi, KIRPILMADAN (sayfanın tam
    // yüksekliği kadar) tek bir tam çözünürlüklü görüntüde alınır. Sayfa kendi içinde
    // kaydırılabilir olsa da kırpım tam yüksekliği kapsar; küçük önizleme üretilmez.
    if (sheetMetrics.sheetHeight < 2000) failures.push(`glif: dizi sayfası beklenenden kısa (sheetHeight=${sheetMetrics.sheetHeight})`);
    // Son satır kırpımın içinde olmalı: aksi hâlde görüntü 30 diziyi kapsamıyor demektir.
    if (sheetMetrics.lastTop + sheetMetrics.maxH > sheetMetrics.sheetHeight) failures.push('glif: son dizi kırpımın dışında kalıyor');
    const rowSpacing = sheetMetrics.rows > 1 ? (sheetMetrics.lastTop - sheetMetrics.firstTop) / (sheetMetrics.rows - 1) : 0;
    if (rowSpacing < sheetMetrics.maxH * 0.9) failures.push(`glif: satır aralığı ${Math.round(rowSpacing)}px çizilen glif yüksekliği ${sheetMetrics.maxH}px ile tutarsız (satırlar üst üste binmiş olabilir)`);

    // Tema ÖLÇÜMÜ (etiket değil): glif satırı da aynı sözleşmeye tabidir.
    const glyphTheme = JSON.parse(await gb.eval(THEME_STATE));
    const glyphThemeProblems = themeProblems(glyphTheme, themeName);
    if (glyphThemeProblems.length) failures.push(`glif: tema doğrulanmadı (${glyphThemeProblems.join('; ')})`);

    const clipName = `${GLYPH_ONLY ? 'g0-30-zor-glif-referans' : 'g1-30-zor-glif'}${SHOT_EXT}`;
    if (manifest.some((row) => row.screenshot === clipName)) throw new Error('yinelenen sahne kimliği: ' + clipName);
    // Tam yükseklik kırpımı: 30 satırın hepsi tek görüntüde, 2× ölçekte okunabilir.
    // Glif sayfası 2× ölçekte alınır (okunabilirlik); 1× ekranda 40 px glif küçük kalır.
    await gb.shotClip(path.join(out, clipName), { x: 0, y: 0, width: 460, height: sheetMetrics.sheetHeight }, 2, { format: SHOT_FORMAT, quality: SHOT_QUALITY });
    // Gerçek yakalama ölçeği görüntünün piksel boyutundan okunur (F5): sabit `2` yazmak
    // "2 ≠ 2" totolojisiydi.
    const glyphAbs = path.join(out, clipName);
    const glyphInfo = imageSize(glyphAbs);
    if (!glyphInfo.ok) throw new Error(`glif çekimi okunamadı: ${clipName} (${glyphInfo.reason})`);
    const glyphScale = glyphInfo.width / 460;
    if (!(glyphScale > 0)) throw new Error(`glif yakalama ölçeği hesaplanamadı: ${clipName}`);
    const glyphActions = await sceneActions(gb);
    // `ser=` (20. denetim F20-1): `glyphEvidence.series[].sha256/source/marks` beyandi ve
    // EVIDENCE "kaynagi ve SHA-256'si kayitli" diyordu ama hicbir kapi yeniden turetmiyordu.
    // Artik 30 dizinin birlesik sha256'si log'a yazilir; ayrica `px=`/`scale=` zaten
    // `glyphEvidence.imagePixels`/`captureScale` icin diskten yeniden turetilen taniktir.
    const seriesDigest = sha256Text(series.map((item) => `${item.index}|${item.ar}|${item.source}|${item.corpus}|${item.marks}|${item.sha256}`).join('\n'));
    const glyphLog = `${GLYPH_ONLY ? 'g0-30-zor-glif-referans' : 'g1-30-zor-glif'}: theme=${glyphTheme.dataTheme} surface=${glyphTheme.surface} vw=460 vh=844 inset=0 fontReady=${Boolean(loaded && fontProof.check)} actionsH=${sha256Text(glyphActions)} hidden=false hiddenPx=0 collisions=0 collisionPx=0 ctaW=-1 ctaH=-1 ctaX=-1 ctaY=-1 ctaR=-1 ctaLay=-1 ctaScr=-1 focus=false sel=-1 covN=-1 covPx=0 covH=-1 coverY=-1 coverH=-1 lscroll=na overflowX=false hard=yok rows=${sheetMetrics.rows} h=${sheetMetrics.maxH} hMin=${sheetMetrics.minH} hFirst=${sheetMetrics.firstTop} hLast=${sheetMetrics.lastTop} hSw=${sheetMetrics.sw} hCw=${sheetMetrics.cw} font=K3P-Scheherazade loaded=${loaded} woff2=${fontProof.requests.length} metrics=${fontProof.withFont}/${fontProof.withFallback} distinct=${fontProof.distinct} check=${fontProof.check} px=${glyphInfo.width}x${glyphInfo.height} scale=${glyphScale.toFixed(2)}x ser=${seriesDigest.slice(0, 16)} | ${series.map((item) => item.ar).join(' ')}`;
    log.push(glyphLog);
    manifest.push(manifestRow({
      profile: 'glif',
      // Glif satırının teması da ÖLÇÜMDEN gelir (F10-1/F10-2), istenen temadan değil.
      theme: glyphTheme.dataTheme,
      viewport: { width: 460, height: 844, safeAreaBottom: 0 },
      captureScale: glyphScale,
      scene: GLYPH_ONLY ? 'g0-30-zor-glif-referans' : 'g1-30-zor-glif',
      sceneKind: 'glyph',
      screenshot: clipName,
      log: [glyphLog],
      issues: [],
      sha256: sha256File(glyphAbs),
      verifiedTheme: glyphTheme,
      actionsJson: glyphActions,
      cta: null
    }));
    glyphEvidence = {
      // Sahne kimliği kanıta YAZILIR: `--glif-karsilastir` tema/font çapasını arayacağı
      // log satırını bununla bulur (10. denetim F10-2). Önceden türetilemiyordu.
      scene: GLYPH_ONLY ? 'g0-30-zor-glif-referans' : 'g1-30-zor-glif',
      seriesCount: series.length,
      lexiconVersion,
      surahVersion,
      font: fontProof,
      sheet: sheetMetrics,
      reference: GLYPH_ONLY,
      screenshot: clipName,
      screenshotSha256: sha256File(glyphAbs),
      captureScale: glyphScale,
      imagePixels: { width: glyphInfo.width, height: glyphInfo.height, bytes: glyphInfo.bytes },
      imageFormat: SHOT_FORMAT,
      imageQuality: SHOT_QUALITY,
      clipHeight: sheetMetrics.sheetHeight,
      viewportHeightDuringCapture: Math.min(preMetrics.sheetHeight, 8000),
      series: series.map((item) => ({ index: item.index, ar: item.ar, source: item.source, corpus: item.corpus, marks: item.marks, sha256: item.sha256 }))
    };
  } finally {
    await gb.close();
  }
}

// ── CTA ≤8 px (aynı aşamanın ardışık render'ları) ──────────────────────────────────────────────
// Sözleşme (K3PD-21): "aynı aşamanın birincil eylemi, ardışık render'larda aynı y'de kalmalı."
// Farklı aşamaların y'leri doğal olarak farklıdır; bu ölçüm aşama içi kararlılığı sınar.
// Kayıtlar `snap()` içinde, ölçülen HER CTA satırı için üretilir (feedback panelleri dâhil).
const ctaReport = sceneYs;
for (const item of ctaReport) {
  if (item.maxDelta > 8) findings.push(`CTA ${item.scene} (${item.stage}): aynı sahnenin ardışık render y-farkı ${item.maxDelta}px > 8px`);
}
if (!GLYPH_ONLY && ctaReport.length === 0) failures.push('CTA: hiçbir sahnede geometri ölçülemedi');

// Glif-only modunda ana tarayıcı ana blok içinde kapatılmadı; burada kapatılır (sızıntı olmasın).
if (GLYPH_ONLY) { try { await b.close(); } catch {} }
const blocked = b.blocked ? b.blocked.length : 0;
// Ölçülen ölçekler (beyan değil): satır başına görüntünün piksel genişliği / viewport genişliği.
const measuredScales = [...new Set(manifest.map((row) => row.captureScale))];

// ── Manifest + log + özet ────────────────────────────────────────────────────────────────────
// `productionFindings` SATIRLARDAN türetilir; beyan ile ölçüm ayrışamaz. `cta_drift` de
// beyan edilir, çünkü doğrulayıcı "ölçülen >8 px ise beyan edilmiş olmalı" kuralını
// iki yönlü uygular (bkz. `validateCta`).
const productionFindings = (() => {
  const found = [];
  for (const row of manifest) {
    if (row.cta && row.cta.hiddenBy) found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_hidden_by', coverStack: row.cta.coverStack });
    if (row.cta && row.cta.overlapCovered) found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_content_overlap' });
    if (row.cta && (row.cta.overlapsControl || []).some((item) => item.overlapPx >= 8)) found.push({ scene: row.scene, theme: row.theme, viewport: row.viewport, kind: 'cta_control_collision', overlapsControl: row.cta.overlapsControl });
  }
  for (const item of ctaReport) {
    if (item.maxDelta > 8) found.push({ scene: item.scene, theme: themeName, viewport, kind: 'cta_drift', maxDelta: item.maxDelta });
  }
  return found;
})();

const sourceAssets = Object.entries(sourceInventory.files).sort(([a], [b]) => a.localeCompare(b)).map(([name, sha256]) => ({ path: name, sha256 }));
if (sourceInventory.conflicts.length) failures.push(`kaynak çekim sırasında değişti: ${sourceInventory.conflicts.join(', ')}`);
for (const item of sourceAssets) if (sha256File(path.join(root, item.path)) !== item.sha256) failures.push(`kaynak çekim sonrası değişti: ${item.path}`);
if (!GLYPH_ONLY) for (const required of ['index.html', 'app/kao.css', 'app/core/quranLearn.js', 'app/core/quranLearnViews.js']) if (!sourceAssets.some((item) => item.path === required)) failures.push(`kaynak isteği gözlenmedi: ${required}`);
runLog.push(`sourceAssets:${sha256Text(JSON.stringify(sourceAssets))}`);
const manifestJson = {
  schema: 'k3pd-visual-qa-manifest',
  schemaVersion: GLYPH_ONLY ? 3 : 11,
  sourceAssets,
  card: 'K3PD-29',
  generatedAt: new Date().toISOString(),
  profile: prof, theme: themeName, viewport,
  // Koşum üstbilgisi: satırlardan TÜRETİLEN ölçek kümesi (beyan değil). Ana satırlar 1×,
  // glif kırpımı cihaz ölçeği × kırpım ölçeği (2 × 2 = 4×) olabilir; bu yüzden tek sayı
  // dayatılmaz, ölçülen küme yazılır. Satır bazlı doğruluk `rows[].captureScale`'dedir.
  captureScales: measuredScales,
  imageFormat: SHOT_FORMAT, imageQuality: SHOT_QUALITY,
  mode: GLYPH_ONLY ? 'glif-referans' : 'tam',
  origin: ORIGIN,
  glyphEvidence,
  ctaReport,
  productionFindings,
  rows: manifest
};
// SON TEMİZLİK + FAIL-CLOSED SAYIM (11. denetim): macOS aynı ada yazarken "ad 3.webp"
// üretirse disk sayımı manifestle uyuşmaz ve `--dogrula` kırmızı olur. Yazımdan hemen
// önce kopyalar silinir; sonrasında disk sayısı manifest satır sayısına EŞİT DEĞİLSE
// kanıt üretilmiş sayılmaz (exit 1).
for (const name of fs.readdirSync(out)) {
  if (DUP_NAME_RE.test(name)) fs.unlinkSync(path.join(out, name));
}
const shotsOnDisk = fs.readdirSync(out).filter((name) => /\.(png|webp)$/i.test(name));
if (shotsOnDisk.length !== manifest.length) {
  failures.push(`disk/ manifest sayımı uyuşmuyor: disk ${shotsOnDisk.length} ≠ manifest ${manifest.length} (${shotsOnDisk.filter((name) => / \d+\./.test(name)).join(', ') || 'kopya ad yok'})`);
}
fs.writeFileSync(path.join(out, 'MANIFEST.json'), JSON.stringify(manifestJson, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'log.txt'), [...runLog, ...log].join('\n') + `\nblocked-external: ${blocked}\n`);
fs.writeFileSync(path.join(out, 'issues.txt'), manifest.flatMap((row) => row.issues.map((issue) => `${row.scene} @${width}px: ${issue}`)).join('\n') + '\n');

// SON SWEEP (12. denetim): macOS "ad 2.webp" kopyası bu kez YAZIMDAN SONRA oluştu;
// yukarıdaki yazım-öncesi denetim onu göremedi ve koşum `exit 0` verip kanıtı kirletti.
// Tüm dosyalar yazıldıktan sonra tekrar süpürülür ve sayım yeniden doğrulanır.
for (const name of fs.readdirSync(out)) {
  if (DUP_NAME_RE.test(name)) { try { fs.unlinkSync(path.join(out, name)); } catch {} }
}

// Sayım: PNG = manifest satırı = log satırı (görüntü başına 1).
const pngCount = fs.readdirSync(out).filter((name) => name.endsWith('.png') || name.endsWith('.webp')).length;
if (pngCount !== manifest.length) failures.push(`sayım: ${pngCount} görüntü ≠ ${manifest.length} manifest satırı`);
if (log.length !== manifest.length) failures.push(`sayım: ${log.length} log satırı ≠ ${manifest.length} manifest satırı`);

// ── Çıkış kodu: ÇEKİM SAĞLIĞI ile BULGU ayrılır ────────────────────────────────────────────────
// `failures` iki farklı şeyi taşıyabilir:
//   • captureFailures  — aracın kendi sözleşmesinin ihlali (tema yanlış, eksik görüntü, sayım/hash
//     uyuşmazlığı, CTA ölçülemedi). Bu bir ARAÇ hatasıdır: exit 1, kanıt üretilmiş sayılmaz.
//   • findings         — üretimde ölçülen GERÇEK kusurlar (ör. örtüşen CTA). Kanıt GEÇERLİDİR;
//     bulgu MANIFEST.json → `productionFindings` alanında ve stderr'deki `FINDING` satırında
//     kayıtlıdır (issues.txt değil: o dosya sahne taramasının bulgularını taşır). Bunlar exit 0
//     ile raporlanır, çünkü aksi
//     hâlde "ölçüm yapılamadı" ile "ölçüm kusur buldu" ayırt edilemez ve ölçüm gevşetme baskısı
//     doğar. Bulgu varlığını gizlememek için ayrıca `FINDING` satırı ve manifest alanı yazılır.
// İki kanal ayrı dizilerde tutulduğu için sınıflandırma YOK — bkz. yukarıdaki dizi tanımları.
const captureFailures = failures;

console.log(`TEMA ${themeName} ${width}px inset=${safeAreaBottom} (${SHOT_FORMAT} q${SHOT_QUALITY}): ${manifest.length} görüntü · ${log.length} log satırı · ${captureFailures.length} araç hatası · ${findings.length} üretim bulgusu`);
findings.forEach((finding) => console.error('FINDING ' + finding));
if (captureFailures.length) {
  captureFailures.forEach((failure) => console.error('HATA ' + failure));
  process.exit(1);
}
if (findings.length) {
  console.log('ÇEKİM SAĞLIKLI; üretim bulgusu var (yukarıda FINDING). Kanıt geçerli, ölçüm gevşetilmedi.');
} else {
  console.log('PASS manifest/log/görüntü eşleşti; tema doğrulandı; CTA ≤8 px; glif 30 dizi.');
}
