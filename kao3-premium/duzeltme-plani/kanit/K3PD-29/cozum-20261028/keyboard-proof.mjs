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
import { launch } from './cdp-key.mjs';
import { glyphSeries, imageSize, manifestRow, sha256File, sha256Text, THEME_TOKENS } from '../../../../../tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs';
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

const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844, insets: safeAreaBottom ? { bottom: safeAreaBottom } : null, scale: 1 });
// ≤8 px kuralı: AYNI sahnenin (aynı aşama + aynı görev/içerik örneği) ardışık render'larında
// birincil eylem aynı y'de kalmalı. Farklı görev örneklerinin y'leri doğal olarak farklıdır
// (içerik yüksekliği değişir); onları tek kovaya toplamak yanlış pozitif üretir.
const sceneYs = [];
const noteYs = (scene, stage, ys) => {
  let maxDelta = 0;
  for (let i = 1; i < ys.length; i += 1) maxDelta = Math.max(maxDelta, Math.abs(ys[i] - ys[i - 1]));
  sceneYs.push({ scene, stage, viewport: `${viewport.width}x${viewport.height}+${viewport.safeAreaBottom}`, samples: ys.length, layoutYs: ys, maxDelta });
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
  var all=scope.querySelectorAll('*');
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
  practice: '.kao-task.is-practice .kao-choices button',
  feedback: '.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue',
  apply: '.kao-lesson[data-lesson-stage="apply"] > .kao-lesson-next',
  summary: '.kao-lesson[data-lesson-stage="summary"] > .kao-lesson-next',
  // Üretim `partEnd` aşamasını `budget` olarak çizer (quranLearn.js kaoLesson modeli).
  partEnd: '.kao-lesson[data-lesson-stage="budget"] > .kao-lesson-next',
  budget: '.kao-lesson[data-lesson-stage="budget"] > .kao-lesson-next',
  read: '.kao-lesson[data-lesson-stage="read"] > .kao-lesson-next'
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
    var scroller=d?(d.querySelector('.kao-lesson-content')||d.querySelector('.kao-body')):null;
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
    var candidates=[].slice.call(stageScope.querySelectorAll('*'));
    for(var i=0;i<candidates.length;i++){
      var other=candidates[i];
      if(other===el||el.contains(other)||other.contains(el)) continue;
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
    var focusable=el.matches('button,a[href],input,select,textarea,[tabindex]')?el:el.querySelector('button,a[href],input,select,textarea,[tabindex]');
    var focusReachable=!!focusable&&!focusable.disabled&&focusable.getBoundingClientRect().width>0;
    return JSON.stringify({selector:sel, present:true, x:Math.round(r.left), y:Math.round(r.top), width:Math.round(r.width), height:Math.round(r.height),
      // Yerleşim konumu (kaydırmadan bağımsız): ≤8 px kararlılık ölçüsü bunu kullanır.
      layoutY: Math.round(r.top + scrollTop), scrollTop: Math.round(scrollTop),
      // GÖRÜNÜRLÜK İKİ EKSENDE (18. denetim F18-1): yatay eksen de hesaba katılır; aksi hâlde
      // yatayda ekran dışındaki bir eylem 'visible:true' yazılıyor ve hiçbir kapı görmüyordu.
      // NOT: bu blok bir TEMPLATE LITERAL içinde; yorumlarda ters tırnak KULLANILMAZ.
      visible: r.width>0&&r.height>0&&r.top<dr.bottom-1&&r.bottom>dr.top+1&&r.left>=dr.left-1&&r.right<=dr.right+1,
      // Sözleşme alanı: eylem içeriği örtüyor mu?
      overlapCovered: overlapsContent.length>0,  // bilgi: yapışkan eylem altındaki kaydırılan içerik
      hiddenBy: covered, coverStack: coverStack,
      overlapsContent: overlapsContent.slice(0,4), overlapsControl: overlapsControl.slice(0,4),
      scroll: scroller?{scrollTop:Math.round(scroller.scrollTop),scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight,localScroll:scroller.scrollHeight>scroller.clientHeight+1}:null,
      focusReachable:focusReachable, dialogRight:Math.round(dr.right), dialogBottom:Math.round(dr.bottom)});
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
  // GERÇEK KUSUR 2: aynı aşamanın başka bir kontrolü eylemin üstüne biniyor.
  const controlCollisions = (cta.overlapsControl || []).filter((item) => item.overlapPx >= 8);
  if (controlCollisions.length) findings.push(`${scene}: CTA başka bir kontrolle çakışıyor — ${controlCollisions.map((item) => `${item.tag}.${String(item.cls).split(' ')[0]}(y=${item.y},h=${item.h},örtüşme=${item.overlapPx}px)`).join(' ; ')}`);
  // İçerik erişilebilirliği: kart "yerel scroll alanı ile sayfa taşmasını ayır" diyor.
  // Yerel kaydırma (scrollHeight > clientHeight) MEŞRUDUR ve kusur değildir; yalnızca
  // sayfa/diyalog taşması kusurdur (SCAN'de SAYFA-TAŞMASI / DİŞARI-TAŞAR olarak yakalanır).
  if (!cta.focusReachable) failures.push(`${scene}: CTA klavye odağına ulaşmıyor`);
  ctaFindings.push({ scene, stage, ...cta });
}

/**
 * Tek görüntü + tek manifest satırı. Hata SKIP'e yutulmaz: doğrudan fırlatır (exit 1).
 */
async function snap(page, rowBase, js = null, { dump = 120 } = {}) {
  if (js) await page.eval(js);
  await page.wait(500);
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
  const logLine = `${rowBase.scene}: theme=${theme.dataTheme} surface=${theme.surface} vw=${width} vh=${viewport.height} inset=${safeAreaBottom} hidden=${hiddenFlag} hiddenPx=${hiddenPx} collisions=${collisions.length} collisionPx=${maxOverlapPx} ctaW=${ctaW} ctaH=${ctaH} ctaX=${ctaX} ctaY=${ctaY} ctaR=${ctaR} ctaLay=${ctaLay} ctaScr=${ctaScr} focus=${focusFlag} sel=${ctaSel} covN=${ctaCovN} covPx=${ctaCovPx} covH=${ctaCovHash} coverY=${ctaCoverY} coverH=${ctaCoverHash} lscroll=${ctaLscroll === null ? 'na' : ctaLscroll} overflowX=${hard.some((item) => item.kind === 'YATAY-KIRPILIR' || item.kind === 'SAYFA-TAŞMASI')} hard=${hardKinds.length ? hardKinds.join(',') : 'yok'} | ${summary}`;
  log.push(logLine);

  if (rowBase.ctaStage) recordCta(rowBase.scene, rowBase.ctaStage, cta);
  // ARDIŞIK RENDER KARARLILIĞI (K3PD-21 ≤8 px): ölçülen HER CTA satırı için kayıt zorunlu.
  // Önceden 42 CTA satırının 17'si (tüm feedback panelleri) hiç kaydedilmiyordu; `ctaReport`
  // 25 kayıt taşırken 42 satır CTA iddia ediyordu (denetim bulgusu F2). Aynı aşama aynı
  // render'da yeniden çizilir (tema aynı değerle sabitlenir) ve y-konumu karşılaştırılır.
  // Fallback YOK: ikinci ölçüm alınamazsa 0 px uydurulmaz, ölçüm kırılması sayılır.
  if (cta && cta.present) {
    await page.eval(`App.setTheme(${dark ? 'true' : 'false'})`);
    await page.wait(450);
    const again = await CTA_PROBE(page)(rowBase.ctaStage);
    if (!again || !again.present) failures.push(`${rowBase.scene}: CTA yeniden ölçülemedi (ardışık render probe boş)`);
    else noteYs(rowBase.scene, rowBase.ctaStage, [cta.layoutY, again.layoutY]);
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
    cta
  }));
  return { theme, cta, hard, info };
}

