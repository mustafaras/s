# Şeyma v3.0 Tanıtım Sayfası — CLAUDE DEVIR PROMPTU

> **KULLANIM:** Bu dosyanın **tamamını** Claude'a yapıştır. Başka bir şeye gerek yok;
> aşağıdaki her şey kendi kendine yeterlidir.
>
> **Bu belge bir "kontrol + düzeltme" görevidir.** Önceki bir ajan (Copilot) bu işi
> yaptı ama kullanıcı sonucu **yeterli bulmadı**. Senin işin: kullanıcının aşağıda
> **birebir** listelenen isteklerini **tek tek doğrulamak**, yanlış/eksik olanı
> **düzeltmek** ve doğrulanabilir kanıt üretmek. Önceki ajanın "yaptım" demesi
> kanıt değildir — **kendin ölç.**

---

## 0. Görev özeti

Kullanıcı, `mustafaras/s` reposundaki **Şeyma** adlı kişisel uygulaması için
`v3-tanitim/` altında **tek seferlik bir sürüm tanıtım + kutlama sayfası** istedi.
Sayfa; kullanıcının **gerçek verilerini** (`mustafaras/seyma-data`) kullanmalı,
premium/görsel zengin olmalı ve "Okudum, anladım" ile bir daha çıkmamalı.

Kullanıcının son şikâyeti: **"hâlâ yanlış — bu verileri (seyma-data) kullanmalıyız"**
ve **"ÇALIŞTIR GÖREYİM YİNE HATALI GİBİ"**.

**Senin hipotezin şu OLMAMALI:** "sayfa çalışıyor". **Şu OLMALI:** "kullanıcının
gördüğü sayı ile `seyma-data`'daki gerçek sayı birebir mi? Değilse neden?"

---

## 1. İlk 5 dakika — zorunlu okuma (sırayla)

```bash
cd /Users/m_ras/Desktop/seyma

# 1) Proje kuralları (İSTİSNASIZ oku — veri güvenliği kuralları burada)
cat CLAUDE.md
cat AGENTS.md

# 2) Bu işin kendi belgeleri
cat docs/v3-tanitim/README.md
cat docs/v3-tanitim/STARTER.md

# 3) Şu anki durum
git log --oneline -6
git status --short
git rev-parse --abbrev-ref HEAD
```

**Mevcut durum (2026-09-15, bu belgenin yazıldığı an):**

- Dal: `premium-fx-gorsel-yuzey` · **LOCAL-ONLY, push edilmedi**
- HEAD: `878d90c`
- Çalışma ağacı: **temiz**
- Sayfa dosyaları: `v3-tanitim/{index.html,v3.css,v3.js,v3-data.js,v3-stats.js,v3-statsview.js,v3-charts.js,v3-source.js}`
- Fixture: `tests/app/test_v3_welcome.js` → **284 kontrol, PASS** (2026-09-15 Claude denetimi: 263 → 284; veri artık `v3-snapshot.js` ile statik — bkz. README §Statik anlık görüntü)
- `app.js` / `sync.js` / `app/` / `panel/` bu iş boyunca **hiç değişmedi**

---

## 2. ⚠️ VERİ GÜVENLİĞİ — pazarlıksız (ihlal edersen iş başarısızdır)

`mustafaras/s` **PUBLIC** bir repodur. Gerçek kişisel veri (ruh hâli, not, günlük,
ilaç, döngü, ekran görüntüsü metni) **asla** bu repoya commit edilmemelidir.

1. **`mustafaras/seyma-data`'ya YAZMA.** Salt-okur. Sadece `GET`. Hiçbir koşulda
   `PUT`/`POST`/`PATCH`/`DELETE` yoki `gh api -X` yazma yöntemi kullanma.
2. **Uygulamayı jenerik olarak "çalışıyor mu" diye tarayıcıda AÇMA.** Kanonik
   doğrulama yolu headless Node `vm` harness'larıdır (bkz. §7).
3. **Kontrollü yerel görsel QA izni var** (kullanıcı ekran görüntüsü istiyorsa):
   - yalnız `127.0.0.1:9000` (loopback),
   - yalnız **tek kullanımlık ajan profili**,
   - URL'de `forceSync=1` **asla**, `seyma-sync-force` **asla**,
   - gerçek token/şifre/mevcut tarayıcı profili **asla** okunmaz/doldurulmaz.
   - `sync.js` **Guard 1** localhost'tan push'u zaten engeller; işin bitince
     sunucuyu **durdur** (`pkill -f http.server`).
4. **Kullanıcıdan sır istemene gerek yok** — sayfa, uygulamanın **zaten** sakladığı
   `settings.ghToken`'ı kendi tarayıcı deposundan okur. Token'ı sohbette sorma.
5. **Gerçek veriyi `/tmp`'de bırakma.** İşin sonunda sil.
6. **Kanıt seviyelerini karıştırma.** "Kaynak/fixture kanıtı", "yerel QA kanıtı" ve
   "kullanıcının cihazındaki davranış" **ayrı** şeylerdir. Cihazı sen doğrulayamazsın;
   onu kullanıcı onaylar.

---

## 3. Kullanıcının TÜM istekleri — birebir ve doğrulama yöntemiyle

Aşağıdaki 10 istek bu konuşmadaki gerçek kullanıcı mesajlarıdır (**birebir alıntı**).
Her biri için: **ne istendi → nasıl doğrularsın → mevcut durum**.