// ── Ön koşul: origin + token + forceSync ──────────────────────────────────────────────────────
await b.goto(`${ORIGIN}/index.html?v3done=1`);
const originCheck = JSON.parse(await b.eval(`JSON.stringify({origin:location.origin, token:!!(window.data&&data.settings&&data.settings.ghToken), force:localStorage.getItem('seyma-sync-force'), href:location.search})`));
if (originCheck.origin !== ORIGIN) throw new Error(`origin ${originCheck.origin} ≠ ${ORIGIN}`);
if (originCheck.token) throw new Error('token alanı dolu: sentetik profil bekleniyordu');
if (originCheck.force === '1') throw new Error('seyma-sync-force ayarlı: bu araç force-sync kullanmaz');
if (/[?&]forceSync=1/.test(originCheck.href)) throw new Error('?forceSync=1 kullanılamaz');
if (safeAreaBottom && (!b.safeAreaApplied || b.safeAreaApplied.bottom !== safeAreaBottom)) throw new Error(`safe-area insets uygulanmadı (${JSON.stringify(b.safeAreaApplied)})`);
runLog.push(`origin: ${originCheck.origin} token:${originCheck.token} force:${originCheck.force} safeAreaBottom:${safeAreaBottom}`);
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
await b.goto(`${ORIGIN}/index.html?v3done=1`);
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