---

### İ-1 · Sayfayı kur
> *"`docs/v3-tanitim/STARTER.md` dosyasını oku ve uygula."*

**Nasıl doğrularsın:** `v3-tanitim/index.html` var mı, `#root data-theme="dark"`
kullanıyor mu, `index.html` `<head>`'inde tek inline bootstrap var mı, "Okudum,
anladım" düğmesi kalıcı işaret yazıp **geri okuyarak doğruluyor** mu.

**Durum:** ✅ Yapıldı. `v3.js` → `SEEN_KEY='seyma-v3-welcome-v1'`,
`markSeen()` yazıp geri okur, sonsuz döngü koruması `?v3done=1`.
*Not: STARTER.md 85 gün varsayımıyla yazılmıştır → bkz. İ-9 (artık 84).*

---

### İ-2 · Flamingo emojisi + çok daha uzun, bol efektli, gelişmiş görselleştirme + kutlama havası + uygulama içinde v3.0
> *"flamingo emojisini kullanmalısın ve çok daha uzun bol effectli çok daha gelişmiş
> süper görselleştirmeleri oln bi sayfa olmalı ayrıca bir kutlama edası olmalı
> uygulamanın 85. gününe özel bir kutlama havası olmalı ve ayrıca uygula içinde de
> ayarlarda falan v3.0 güncellemesi yazman gereken yerlere yaz ve güncelle"*

**Nasıl doğrularsın:**
- Sayfadaki **tek emoji 🦩** olmalı ve **elle çizilmiş SVG flamingo kalmamalı**.
- Emojiye `color` verilmemeli (renkli emojiyi boyamak bozar).
- Efektler ad ad sayılmalı (fixture bunu kontrol eder).
- `app/core/settings.js` → Ayarlar'da **v3.0** metni + "3.0'da neler değişti?"
  köprüsü (`<a href="v3-tanitim/index.html">`).
- `app/core/render.js` → başlangıç ekranı rozeti **v3.0**.

**Durum:** ✅ Yapıldı (commit `b9387f5`, `f91b9d4`). Fixture §[8] ve §[9] doğrular.

---

### İ-3 · 85 günlük veri özetleri, grafikler, başarılar (rozetler)
> *"estetik 85 günlük veri özetleri grafikleri başarılar bunlarla zenginleştirelim"*

**Nasıl doğrularsın:** Sayfada `#v3-veri` bölümü; ısı haritası, ruh hâli trendi,
alışkanlık çubukları, rozetler. Kişisel metin (`note`/`journal`/`intention`/`meals`)
**ekrana çıkmamalı**; ruh hâli **etiketi** yazılmamalı (yalnız sayı/renk).

**Durum:** ✅ Yapıldı (`8455695`). **UYARI:** rozetlerden biri hatalı → İ-10/B2.

---

### İ-4 · En üstte 🦩 emojisi, tuhaf kuşu kaldır
> *"🦩 — en üstte de bu emojiyi kullan o tuhaf kusu kaldır"*

**Nasıl doğrularsın:** Hero'da SVG flamingo **yok**; tek emoji 🦩.

**Durum:** ✅ Yapıldı (`b9387f5`).

---

### İ-5 · seyma-data'nın GERÇEK verileriyle gelişmiş matematik + premium tasarım
> *"seyma data reposundaki gerçek ve tam verileri anlamlı istatistikler haline getir
> çok daha gelişmiş esttetik premium bir tasaırım istiyorum sayılar gelişmiş matematik
> ve gerçek verilerle yapmalısın"*

**Repo linki (kullanıcının verdiği):** https://github.com/mustafaras/seyma-data