try {
 await b.eval(`SeymaQuranLearn.kaoOpen('home'); SeymaQuranLearn.kaoSetView('home'); App.kaoLesson('start','u01.03')`);
 let summaryFound = false;
 for (let k=1;k<=120;k++) {
   const st=JSON.parse(await b.eval(`JSON.stringify((function(){var s=ui.kaoLesson;if(!s)return {done:true};var it=s.plan[s.at];return {phase:s.phase,kind:it&&it.kind,done:false}})())`));
   if(st.done) break;
   if(st.phase==='practice') {
     const task=JSON.parse(await b.eval(`JSON.stringify((function(){var q=ui.kaoQueue[ui.kaoTaskIndex];var t=ui.kaoTasks[q.id];return {id:t.id,kind:t.kind,type:t.type,errorClass:t.errorClass,choices:t.choices.map(function(c){return {id:c.choiceId,correct:c.correct,ordinal:c.ordinal}})}})())`));
     if(practiceKind(task)==='order') { for(const choice of task.choices.slice().sort((a,z)=>a.ordinal-z.ordinal)) await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(choice.id)})`); }
     else {const pick=(k%2?task.choices.find(c=>c.correct):task.choices.find(c=>!c.correct))||task.choices[0]; await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(pick.id)})`);}
     await b.wait(350); await b.eval(`App.kaoContinue()`); await b.wait(250); continue;
   }
   const stage=st.kind||st.phase;
   if(stage==='summary') {summaryFound=true; break;}
   if(stage==='partEnd') break;
   await b.eval(`App.kaoLesson('next')`); await b.wait(220);
 }
 if(!summaryFound) throw new Error('summary gerçek ders yolunda bulunamadı');
 await snap(b,{profile:'ana',scene:'l25-summary',sceneKind:'lesson',ctaStage:'summary'});
 const scrollChecks=[];
 for(const fraction of [0,0.5,1]) {
  const v=JSON.parse(await b.eval(`JSON.stringify((function(){var s=document.querySelector('.kao-lesson-content'),p=document.querySelector('.kao-lesson-next'),q=document.querySelector('.kao-lesson>.kao-lesson-more');if(!s||!p||!q)throw Error('missing nodes');s.scrollTop=(s.scrollHeight-s.clientHeight)*${fraction};function rect(e){var r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.left,y:r.top,w:r.width,h:r.height,bottom:r.bottom,hit:!!hit&&(hit===e||e.contains(hit)),text:e.innerText};}var a=rect(p),b=rect(q),c=rect(s);return {fraction:${fraction},scrollTop:s.scrollTop,scrollHeight:s.scrollHeight,clientHeight:s.clientHeight,primary:a,secondary:b,content:c,detailsOpen:!!(s.querySelector('details')&&s.querySelector('details').open),font:getComputedStyle(document.querySelector('.kao-lesson')).fontSize,contentSeparate:c.bottom<=Math.min(a.y,b.y)+1}})())`));
  scrollChecks.push(v);
  if(!v.primary.hit||!v.secondary.hit||!v.contentSeparate||v.primary.w<44||v.secondary.w<44||v.primary.h<44||v.secondary.h<44) failures.push('scroll '+fraction+' eylem/içerik ayrımı başarısız');
 }
 const beforeRepaint=await b.eval(`document.querySelector('.kao-lesson-content').scrollTop`);
 await b.eval(`App.setTheme(${dark ? 'true' : 'false'})`);await b.wait(100);
 const afterRepaint=await b.eval(`document.querySelector('.kao-lesson-content').scrollTop`);
 if(Math.abs(afterRepaint-beforeRepaint)>1)failures.push('aynı aşama repaint iç scroll sıfırladı');
 const colorCheck=JSON.parse(await b.eval(`JSON.stringify(Array.from(document.querySelectorAll('.kao-lesson-summary .kao-lesson-apply-word')).map(function(e){var bg=getComputedStyle(e).backgroundColor;return Array.from(e.querySelectorAll('span')).map(function(x){return {bg:bg,fg:getComputedStyle(x).color,text:x.textContent}})}).flat())`));
 function lum(rgb){const values=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(x=>x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4));return .2126*values[0]+.7152*values[1]+.0722*values[2];}
 for(const x of colorCheck){const a=lum(x.bg),b=lum(x.fg);x.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(x.ratio<4.5)failures.push('kelime kontrastı <4.5');}
 if(!colorCheck.length)failures.push('özet kelime renkleri eksik');
 if(scrollChecks[2].scrollTop<=scrollChecks[0].scrollTop)failures.push('gerçek kaydırma yok');
 if(sceneYs.some(x=>x.maxDelta>8))failures.push('CTA stability exceeds 8px');
 const keyboard=[];
 await b.eval(`document.querySelector('.kao-focus-exit').focus()`);
 for(let i=0;i<80;i++){
   await b.keyTab();
   const active=JSON.parse(await b.eval(`JSON.stringify((function(){var e=document.activeElement;return {tag:e.tagName,cls:String(e.className||''),text:(e.innerText||'').trim().slice(0,50)}})())`));
   keyboard.push(active);
   if(keyboard.some(x=>x.cls.includes('kao-lesson-next'))&&keyboard.some(x=>x.cls.includes('kao-lesson-more')))break;
 }
 if(!keyboard.some(x=>x.cls.includes('kao-lesson-next'))||!keyboard.some(x=>x.cls.includes('kao-lesson-more'))) failures.push('Tab ile iki eyleme erişilemedi');
 const report={viewport,theme:themeName,rows:manifest,ctaReport:sceneYs,scrollChecks,keyboard,repaint:{before:beforeRepaint,after:afterRepaint},colorCheck,failures,findings,blockedExternalCount:b.blocked.length,cssSha256:sha256File(path.join(root,'app/kao.css')),viewsSha256:sha256File(path.join(root,'app/core/quranLearnViews.js')),engineSha256:sha256File(path.join(root,'app/core/quranLearn.js')),origin:ORIGIN};
 fs.writeFileSync(path.join(out,'TARGET.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(out,'log.txt'),[...runLog,...log].join('\n')+'\n');
 if(failures.length||findings.length) throw new Error(JSON.stringify({failures,findings}));
 console.log('TARGET PASS '+themeName+' '+width+' inset='+safeAreaBottom+' '+JSON.stringify({delta:sceneYs[0]?.maxDelta,cta:manifest[0]?.cta}));
} finally { await b.close(); }

}