**Nasıl doğrularsın:** `v3-stats.js` gerçek matematik yapıyor mu (örneklem SS n−1,
tip-7 çeyrekler, IQR/Tukey, en küçük kareler + R², Pearson r, hareketli ortalama
pencere kuralı). Sonra **her gösterilen sayıyı bağımsız olarak yeniden hesapla**
(bkz. §6'daki hazır komut) ve sayfayla karşılaştır.

**Durum:** ✅ Yapıldı (`2a12541`) — ama **okuma yolu yanlıştı** → İ-8.

---

### İ-6 · Hero'nun daha pro/premium/ortalanmış/vurgulu olması
> *"bu görseldeki kısmın çok daha pro premium ortalı ve vurgulu olmasını istiyorum"*

**Nasıl doğrularsın:** `.v3-hero{text-align:center}` + `> *{margin:auto}`; flamingo
halesi, altın parıltı süpürmesi, ortalanmış elmaslı ayraç; kontrast ≥4.5:1.

**Durum:** ✅ Yapıldı (`08e618c`).

---

### İ-7 · **"Hedefleri tutturabildin mi" kısmı yanlış** ← ⚠️ KRİTİK
> *"Hedefleri tutturabildin mi — bu kısım doğru verilerler yazmıyosun şeyma datadaki
> tüm 84 gün verilerle bu sayfadaki verileri de DOĞRU NET KESİN SEYMA DATA VERİLERİYLE
> OLUŞTURMALISIN"*

**Nasıl doğrularsın:**
1. `#v3-ist-goals` panosunun etiketleri **sabit metin değil**, `goals.thresholds`'tan
   üretilmeli (`v3-statsview.js` → `tr(th.steps) + ' adım ve üzeri'`).
2. Adım hedefi **9000** olmalı — **4500 DEĞİL**. 4500 yalnızca *tikin* eşiğidir
   (`STEP_TICK_MIN`); **hedef** `health.js stepsGoal()` = 9000 (tatilde 12000/9000/5000).
3. Payda **yalnız o ölçümün kaydedildiği günler** olmalı; boş gün 0 sayılmamalı.

**Durum:** ✅ Düzeltildi (`621493c`). Kanıt: uyum **%55 → %10** (5/51).
**Bu kısım kullanıcının en çok şikâyet ettiği yerdir — ilk buraya bak.**

---

### İ-8 · **"hâlâ yanlış — bu verileri kullanmalıyız"** ← ⚠️ KRİTİK
> *"hala yanlış https://github.com/mustafaras/seyma-data bu verileri kullanmalıyız"*

**Kök neden (önceki ajan tespit etti):** Sayfa **yalnız** tarayıcı deposunu
(`localStorage['seyma-reset-v1']`) okuyordu. Uygulama açılışta uzak veriyi
**ÇEKMİYOR** — yalnız kendi verisini **GÖNDERİYOR** (`sync.js schedule`). Yani
deposu boş/bayat olan cihazda sayfa eksik/yanlış görünüyordu.

**Nasıl doğrularsın:**
```bash
grep -n "hasLocalData\|creds()\|fetchLatest\|git/blobs" v3-tanitim/v3-source.js
grep -n "if (!creds())" v3-tanitim/v3-source.js     # politika: repo esastır
```
Sonra §6'daki senaryo testini çalıştır: **bayat 3 günlük cihaz verisi + token →
sayfa 84 gün göstermeli.**

**Durum:** ✅ Düzeltildi (`d2fbb55`, `4a691be`) — `v3-source.js` salt-okur köprü.
**⚠️ Bu, önceki ajanın EN SON düzelttiği şeydir ve kullanıcı hâlâ "hatalı gibi"
dedi. İlk işin bunu kendi gözünle doğrulamak olsun (§6).**

---

### İ-9 · **"ÇALIŞTIR GÖREYİM YİNE HATALI GİBİ"** ← ⚠️ KRİTİK, AÇIK
> *"ÇALIŞTIR GÖREYİM YİNE HATALI GİBİ"*

**Bu istek TAM ÇÖZÜLMEDİ.** Önceki ajan sayfayı çalıştırdı ve şunu buldu:
sayfa **baktığın tarayıcının** verisini gösteriyor; o tarayıcıda token yoksa sayılar
farklı çıkıyor ve sayfa bunu **söylemiyordu**.

**Yapılan:** `#v3-veri-src` **veri kaynağı rozeti** eklendi (`4a691be`):
- `remote` → "✓ Eşitlenmiş veri · kendi özel veri deposundan salt-okur okundu"
- `device` → "Bu cihazdaki kayıt · eşitlenmiş veriye ulaşılamadı"
- `none` → rozet `hidden`

**Ama kullanıcının cihazında ne olduğu DOĞRULANMADI.** Senin yapman gerekenler:
1. §6'daki senaryoları çalıştır — köprü gerçekten çalışıyor mu?
2. Kullanıcıdan **rozetin ne yazdığını** isteyin; "eşitlenmiş veri" yazmıyorsa
   token/`ghRepo` ayarına bak (uygulama → Ayarlar → Eşitleme).
3. **Gün sayısı 84 olmalı, 85 değil** (bkz. §4). Sayfa hâlâ bir yerde 85 diyorsa
   bul ve düzelt.

---

### İ-10 · **"istediklerimi düzgün yapamadın — devir promptu yaz"**
> *"senden istediklerimi düzgün yapamadın claude a devredeceğim ... TUM BU
> KONUSMADAKİ SENDEN İSTEDİKLERİMİ KONTROL EDECEK VE DOGRUSUNU UYGULAYACAK ŞEKİLDE
> OLMALI"*

Bu belge o isteğin karşılığıdır. **Senin görevin: yukarıdaki İ-1…İ-9'u tek tek
doğrulamak ve yanlış olanı uygulamak.**

---

## 4. Gerçek veri — referans değerler (2026-09-15)

Kaynak: `https://github.com/mustafaras/seyma-data` → `data/latest.json`
(**PRIVATE repo, salt-okur**). Önceki ajan bu dosyayı `gh` CLI ile okudu ve
doğruladı. **Sen de oku ve doğrula:**

```bash
mkdir -p /tmp/sv && cd /tmp/sv
gh api "repos/mustafaras/seyma-data/contents/data/latest.json" \
  -H "Accept: application/vnd.github.raw" > latest.json
node -e "
const d=JSON.parse(require('fs').readFileSync('latest.json','utf8'));
const ks=Object.keys(d.days).sort();
console.log('startDate:', d.startDate);
console.log('ilk gun  :', ks[0], '| son gun:', ks[ks.length-1]);
console.log('gun sayisi:', ks.length);
const inc=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/86400000)+1;
console.log('dayIndexFor (uygulama formulu):', inc(d.startDate,'2026-09-15'));
console.log('nickname :', JSON.stringify((d.settings||{}).nickname));
console.log('ghToken  :', (d.settings||{}).ghToken!==undefined?'VAR (KÖTÜ!)':'YOK (sanitize edilmis)');
"
```

**Doğrulanmış gerçekler:**

| Alan | Değer | Not |
|---|---|---|
| `startDate` | `2026-06-24` | ilk kayıtlı gün de bu |
| son gün | `2026-09-15` | boşluk yok |
| **gün sayısı** | **84** | **85 DEĞİL** |
| `dayIndexFor` (uygulama) | **84** | `dateUtils.js: diffDays(start,date)+1` |
| `nickname` | `"Sevgili Günışığı"` | uzak veriden de gelir |
| `settings.ghToken` | **YOK** | `sync.js sanitize()` temizliyor ✓ |
| `settings.ghRepo` | `mustafaras/seyma-data` | |
| `targets.*` | hepsi `null` | `activityLevel:"moderate"` |
| `vacation.enabled` | `false` | (pencere 2026-07-21→28, kullanılmıyor) |

### ⚠️ Tuzak: tik sayısı 679, 681 DEĞİL

Ham sayım (`Object.keys(r.habits)` ile) **681** verir — **yanlıştır**. Çünkü veride
kullanımdan kalkmış `veggie` anahtarından **2 bayat tik** vardır.

**Doğru:** yalnız `app.js HABITS[]` içindeki **15 aktif** alışkanlığı say →
**679**. `v3-data.js` bu yüzden `HABIT_KEYS`'i sabit tutar ve fixture bunu
`app.js HABITS[]` ile **birebir** karşılaştırır.

```bash
node -e "
const d=JSON.parse(require('fs').readFileSync('/tmp/sv/latest.json','utf8'));
const K=['sweetManaged','foodManaged','coffeeManaged','eveningControl','walked20','protein','water','vitaminD','sleepReg','journaled','mediaFed','freshAir','selfKind','caffeineOk','magnesium'];
let n=0; Object.values(d.days).forEach(r=>{ if(r&&r.habits) K.forEach(k=>{ if(r.habits[k]) n++; }); });
console.log('DOGRU tik sayisi:', n);   // 679
"
```

**Alışkanlık notu:** `since` yalnız **7** tanesinde var → ilk gün **8**, bugün **15**
aktif alışkanlık. `habitCountOn(date)` bunu gün gün hesaplar.

---

## 5. Sayfadaki sabit iddialar — DOĞRULANDI ✓

Bunları **sen de** doğrula (`§7`'de komut var). Hepsi **doğru** çıktı:
| Sayfa iddiası | Gerçek | Durum |
|---|---|---|
| `114 sûre` | `quranRevelationOrderV1.surahs.length` = 114 | ✓ |
| `99 esmâ` | `esmaulHusnaV1.names.length` = 99 | ✓ |
| `100 öncü` | `saygiPeople.js` içinde `name:\s*'` sayısı = 100 | ✓ |
| `30 çekirdek modül` | `ls app/core/*.js \| wc -l` = 30 | ✓ |
| `11 içerik dosyası` | `ls app/content/*.js \| wc -l` = 11 | ✓ |
| `13.139 → 7.610 satır · %42` | `shell-inventory` = 7610; (13139−7610)/13139 = **%42,08** | ✓ |
| `192 sahne` | 4 zaman × 8 hava × 6 mevsim | ✓ |

> **Satır sayımı tuzağı:** `wc -l app.js` **7609** der, `shell-inventory` **7610**.
> Fark: dosya sonu yeni satırı. **Kanonik olan `shell-inventory`'dir** → `7.610`.

**Tek komutla doğrula:**
```bash
node -e "
const fs=require('fs'),vm=require('vm');
function load(f,g){const sb={window:{},console};sb.window=sb;
  try{vm.runInNewContext(fs.readFileSync(f,'utf8'),sb,{filename:f});}catch(e){return null;}
  return sb.window[g];}
const q=load('app/content/quranRevelationOrderV1.js','QuranRevelationOrderV1');
const e=load('app/content/esmaulHusnaV1.js','EsmaulHusnaV1');
console.log('114 sure :', q && q.surahs ? q.surahs.length : '?');
console.log('99 esma  :', e && e.names ? e.names.length : '?');
console.log('100 oncu :', (fs.readFileSync('app/content/saygiPeople.js','utf8')
  .match(/name:\\s*'/g)||[]).length);
"
ls app/core/*.js | wc -l      # 30
ls app/content/*.js | wc -l   # 11
node tools/shell-inventory.mjs 2>/dev/null | grep -m1 'toplam satır'   # 7610
```

---

## 6. ZORUNLU: köprüyü kendi gözünle doğrula

Bu, kullanıcının "hâlâ yanlış" şikâyetinin kalbidir. **Çalıştırmadan "tamam" deme.**

```bash
cd /Users/m_ras/Desktop/seyma
cat > /tmp/bridge-test.js <<'EOF'
const fs=require('fs'),vm=require('vm');
const read=f=>fs.readFileSync('/Users/m_ras/Desktop/seyma/'+f,'utf8');
const real=JSON.parse(fs.readFileSync('/tmp/sv/latest.json','utf8'));

function run(label,opts){
  const nodes={}; const mk=id=>({id,textContent:'',innerHTML:'',attrs:{},hidden:false,
    setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},
    removeAttribute(k){delete this.attrs[k];}});
  ['v3-lead','v3-counter-num','v3-counter-ordinal','v3-counter-note','v3-veri-baslik',
   'v3-kapanis-baslik','v3-footer-days','v3-veri','v3-veri-body','v3-veri-stats',
   'v3-veri-heat','v3-veri-mood','v3-veri-habits','v3-veri-badges','v3-veri-greeting',
   'v3-veri-heat-cap','v3-istatistik','v3-istatistik-body','v3-veri-src','v3-ist-honest'
  ].forEach(i=>nodes[i]=mk(i));
  const store=new Map();
  if(opts.stored!==undefined) store.set('seyma-reset-v1',JSON.stringify(opts.stored));
  let calls=[];
  const sb={console,Date,JSON,Math,Number,String,Boolean,Array,Object,isNaN,TextDecoder,
    Uint8Array,setTimeout,clearTimeout,
    atob:s=>Buffer.from(s,'base64').toString('binary'),
    AbortController:class{constructor(){this.signal={};}abort(){}},
    window:{},document:{readyState:'complete',getElementById:id=>nodes[id]||null,
      querySelectorAll:()=>[],addEventListener(){}},
    localStorage:{getItem:k=>store.has(k)?store.get(k):null}};
  sb.window=sb; sb.window.localStorage=sb.localStorage;
  sb.window.matchMedia=()=>({matches:false}); sb.matchMedia=sb.window.matchMedia;
  sb.fetch=(url,o)=>{ calls.push((o&&o.method)||'GET');
    if(opts.fail) return Promise.reject(new Error('offline'));
    if(String(url).includes('/contents/')) return Promise.resolve({ok:true,
      text:()=>Promise.resolve(JSON.stringify({sha:'abc',encoding:'none',content:''}))});
    if(String(url).includes('/git/blobs/')) return Promise.resolve({ok:true,
      text:()=>Promise.resolve(opts.blob||JSON.stringify(real))});
    return Promise.resolve({ok:false,text:()=>Promise.resolve('')}); };
  sb.window.fetch=sb.fetch;
  ['v3-data.js','v3-stats.js','v3-statsview.js','v3-charts.js','v3-source.js']
    .forEach(f=>vm.runInNewContext(read('v3-tanitim/'+f),sb,{filename:f}));
  return new Promise(r=>setTimeout(()=>{
    const s=sb.window.SeymaV3Data.summarize(), d=sb.window.SeymaV3Data.dynamic();
    r({label,calls:calls.length,methods:[...new Set(calls)],
       day:d&&d.dayCount, days:s.daysRecorded, ticks:s.ticks,
       src:nodes['v3-veri-src'].attrs['data-src'],
       badge:nodes['v3-veri-src'].textContent.slice(0,44),
       hero:nodes['v3-lead'].textContent.slice(0,30),
       state:nodes['v3-veri'].attrs['data-state']});
  },60));
}

const TOKEN={days:{},settings:{ghToken:'T',ghRepo:'mustafaras/seyma-data',ghBranch:'main'}};
const STALE={startDate:Object.keys(real.days).sort()[0],
  days:Object.fromEntries(Object.keys(real.days).sort().slice(0,3).map(k=>[k,real.days[k]])),
  settings:TOKEN.settings};
/* Token VAR ama cihazda da GERÇEK veri var → ağ düşerse cihaza düşülür,
   rozet 'device' olur. (Token'sız boş depo ile karıştırma!) */
const DEVICE=JSON.parse(JSON.stringify(real));
DEVICE.settings={ghToken:'T',ghRepo:'mustafaras/seyma-data',ghBranch:'main'};

(async()=>{
  const R=[];
  R.push(await run('A) depo bos + token YOK → aga CIKMAMALI', {stored:{days:{},settings:{}}}));
  R.push(await run('B) depo BAYAT(3 g) + token → repo verisi gelmeli', {stored:STALE}));
  R.push(await run('C) depo bos + token → repo verisi gelmeli', {stored:TOKEN}));
  R.push(await run('D) ag hatasi + cihazda veri VAR → cihaza dusmeli', {stored:DEVICE,fail:true}));
  R.push(await run('E) uzak veri BOZUK + cihazda veri VAR → cihaza dusmeli', {stored:DEVICE,blob:'{bozuk'}));
  R.push(await run('F) uzak BOZUK + cihaz BOS → sahte sayi OLMAMALI', {stored:TOKEN,blob:'{bozuk'}));
  console.log('=== KOPRU SENARYOLARI ===');
  R.forEach(r=>{ console.log('\n'+r.label);
    console.log('  fetch:',r.calls,'| yontem:',r.methods.join(',')||'-');
    console.log('  gun:',r.day,'| kayitli:',r.days,'| tik:',r.ticks,'| durum:',r.state);
    console.log('  rozet:',r.src,'—',JSON.stringify(r.badge));
    console.log('  hero :',JSON.stringify(r.hero)); });
  const ok =
    R[0].calls===0 && R[0].src==='none' &&
    R[1].calls>=1 && R[1].day===84 && R[1].days===84 && R[1].ticks===679 && R[1].src==='remote' &&
    R[2].calls>=1 && R[2].day===84 && R[2].ticks===679 && R[2].src==='remote' &&
    R[3].calls>=1 && R[3].day===84 && R[3].src==='device' &&
    R[4].calls>=1 && R[4].day===84 && R[4].src==='device' &&
    R[5].day===null && R[5].ticks===0 && R[5].src==='none' &&
    R.every(r=>r.methods.every(m=>m==='GET'));
  console.log('\nSONUC:', ok ? 'PASS — kopru dogru calisiyor'
    : 'FAIL — yukaridaki satirlari incele ve DUZELT');
  process.exitCode = ok?0:1;
})();
EOF
node /tmp/bridge-test.js; echo "exit=$?"
```

**Beklenen:** `B` satırı **84 gün / 679 tik / `remote`** göstermeli. Göstermiyorsa
İ-8 **çözülmemiş** demektir → `v3-source.js`'i düzelt.

---

## 7. Kanonik doğrulama protokolü

**Hiçbir değişiklikten sonra "tamam" demeden önce bunları çalıştır:**

```bash
cd /Users/m_ras/Desktop/seyma

# Ana fixture (284 kontrol) — bu sayfanın sözleşmesi
node tests/app/test_v3_welcome.js

# Tüm aileler (regresyon)
for d in tests/app tests/panel tests/panel-v2 tests/quran; do
  for f in $d/*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL: $f"; done
done
node tests/reminders/run-reminder-smoke.mjs

# Uygulama harness'ları (sayfa app.js'e dokunmamalı — pinler)
node .claude/skills/run-seyma/driver.mjs; echo "driver exit=$?"
node .claude/skills/run-seyma/zikr-harness.mjs
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs

# Satır bütçesi (DONDURULDU — 7800/0/450/150)
node tools/shell-inventory.mjs --gate

# Sözdizimi
for f in v3-tanitim/*.js app.js sync.js; do node --check "$f" || echo "SYNTAX FAIL $f"; done
```

**Beklenen taban (2026-09-15):**
`tests/app 53/53` · `panel 23/23` · `panel-v2 27/27` · `quran 9/9` · `reminders OK` ·
`driver exit 0` · `zikr 95/95` · `B1/B2/B3 OK` · `shell-inventory --gate PASS` ·
`test_v3_welcome 284 kontrol PASS`

### Kritik pinler — BUNLARI KAYDIRMA

| Pin | Değer | Kim doğrular |
|---|---|---|
| `App.x=function` (app.js kök) | **554** | `test_v3_welcome` §[6] |
| App yüzeyi | **718** | `test_fx2_overlay_motion.js`, `test_fx2_tab_transition.js`, `test_fx2_touch_coverage.js` |
| `onclick=` sayısı | **391** | aynı üç fx2 fixture'ı |

> ⚠️ **TUZAK:** fx2 fixture'ları bu sayıları **düz metin taraması** ile bulur ve
> **yorumları da sayar**. `app/core/settings.js` / `render.js` bu taramaya dâhildir.
> Bir yorumda `App.<ad>=` yazmak veya tıklama niteliği adını geçirmek **pini
> kaydırır** ve 3 fixture'ı düşürür. (Önceki ajan bunu bir kez yaşadı.)

---

## 8. Bilinen eksikler — B1 ve B2 kullanıcı onayıyla DÜZELTİLDİ (2026-09-15, Claude)

> **Durum:** B1 → `v3-data.js` rozeti "Tüm alışkanlıklar (15/15)"; B2 → dört
> bayat "4.500" metni (`appSurface.js:76`, `app.js derivedProgText`,
> `setWalkSteps` toast'ı, HABITS başlığı) gerçek `stepsGoal` hedefine çekildi.
> Kanıt: tik `habitProgress → stepsGoal(date)` ile dolar; `STEP_TICK_MIN=4500`
> hiçbir yerde okunmaz; gerçek veride 24 Temmuz'dan beri 4.500–7.250 adımlı
> hiçbir gün tiklenmemiş, 9.000+ günler tiklenmiş. B3 açık (uygulama kapsamı).
> Aşağısı tarihsel tespit metnidir.

Bunlar önceki ajan tarafından **bulundu ama düzeltilmedi** (pinned yüzeylere
dokunuyorlar; kullanıcı onayı + dikkatli pin muhasebesi gerekiyor).

### B1 · Sayfa rozeti: `'7/7 mükemmel'` yanlış etiket
**Dosya:** `v3-tanitim/v3-data.js:384`

**Sorun:** Rozet adı "7/7" ama karşılaştırma `countRec(rec) >= habitCountOn(date)`
→ bugün **15** (ilk gün 8). Gerçek veride en yüksek tik **12** → bu rozet
**asla kazanılamaz**. Etiket **7 alışkanlıklı dönemden** kalmış.

**Kanıtla:**
```bash
grep -n "7/7 mükemmel" v3-tanitim/v3-data.js app/core/report.js
# ikisinde de: countRec(r) >= habitCountOn(date)
node -e "
const d=JSON.parse(require('fs').readFileSync('/tmp/sv/latest.json','utf8'));
let max=0; Object.values(d.days).forEach(r=>{ if(!r||!r.habits) return;
  const n=Object.keys(r.habits).filter(k=>r.habits[k]).length; if(n>max) max=n; });
console.log('gercek en yuksek tik:', max, '→ 15 gerekli, kazanilamaz');
"
```

**Düzeltme önerisi:** etiketi gerçek paydaya göre üret:
`habitCountOn(date) + '/' + habitCountOn(date) + ' mükemmel'` → ör. `"15/15 mükemmel"`.
Sayfa, uygulamayı **aynalamalı** ama **yanlış etiketi kopyalamamalı**.

### B2 · Uygulama metni: `4.500+ adım` (gerçek hedef 9000)
**Dosya:** `app/core/appSurface.js:76`
`walked20:'Yürüyüş tamam — 4.500+ adım. …'`

**Sorun:** Gerçek eşik `stepsGoal(date)` = **9000** (tatilde 12000/9000/5000).
Aynı dosyanın 96–98. satırları `stepsGoal`'u **doğru** kullanıyor → tutarsızlık.

**Kanıtla:**
```bash
grep -n "walked20" app/core/appSurface.js
grep -n "function stepsGoal" app/core/health.js
```

**⚠️ Dikkat:** `appSurface.js` fx2 pin taramasına dâhildir. Düzeltirken
`App.<ad>=` veya tıklama niteliği adı **yazma**; sonra üç fx2 fixture'ını çalıştır.

### B3 · Uygulamanın kendisi uzaktan veri çekmiyor
**Bağlam:** `app.js` açılışta `SeySync.schedule` ile yalnız **push** eder. Çok
cihazlı senaryoda depo bayat kalabilir. Bu iş kapsamı **dışında**, ama
kullanıcının yaşadığı semptomun kökü budur → **kullanıcıya bildir**.

---

## 9. Sayfa mimarisi (hızlı harita)

```
v3-tanitim/
  index.html      Kabuk. <div id="root" data-theme="dark"> ZORUNLU (tokenlar
                  app/styles.css'te #root üzerinde; :root DEĞİL).
                  Bölümler: hero → #v3-milestone → #v3-yenilikler →
                  #v3-galeri → #v3-rakamlar → #v3-veri → #v3-istatistik →
                  #v3-kapanis → footer
  v3.css          Tüm sayfa stilleri. 14 keyframe; hepsi reduced-motion'da kapanır.
  v3.js           Kalıcılık + scroll-reveal + sayaç + konfeti + ilerleme çubuğu.
                  AĞ YOK.
  v3-data.js      SALT-OKUR veri katmanı. localStorage'a YAZMAZ (setItem YOK).
                  AĞ YOK. SOURCE durumunu izler (remote/device/none).
                  Gün sayısını startDate'ten TÜRETİR.
  v3-stats.js     Saf matematik motoru (SS n−1, tip-7 çeyrek, IQR/Tukey,
                  en küçük kareler+R², Pearson, hareketli ortalama).
  v3-statsview.js İstatistik görselleştirme. KARARLI yazı yok — etiketler
                  okunan eşikten üretilir.
  v3-source.js    SALT-OKUR uzak köprü. TEK ağ noktası. Yalnız GET.
                  1 MB üstü dosya için git/blobs yedeği + UTF-8 TextDecoder.
  v3-charts.js    Grafik çizimi + kaynak rozeti. AĞ YOK.
```

**Yükleme sırası (KORU):**
`v3-data.js` → `v3-stats.js` → `v3-source.js` → `v3-statsview.js` →
`v3-charts.js` → `v3.js`

`v3-source.js` `window.SeymaV3Source`'u kurar; `v3-charts.js` onu görürse
boot'u **ona devreder** (`autoboot()` → `if (window.SeymaV3Source) return;`).
Kaynak modül yoksa sayfa tek başına çalışır.

---

## 10. Tuzaklar (her biri en az bir kez yaşandı)

1. **`#root data-theme="dark"` zorunlu.** Tokenlar `:root`'ta değil `#root`'ta
   tanımlı (`app/styles.css`). Ayrı sayfada `body` `#root`'un üstündedir →
   `var(--bg)` çözülmez.
2. **Renkli emojiye `color` verme** — 🦩 emojisi bozulur. Yalnız boyut/gölge/hareket.
3. **fx2 pin taraması yorumları sayar** → yorumda `App.<ad>=` yazma.
4. **`chartsSource`/`statsSource` TDZ tuzağı** — fixture'ın ileri bölümlerinde
   tanımlanır. Erken bölümde kullanırsan `Cannot access before initialization`
   alırsın. Yerine `read('v3-tanitim/v3-charts.js')` ile satır içi oku.
5. **CSS değişince `?v=` bump et** — fixture cache-bust'ı doğrular.
6. **`85` sabit yazma** — veriden türet. Statik HTML yalnız *varsayılan* taşır
   (JS kapalıyken de doğru görünmesi için).
7. **`veggie` bayat anahtarı** — ham tik sayımı 681 verir; doğrusu **679**.
8. **`STEP_TICK_MIN (4500)` ≠ `stepsGoal (9000)`** — tikin eşiği ile hedefi
   karıştırma. Kullanıcının ilk şikâyeti buydu.
9. **`wc -l` (7609) ≠ `shell-inventory` (7610)** — kanonik olan `shell-inventory`.
10. **`app.js` `save()` ham veriyi yazar** (token dâhil) → köprü token'ı
    `localStorage`'tan okuyabilir. `sync.js sanitize()` yalnız **push**'ta temizler,
    depo verisinde `ghToken` **yoktur** (doğrulandı ✓).

---

## 11. Kabul kriterleri — "bitti" demek için

Hepsi **aynı anda** doğru olmalı:

- [ ] `node /tmp/bridge-test.js` → **PASS** (B satırı: 84 gün / 679 tik / remote)
- [ ] `node tests/app/test_v3_welcome.js` → **PASS** (≥284 kontrol)
- [ ] Tüm fixture aileleri yeşil (app 53 / panel 23 / panel-v2 27 / quran 9 / reminders)
- [ ] `driver.mjs` **exit 0** · `zikr-harness` 95/95 · B1/B2/B3 OK
- [ ] `node tools/shell-inventory.mjs --gate` → **PASS** (7610/0/408/57)
- [ ] fx2 pinleri **korundu**: App yüzeyi **718**, `onclick=` **391**
- [ ] `git diff --name-only` → `app.js`/`sync.js`/`app/`/`panel/` **hiç değişmedi**
      (B2'yi kullanıcı onayıyla düzeltmediysen)
- [ ] Sayfada **hiçbir `85` / `23 Haziran`** kalmadı — statik varsayılan artık
      gerçek `startDate`'e sabit (**24 Haziran 2026 / 84**), JS yine veriden düzeltir
      ```bash
      # 2026-09-15 düzeltmesi: statik metin "23 Haziran / 85" diyordu — gerçek
      # veriyle bir gün sapıyordu ve veri/token olmayan tarayıcıda JS bunu
      # düzeltemiyordu (kullanıcının gördüğü "yine hatalı" ekranı buydu).
      grep -rn "85\. gün\|85 gün\|Seksen beş\|23 Haziran" v3-tanitim/   # → 0 satır
      # Statik varsayılan: 5 ID'li düğüm (hero + sayaç + veri başlığı + kapanış + footer)
      grep -rn "84\. gün\|84 gün\|Seksen dört" v3-tanitim/index.html | grep -c 'id='   # 5
      ```
- [ ] `#v3-veri-src` rozeti gerçek kaynağı söylüyor
- [ ] Gerçek veri `/tmp`'den **silindi** · çalışan sunucu **yok**
- [ ] `git status --short` **temiz** · **push edilmedi**

**Cihaz kabulü (K3) yalnız kullanıcıdan gelir.** Sen "kullanıcının telefonunda
düzeldi" diyemezsin — yalnız "kaynak/QA kanıtı ürettim, cihazı sen doğrula" dersin.

---

## 12. Git / yayın kuralları

- Dal: **`premium-fx-gorsel-yuzey`** — **LOCAL-ONLY**.
- **Push YOK · merge YOK · tag YOK · deploy YOK** — kullanıcı **açıkça** onaylamadan.
- `main`'e push GitHub Pages'i yayına alır (`.github/workflows/pages.yml`, build yok,
  test kapısı yok) → **çok dikkatli ol**.
- Commit mesajları: kısa, **Türkçe**, yapılanı anlatır (mevcut üslup).
- Her commit'te `.anti-amnesia/` defterleri ve durum JSON'ları **güncel** olmalı
  (proje kuralı — bkz. `CLAUDE.md`).

---

## 13. İlk yapılacaklar listesi (senin için)

1. §1'deki **zorunlu okumayı** yap.
2. `/tmp/sv/latest.json`'ı çek (§4) → referans değerleri **doğrula**.
3. `node /tmp/bridge-test.js` çalıştır (§6) → **PASS mi?**
   - **Değilse:** `v3-source.js`'i düzelt → İ-8'in gerçekten çözüldüğünden emin ol.
   - **Öyleyse:** İ-9'nun kalanını ele al (kullanıcı cihazı + tek kalan `85`).
4. `node tests/app/test_v3_welcome.js` ve tüm aileleri çalıştır (§7).
5. `#v3-ist-goals` panosunu **elle** kontrol et (İ-7): adım hedefi **9000** mi?
   Etiketler **okunan eşikten** mi üretiliyor?
6. **Sabit `85` avı:** `grep -rn "85\. gün\|85 gün\|Seksen beş" v3-tanitim/`
7. B1 (rozet etiketi) ve B2 (`4.500+` metni) için **kullanıcıdan onay iste**;
   onaylarsa düzelt ve pinleri yeniden doğrula.
8. Kullanıcıya **kanıtla** raporla: hangi sayı hangi kaynaktan geldi,
   hangi fixture kaç kontrol geçti, ne doğrulanamadı (cihaz!).
9. **Temizlik:** `/tmp/sv` ve `/tmp/bridge-test.js` sil · sunucu varsa durdur.

---

## 14. Kullanıcının verdiği linkler

- **Veri deposu (PRIVATE, salt-okur):**
  https://github.com/mustafaras/seyma-data
  → dosya: `data/latest.json` (2,2 MB — Contents API gövdeyi **boş** döndürür,
  `git/blobs/<sha>` kullan)
- **Uygulama kodu (PUBLIC):** https://github.com/mustafaras/s
- **Sayfa (deploy edilirse):** `https://mustafaras.github.io/s/v3-tanitim/`

---

## 15. Özet — tek paragrafta ne istendi

Kullanıcı, Şeyma'nın **3.0 sürümü** için **tek seferlik**, **flamingo temalı**,
**görsel olarak zengin**, **kutlama havasında** bir tanıtım sayfası istedi; bu sayfa
kullanıcının **kendi gerçek verisini** (`mustafaras/seyma-data`, 2026-06-24'ten
bugüne **84 gün**) kullanarak **gelişmiş istatistikler** ve **premium grafikler**
göstermeli; uygulamanın içinde de **v3.0** yazmalı. Kullanıcı, gösterilen sayıların
**repo'daki gerçek verilerle birebir** olmasını **iki kez** vurguladı ve sonuçtan
**memnun kalmadı**. Senin işin: **her isteği tek tek doğrula**, yanlışı düzelt,
kanıt üret. **"Yaptım" demek yetmez — ölç ve göster.**

---

*Bu belge 2026-09-15'te, önceki ajanın çalışması (`d2fbb55`, `4a691be`, `878d90c`)
ve gerçek `seyma-data` doğrulaması temel alınarak yazıldı.*
