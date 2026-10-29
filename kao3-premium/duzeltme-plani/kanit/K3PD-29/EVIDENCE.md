> Yöntem düzeltmesi: Bu genel çekimler sırasında onboarding denetimi, boş sentetik profilde parola alanının DOM’da var olup olmadığını sorguladı; parola değeri okunmadı veya doldurulmadı, gerçek profil kullanılmadı. Alanın kendisine otomasyonla erişmeme sınırı bakımından bu sorgu sorunludur; genel çekim aracından kaldırıldı. Ham sonuçlar korunur ve bu yöntem G4 uyumlu diye sunulmaz.

# K3PD-29 — Gerçek iki tema, geometri ve zor glif görsel QA

> **Güncel yönlendirme · 2026-10-29:** Aşağıdaki 2026-10-26 özeti ve hükümleri tarihsel anlık kayıttır. Daha sonra kullanıcı yetkisiyle `app/kao.css`, `app/core/quranLearnViews.js` ve `app/core/quranLearn.js` üzerinde CTA/kontrast, scroll ve odak düzeltmeleri yapıldı; aşağıdaki “üretim değişmedi / allowlist dışı / tek kusur” ifadeleri güncel çalışma ağacını tarif etmez. Ham geçmiş değiştirilmemiştir. Güncel kanıt ve açık sınırlar için [v11 ve ek kanıtlar](v11-20261028/README.md), [sahne incelemesi düzeltmesi](v11-20261028/SAHNE-INCELEME-DUZELTME-20261029.md) ve [güncel durum](../../GUNCEL-DURUM.md) esas alın. Son kart kabulü ve yayın henüz yapılmadı.

Tarih: 2026-10-26 · Branch: `k3pd-denetim-duzeltmeleri` · Kart tabanı (baseHead): `35478e6b931aac37a867732070bf4b4b19f0691b`

Bu kart bir **ölçüm ve kanıt** kartıdır. Üretim davranışı (`app.js`, `app/core/*`, `app/content/*`,
`app/*.css`, `sw.js`, `index.html`), `migrate()`, `sync.js` ve `App.kao*` (45) **değişmedi**.
Değişen tek üretim-dışı araç kümesi: çekim aracı, kanıt sözleşmesi modülü, `cdp.mjs`'e geriye
uyumlu ölçüm seçenekleri ve yeni fixture.

## 1. Özet hüküm

| Alt kabul | Hüküm | Kanıt |
|---|---|---|
| 6 kombinasyonda **gerçek tema** doğrulaması (320/390/460 × açık/koyu) | **PASS** | 7 koşum, 7/7 etiket=ölçüm=**log.txt**; §4 |
| Onboarding de ölçüm kapsamında, kendi temasıyla | **PASS** | 7/7 koşumda 7 onboarding sahnesi, tema=koşum teması; §5 |
| Bütün ana/onboarding sahnelerinde **screenshot = log = manifest** | **PASS (bounded)** | 518 satır / 518 görüntü / 518 log; hash bayt-eş; `issues.txt` **türetilmiş** tanıktır (bağımsız değil). Envanterin mutlak tabanı YOKTUR — kart ekran sayısını sabitlemeyi yasaklar. §3, §11 |
| Beklenmeyen overflow/clipping **0** | **PASS** | 0 `SERT:` bulgu (518 satır), log'daki `hard=` kümesiyle birebir; chunk yürüyüşü + RIFF/IEND bütünlüğü; §6 |
| CTA ≤8 px (sahne içi kararlılık) | **PASS** | 7/7 koşum, **42/42 CTA satırı**, maxDelta **0 px**; §7.1 |
| CTA görünürlük / örtüşmeme (iki eksen) | **FAIL — 1 gerçek üretim kusuru** | §7.2: `l25-summary`; yatay eksen kapısı §7.32 |
| Yapışkan altbilgi ↔ içerik erişilebilirliği | **NOT_MEASURED** | İki okuma ayırt edilemedi; §7.3 |
| 30 zor glif okunabilir **önce/sonra** karşılaştırma | **PASS** | Gerçek eski build referansı; görüntüler diskten hash'lenir; tema **log.txt**'ten, font kanıtı `loaded=/woff2=/distinct=/check=` ile çapalı; §8 |
| Kapı sertliği (ölçüm kırılması ↔ üretim bulgusu) | **PASS** | `failures` → `exit 1`; `findings` → `exit 0`; CTA sözleşmesi hem `--dogrula` hem `--kapsam`'da; §7.4/§7.24/§7.25/§7.26/§7.28/§7.29/§7.30/§7.31/§7.32/§7.33/§7.34/§7.35/§7.36/§7.37/§7.38/§7.39/§7.40/§7.45 |
| Headless font kanıtı cihaz kabulünden ayrı | **PASS (ayrım korunuyor)** | §8.4 |
| Sunucu/tarayıcı cleanup | **PASS** (sunucu hiç açılmadı) | §9 |

**Kart hükmü: `PARTIAL` + `NOT_MEASURED`.** On bir alt kabulden dokuzu PASS; CTA
görünürlük/örtüşme alt kabulünde **tek, tekrarlanabilir, üretim kaynaklı** kusur var; yapışkan
altbilgi ↔ içerik ilişkisi ise ölçümle **ayırt edilemedi**.

Kusur bu kartın yazma allowlist'i **dışındadır** (üretim davranışı ve `app/kao.css` yasak), bu
yüzden ölçüm gevşetilmedi: kusur olduğu gibi kaydedildi ve düzeltmesi ayrı kart/karar ister.
Araç çıkış kodunu **ikiye ayırır**: *araç hatası* (tema yanlış, eksik görüntü, sayım/hash
uyuşmazlığı) → `exit 1`; *üretim bulgusu* (ölçülen gerçek kusur) → `exit 0` + `FINDING` satırı +
`MANIFEST.json → productionFindings`. Böylece "ölçüm yapılamadı" ile "ölçüm kusur buldu"
birbirine karışmaz ve bulgu gizlenmez. Bu koşumlarda **araç hatası 0, üretim bulgusu 2**.

## 2. F-11'in kök nedeni ve bu kartın kapattığı açıklar

Denetim bulgusu F-11 üç ayrı iddiayı işaret ediyordu:

1. **Açık tema sabit değildi.** Eski araç `dark` argümanı verilmediğinde hiç `setTheme`
   çağırmıyordu; tema "etiket" olarak loglanıyor, ölçülmüyordu.
2. **Onboarding teması hiç seçilmiyordu** ve onboarding çekimleri ayrı bir tarama bloğundaydı.
3. **"474 kaydın aynı kapsamda olduğu" iddiası yanlıştı** — sayı ile kanıt birbirine bağlı
   değildi. Ölçüm (yeniden üretildi): eski `kanit/sonraki/{acik,koyu}-{320,390,460}/log.txt`
   dosyalarında **her koşumda 74 sahne satırı** vardır; 6 × 74 = **444** doğrudur. Yanlış olan
   **474**'tür (6 × 79; altı eski koşumda hiç loglanmayan onboarding sahnelerini de sayıyor).
   Yani "444 kayıt" iddiası doğruydu, "474" değildi.

Bu kartta üçü de yapısal olarak kapatıldı:

- Tema artık **sabitleniyor ve ölçülüyor**: `App.setTheme(false|true)` → root `data-theme` +
  computed `--quran-surface` / `--quran-ink` beklenen token çiftiyle karşılaştırılır. Uymazsa
  çekim `exit 1` ile **başarısız** olur (atlanmaz, SKIP'e yutulmaz).
- Onboarding **ayrı profil, aynı sabit tema** ile ölçülür ve `data-onboarding-theme` de
  doğrulanır. Kritik sıra hatası da düzeltildi: `authUnlocked` **render'dan önce** yazılmazsa
  ekran kilit kapısında kalıyordu; eski çekimlerin onboarding'i aslında **kilit ekranıydı**.
- Her görüntü için **tek manifest satırı** üretilir ve satırdaki `sha256` diskin gerçek baytıyla
  eşleşmek zorundadır. Satır ≠ görüntü ≠ log ise araç `exit 1` verir.

## 3. Kanıt şeması ve sayım eşliği

Modül: [`tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs`](../../../../tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs)

Zorunlu satır alanları (kart: *profil/tema/viewport/sahne/screenshot/log/issues/hash*):
`profile`, `theme`, `viewport{width,height,safeAreaBottom}`, `scene`, `sceneKind`, `screenshot`,
`log[]`, `issues[]`, `sha256`; ölçüm kanıtı olarak ayrıca `verifiedTheme` ve `cta` taşınır.

| Ölçüm | Sonuç |
|---|---|
| Koşum sayısı | 7 (6 zorunlu kombinasyon + 1 sentetik safe-area) + 1 glif referansı |
| Manifest satırı | 518 (7 × 74) + 1 |
| Görüntü dosyası | 519 (hepsi WebP q90, hepsi ≥4096 bayt, hepsi gerçek piksel boyutlu) |
| Satır başına log | 1 (birebir) |
| Hash uyuşmazlığı | 0 |
| Sayım uyuşmazlığı | 0 |
| Diskteki `.webp` toplamı | **520** = 518 koşum görüntüsü (74×7) + 1 glif referansı + 1 kök bileşik görüntü (`GLIF-ONCE-SONRA.webp`). Koşum dizinlerindeki toplam **519**'dur; `--dogrula` 519 satır doğrular, bileşik görüntü manifest satırı taşımaz |
| `issues.txt` iki yönlü eşleşme | 0 eksik, 0 fazla (dosya yoksa `exit 1`). **Not:** `issues.txt` araç tarafından manifestten **türetilir**; bağımsız tanık değildir (§11.9) |
| Ölçülen yakalama ölçeği | ana satırlar **1×**, glif kırpımı **4×** (2× cihaz × 2× kırpım) |
| CTA satırı / kararlılık kaydı | **294 / 294** (42 × 7) |
| Log çapaları (sahne başına) | `theme=`, `surface=`, `vw=`, `vh=`, `inset=`, `hidden=`, `hiddenPx=`, `overflowX=`, `hard=` (+ onboarding'de `node=`/`text=`/`onb=`) — **her satırda** zorunlu ve manifest beyanıyla çapraz doğrulanır. `collisions=`/`collisionPx=`/`ctaW=`/`ctaH=`/`ctaX=`/`ctaR=`/`focus=`/`sel=`/`covN=`/`lscroll=` yalnız **CTA taşıyan** satırlarda zorunludur. Eksik zorunlu token sert hatadır |

`node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --dogrula <dizin>` → 8/8 PASS
`node tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs --kapsam …` → `PASS kapsam 7 koşum · 518 satır · 7 kombinasyon`

Negatif kontroller (fixture + modülün kendi matrisi, **214 + 113** kontrol): eksik satır, eksik
alan, bozuk hash, tema etiketi ↔ root çelişkisi, **computed yüzey/metin tokenı yanlış**,
**token hiç ölçülmemiş**, sahnenin tek temada kalması, log'suz satır, **log.txt'te eksik/fazla
sahne satırı**, **log'daki tema/surface/vh/collisions=/collisionPx= beyanla çelişmesi**,
**log satırında `collisions=` alanının hiç olmaması**, eksik profil, eksik kombinasyon, eksik
zorunlu genişlik, ana sahne envanterinin kayması, tek koşumla tam kapsam iddiası, **önce/sonra
görüntülerinin birebir aynı olması** → **hepsi kırmızı**.

Doğrulayıcı ayrıca şunları reddeder (hepsi tahrifat testiyle denendi): kırpılmış görüntü
(RIFF toplam uzunluğu **ve** chunk yürüyüşü + PNG `IEND`), manifestte beyan edilen `SERT:`
taşma/kırpılma, CTA nesnesi olmayan `lesson`/`practice`/`feedback` satırı, `--kapsam`da CTA
sözleşmesi ihlali.

`--glif-karsilastir` ayrıca şunları reddeder (hepsi canlı denendi):

- **ölçek uyuşmazlığı** — 390 px'lik koşum ↔ 460 px referans → `HATA genişlik farklı: 460 ≠ 390`;
- **iki kez çekim** — aynı iki görüntü → `HATA önce ve sonra görüntüleri BİREBİR AYNI`;
- **ortak elle düzenleme** — iki manifest birlikte bozulsa bile diziler **canlı içerikten
  yeniden türetilir** ve `doğrulanmış içerikten yeniden türetilen 30 diziyle eşleşmiyor` hatası
  verir (tahrif edilmiş kopyayla canlı denendi).

`--dogrula` artık **çoklu dizin** kabul eder ve verilen dizinlerin **tamamını** doğrular; eksik
dizin `exit 1`'dir (önceden yalnız ilk dizin okunup geri kalanı sessizce yutuluyordu).
`issues.txt` kontrolü **iki yönlüdür**: manifestte beyan edilen her bulgu dosyada olmalı ve
dosyada manifest dışı satır bulunmamalı.

## 4. Tema doğrulaması (6 kombinasyon)

Beklenen token çiftleri `app/styles.css`'ten: açık `--quran-surface:#F7F5EE` / `--quran-ink:#172B45`;
koyu `#151C28` / `#E8EBF2`.

| Koşum | Etiket | Ölçülen `data-theme` | Ölçülen yüzey | Sonuç |
|---|---|---|---|---|
| light-320 | light | light | `#F7F5EE` | PASS |
| light-390 | light | light | `#F7F5EE` | PASS |
| light-460 | light | light | `#F7F5EE` | PASS |
| dark-320 | dark | dark | `#151C28` | PASS |
| dark-390 | dark | dark | `#151C28` | PASS |
| dark-460 | dark | dark | `#151C28` | PASS |
| light-390-inset (+34 px) | light | light | `#F7F5EE` | PASS |

518/518 satırda etiket, manifestteki `verifiedTheme` computed tokenları **ve diskteki
`log.txt` `theme=`/`surface=` değerleri** birbiriyle uyuşur (10. denetim F10-1: bu üçüncü
çapa eklendi — önceden etiket ile `verifiedTheme` **ikisi de** manifestte olduğu için
tek dosya düzenlemesiyle gerçek bir koyu koşum "açık" gösterilebiliyordu).
Görüntü etiketi tek başına tema kanıtı sayılmaz.

## 5. Onboarding kapsamı

Her koşumda 7 onboarding sahnesi ölçüldü: `o1-ilk-acilis-1`, `o2-ilk-acilis-2`,
`o3..o7` KAO ilk açılış + yerleştirme (okuma/dinleme) adımları.

- 7/7 koşumda onboarding satırlarının **tamamı** koşumun `data-theme` ölçümünü ve computed
  `--quran-surface` / `--quran-ink` çiftini taşıyor (her satırda doğrulandı).
- `data-onboarding-theme` niteliği **yalnız kabuk onboarding yüzeyinde** (`o1-ilk-acilis-1`)
  bulunur ve koşum temasıyla aynıdır. Yüzey dağılımı (log'daki `node=` alanı): `o1` =
  `onboarding` (kabuk karşılama), `o2` = **`app`** (başlat sonrası ana uygulama — KAO ekranı
  değil), `o3`–`o7` = `dialog` (KAO onboarding/yerleştirme). `o2`–`o7` teması **root
  `data-theme` + computed token** ile doğrulanır; niteliğin varlığına dayanmaz. İlk sürümdeki “nitelik onboarding yüzeyinde mevcut” ifadesi
  7 sahnenin tamamını kapsıyormuş gibi okunuyordu; düzeltildi.
- Kilit kapısı (`input[type=password]`) tespit edilirse çekim **başarısız** sayılır — bu
  kontrol eklendi çünkü eski çekimlerde tam olarak bu hata vardı.

## 6. Taşma / kırpılma

Tarama, "yerel kaydırma alanı" ile "sayfa/diyalog taşması"nı ayırır:

- `SAYFA-TAŞMASI`, `DIŞARI-TAŞAR`, `YATAY-KIRPILIR`, `DİKEY-KIRPILIR` = **sert kusur**.
- `KAYDIRMALI-ALAN(bilgi)`, `DİYALOG-YATAY-KAYDIRMA(bilgi)`, `KISALTILMIS-METIN(bilgi)` = bilgi.

**518 satırda `SERT:` bulgu sayısı: 0.**

Bilgi sınıfına alınan ve gerekçesi kayıtlı üç durum:

| Durum | Gerekçe |
|---|---|
| `KAYDIRMALI-ALAN` (sûre seçici, gramer tablosu) | Kartın kendi sözleşmesi "uzun içerik yerel kaydırılsın" der; kaydırma kusur değil. |
| `.sey-header-save__label` / `.sey-header-action span` kırpılması | `app/styles.css` bunları **bilerek** `width:1px;height:1px;clip:rect(0,0,0,0)` yapar — ekran okuyucuya özel etiket. |
| `text-overflow:ellipsis` / satır sınırı (ör. `hava bekleniyor`, tatil notu) | Kullanıcıya "…" ile sinyal verilir; metin kaybı değil. |

Bu üç istisna **ölçümü gevşetmek için sonradan eklenmedi**: her biri canlı CSS kaynağında
doğrulandı ve yalnız kendi sınıfına uygulanır (yaprak metin düğümü koşulu).

## 7. CTA geometrisi (K3PD-21 matrisi) — 1 GERÇEK KUSUR

Sözleşme (`kao3-premium/araclar/eylem-geometri.cjs`): *"aynı aşamanın birincil eylemi, ardışık
render'larda aynı y'de kalmalı"*; görünür, içeriği örtmeyen, ≥44 px.

### 7.1 Kararlılık (≤8 px) — PASS

42 sahne × 7 koşum, her sahnede 2 ardışık render (tema yeniden uygulanır → `render()` çalışır).

**Gerçek ölçüm (komutlanabilir):** yedi koşumun **hepsinde** maxDelta = **0 px**;
koşum başına **42 sahne** ölçüldü ve **42 kararlılık kaydı** yazıldı (294/294 toplam).
Yani hem 320/390/460 (inset yok) hem 390+34 px inset için sıfır fark.

> **Kapı sertleştirmesi (4. denetim, F2):** önceki sürümde 42 CTA satırının yalnız **25**'i
> kararlılık kaydı taşıyordu — 17 geri bildirim paneli hiç kaydedilmiyordu, yani "≤8 px"
> iddiası ölçülmemiş satırlar için de yazılıyordu. Artık kayıt `snap()` içinde **her** CTA
> satırı için üretiliyor ve doğrulayıcı "ölçülen her CTA sahnesinin kaydı olmalı" kuralını
> uyguluyor (kayıt eksikse `exit 1`).

> Düzeltme kaydı: bu belgenin ilk sürümü "320'de 0" ve "inset'te ≤2 px, 10 sahnede 1–2 px"
> yazıyordu. **Yanlıştı**: o sayılar, kapılar sıkılaştırılmadan önceki ara koşumdan geliyordu ve
> commit edilen manifestlerle uyuşmuyordu. Bağımsız denetim yakaladı; sayılar güncel
> manifestlerden yeniden türetildi. Aşağıdaki tablo tek doğru kaynaktır.

Ölçü `layoutY = viewport y + scrollTop` ile kaydırmadan bağımsız alınır; yoksa yapışkan bir
öğenin kaydırma durumu yanlış y-farkı üretiyordu (ilk denemede 112 px'lik yanlış pozitif).

**Not (dürüstlük):** farklı aşamaların y'leri doğal olarak farklıdır (içerik yüksekliği değişir:
intro 638 vs 664). ≤8 px kuralı **sahne içi kararlılık** olarak uygulandı; aşamalar arası
konum eşitliği hiçbir zaman sözleşme değildi.

### 7.2 Görünürlük / örtüşme / hedef boyutu — FAIL (tek kusur, iki kayıt)

> Sayım notu: `productionFindings` **2 satır** taşır ama bunlar **aynı tek kusurun** iki
> ölçümüdür — `cta_hidden_by` (eylem noktasında üstte başka öğe var) ve `cta_control_collision`
> (aynı aşamanın başka bir kontrolü 44 px biniyor). Kusur sayısı **1**’dir; iki kayıt
> ölçümün iki farklı yönünü belgelediği için ayrı tutulur.

**`l25-summary` (ders özeti), 7/7 koşumda tekrarlanıyor:**

| Ölçüm | Değer |
|---|---|
| Birincil eylem | `.kao-lesson[data-lesson-stage="summary"] > .kao-lesson-next` ("Bugün yeter") |
| Kutu | y=758, h=50 (≥44 px ✓) |
| Üstte kalan öğe | `BUTTON.kao-lesson-audio.kao-lesson-more` ("5 dakika daha"), y=764, h=44, `position:sticky` |
| Çakışma | **44 px** (ikincil buton birincilin tam üstüne biniyor) |
| Piksel doğrulaması | Ders özeti kırpımında birincil etiketin yerinde **"5 dakika daha"** okunuyor |

Kök neden (üretim kaynağı, **kart kapsamı dışı**):

- [`app/core/quranLearnViews.js:394`](../../../../app/core/quranLearnViews.js): `<main class="kao-lesson">`
  içine `… + <button class="kao-primary kao-lesson-next"> + secondary` sırasıyla yazılıyor.
- [`app/kao.css`](../../../../app/kao.css): `.kao-lesson>.kao-lesson-next,.kao-lesson>.kao-lesson-more{position:sticky;bottom:calc(8px + env(safe-area-inset-bottom,0px))}`
  — **iki kardeş buton da aynı `bottom` değerine yapışıyor**, bu yüzden üst üste biniyorlar.
  Aynı `bottom` iki ayrı yükseklikte eleman için tanımlandığından ikincisi birincinin üstüne
  boyanır (`z-index:auto`, DOM sırası sonra gelen kazanır).

Kanıt görüntüleri: `light-390/l25-summary.webp`, `dark-460/l25-summary.webp`,
`light-390-inset/l25-summary.webp`, … (7/7). Manifest alanı:
`rows[scene=l25-summary].cta.hiddenBy = true`, `cta.overlapsControl[0].overlapPx = 44`.

**Bu kusur bu kartta düzeltilmedi** — kart açıkça "üretim davranışı yasak" diyor ve allowlist
`app/kao.css` / `quranLearnViews.js` içermiyor. Ölçüm gevşetilmedi: kusur `MANIFEST.json →
productionFindings` alanında ve stderr'deki `FINDING` satırında kayıtlıdır. (`issues.txt`
sahne taramasının bulgularını taşır — örtüşme bir **geometri** bulgusudur, tarama bulgusu
değil; bu yüzden oraya yazılmaz. İlk sürümdeki "issues.txt'te de kayıtlı" ifadesi yanlıştı.)

**Önceden var mıydı?** Evet — ama kanıt **git soy ağacıdır**, eski bir ekran görüntüsü değil:
yapışkan `bottom` kuralını veren `app/kao.css` satırı `c99de5e6` (K3P-A6) commit'inden gelir ve
`0beb6d0d` bu kartın tabanının atasıdır; ikincil butonu üreten `secondaryAction` da o tabanda
vardı. Yani kusur bu kartın **regresyonu değil**.

> Düzeltme kaydı: ilk sürüm "eski `l25-summary` PNG'sinde de görünüyor" diyordu.
> **Yanlıştı**: `kao3-premium/kanit/` altında sahne başına PNG/WebP **yok** (yalnız 8 `.jpg`
> kontak sayfası + log); eski 390 log'unda sahne adı `l29-summary` ve o log'da "5 dakika daha"
> geçmiyor. Bağımsız denetim yakaladı; atıf kaldırıldı, soy ağacı kanıtı konuldu.

### 7.3 Yapışkan altbilgi ↔ içerik ilişkisi (hüküm verilmedi)

Bu, "yapışkan eylem altındaki içeriği kapatıyor" ifadesinin iki farklı okuması olduğu için
**hükme bağlanmadı**:

- **Okuma A (kusur değil):** kartın kendi sözleşmesi "uzun içerik yerel kaydırılsın" der;
  yapışkan altbilginin kaydırılan içeriğin üzerine binmesi normal mobil desendir.
- **Okuma B (kusur):** içerik kaydırılarak tamamen açığa çıkamıyorsa bilgi kalıcı olarak gizlidir.

Ölçüm aracı bu okumayı **ayırt etmez**: `cta.overlapsContent` alanı yapışkan eylem alanına
giren metin öğelerini bilgi olarak listeler, hata üretmez — böylece ölçüm hiçbir yöne
zorlanmaz. §6'daki sert taşma taraması bu sahnelerde temizdir (kırpılma yok, metin boyanıyor).

> **Düzeltme kaydı:** ilk sürüm burada piksel sayıları veriyordu (`77–531 px`, `≤383 px`,
> `.kao-lesson` kutusu `332 px`, "en alt içerik `555 px`"). **Bu sayılar hiçbir commit edilmiş
> artefakttan türetilemiyordu** — `cta` nesnesi "alttaki içeriğin mutlak alt kenarı" ya da
> "ders kutusu yüksekliği" alanı taşımıyor. Bağımsız denetim yakaladı; sayılar kaldırıldı,
> niteliksel `NOT_MEASURED` ifadesi korundu.

Bu yüzden bu alt başlık **`NOT_MEASURED`** olarak işaretlenir ve PASS sayılmaz.
Bağımsız denetçinin bu okumayı karara bağlaması gerekir.

### 7.4 Kapı sertliği (bağımsız denetim düzeltmesi)

İlk sürümde çıkış kodu sınıflandırması **metin aramasıyla** yapılıyordu
(`failure.includes(': CTA ')`), bu da `CTA seçicisi DOM'da yok`, `dokunma hedefi < 44 px`,
`CTA görünür değil` ve `klavye odağına ulaşmıyor` durumlarını **üretim bulgusu** sayıp `exit 0`
veriyordu. Yani eksik/görünmez bir birincil eylem sessizce "yeşil" geçebilirdi.

İkinci turda önek (`MEASURE:`) denendi; bağımsız denetim bunun da **fail-open** kaldığını
gösterdi: satır bazlı tema sapması, onboarding profili, font yüklemesi, glif sayfası ve
sayım uyuşmazlıkları öneksiz kaldığı için hâlâ `exit 0` alıyordu. Bu yüzden tasarım
**metin aramasından tamamen ayrıldı** — iki ayrı dizi:

| Kanal | Ne taşır | Varsayılan | Çıkış kodu |
|---|---|---|---|
| `failures` | Ölçüm/çekim kırılması: CTA seçici yok, <44 px, görünmez, odak yok, tema doğrulanamadı (satır + onboarding + glif), font yüklenmedi, glif sayfası bozuk, sayım uyuşmazlığı | **yeni kontrol buraya yazılır** | **1** |
| `findings` | Yalnız üretimde ÖLÇÜLEN gerçek kusur: CTA örtülmesi, kontrol çakışması, >8 px y-farkı | açıkça yazılır (**1 kusur**, 3 dedektör türü; koşum başına 2 kayıt) | 0 + `FINDING` + `productionFindings` |

Fail-closed varsayılan budur: yeni bir kontrol ekleyen kişi `failures`'a yazar; "üretim kusuru"
demek için `findings`'i **bilinçli** seçmek zorundadır. Hiçbir yerde metin/önek araması yoktur.

Doğrulayıcı da sertleştirildi:

1. **Tema artık computed tokenla doğrulanıyor** — yalnız `data-theme` değil, `--quran-surface`
   ve `--quran-ink` beklenen çiftle karşılaştırılır; token yoksa satır reddedilir. (F-11'in asıl
   hatası "yanlış tema etiketlenmiş görüntü" olduğu için bu şart.)
2. **`log.txt` çapraz kontrolü** — dosyadaki sahne satırı sayısı manifest satır sayısına eşit
   olmalı ve her satırın log metni dosyada bulunmalı. Önceden "screenshot == log == manifest"
   yalnız aracın kendi dizileriyle sınırlıydı.
3. **Glif satırının teması da ölçülüyor** (etiket değil) ve log satırı `theme=`/`surface=`
   taşıyor.
4. **`THEME_TOKENS` canlı CSS'e pinlendi** — fixture, `app/styles.css` içindeki `#root` ve
   `#root[data-theme="dark"]` bloklarından okunan gerçek tokenlarla eşleştirir; CSS değişirse
   fixture kırmızı olur.
5. **`--glif-karsilastir <önce> <sonra>`** eklendi: aynı 30 dizi/sıra, aynı genişlik, aynı
   yakalama ölçeği ve **görüntülerin farklı olması** doğrulanır. "Aynı görüntüyü iki kez çekme"
   artık makineyle reddedilir.

### 7.24 Yirmi beşinci denetim düzeltmeleri (3 MEDIUM + 1 LOW)

> Bu turun en ağır bulgusu bir **uydurma beyandı**: kendi sözleşme tablom, log'da **hiç
> bulunmayan** üç tanık adı (`ctaY=`, `ctaLay=`, `ctaScr=`) anıyordu. Yani "çapalı" demek,
> çapayı **var saymak** ile karışmıştı.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F26-1** MEDIUM | **`manifest.theme` ve `manifest.viewport` `--dogrula`/`--kapsam`'da hiç okunmuyordu** (yalnız `--glif-karsilastir` bakıyordu). `theme light→dark`, inset koşumunda `safeAreaBottom 34→0` → iki kapıda da **rc=0**. | İkisi de **satırlardan türetilir**: tek tema/tek viewport beklenir ve satırların değeriyle birebir eşleşmeli. **Glif satırı koşum viewport özetinden hariç tutulur** — o satır her koşumda 460 px'lik dizi sayfasıdır ve kendi `sheet.sw`/`captureScale` çapasına sahiptir. | `theme light→dark` → **rc=1** `manifest.theme 'dark' ≠ satırların teması 'light'`; `safeAreaBottom 34→0` → **rc=1** `manifest.viewport.safeAreaBottom 0 ≠ satırların 34`; `+1` → **rc=1**. |
| **F26-2** MEDIUM | **Sözleşme üç tanığı ADLANDIRIYORDU ama log'da YOKTU.** `rows[].cta.y` → `anchor:log.txt ctaY=`, `layoutY` → `ctaLay=`, `scrollTop` → `ctaScr=`. Gerçekte bu üç token **8 koşumun hiçbirinde 0 kez** geçiyordu; dolayısıyla `cta.y += 5`, `layoutY += 5`, `scrollTop += 5` ve `cta.scroll.scrollTop = 9999` **rc=0** veriyordu. **Bu bir yanlış beyandır** — tanık yokluğundan daha kötüsü, var sanılması. | Üç token artık **yazılıyor** ve CTA satırlarında **zorunlu**; üç alan log'la birebir eşleşir. | `y += 5` → **rc=1** `CTA y 290 ≠ log.txt'teki ctaY=285`; `layoutY += 5` → **rc=1**; `scrollTop += 5` → **rc=1**; `cta.scroll.scrollTop=9999` → **rc=1** `scroll.scrollTop 9999 ≠ cta.scrollTop 0`; **eksik `ctaY=` token'ı** → **rc=1**. |
| **F26-3** MEDIUM | **`cta.scroll` iç alanları serbestti.** `scrollHeight = 10` (gerçek 844) → **rc=0**; `scrollHeight`+`clientHeight` birlikte +1 (boolean korunur) → **rc=0**. | `scroll.scrollTop` = `cta.scrollTop` (log `ctaScr=` ile çapalı); `clientHeight` = satırın `viewport.height`; `scrollHeight ≥ clientHeight`. | `scrollHeight=10` → **rc=1** `scroll.scrollHeight 10 < clientHeight 844`; birlikte +1 → **rc=1** (clientHeight viewport'a bağlı). |
| **N26-1** LOW | **Font isteği adı ve boyutu serbestti.** `transferSize = 9999999` → **rc=0**; `Sahte-Font.woff2` → **rc=0** — oysa §8.3 `25.360 B`'yi **ölçülmüş** bir sayı olarak aktarıyor. | İstek adı **tek yayın fontuyla** eşleşmeli (`assets/kao/font/ScheherazadeNew-Regular.k3p.woff2`); `transferSize` `0 < h ≤ 1 MiB` aralığında. | `Sahte-Font.woff2` → **rc=1** `yayın fontu ScheherazadeNew-Regular.k3p.woff2 değil`; `9999999` → **rc=1** `> 1048576 (yayın fontu için imkânsız)`. |

**Ölçüm.** Negatif öz-test **104 → 113** (3 kabul + 110 ret), fixture **208 → 214**. Sekiz dizin /
519 satır `rc=0`; `--kapsam` 7/7; `--glif-karsilastir` PASS. Kanıt dizini yeniden üretildi (log
biçimi `ctaY=`/`ctaLay=`/`ctaScr=` ile genişledi); kaynak glif hash'leri değişmedi
(`ed26e3b2…`, `38e46400…`).

**Ders (yazılı).** Bir sözleşme bir tanığı **adlandırıyorsa**, o tanık log'da **gerçekten**
bulunmalıdır — aksi hâlde beyan yanlıştır ve alan **açıkta** kalır. **Uydurma tanık adı, tanık
yokluğundan daha kötüdür**, çünkü denetçiyi de yanıltır. Bu yüzden bu turun düzeltmesi yalnız kod
değil, **beyanın geri alınıp gerçeğe bağlanmasıdır**.

**Kalan sınır (değişmedi):** §7.27 S1–S10.

### 7.25 Yirmi dördüncü denetim — ikinci katman taraması (2 MEDIUM)

> 23. tur "her yaprak gerçek kaynağa bağlı" dedi. Bu tur **bağlı olmayan iki küme davranışı**
> ve 9 maddelik bir ikinci-katman kaçış taraması yapıldı.

**F25-1 MEDIUM — `productionFindings` kümesel değildi.** Aynı bulgu kaydını **iki kez** yazmak
(veya listeyi çoğaltmak) hiçbir kapıya takılmıyordu: `--dogrula` **rc=0**. Kanıt listesi
şişirilebiliyor, "kaç bulgu var" sayısı bozulabiliyordu. Düzeltildi: liste **kümesel** — `(scene,
kind)` tekil olmalı, hem `validateManifest` hem `validateCta` yolunda.

**F25-2 MEDIUM — sheet yükseklik zinciri tek tek ya da birlikte kaydırılabiliyordu.**
`sheetHeight`/`docH`/`bodyH`/`scrollH`/`clientH` birbirine bağlı beş ölçümdür; `scrollH += 1`
**rc=0** veriyordu, beşini birlikte +1 kaydırmak da öyle. Düzeltildi: zincir **bütün olarak tek
değer** olmalı **ve** satır geometrisiyle tutarlı olmalı (`firstTop + rows × maxH ≤ sheetHeight`).

**İkinci katman taraması (9 vaka).** Aşağıdakiler tek alanla denendi; **7'si zaten `rc=1`** idi,
2'si bu turda kapatıldı:

| Mutasyon | Sonuç |
|---|---|
| `sceneKind` → aynı önekli başka enum üyesi | **rc=1** `sceneKind 'view' sahne adının gerektirdiği 'lesson' ile çelişiyor` |
| `profile` → `glif` (normal satırda) | **rc=1** `profile 'glif' sahne adının gerektirdiği 'ana' ile çelişiyor` |
| `cta.selector` → aynı aşamalı **farklı gerçek seçici** | **rc=1** `CTA selector log.txt'teki sel=5a43fe942ce7 ile eşleşmiyor` |
| `ctaReport[].samples` 2→3 | **rc=1** `samples=3 ama layoutYs 2 örnek` |
| `cta.overlapsControl[0].tag` | **rc=1** `overlapsControl[0].tag 'BUTTON' ≠ satırdaki 'DIV'` |
| `series[0]` ↔ `series[29]` yer değiştirme | **rc=1** `series[0].ar doğrulanmış içerikle çelişiyor` |
| `captureScales` ile satır ölçeği çelişkisi | **rc=1** `captureScales [1,4] ≠ satırlardan ölçülen [1,2,4]` |
| `issues[]` metnini `SERT:` yapmak | **rc=1** `beyan edilen sert taşma/kırpılma` |
| **`productionFindings` çoğaltma** | **rc=0 → kapatıldı** (§F25-1) |
| **`sheet.scrollH += 1`** | **rc=0 → kapatıldı** (§F25-2) |

**Ölçüm.** Negatif öz-test **104 → 112**, fixture **208 → 213**. Sekiz dizin / 519 satır `rc=0`;
`--kapsam` 7/7; `--glif-karsilastir` PASS.

**Ders (yazılı).** İki kural: (1) **küme alanları tekil olmalı** — bir listeyi çoğaltmak da bir
tahrifattır; (2) **birbirine bağlı ölçümler tek tek değil BÜTÜN olarak çapalanmalı** — beş
yükseklik alanını birlikte kaydırmak, her birini ayrı ayrı doğrulayan kapılardan geçer.

**Kalan sınır (değişmedi):** §7.27 S1–S10.

### 7.26 Yirmi üçüncü denetim düzeltmeleri (2 MEDIUM + 2 LOW)

> 22. tur "her kayıtlı yaprağın okuyucusu var" dedi. Bu tur, bazı okuyucuların **yalnız şekil**
> denetlediğini (her makul değeri geçen aralık testleri) ve iki yaprağın `--dogrula`/`--kapsam`'da
> hiç okunmadığını buldu. Ayrıca kendi belgemde bir sayaç tutarsızlığı vardı.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F24-1** MEDIUM | **`glyphEvidence.font.check`/`.distinct` sözleşmede `anchor:log.txt check=` diye kayıtlıydı ama `--dogrula`/`--kapsam` onları OKUMUYORDU** (yalnız `--glif-karsilastir` bakıyordu). `check true→false` ve alanı **silmek** iki manifest kapısında da **rc=0** veriyordu — oysa EVIDENCE bu alanı çapalı diye aktarıyordu. | Her iki bayrak `--dogrula` içinde log'daki `check=`/`distinct=` ile birebir eşleşir; **eksik alan sert hatadır**. | `check=false` → **rc=1** `glyphEvidence.font.check false ≠ log.txt'teki check=true`; alan silinmiş → **rc=1** `glyphEvidence.font.check yok — font ölçüm bayrağı eksik`; `distinct=false` → **rc=1**. |
| **F24-2** MEDIUM | **`productionFindings[].coverStack`/`.overlapsControl` yalnız "prefix" denetiminden geçiyordu.** Bulgu listesini **boşaltmak** (`coverStack=[]`, `overlapsControl=[]`) §7.2'de aktarılan 44 px kanıtını siliyor, iki kapı da yeşil kalıyordu. | Uzunluklar **birebir** eşleşmeli; ayrıca bulgu türü kendi listesini **taşımak zorunda** (`cta_hidden_by` → `coverStack`, `cta_control_collision` → `overlapsControl`). | `coverStack=[]` → **rc=1** `coverStack 0 kayıt ama satırda 4 ölçüm var — birebir eşleşmeli`; `overlapsControl=[]` → **rc=1** `0 kayıt ama satırda 1 ölçüm`. |
| **F24-3** LOW | **`sheet.minH`/`firstTop`/`cw` yalnız ŞEKİL denetiminden geçiyordu.** `minH=1` (veya 60), `firstTop=0`, `cw=1` gibi **fiziksel olarak imkânsız** değerler `--dogrula`'da rc=0 veriyordu; yedisinde birden yapılırsa `--kapsam` da rc=0. | Beşi de log'daki gerçek ölçümle birebir eşleşir: yeni log tanıkları `hMin=`, `hFirst=`, `hLast=`, `hSw=`, `hCw=`. | `minH=1` → **rc=1** `≠ log.txt'teki hMin=68`; `firstTop=0` → **rc=1** `≠ hFirst=15`; `cw=1` → **rc=1** `≠ hCw=460`. |
| **N24-1** LOW | **Kendi belgemde sayaç tutarsızlığı.** §7.29 "`derived:` **3** kayıt" diyordu; sözleşmede **4** vardı (`glyphEvidence.viewportHeightDuringCapture` atlanmıştı) ve aynı belgenin §7.27/S9'u 4 diyordu — yani **doküman kendisiyle çelişiyordu**. | §7.29 düzeltildi (4) ve dört alan tek tek listelendi. | `MANIFEST_FIELD_CONTRACT` → derived: `generatedAt`, `imageQuality`, `glyphEvidence.imageQuality`, `glyphEvidence.viewportHeightDuringCapture`. |

**Ölçüm.** Negatif öz-test **100 → 104**, fixture **202 → 208**. Sekiz dizin / 519 satır `rc=0`;
`--kapsam` 7/7; `--glif-karsilastir` PASS. Yeni okuyucular **hiçbir gerçek kanıtı reddetmedi**.

**Ders (yazılı).** Bir alanın **okuyucusu olması** yetmez: okuyucunun **gerçeği** denetlemesi
gerekir. "Aralık içinde mi / pozitif mi / enum üyesi mi" soruları **şekil** sorusudur; yazıcının
kendi ürettiği değerleri her zaman geçer. Gerçek denetim, değeri **bağımsız bir kaynakla**
karşılaştırmaktır — bu turda yapılan tam olarak buydu (log tanıkları + satırın kendi ölçümü).
Ve: bir belge kendisiyle çelişiyorsa, o çelişki **bulgu**dur.

**Kalan sınır (değişmedi):** §7.27 S1–S10.

### 7.28 Yirmi ikinci denetim düzeltmeleri (1 HIGH + 2 MEDIUM + 1 LOW)

> 21. tur "sınıfı yapısal olarak kapattım" dedi. Bu tur bunun **yalnız yarısının** doğru
> olduğunu gösterdi: sözleşme **yeni** alan eklemeyi engelliyordu, ama **kayıtlı bir alanı
> değiştirmek** hâlâ serbestti. Ve 21. turun "8 gizli alan mevcut kapılara bağlandı" beyanı
> **yanlıştı** — o alanlar tabloya yazıldı, ama hiçbir kapı onları okumuyordu.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F23-1** HIGH | **Kayıt ≠ okuma.** 60 değiştirilebilir kayıtlı yapraktan **20'sinin okuyucusu yoktu**. Ölçülen: `font.faces[0].weight "400"→"700"` → **rc=0**; aynı şekilde `faces[].family`, `faces[].unicodeRange`, `requests[].name`, `requests[].transferSize`, `ctaReport[].viewport` (nesne ve dize), `ctaReport[].stage`, `lexiconVersion`, `surahVersion`, `clipHeight`, `viewportHeightDuringCapture`, `imageFormat`, `rows[].scrollTop` → hepsi **rc=0**, hem `--dogrula` hem `--glif-karsilastir`. | Her yaprak **okuyucuya** bağlandı: font ailesi/ağırlığı **yayın fontuna sabit**; `unicodeRange` **Arapça bloğuna** (U+600-6FF); istek **adı izinli origin'e** ve `assets/kao/font/` yoluna; `transferSize > 0` (gerçek indirme); `ctaReport[].viewport` **satırın viewport'una**; `ctaReport[].stage` **satırın seçicisindeki `data-lesson-stage`** değerine (türetme öncelikli, kümeli liste yedek); `lexiconVersion`/`surahVersion` **canlı içerikten yeniden türetilir**; `clipHeight` = **`sheet.sheetHeight`**; `imageFormat` **diskteki dosyadan** (RIFF/WEBP vs PNG imzası); `rows[].scrollTop` = **`cta.scrollTop`**. | **13/13 yaprak tahrifatı `rc=1`**: `weight '700' ≠ yayın ağırlığı '400'` · `family 'X' ≠ yayın fontu 'K3P Scheherazade'` · `unicodeRange Arapça bloğunu (U+600-6FF) taşımıyor` · `requests[0].name izinli origin ile başlamıyor` · `transferSize 0 gerçek indirme değil` · `viewport '390x844+0' ≠ satırın '460x844+0'` · `stage 'zzz' ≠ satırın seçicisindeki 'goal'` · `lexiconVersion 'x' ≠ canlı içerik 'quran-lexicon-tr-v1'` · `surahVersion 'x' ≠ canlı içerik 'quran-short-surahs-tr-v1'` · `clipHeight 1 ≠ sheet.sheetHeight 2622` · `viewportHeightDuringCapture -5 geçersiz` · `imageFormat 'png' ≠ diskteki 'webp'` · `scrollTop 999 ≠ cta.scrollTop 0`. |
| **F23-2** MEDIUM | **Yol taklidi (`has()` aldatmacası).** Sözleşme anahtarları `"rows[].cta.height"` gibi **yol dizeleri**dir. Bir manifest alanının **adı** bu yollardan biriyle aynı olursa `has()` onu kayıtlı sanıp geçiriyordu: `m['rows[].cta.height']=999` → **rc=0**, `m['productionFindings[].theme']='dark'` → **rc=0**, `rows[0]['cta.width']=9999` → **rc=0**. | Nokta veya köşeli parantez içeren **alan adları yapısal olarak yasak** (`FORGED_PATH_RE`); yürüyücü bunları `"(alan adı yol dizesi taşıyamaz)"` etiketiyle reddeder. | `m['rows[].cta.height']=999` → **rc=1** `rows[].cta.height (alan adı yol dizesi taşıyamaz)`; satır içi `'cta.width'` → **rc=1**. |
| **N23-1** MEDIUM | **EVIDENCE §7.29 beyanı yanlıştı.** "8 gizli alan … **hepsi kaydedildi ve mevcut kapılara bağlandı**" yazıyordu; gerçekte yalnız kaydedildiler, bağlanmadılar. Bu, kanıt kaybı kadar ciddi bir **yanlış beyandır**. | Beyan düzeltildi: alanların gerçekten **hangi** kapıya bağlandığı tek tek yazıldı (bu bölüm) ve §7.29'daki fazla iddia açıkça geri alındı. | §7.28 tablosu + §7.29 düzeltme notu. |
| **N23-2** LOW | **Temizlik makbuzu "0 k3pd29 artefaktı kaldı" diyordu; diskte 9 dosya vardı.** Bunlar tarayıcı profili değil, **operatörün kendi kabuk geçici dosyalarıydı** (`/tmp/k3pd29-*.out`, `*.txt`). | Ayrım yazıldı: `sweepProfiles()` tarayıcı profillerini (`$TMPDIR`) temizler; kabuk geçici dosyaları operatörün sorumluluğundadır ve bu kart sonunda silindi. | `ls -d $TMPDIR/k3pd29*` → **0**; `/tmp/k3pd29-*` → kart sonunda silindi. |

**Ölçüm.** Negatif öz-test **96 → 100** (3 kabul + 97 ret), fixture **190 → 202**. Sekiz dizin /
519 satır `rc=0`; `--kapsam` 7/7; `--glif-karsilastir` PASS — yani yeni okuyucular **hiçbir gerçek
kanıtı reddetmedi**.

**Ders (yazılı).** **Kayıt, okuma değildir.** Bir alanı sözleşmeye yazmak onu bağlamaz; her
yaprağın bir **okuyucusu** olmalı. Sözleşme tablosu "yeni alan eklenemez" garantisi verir, ama
"kayıtlı alan değiştirilemez" garantisi **ancak** her yaprak bir kapıya bağlıysa doğrudur.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz; `blocked-external` koşum-zamanı artefaktıdır;
`generatedAt`/`imageQuality`/`glyphEvidence.imageQuality`/`glyphEvidence.viewportHeightDuringCapture`
`derived:` olduğu için kanıt olarak aktarılmaz.

### 7.27 Kalan bilinen sınırların TAM listesi (22 tur sonrası)

Aşağıdakiler **bilinerek** kabul edilmiştir; her biri ya ölçümle ayırt edilemez ya da kartın
kapsamı dışındadır. Hiçbiri bir kabul maddesini gevşetmez.

| # | Sınır | Neden kapatılamaz | Kanıt/konum |
|---|---|---|---|
| S1 | Envanterin **mutlak tabanı** yok | Kart ekran sayısını sabitlemeyi yasaklar; yedi koşumun hepsinden aynı sahne tutarlı biçimde silinirse (§`log.txt`+manifest+disk birlikte) hiçbir hash tabanlı denetim görmez | §11.8 |
| S2 | `issues.txt` **türetilmiş** tanık | Araç onu manifestten üretir; iki yönlü eşleşme manifestin kendi kendisiyle tutarlılığını gösterir, bağımsız tarama kaydını değil | §11.11 |
| S3 | Glif **piksel↔font** bağı makine ile denetlenmez | `--glif-karsilastir` font kanıtını log'dan çapalar ve bit-eydeş çekimi reddeder, ama "önce" görüntüsünün gerçekten fontsuz build'den geldiğini **pikselden** doğrulamaz | §11.10 |
| S4 | CTA **ikinci** stabilite örneği | `layoutYs[1]` için ayrı log tanığı yok; yalnız `layoutYs[0]` satırın `cta.layoutY`'sine çapalı | §11 (d), §7.1 |
| S5 | **Tutarlı çok-alan** imali | Birden çok alan birlikte ve tutarlı biçimde değiştirilirse hash-tabanlı denetim yakalamaz | §11 (e) |
| S6 | **Yatay/dikey taşma** yalnız ölçülen bağlamda | `localScroll` yerel kaydırmayı sayfa taşmasından ayırır, ama tarayıcı dışı (cihaz) render farkı ölçülmez | §6 |
| S7 | `blocked-external` **koşum-zamanı artefaktı** | Sayfa kaç dış istek *denemesi* yaptığına bağlı; ±1 oynayabilir; kabul ölçütü değildir | §9 |
| S8 | **Cihaz / ekran okuyucu / L2** kabulü | Bu kart yalnız headless ölçüm yapar; cihaz ve uzman onayı **yapılmadı ve iddia edilmiyor** | §8.4, §11.2-11.4 |
| S9 | `derived:` alanlar | `generatedAt`, `imageQuality`, `glyphEvidence.imageQuality`, `glyphEvidence.viewportHeightDuringCapture` — kanıt olarak **aktarılmaz** | §7.28 |
| S10 | **Yapışkan altbilgi ↔ içerik** erişilebilirliği | İki okuma (örtülme mi, kaydırma mı) ölçümle ayırt edilemedi → `NOT_MEASURED` | §7.3 |

> **Not (dürüstlük):** S1–S5 *yapısal* sınırlardır (hash tabanlı kanıtın doğası), S6–S10 *kapsam*
> sınırlarıdır (cihaz/uzman/ayırt edilemezlik). Hiçbiri "ölçüm gevşetildi" anlamına gelmez;
> aksine her biri ölçümün nerede **durduğunu** açıkça söyler.

### 7.29 Yirmi birinci denetim — sınıfı YAPISAL olarak kapatma (F22-0)

> Yirmi turun her biri "bir alan daha vardı" buldu. Kök neden **tek tek alan kapatmak**tı:
> kapatılan her alanın bir kardeşi, bir alt alanı, bir liste kaydı ya da bir üst düzey kopyası
> açıkta kalıyordu. Bu tur yöntemi değiştirdi.

**F22-0 — kapalı alan sözleşmesi (`MANIFEST_FIELD_CONTRACT`).** Manifestte **beyan edilen her
alan** bir tabloda kayıtlı olmak zorunda ve her kayıt ya `anchor:<bağımsız kaynak>` ya da
`derived:<gerekçe>` olarak sınıflanır. `validateManifest`, manifestteki alan yollarını bu
tabloyla karşılaştırır: **kayıtlı olmayan tek bir alan manifesti reddettirir.**

Sonuç: yeni bir beyan alanı eklemek, onu **çapalamadan** mümkün değildir. "Bir alan daha vardı"
turı yapısal olarak sona erer — bir sonraki alan ya tabloda gerekçesiyle durur, ya da manifest
geçersizdir.

**Tablo yazılırken 8 gizli alan daha ortaya çıktı** (yani sözleşme hemen işe yaradı):
`glyphEvidence.imagePixels.{width,height,bytes}`, `glyphEvidence.font.faces[].{family,status,weight,unicodeRange}`,
`glyphEvidence.font.requests[].{name,transferSize}`, `productionFindings[].viewport.{width,height,safeAreaBottom}`,
`ctaReport[].viewport.*`, `rows[].viewport.*`. Hepsi kaydedildi. **DÜZELTME (22. denetim N23-1):** ilk yazımda "ve mevcut kapılara bağlandı" deniyordu; bu YANLIŞTI — o turda yalnız kaydedildiler. Gerçek bağlama §7.28'de yapıldı.

| Doğrulama | Sonuç |
|---|---|
| Sözleşmede olmayan üst düzey alan (`brandNewClaim`) | **rc=1** `manifest alanı sözleşmede kayıtlı değil (çapasız beyan): brandNewClaim` |
| Sözleşmede olmayan satır alanı | **rc=1** `… : rows[].brandNewClaim` |
| Sözleşmede olmayan cta/sheet alanı | **rc=1** `… : glyphEvidence.sheet.newField` |
| `derived:` alanların sayısı | **4** (`generatedAt`, `imageQuality`, `glyphEvidence.imageQuality`, `glyphEvidence.viewportHeightDuringCapture`) — kanıt olarak aktarılmazlar |
| Tablo büyüklüğü | **170 kayıt** (hepsi `anchor:`/`derived:` gerekçeli) |

**Ölçüm.** Negatif öz-test **93 → 100** (3 kabul + 97 ret), fixture **183 → 202**. Sekiz dizin /
519 satır hâlâ `rc=0`; `--kapsam` 7/7; `--glif-karsilastir` PASS. Yani sözleşme **hiçbir gerçek
kanıtı reddetmedi**, yalnız çapasız beyanı reddediyor.

**Ders (yazılı, serinin son dersi).** Yirmi tur "eksik alan" avıydı; yirmi birinci tur **avı
bitiren** tur oldu. Bir kanıt şemasını sertleştirmenin ölçeklenen yolu, alanları tek tek
kapatmak değil, **kapatılmamış alanı temsil edilemez kılmaktır**.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz; `blocked-external` koşum-zamanı artefaktıdır;
`generatedAt`/`imageQuality`/`glyphEvidence.imageQuality` `derived:` olduğu için kanıt olarak aktarılmaz.

### 7.30 Yirminci denetim düzeltmeleri (1 HIGH + 3 MEDIUM + 1 LOW)

> Bu tur iki şeyi gösterdi. Birincisi: 19. turun "kapattım" dediği yedi alanın **biri
> (`productionFindings[].theme`/`.viewport`) hâlâ açıktı**. İkincisi: **hiçbir kapının hiç
> okumadığı** yeni bloklar vardı — ve **yazılan bir tanık (`ser=`) hiç okunmuyordu**, yani
> "zorunlu tanık" iddiası yanlıştı.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F21-1** HIGH | **`productionFindings[].theme`/`.viewport` hâlâ serbestti.** 19. turun F20-1 kaydı bu iki alanı da "kapandı" diye listeliyordu; oysa `theme → "dark"` veya `viewport.width → 390` yapmak **üç kapıda da rc=0** veriyordu. Yani beyan, gerçekten fazlasını iddia ediyordu. | Bulgunun işaret ettiği **satırın kendi ölçümü** ile birebir eşleşmeli (`theme`, `viewport.width/height/safeAreaBottom`); var olmayan sahneye işaret eden bulgu da reddedilir. Ayrıca `coverStack[]`/`overlapsControl[]`/`overlapsContent[]` **kayıtlarının her alanı** satırın `cta` ölçümüyle eşleşir. | `theme="dark"` → **rc=1** `üretim bulgusu (l25-summary): theme 'dark' ≠ satırın teması 'light'`; `viewport.width=390` → **rc=1** `≠ satırın 460`; `coverStack[0].y=0` → **rc=1** `'0' ≠ satırdaki '764'`; `overlapsControl[0].overlapPx=1` → **rc=1** `'1' ≠ satırdaki '44'`. |
| **F21-2** MEDIUM | **`glyphEvidence.sheet.*` bloğunun tamamı okunmuyordu.** `rows 30→29`, `maxH 68→70`, `sheetHeight→100`, `sw→320`, `firstTop→0`, `minH→60` — hepsi `rc=0`. | Sheet, satırın kendi ölçümleriyle **ve** log'la bağlanır: `rows` = dizi sayısı; `minH ≤ maxH` ve `minH > 0`; `lastTop − firstTop ≥ (rows−1)·maxH`; `sw = satır viewport.width`; `sheetHeight = docH = bodyH`; `sheetHeight ≤ scrollH`; son satır sayfaya sığar; **`maxH` = log'daki `h=`**. | `sheet.rows=29` → **rc=1** `≠ dizi sayısı 30`; `maxH=70` → **rc=1** `≠ log.txt'teki h=68`; `sheetHeight=100` → **rc=1** `yükseklikleri çelişiyor (sheetHeight=100, docH=2622, bodyH=2622)`. |
| **F21-3** MEDIUM | **CTA liste kayıtlarının İÇERİĞİ serbestti.** `overlapsContent[0].overlapPx 43→1`, `.y→0`, `.txt→"FAKE"`, `coverStack[0].cls→"FAKE"` hepsi `rc=0` — oysa §7.2 bu sayıları **doğrulanmış** olarak aktarıyor. Yalnız tek bir maksimum değeri log'a yazmak yetmedi: aynı listede ikinci kaydı değiştirmek maksimumu değiştirmiyordu. | Her kayıt listesi için log'a **iki** tanık yazılır: `covPx=`/`coverY=` (baş değerler) **ve** `covH=`/`coverH=` (**tüm listenin normalize edilmiş sha256 özeti**). Herhangi bir kaydın herhangi bir alanı değişirse özet değişir. | `overlapsContent[0].overlapPx=1` → **rc=1** `özeti ff6eaf425bb7 ≠ log.txt'teki covH=c40f36d71945`; `coverStack[0].cls="FAKE"` → **rc=1** `coverStack özeti df2037595eae ≠ …`; **ikinci** kaydı değiştirmek de **rc=1** (`overlapsContent[1].txt`, `coverStack[1].y`). |
| **F21-4** MEDIUM | **`ser=` "zorunlu tanık" diye yazıldı ama HİÇ OKUNMADI.** `log.txt` ve `row.log[]`'dan silmek `--dogrula`'da **rc=0** veriyordu; değerini değiştirmek yalnız satır metni eşleşmediği için yakalanıyordu, anlamsal bir denetim yoktu. Bu bir **yanlış beyandı** (alan açıkta değildi: `series[].sha256` zaten içerikten türetiliyordu). | `ser=`, **iki** kapıda da (`--dogrula` ve `--glif-karsilastir`) zorunlu ve manifestteki 30 dizinin birleşik özetiyle birebir eşleşir. | `ser=` silinmiş → **rc=1** `glif log satırı ser= taşımıyor — 30 dizi özeti çapalanamaz`. |
| **N21-1** LOW | **Manifest üstbilgisi okunmuyordu.** `origin → "http://evil.com"`, `mode → "xyz"`, `card → "K3PD-99"`, `captureScales → []`, `schemaVersion → 9` hepsi üç kapıda da `rc=0`. `log.txt` gerçek `origin: http://127.0.0.1:9000` satırını taşıyordu — bağımsız tanık vardı, manifest kopyası bağlı değildi. | `origin` yalnız `http://127.0.0.1:9000` olabilir **ve** `log.txt`'teki `origin:` satırıyla eşleşmeli; `card` = `K3PD-29`; `mode` kapalı enum (`tam` \| `glif-referans`) **ve** satır sayısıyla tutarlı; `captureScales` satırlardan ölçülen kümeyle eşleşmeli; `schema`/`schemaVersion` sabit; `profile` **log'daki `tmp-profil: … önek=`** ile eşleşmeli. | `origin="http://evil.com"` → **rc=1** `≠ tek izinli origin`; `mode="xyz"` → **rc=1** `geçersiz (tam | glif-referans)`; `card="K3PD-99"` → **rc=1**; `captureScales=[]` → **rc=1**. |

**Tek-alan tahrifat matrisi: 23/23 `rc=1`.** `pf-theme`, `pf-vp`, `coverstack`, `coverscontent`,
`overscontent`, `serdel`, `origin`, `mode`, `card`, `scales`, `sheetrows`, `sheetmaxH`, `sheeth`,
`sel`, `covn`, `lscroll`, `onb`, `series`, `pixels`, `capscale`, `x`, `dialogRight` — ve bunlara ek
olarak 19. turdan devralınan `ctaW`/`ctaH`/`focus`. Negatif öz-test **83 → 93** (3 kabul + 90 ret),
fixture **177 → 183**.

**Ders (yazılı).** İki kural: (1) bir alanı "kapattım" demek, o alanın **her kardeş alanını ve
kayıt içeriğini** de çapalamayı gerektirir; (2) **yazılan tanık, OKUNMADIKÇA tanık değildir** —
`ser=` tam olarak bunu gösterdi. Ayrıca bir beyan (F20-1'in "yedi alan kapandı" ifadesi) gerçekten
fazlasını iddia ediyorsa, bu **kanıt kaybı kadar ciddi** bir bulgudur; bu yüzden düzeltme kaydı
yalnız "ne yapıldı" değil "önceki iddia neden yanlıştı" biçiminde yazıldı.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz; `blocked-external` koşum-zamanı artefaktıdır.

### 7.31 On dokuzuncu denetim düzeltmeleri (1 MEDIUM + 1 MINOR)

> Bu tur **yeni bir kaçış sınıfı** buldu: **hiçbir kapı tarafından okunmayan beyan alanları**.
> Önceki 18 tur, `visible`/`height`/`x` gibi **kabul kararını** etkileyen alanları çapaladı;
> ama manifestte duran ve EVIDENCE'ın "doğrulandı" diye aktardığı **tanıklık alanları**
> (onboarding teması, CTA seçicisi, içerik örtülmesi, yerel kaydırma, glif seri hash'leri,
> glif piksel boyutu) hiçbir gate tarafından okunmuyordu ve tek düzenlemeyle yeniden
> yazılabiliyordu.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F20-1** MEDIUM | **Yedi beyan alanı hiçbir kapıda okunmuyordu.** Denetçi her birini tek alanla değiştirdi ve `--dogrula`/`--kapsam`/`--glif-karsilastir` **rc=0** verdi: `dark-390` onboarding satırında `verifiedTheme.onb` `dark→light` (oysa `log.txt`'te `onboardingTheme:"dark"` yazıyor); `cta.selector` → `"body"`; `cta.overlapsContent` → `[]`; `cta.scroll.localScroll` → `true`; `glyphEvidence.series[0].sha256` → `'f'×64` (**hem** `--dogrula` **hem** `--glif-karsilastir` yeşil); `glyphEvidence.captureScale`/`imagePixels` → `2`/`{1,1}`; `productionFindings[].theme`/`viewport`. EVIDENCE §5 bunlardan birini ("`data-onboarding-theme` … koşum temasıyla aynıdır") ve §8.1 başka birini ("her birinin kaynağı ve SHA-256'sı kayıtlı") **doğrulanmış gerçek** olarak aktarıyordu. | (a) Log'a beş yeni tanık yazılır ve **zorunludur**: `sel=` (seçicinin sha256 öneki), `covN=` (`overlapsContent` uzunluğu), `lscroll=` (`scroll.localScroll`), `onb=` (onboarding satırlarında `data-onboarding-theme`), `ser=` (30 dizinin birleşik sha256'sı). (b) `overlapCovered` ve `scroll.localScroll` **türetilir** (`overlapsContent.length > 0`; `scrollHeight > clientHeight + 1`), beyan kabul edilmez. (c) `glyphEvidence.series[]` alanlarının **tamamı** (`ar`, `sha256`, `source`, `corpus`, `marks`, `index`) canlı doğrulanmış içerikten yeniden türetilen 30 diziyle birebir eşleşmeli. (d) `glyphEvidence.imagePixels`/`captureScale` **diskteki görüntüden** yeniden ölçülür. | Her mutasyon **rc=1**: `CTA selector log.txt'teki sel=5a43fe942ce7 ile eşleşmiyor` · `CTA overlapsContent 0 kayıt ≠ log.txt'teki covN=4` · `CTA scroll.localScroll true ≠ log.txt'teki lscroll=false` · `verifiedTheme.onb 'dark' ≠ log.txt'teki onb=light` · `glyphEvidence.series[0].sha256 kendi metninden yeniden türetilen hash ile eşleşmiyor` · `glyphEvidence.imagePixels.width 1 ≠ diskteki 1840`. Negatif öz-test **72 → 83** (11 yeni ret vakası), fixture **171 → 177** (6 yeni iddia). |
| **N20-1** MINOR | **`blocked-external` makbuzu tekrar üretmiyordu.** EVIDENCE "7 koşumda **84**" diyordu; o sıradaki kanıt kümesinde bir koşum **83**'tü (toplam 587, 588 değil). | Sayı, sayfanın kaç dış istek **denemesi** yaptığına bağlı bir **koşum-zamanı artefaktıdır** ve koşumlar arası ±1 oynayabilir; sözleşme değildir. Makbuz artık bu koşumda **ölçülen** değerleri tek tek yazar ve oynaklığı açıkça belirtir. **Ölçüm gevşetilmedi:** güvenlik iddiası "dış ağ CDP ile kesildi"dir; `blocked-external` bunun sayısıdır, kabul ölçütü değildir. | Bu kanıt kümesinde (yeniden üretim sonrası) ölçülen: 84 × 7, glif referansında 0. |

**Ders (yazılı):** bir kanıt alanı **iki** şeyden birini yapmalıdır — ya bağımsız bir kaynaktan
**yeniden türetilmeli**, ya da EVIDENCE onu **doğrulanmış gerçek** olarak aktarmamalıdır.
"Manifestte duruyor" doğrulama değildir. 19 tur boyunca kabul kararını etkileyen alanlar
kapatıldı; **tanıklık** alanları aynı ölçüde bağlayıcı olmadığı için açıkta kaldı.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz.

### 7.32 On sekizinci denetim düzeltmeleri (1 HIGH)

> Bu tur, 16/17. turların çapaladığı **dikey** eksenin yanında **yatay** eksenin hiç
> okunmadığını buldu. Aynı sınıfın (CTA görünürlüğü) üçüncü kez yarısı açık kalmıştı.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F18-1** HIGH | **`cta.x` / `cta.dialogRight` hiçbir kapıda okunmuyordu ve log'da tanıkları yoktu.** Sözleşme alanıydılar ama `validateControlGeometry` yalnız `width/height/y/dialogBottom` üzerinden **dikey** görünürlük türetiyordu. Yatayda tamamen ekran dışına taşınan bir eylem (`x = -1000`) `visible:true` olarak geçiyordu; `width` 358→900 yapıp diyaloğun sağ kenarından taşırmak da geçiyordu. 42/42 CTA satırının tamamı etkileniyordu. | (a) Görünürlük artık **iki eksende** türetilir: `x >= 0` **ve** `x + width <= dialogRight + 1`. (b) Çekim aracı her log satırına **`ctaX=` / `ctaR=`** yazar (CTA yoksa `-1`); CTA satırlarında zorunludur ve manifest beyanıyla birebir eşleşir. (c) `x`/`dialogRight` eksikse sert hata. | (a) `x=-1000` (manifest) → **`rc=1`** `CTA x -1000 ≠ log.txt'teki ctaX=35` (42 satırın tamamı). (b) `x=-1000` **manifest + log birlikte** yamalandığında da **`rc=1`** `CTA yatayda diyalog dışında: x=-1000, width=320, dialogRight=390` — yani log çapası tek başına son savunma değil. (c) `width=900` → **`rc=1`** yatay taşma. (d) `dialogRight` silinmiş → **`rc=1`** `CTA yatay geometrisi eksik`. Negatif öz-test: 3 yeni ret vakası (65→69 CTA/log, toplam **72**). |

**Ders (yazılı, 17. turun dersinin devamı):** "görünür" iki boyutlu bir yargıdır. 16. tur
`visible`'ı türetti, 17. tur türetimin **dikey** girdilerini çapaladı, 18. tur **yatay**
girdilerin hiç var olmadığını gördü. Aynı sınıf üç turda kapanabildi; bu yüzden kural artık
şu: bir görünürlük/kırpılma yargısı **her iki eksende** hem türetilmeli hem log'la çapalanmalı.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz.

### 7.33 On yedinci denetim düzeltmeleri (1 HIGH + 2 MEDIUM)

> Bu tur, **16. turun kapattığını iddia ettiği sınıfın kalan yarısını** buldu: `cta.visible`
> türetilmişti ama kardeş alanları beyan olarak kalmıştı. Ders: bir sınıfı kapatmak, o sınıfın
> **her** alanını çapalamayı gerektirir.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F17-1** HIGH | **`height` / `width` / `focusReachable` hâlâ saf kendi beyanıydı.** 16. tur yalnız `visible`'ı geometriden türetti; `height` (`≥44`), `width` ve `focusReachable` doğrudan satırdan okunuyordu ve `log.txt`'te hiçbir tanıkları yoktu. Tek alanla `height 12→50`, `focusReachable false→true`, `width 20→350` yapıldığında `rc=1` sessizce `rc=0` oluyordu. | Çekim aracı her sahne log satırına **`ctaW=` / `ctaH=` / `focus=`** yazar (CTA yoksa `-1` / `-1` / `false`); CTA satırlarında bu üç token zorunludur ve beyanla birebir eşleşir. | `ctaH=12` (log) + `height=50` (manifest) → **`rc=1`** `CTA height 50 ≠ log.txt'teki ctaH=12`; `focus=false` + `true` → **`rc=1`** `CTA focusReachable true ≠ log.txt'teki focus=false`; `ctaW=258` + `width=350` → **`rc=1`** `CTA width 350 ≠ log.txt'teki ctaW=258`. |
| **F17-2** MEDIUM | **`glyphEvidence.scene` serbest bir alandı ve log araması `else`'siz `if` ile korunuyordu.** Onu `log.txt`'te bulunmayan bir dizeye çekmek **tüm** font karşılaştırmasını sessizce atlatıyordu (7/7 koşumda ve `glif-referans`'ta). Yani 16. turun kapattığı F16-3, tek alanla yeniden açılabiliyordu. | `glyphEvidence.scene`, eşleşen **glif satırının** `scene`'i olmak zorunda; log satırı bulunamazsa bu **sert hata**dır (sessiz `else` yok). | `scene='nope'` + `faces/requests` boşaltıldı → **`rc=1`** `glyphEvidence.scene 'nope' eşleşen glif satırının scene'i 'g1-30-zor-glif' ile çelişiyor` + `glyphEvidence.font yüklü=0 ≠ log.txt'teki loaded=true`. |
| **F17-3** MEDIUM | **`visible` türetiminin girdileri çapasızdı.** `dialogBottom` beyandı ve `viewport.height`/log `vh=` ile karşılaştırılmıyordu; `1000` yapınca ekran dışındaki eylem "görünür" oluyordu. Ayrıca `y + scrollTop == layoutY` bağı (294/294 satırda doğru) hiç denetlenmiyordu; `y=285, layoutY=900` geçiyordu. | `dialogBottom`, `viewport.height` ile eşleşmeli; `y + scrollTop`, `layoutY` ile eşleşmeli (±1 px). | `dialogBottom=1000` + `visible=true`, `y=900` → **`rc=1`** `CTA dialogBottom 1000 ≠ viewport.height 844`. |

**Ders (yazılı):** bir kaçış sınıfını kapatmak, o sınıfın **her** alanını bağımsız bir kaynağa
bağlamayı gerektirir. 16. tur `visible`'ı çapaladı, kardeşlerini bıraktı; 17. tur onları da
çapaladı. Aynı hata iki turda tekrarlandığı için bu ders EVIDENCE'a yazıldı.

**Kalan sınır (değişmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş tanık; glif
piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği için ayrı log tanığı
yok; tutarlı çok-alan imali hash-tabanlı yakalanmaz.

### 7.34 On altıncı denetim düzeltmeleri — kabul maddesi odaklı (1 HIGH + 2 MEDIUM)

> Bu tur **farklı bir soruyla** koşuldu: "kabul maddeleri gerçekten karşılanıyor mu, ve kalan
> kaçaklar belgelenmiş sınırın **dışında** mı?" Denetçi önce 9 kabul maddesini tek tek
> **MET / NOT_MEASURED / FAIL (bildirilmiş)** olarak doğruladı (hepsi geçti), sonra belgelenmiş
> beş sınırın kapsamadığı kaçakları aradı. Üç tane bulundu.

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F16-1** HIGH | **`cta.visible` / `focusReachable` / `height` saf kendi beyanıydı.** Üçü de yalnız `rows[].cta`'dan okunuyor, hiçbir şeyle karşılaştırılmıyordu; `log.txt`'te `visible=`/`focus=`/`height=` tanığı yoktu. Tek karakterlik düzenleme (`visible: false → true`) **ekran dışında kalmış bir birincil eylemi** yeşile çeviriyordu — `rc=1` → `rc=0`. Bu, belgelenmiş beş sınırın **hiçbirine** girmiyordu (sınır #4 yalnız ikinci *stabilite* örneği hakkında; bu ise **satır başına tek alan**). | `visible` artık **geometriden yeniden türetilir** — çekim aracının yazdığı formülün aynısı: `width>0 && height>0 && y < dialogBottom-1 && y+height > 1`. Geometri eksikse (herhangi bir alan yoksa) bu da sert hatadır; "türetilemiyor" sessizce geçmez. | Ekran dışı eylem (`y=900`) + `visible=true` → **`rc=1`** `CTA visible beyanı true ama geometri false diyor: l01-goal`. |
| **F16-2** MEDIUM | **≥44 px kuralı yalnız yükseklikteydi.** `cta.width` hiç denetlenmiyordu; 20×50 px bir eylem — hiçbir okumada ≥44 px hedef değil — iki kapıdan da geçiyordu. | Kural **her iki boyutta** uygulanır. | `width=20` → **`rc=1`** `CTA hedefi genişliği 20px < 44px: l01-goal`. |
| **F16-3** MEDIUM | **`glyphEvidence.font` `--dogrula`/`--kapsam`'da okunmuyordu.** Yalnız `--glif-karsilastir` (tek çift) çapalıyordu; diğer **altı koşuda** blok serbestçe boşaltılabiliyordu — "yazılıyor ama okunmuyor" sınıfı. | Font bloğu artık `--dogrula`/`--kapsam`'da da zorunlu ve log'daki `loaded=`/`woff2=`/`metrics=` ile eşleştirilir. | `faces`/`requests` boşaltıldı → **`rc=1`** `glyphEvidence.font yüklü=0 ≠ log.txt'teki loaded=true` + `requests 0 ≠ woff2=1`. |

**Kabul maddesi tablosu (denetçinin bağımsız ölçümü, 16. tur):** 9 maddenin **8'i MET**,
1'i **bildirilmiş FAIL** (`l25-summary` 44 px; düzeltmesi yazma allowlist'i dışında). Denetçi
pikselleri kendisi ölçtü: `light-390` ort. parlaklık 227.1 vs `dark-390` 38.3, **74/74 sahne**
ayrışıyor (tema etiket değil, ölçüm). 30 dizinin 30'u canlı modüllerden yeniden çözüldü
(12 lexicon + 6 example + 12 sûre, hepsi `sourced`). 519 satır = 519 görüntü = 519 log satırı,
0 hash uyuşmazlığı, 294/294 CTA `maxDelta = 0`.

**Kalan sınır (değişmedi, genişletilmedi):** envanterin mutlak tabanı yok; `issues.txt` türetilmiş
tanık; glif piksel↔font bağı makine ile denetlenmez; CTA'nın **ikinci** stabilite örneği
(`again.layoutY`) için ayrı log tanığı yok (yalnız `layoutYs[0]` satıra çapalı); tutarlı çok-alan
imali hash-tabanlı yakalanmaz.

### 7.35 On beşinci denetim düzeltmeleri (2 MAJOR + 2 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F15-1** MAJOR | **`ctaReport[].layoutYs` satırın kendi ölçümüne bağlı değildi.** `noteYs()` `layoutYs`'i `[cta.layoutY, again.layoutY]` olarak kurar ve aynı `cta.layoutY` manifestte `rows[].cta.layoutY` olarak durur — ama doğrulayıcı `rows[].cta.layoutY`'i **hiç okumuyordu**. Tek alanı (`layoutYs: [400,400]`) değiştirmek, satır 285 derken koşumun "eylem y=400'deydi" demesine izin veriyordu. **Gerçek bir kayma da aynı yolla silinebiliyordu**, yani "CTA ≤8 px PASS" makine ile doğrulanamıyordu. | `layoutYs[0]`, eşleşen satırın `cta.layoutY`'siyle (±1 px tolerans) karşılaştırılır; kayıt ölçüm satırıyla eşleşmezse de hata. | `layoutYs=[400,400]` yapıldı (satır 285) → **`rc=1`** `CTA layoutYs[0] 400 ≠ satırdaki cta.layoutY 285: l01-goal`. |
| **F15-2** MAJOR | **`glyphEvidence` opsiyoneldi.** Blok yoksa doğrulama sessizce atlanıyordu; yedi koşumun **altısından** (ve `glif-referans`'tan) silmek iki manifest kapısından da geçiyordu. Yalnız `--glif-karsilastir` fark ediyordu ve o da tek bir çift üzerinde koşuyor. | Glif satırı (`sceneKind==='glyph'` veya `profile==='glif'`) taşıyan manifestte `glyphEvidence` **zorunludur**. | Blok silindi → **`rc=1`** `glif satırı var ama glyphEvidence bloğu yok — font/30-dizi kanıtı eksik` (hem `--dogrula` hem `--kapsam`; `glif-referans` için de). |
| **F15-3** MINOR | **`collisions=`/`collisionPx=` zorunlu-token listesinde değildi.** §3 "herhangi biri eksikse sert hata" diyordu; CTA taşımayan ~32 satır için bu yanlıştı (orada alanlar koşullu). | Belge daraltıldı: bu iki token yalnız **CTA taşıyan** satırlarda zorunlu; diğer tokenlar her satırda. | EVIDENCE §3 tablosu güncellendi. |
| **F15-4** MINOR | **`hiddenPx` yazıcı/doğrulayıcı formülü uyuşmuyordu.** Yazıcı `min(cta.height, coverStack[0].h)` yazıyor, doğrulayıcı ham `coverStack[0].h` bekliyordu. Eylemden **yüksek** bir örtücü (ör. `light-320`'de `SECTION h=147`) olduğunda araç kendi çıktısını reddederdi. | Yazıcı artık **ham** `coverStack[0].h` değerini yazar. | Gönderilen kanıtta `coverStack[0].h = 44 < cta.height = 50` olduğu için `min()` zaten eşitti; kanıt geçerliliğini korur. |

**Kapanan sınıf:** `ctaReport` artık satırların ham ölçümüne bağlı, `glyphEvidence` glif satırı
varsa zorunlu ve satır+disk ile eşleşiyor. Yazıcı/doğrulayıcı formülleri hizalı.

**Kalan sınır (değişmedi):** envanterin **mutlak tabanı yok**, `issues.txt` **türetilmiş** tanık,
glif piksel↔font bağı makine ile denetlenmez ve **`cta_hidden_by`'ın ikinci örneği** (`again.layoutY`)
log'da ayrı bir tanık taşımaz — yalnız `layoutYs[0]` satıra çapalıdır.

### 7.36 On dördüncü denetim düzeltmeleri (2 CRITICAL + 1 MAJOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F14-1** CRITICAL | **`row.log` dekoratifti.** Log bloğu yalnız `sceneLines.includes(line)` — yani metnin `log.txt`'te **herhangi bir yerde** bulunması — denetliyordu; satırın sahne öneki `row.scene` ile **hiç** karşılaştırılmıyordu ve çapalar `loggedVw.get(row.scene)`'ten (yani `log.txt`'in kendi satırından) okunuyordu. Bu yüzden `row.log`'u başka bir sahnenin satırıyla değiştirmek **tek alanlık** bir kaçıştı ve F10-5'in kapattığı sınıfı yeniden açıyordu. | Satırın log metni artık (a) sahne öneki `row.scene` ile aynı olmalı, (b) `log.txt`'te birebir bulunmalı ve (c) **aynı log satırı iki manifest satırına atanamaz**. | `v01-home`'un `log`'u `v02-units`'in satırıyla değiştirildi → **`rc=1`** `log satırı sahne adıyla çelişiyor: satır 'v02-units' ≠ row.scene 'v01-home'` + `aynı log satırı birden çok manifest satırına atanmış`. |
| **F14-2** CRITICAL | **`screenshot`/`sha256` sahneye bağlı değildi.** Disk geçişi dosyanın varlığını, hash'i ve piksel genişliğini denetliyordu, ama adın sahneden türediğini dayatmıyordu. İki satırın `screenshot`+`sha256` çiftini takas etmek (**iki alan**) bir sahnenin **tüm görsel kanıtını** başka bir ad altına taşıyordu; iki görüntü de aynı genişlikte olduğu için piksel denetimi de geçiyordu. | `screenshot` adı **`${scene}.<png|webp>`** olmak zorunda (çekim aracının yazıcı sözleşmesi). Disk gerektirmediği için `root` korumasının dışında denetlenir. | Takas edildi → **`rc=1`** `screenshot adı sahneden türetilmemiş: 'v02-units.webp' ≠ 'v01-home'`. |
| **F14-3** MAJOR | **`glyphEvidence` "bir satıra" bağlıydı, "glif satırına" değil.** `find(row => row.screenshot === shot)` sıradan bir `view` satırını da kabul ediyordu; glif kanıtı bir `view` satırına yönlendirildiğinde manifest kendi kendisiyle çelişiyor, ama yalnız `light-460` `--glif-karsilastir`'dan geçtiği için **altı koşumda** fark edilmiyordu. | Eşleşen satırın `sceneKind === 'glyph'` ya da `profile === 'glif'` olması zorunlu. | `v03-unit` satırına yönlendirildi → **`rc=1`** `glyphEvidence.screenshot bir glif satırına bağlı değil: v03-unit.webp (sceneKind 'view', profile 'ana')`. |

**Kapanan sınıf:** artık **kimlik zinciri** bağlıdır — `scene` → `log` satırı (önek + tekil atama) →
`screenshot` adı (`${scene}.<ext>`) → disk baytları (sha256 + RIFF/IEND + piksel genişliği) →
`glyphEvidence` (yalnız glif satırı) → `log.txt`'teki çapa tokenları. Bu zincirin **herhangi bir
halkasını** tek veya iki alanla koparmak reddedilir.

**Kalan sınır (değişmedi):** envanterin **mutlak tabanı yok** (kart ekran sayısını sabitlemeyi
yasaklar), `issues.txt` **türetilmiş** tanıktır ve glif piksel↔font bağı makine ile denetlenmez.

### 7.37 On üçüncü denetim düzeltmeleri (1 CRITICAL + 2 MAJOR + 1 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F13-1** CRITICAL | **Glif satırları envanterden de atlıyordu.** F12-2 "tüm sahnelere" genişletildiğini kaydediyordu ama kodda `if (row.profile === 'glif') continue;` **hem** matris anahtarını **hem** `combo.scenes`/`combo.byProfile` kaydını atlıyordu. Tek koşumdan (veya 5/7 koşumdan) glif satırını dört artefaktla birlikte silmek iki kapıdan da geçiyordu; `g*` üzerindeki bir `SERT:` bulgusu satır silinerek temizlenebiliyordu. | Glif satırı matrise **girmez** (sabit 460 px), ama envanter artık **koşum başına ayrı** tutulup karşılaştırılır; hiç glif satırı olmayan koşum ayrıca reddedilir. | `dark-460`'dan glif satırı dört artefaktla silindi → **`rc=1`** `glif sahne envanteri koşumlar arasında farklı (2 farklı liste)` + `bir koşumda hiç glif satırı yok`. |
| **F13-2** MAJOR | **`glyphEvidence` iki kabul kapısında hiç okunmuyordu.** Yalnız `--glif-karsilastir` ona bakıyordu; glif satırı silindiğinde manifest hâlâ var olmayan bir dosyayı ve hash'ini gösteriyor, `--dogrula`/`--kapsam` yeşil kalıyordu. | `validateManifest` artık `glyphEvidence`'ı satırlara **ve** diske bağlar: `screenshot` bir satıra karşılık gelmeli, `sha256`'lar eşleşmeli, dosya diskte olmalı, `seriesCount` = `series.length`. | Aynı silme → **`rc=1`** `glyphEvidence.screenshot 'g1-30-zor-glif.webp' hiçbir manifest satırına karşılık gelmiyor` + `diskte yok`. |
| **F13-3** MAJOR | **`node=`/`text=` yazılıyor ama hiç ayrıştırılmıyordu** — üstelik EVIDENCE §5 o1/o2/o3–o7 yüzey dağılımını bu alanlara dayandırıyordu, yani atıfın çapası yoktu. | İkisi de ayrıştırılır; **onboarding** satırlarında zorunludur (eksikse sert hata). | `o1-ilk-acilis-1` log'undan ` node=onboarding` silindi → **`rc=1`** `onboarding log satırı node= taşımıyor — yüzey tanığı yok`. |
| **F13-4** MINOR | **`hard=` yazıcı/ayrıştırıcı ayırıcısı uyuşmuyordu.** Yazıcı `,` ile birleştiriyor, ayrıştırıcı `|` bekliyordu; çok türlü satırlar sessizce kırpılıyordu ("tam eşitlik" iddiası yalnız tek türlü satırlarda doğruydu ve gerçek iki türlü bir koşum yanıltıcı hatayla reddedilirdi). | Ayrıştırıcı `[,|]` kabul eder; birleştirme de buna göre bölünür. | `hard=DIŞARI-TAŞAR,DİKEY-KIRPILIR` artık iki tür olarak okunur (birim sınamasıyla doğrulandı). |

**Kapanan sınıf:** çekim anında yazılan **her** tanık artık okunuyor ve eksikliği sert hatadır —
`theme=`, `surface=`, `vw=`, `vh=`, `inset=`, `hidden=`, `hiddenPx=`, `collisions=`, `collisionPx=`,
`overflowX=`, `hard=` (her satırda), `node=`, `text=` (onboarding'de), glif
`loaded=`/`woff2=`/`distinct=`/`check=`/`metrics=`. Ayrıca `glyphEvidence` bloğu satır+disk ile
bağlanır ve glif envanteri koşumlar arasında karşılaştırılır.

**Kalan sınır (değişmedi):** envanterin **mutlak tabanı yok** (kart ekran sayısını sabitlemeyi
yasaklar), `issues.txt` **türetilmiş** tanıktır ve glif piksel↔font bağı makine ile denetlenmez.
Bu üçü mutlak iddia olarak sunulmuyor.

### 7.38 On ikinci denetim düzeltmeleri (2 MAJOR + 1 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F12-1** MAJOR | **`overflowX=` yazılıyor ama hiç okunmuyordu.** Taşma kabulü **yalnız** `rows[].issues` içindeki `SERT:` beyanına dayanıyordu — yani doğrulanan dosyanın kendi beyanına. Çekim anında hesaplanan gerçek boolean log'a yazıldığı hâlde ayrıştırılmıyordu; ayrıca beş sert türün **üçünün** (`DIŞARI-TAŞAR`, `DİKEY-KIRPILIR`, `METIN-KIRPILIR`) log'da hiçbir tanığı yoktu. | Log'a `hard=` eklendi: **beş** sert türün tamamı yazılır (`yok` = hiçbiri) ve `SERT:` beyanıyla **birebir** eşleşmek zorundadır; `overflowX=` da `hard=` ile tutarlı olmalı. `hard=` alanı zorunludur (silinirse hata). | `v01-home` log'unda `overflowX=true` yapılıp `issues` boş bırakıldı → **`rc=1`** `log.txt overflowX=true ama hard=[]`. Ters yön (manifestte `SERT:` var, log'da `hard=yok`) da **`rc=1`**. |
| **F12-2** MAJOR | **`--kapsam` envanter karşılaştırması `o*` ve `g*` sahnelerini dışlıyordu.** Tek koşumdan onboarding/glyph satırı silmek (manifest + log + `issues.txt` + disk birlikte, dört artefakt tutarlı) her iki CLI'dan da geçiyordu; dahası `o*` üzerindeki bir `SERT:` bulgusu **satırı silerek** temizlenebiliyordu. | Karşılaştırma artık **tüm** sahneler üzerinde **ve** profil bazında ayrıca yapılır. | `light-390`'dan `o2…o7` dört artefakt birlikte silindi → `--kapsam` **`rc=1`** `sahne envanteri kombinasyonlar arasında farklı (2 farklı liste)` + `profil bazlı sahne envanteri … farklı`. |
| **F12-3** MINOR | **Glif "önce" görüntüsü bildirilen font durumuna bağlı değildi.** Fontsuz referans `.webp` yerine **güncel fontlu** sayfanın tek bayt oynatılmış kopyası konup iki hash alanı yamalanınca `--glif-karsilastir` geçiyordu; tek piksel-düzeyi savunma `before.actualSha !== after.actualSha` idi. | Bu bağ **makine ile kurulamaz** (pikselden font yüklemesi okunamaz). Bu yüzden kod değişmedi; **mutlak ifade yumuşatıldı**: "iki kez çekimi reddeder" → **"bit-eydeş iki kez çekimi reddeder"**, ve piksel↔font bağının makine ile denetlenmediği §8.4 ile §11'e yazıldı. Kanıt bütünlüğü bozulmadı: gönderilen referans gerçekten fontsuz (`0beb6d0d`, `@font-face` 0, `assets/kao/font` yok). | Denetçi tahrifatı **`rc=0`** aldı; bu artık **belgelenmiş sınır** olarak yazılı, iddia değil. |

**Kapanan sınıf:** çekim anında yazılan **her** tanık artık okunuyor — `theme=`, `surface=`, `vw=`,
`vh=`, `inset=`, `hidden=`, `hiddenPx=`, `collisions=`, `collisionPx=`, `overflowX=`, `hard=`,
`node=`, `text=` (yalnız onboarding satırlarında; 13. turda bağlandı), glif `loaded=`/`woff2=`/`distinct=`/`check=`/`metrics=`. Eksik alan **sert hata**dır.

**Kalan sınır (değişmedi ve daraltılamaz):** envanterin **mutlak tabanı yok** (kart ekran sayısını
sabitlemeyi yasaklar) ve `issues.txt` **türetilmiş** tanıktır; glif piksel↔font bağı makine ile
denetlenmez. Bu üçü mutlak iddia olarak sunulmuyor.

### 7.39 On birinci denetim düzeltmeleri (1 CRITICAL + 1 MAJOR + 1 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F11-1** CRITICAL | **Bütün log çapaları `vw=` eşleşmesine bağlıydı.** Sahne log haritasına yalnız `\bvw=(\d+)\b` eşleşirse giriyor, satır döngüsü de `if (!logged …) continue;` ile çıkıyordu. Yani **` vw=390` token'ını silmek (11 karakter)** tema, `surface`, viewport ve çakışma çapalarının **hepsini** sessizce kapatıyordu — 10. turda eklenen çapalar dâhil. Bu, kartın kapattığını iddia ettiği fail-open sınıfının ta kendisiydi. | Harita artık **koşulsuz** kaydeder (`if (sceneName)`), eksik gösterge tokenı (`vw=`, `vh=`, `inset=`, `theme=`, `surface=`, `hidden=`, `hiddenPx=`) **açık hata**dır. | `dark-390`'dan ` vw=390` silinip satır log'u yeniden hizalanıp tema `light`'a çevrildi → **`rc=1`** `log.txt satırı vw= taşımıyor — çapa doğrulanamaz` + `theme 'light' ≠ log.txt'teki theme=dark`. Aynı düzenleme çakışma bulgusunu silmek için de denendi → **`rc=1`**. |
| **F11-2** MAJOR | **`cta.hiddenBy` hâlâ saf kendi beyanıydı.** 10. tur `overlapsControl` döngüsünü kapattı ama **A dedektörünü** (`hiddenBy`) olduğu gibi bıraktı: `hiddenBy=false` yapıp `coverStack` ve bulguyu silmek tek düzenlemeydi. | Örtülme de log'a yazılır (`hidden=`/`hiddenPx=`, çekim anında) ve beyanla eşleşmek zorunda; `hidden=true` iken `coverStack` boş olamaz ve `coverStack[0].h` log'daki `hiddenPx=` ile eşleşir. | `hiddenBy=false` + `coverStack` silindi + bulgu silindi → **`rc=1`** `cta.hiddenBy false ≠ log.txt'teki hidden=true` + `hidden=true ama coverStack boş — örtülme kanıtı yok`. |
| **F11-3** MINOR | **Glif font metrikleri çapasızdı.** `withFont`/`withFallback` yalnız manifestten okunuyordu; log satırı `metrics=3011/4492` taşıdığı hâlde hiç ayrıştırılmıyordu. | `metrics=(\d+)/(\d+)` log'dan ayrıştırılır ve `font.withFont`/`withFallback` ile **birebir** eşleşmek zorundadır; alan yoksa sert hata. | `withFont=1000`, `withFallback=5000` yapıldı (log'a dokunulmadı) → **`rc=1`** `glyphEvidence.font metrics 1000/5000 ≠ log.txt'teki metrics=3011/4492`. |

**Ek sağlamlaştırma:** çekim aracı yazımdan hemen önce disk/manifest sayımını **fail-closed**
doğrular (`disk ≠ manifest` → `failures` → `exit 1`) ve macOS'un `ad 3.webp` kopyalarını
manifest/log/issues dâhil temizler. Bu, 11. turda üç kez yaşanan kopya-ad artefaktını
kanıtı bozmadan yakalar.

**Güncel çapa tablosu (hepsi bağımsız kaynağa bağlı):** `sceneKind` (enum + ad), `profile` (ad
öneki), `maxDelta` (ham `layoutYs`), `overlapsControl` (log `collisions=`/`collisionPx=` + ham
geometri), **`cta.hiddenBy` (log `hidden=`/`hiddenPx=` + `coverStack` geometrisi)**, sahne
envanteri (`log.txt`), `viewport.{width,height,safeAreaBottom}` (`vw=`/`vh=`/`inset=` — **eksikse hata**),
tema (etiket ↔ computed token ↔ disk log `theme=`/`surface=`), `captureScale` (tam sayı ≥1 + gerçek
piksel), ölçüm/görüntü (disk SHA-256, RIFF **chunk yürüyüşü** + PNG IEND), glif font kanıtı
(`faces[].status`, `requests`, log `loaded=`/`woff2=`/`distinct=`/`check=`/`metrics=`).

### 7.40 Onuncu denetim düzeltmeleri (2 CRITICAL + 3 MAJOR + 2 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F10-1** CRITICAL | **Tema çapasızdı.** `row.theme` ile `row.verifiedTheme` **ikisi de manifestten** geliyordu; diskteki `log.txt` `theme=`/`surface=` yazdığı hâlde değerleri hiç okunmuyordu. Gerçek bir koyu koşum yalnız manifest düzenlenerek "açık" gösterilebiliyordu. | Tema artık **üç** kaynaktan çapalanır: satır etiketi ↔ `verifiedTheme` computed tokenları ↔ diskteki `log.txt`. Ayrıca çekim aracı satır etiketine **istenen** temayı değil **ölçülen** `data-theme`'i yazar. | Gerçek `dark-390` yalnız manifestte `light` yapıldı → **`rc=1`** `theme 'light' ≠ log.txt'teki theme=dark` (+ `verifiedTheme.dataTheme` çelişkisi). |
| **F10-2** CRITICAL | **`--glif-karsilastir` tema kapısı aynı beyandı** — iki manifest *string*'i karşılaştırılıyordu. Koyu glif sayfası "açık" etiketlenip geçiyordu. | Glif teması da **disk log'undan** okunur; manifest etiketi log ile çelişirse reddedilir. `glyphEvidence` kendi sahne kimliğini taşır (aksi hâlde log satırı bulunamıyordu). | `dark-460` glif sayfası `light` etiketlendi → **`rc=1`** `tema farklı: önce log.txt 'light', sonra 'dark'` + `manifest teması diskteki log.txt temasıyla çelişiyor`. |
| **F10-3** MAJOR | **Font kanıtı hiçbir kod yolunda okunmuyordu** (`glyphEvidence.font` yalnız yazılıyordu). Tek bayt oynatılmış kopya "gerçek farklı build" sayılıyordu. | Font kanıtı `faces[].status==='loaded'` ve `requests` üzerinden **log.txt değerleriyle** çapalanır; `distinct` tek başına yetmez (fontsuz build'de de `true` çıkar — referans koşumda tam olarak böyleydi). "Önce" koşumu **fontsuz** olmak zorunda; "sonra" koşumunda yüklenmiş face + woff2 isteği + farklı metrik oranı zorunlu. | Gerçek `light-460` tek bayt oynatılıp `reference:true` yapıldı → **`rc=1`** `"önce" koşumunda 1 font-face yüklenmiş` + `1 woff2 isteği var` + `font metrik oranı neredeyse aynı (0.6703, 0.6703)`. |
| **F10-4** MAJOR | **Envanterin mutlak tabanı yok** ve `issues.txt` **türetilmiş** tanıktır (`flatMap(row.issues)`), bağımsız kayıt değil. Yedi koşumun hepsinden aynı sahne silinirse kapı yeşil kalır. | Yapısal düzeltme **kapsam dışı**: kart "ekran sayısını sabitleme" diyor ve `issues.txt`'i ayrı bir tanık yapmak aracın kendi çıktısını ikinci kez yazması olurdu. Bu yüzden iddia **daraltıldı**: EVIDENCE "sayım/log/issues uyuşmazlığı 0" der ama **mutlak envanter tabanı olmadığını** açıkça yazar; `issues.txt` bağımsız tanık olarak **sunulmaz**. | EVIDENCE §1 tablosu `PASS (bounded)` olarak güncellendi; §11 sınırlar listesine eklendi. |
| **F10-5** MAJOR | **Bulgu türetimi çakışma listesinden geliyordu** — `deriveFindings` `cta.overlapsControl`'ü okuyor, doğrulama da aynı alanı karşılaştırıyordu (kapalı döngü). Listeyi boşaltıp bulguyu silmek **tek** düzenlemeydi ve kartın tek açık üretim kusurunu (l25, 44 px) diskte iz bırakmadan siliyordu. | Çakışma sayısı artık **çekim anında sahne log satırına** yazılır (`collisions=`/`collisionPx=`) ve beyanla eşleşmek zorunda; alan yoksa da reddedilir. `overlapsControl` kayıtlarının `overlapPx` değeri CTA'nın kendi `y`/`height` değerleriyle **yeniden hesaplanır** (`validateControlGeometry`). | Liste boşaltılıp bulgu silindi → **`rc=1`** `overlapsControl 0 kayıt bildiriyor ≠ log.txt'teki collisions=1` + `en büyük çakışma 0px ≠ log.txt'teki collisionPx=44`. |
| **F10-6** MINOR | **RIFF uzunluğu yamalanmış kırpık WebP geçiyordu.** Yalnız RIFF toplam uzunluğuna bakılıyordu; dosya kırpılıp uzunluk alanı yeni boyuta yamanınca denetimden geçiyordu (içteki `VP8 ` chunk'ı hâlâ eski boyutu bildirir). | **Chunk yürüyüşü** eklendi: her chunk'ın bildirdiği boyut dosya sınırları içinde kalmalı ve yürüyüş tam olarak dosya sonunda bitmeli. | Dosya yarıya kırpılıp RIFF uzunluğu yamalandı → **`rc=1`** chunk hatası (sha256 değiştiği için ilk hata hash'te çıkar; hash de yeniden hesaplandığında chunk yürüyüşü yakalar). |
| **F10-7** MINOR | **Bulgu sayısı yanlıştı.** Üç belge "3 gerçek üretim kusuru" diyordu; gerçek: koşum başına **2 kayıt**, **1** kusur (`l25-summary`, iki dedektör türü). | Üç yer ve iki belge düzeltildi: "2 kayıt / 1 kusur, 3 dedektör türü". | EVIDENCE §7.4 tablosu, `GUNCEL-DURUM.md`, `COMMANDS.json`. |

**Ölçülen çapa listesi (güncel):** `sceneKind` (enum + ad), `profile` (ad öneki), `maxDelta` (ham
`layoutYs`), **`overlapsControl` (log `collisions=`/`collisionPx=` + ham geometri)**, sahne envanteri
(`log.txt`), `viewport.{width,height,safeAreaBottom}` (`vw=`/`vh=`/`inset=`), **tema (manifest etiketi
↔ computed token ↔ disk log `theme=`/`surface=`)**, `captureScale` (tam sayı ≥1 + gerçek piksel),
ölçüm/görüntü (disk SHA-256, RIFF **chunk yürüyüşü** + PNG IEND), **glif font kanıtı (`faces[].status`,
`requests`, log `loaded=`/`woff2=`/`distinct=`/`check=`)**.

**Kalan gerçek sınır:** birden çok alanı **tutarlı** biçimde imal etmek (satırı `log.txt`,
`issues.txt` ve diskten birlikte silmek) hash-tabanlı yakalanamaz; ayrıca envanterin **mutlak
tabanı yoktur** (kart ekran sayısını sabitlemeyi yasaklar) ve `issues.txt` **türetilmiş** tanıktır.
Bu ikisi artık mutlak iddia olarak **sunulmuyor**.

### 7.41 Dokuzuncu denetim düzeltmeleri (2 MAJOR + 3 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F9-1** MAJOR | **`captureScale` çapasızdı.** Genişlik denetimi `viewport.width × captureScale` çarpımını doğruluyordu — yani iki saldırgan-seçimli sayının **çarpımını**, gerçek cihaz ölçeğini değil. Tek alan (`captureScale=1.21875`) ile 390 px'lik bir çekim 320 px'lik koşumda geçiyordu. | `captureScale` artık **tam sayı ≥1** olmalı (CDP legal değerler); keyfî float reddedilir. Ayrıca `viewport.width` koşumun kendi `log.txt`'indeki `vw=` değerine çapalanır, böylece genişlik beyanı da bağımsız kaynaktan doğrulanır. | 390 px görüntü 320 px koşuma konup `captureScale=1.21875` yapıldı → **`rc=1`** `captureScale tam sayı ≥1 olmalı (1.21875)`. |
| **F9-2** MAJOR | **`viewport` alt alanları `validateManifest`'te doğrulanmıyordu.** `viewport.width` silinince genişlik denetimi sessizce devre dışı kalıyordu; `height`/`safeAreaBottom` yalnız harita anahtarıydı, değiştirilince matris anahtarı kayıyordu. | `viewport.{width,height,safeAreaBottom}` açıkça tip/pozitiflik denetiminden geçer; eksik `viewport.width` **sert hata**dır. Üç alan da log'daki `vw=`/`vh=`/`inset=` değerlerine çapalanır. Log satırı biçimi `vh=` ile genişletildi ve **yedi koşum yeniden üretildi**. | `viewport.width` silindi → **`rc=1`**; `height=9999` → **`rc=1`** `viewport.height 9999 ≠ log'daki vh=844`; `safeAreaBottom=0` (inset koşumunda) → **`rc=1`** `≠ log'daki inset=34`. |
| **F9-3** MINOR | EVIDENCE "ilk hatada durur" diyordu; kod hata toplayıp tek seferde çıkıyor. | İfade "en az bir hata varsa non-zero döner" olarak düzeltildi. | §7.42 |
| **F9-4** MINOR | "Hiçbir tek alan" iddiası — üçüncü kez çürütüldü. | Mutlak ifade kaldırıldı; yerine **ölçülmüş çapa listesi** kondu (hangi alan neye bağlı). | §7.42 son paragraf |
| **F9-5** MINOR | `GUNCEL-DURUM` "56 bulgu, hepsi düzeltildi" diyordu; 9. tur aynı sınıfta yeni kaçışlar buldu. | Kayıt "56 bulgu raporlandı ve düzeltildi; 9. tur aynı sınıfta 2 yeni kaçış buldu" olarak dürüstleştirildi. | `GUNCEL-DURUM.md` |

### 7.42 Sekizinci denetim düzeltmeleri (1 CRITICAL + 1 MAJOR + 1 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **N8-F1** CRITICAL | **`--kapsam` manifesti hiç doğrulamıyordu.** Yalnız envanter + CTA sözleşmesine bakıyordu; hash, görüntü bütünlüğü, tema, `SERT:`, satır↔log envanteri ve disk sayımı **denetlenmiyordu**. Denetçi 7 koşumun hepsinde `sha256` bozup, temayı `#000000` yapıp `SERT:FAKE` ekledi → `--kapsam rc=0 PASS`. | `--kapsam` artık her dizin için `--dogrula` ile **aynı** `validateManifest` çağrısını yapar (log, issues, screenshots, disk eşliği dâhil) ve **en az bir hata varsa** non-zero döner (hata toplayıp tek seferde çıkar). | Aynı tahrifat → **`rc=1`** `'light' etiketli satırda --quran-surface '#000000' ≠ '#F7F5EE'`, `beyan edilen sert taşma`, `sha256 uyuşmuyor`. |
| **N8-F2** MAJOR | **`maxDelta` ham örneklerden türetilmiyordu.** `ctaReport[].layoutYs` hiç okunmuyordu; tek alan (`maxDelta: 30 → 0`) gerçek kaymayı `layoutYs`'te bırakıp kapıyı yeşile çeviriyordu — N7-F1'in "hiçbir tek alan kaçış kapısı değildir" iddiasını çürütüyordu. | `maxDelta` **`layoutYs`'ten yeniden hesaplanır**; beyan ile çelişirse reddedilir. Ayrıca `layoutYs` zorunlu, sayısal olmalı ve `samples` uzunluğuyla eşleşmeli. | `layoutYs:[100,130]` + `maxDelta:0` → **`rc=1`** `CTA maxDelta beyanı 0px ama ham örnekler 30px gösteriyor`. |
| **N8-F3** MINOR | **`profile` çapasızdı.** `validateCoverage` glif satırlarını matristen atladığı için tek alanla (`profile:'glif'`) bir satır matristen düşürülebiliyordu. Ayrıca §7.43'teki "hiçbir tek alan" ifadesi bu yüzden fazla iddialıydı. | `expectedProfile()` eklendi: `o\d+-` → onboarding, `g\d+-` → glif, gerisi ana. Çelişki reddedilir. Dürüst sınır ifadesi buna göre daraltıldı. | `l25-summary` + `profile:'glif'` → **`rc=1`** `profile 'glif' … 'ana' ile çelişiyor`. |

**Ölçülen kapsam (mutlak iddia değil):** aşağıdaki alanlar bağımsız bir kaynağa çapalıdır —
`sceneKind` (enum + sahne adı), `profile` (sahne adı öneki), `maxDelta` (ham `layoutYs`),
sahne envanteri (`log.txt`), `viewport.width` (`log`daki `vw=`), `viewport.height` (`vh=`),
`viewport.safeAreaBottom` (`inset=`), tema (computed tokenlar), ölçüm/görüntü (disk SHA-256,
RIFF/IEND, piksel boyutu) ve `captureScale` (tam sayı ≥1 + `width × scale` = gerçek piksel).

Kalan gerçek sınır: **birden çok alanı birbiriyle tutarlı biçimde** imal etmek (satırı
`log.txt`, `issues.txt` ve diskten birlikte silmek). Bu, kanıtın kendi kendini tanımladığı her
sistemde kaçınılmazdır ve burada açıkça yazılıdır; karşı önlem bağımsız denetçinin çapraz
okumasıdır. **Not:** önceki turlarda "hiçbir tek alan" gibi mutlak ifadeler kullanıldı ve her
seferinde çürütüldü; bu yüzden burada yalnız **ölçülmüş** çapa listesi veriliyor.

### 7.43 Yedinci denetim düzeltmeleri (1 CRITICAL + 2 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **N7-F1** CRITICAL | **`sceneKind` kendi beyanıydı ve doğrulanmıyordu.** Tek alanla üç kural birden yönetiliyordu: (a) glif muafiyeti, (b) `lesson`/`practice`/`feedback` zorunluluğu, (c) `cta` zorunluluğu. Denetçi tek alanla `rc=1 → rc=0` çevirdi **ve** kartın tek açık üretim kusurunu (`l25-summary`) yedi koşumdan sildi. Yani "yapısal alanlar artık muafiyet açmaz" iddiası **yanlıştı**. | `sceneKind` iki bağımsız çapaya bağlandı: **(1) kapalı enum** (`SCENE_KINDS`, 8 değer; bilinmeyen reddedilir) ve **(2) sahne-adı öneki** (`l…-gorev-`→practice, `l…-panel-`→feedback, `v…-`→view, `o…-`→onboarding, `s0-`→s0, `g…-30-zor-glif`→glyph, `z2-`→mastery, ders aşamaları→lesson). Çelişki reddedilir; ad hiçbir desene uymuyorsa tür çapalanamaz ve satır reddedilir. | (a) `l25-summary` → `view` + `cta:null` + bulgu silindi → **`rc=1`** `sceneKind 'view' … 'lesson' ile çelişiyor`. (b) 16 practice satırı `cta:{present:false}` → `rc=1`; `view`'e etiketlenip `cta:null` → **`rc=1`** (çelişki). (c) `zzz-nonsense` → **`rc=1`** `bilinmeyen sceneKind`. (d) Gerçek 8 dizin hâlâ `rc=0`. |
| **N7-F2** MINOR | Sahne envanterinde **taban yoktu**: satırlar 74→6 kırpılsa bile `--kapsam` `PASS` veriyordu (kart "ekran sayısını sabitleme" dediği için sabit sayı dayatmak yanlış olurdu). | Envanter koşumun **kendi `log.txt`'ine** bağlandı: log'daki sahne kümesi ile manifest satır kümesi birebir aynı olmalı (iki yönlü); log'da yinelenen sahne de hata. Sabit sayı dayatılmaz. | 74 satırlık kopya 6'ya kırpıldı (log dokunulmadı) → **`rc=1`** `log.txt'te olup manifestte olmayan sahne: v01-home` + `sayım uyuşmuyor: disk 74 ≠ manifest 6`. |
| **N7-F3** MINOR | `KAYIT.md` seq165/166'da bayat sayılar ("25 sahne", "inset'te en fazla 2 px") yaşıyordu; committed manifestler 42 sahne / 0 px. | Kayıt dosyası **append-only**; seq165/166 yeniden yazılmadı. Bunun yerine seq171'de üstün-kayıt (superseding) satırı yazıldı ve EVIDENCE §7.1 düzeltme kaydına işaret edildi. | `KAYIT.md` seq 171 |

**Güncellenmiş dürüst sınır:** artık **hiçbir tek manifest alanı** kaçış kapısı değildir —
`sceneKind` enum+ad çapasına, envanter `log.txt`'e, tema computed tokenlara, ölçümler disk
hash'lerine bağlıdır. Kalan gerçek sınır: **birden çok alanı birbiriyle tutarlı biçimde**
yalan söylemek (ör. satırı silip log'tan da silmek) hash-tabanlı yakalanamaz, çünkü kanıt
manifestin kendisidir; tek karşı önlem bağımsız denetçinin çapraz okumasıdır. Bu sınır yazılı.

### 7.44 Altıncı denetim düzeltmeleri (1 CRITICAL + 2 MAJOR + 3 MINOR)

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **N6-F1** CRITICAL | Zorunlu sahne sözleşmesinin istisnası **kendi beyan edilen** `mode: 'glif-referans'` alanına bağlıydı: bayt-eş bir kopyada tek alanı değiştirmek `rc=1` reddini `rc=0 PASS`'a çeviriyordu (R5-F1'in aynı fail-open'ı başka kapıdan). | `mode` ölçütü **tamamen kaldırıldı**; istisna yalnız **yapısal** (`rows.length === 1 && sceneKind === 'glyph'`). | A/B: 74 satırlık kopyada practice/feedback → `view` etiketlendi → `rc=1`; aynı kopyaya `mode:'glif-referans'` eklendi → **`rc=1`** (önceden 0). Gerçek glif koşumu (1 satır) hâlâ `rc=0`. |
| **N6-F2** MAJOR | R5-F7'nin düzeltme notu **kendi içinde yanlıştı** (85/71/93 aynı fixture için). | Tek doğru değer **93** yazıldı; §3/§10/`tests/README.md`/DURUM aynı. | `93 PASS` |
| **N6-F3** MAJOR | §7.1 "**25 sahne** × 7 koşum" diyordu; bir sonraki cümle 42 diyordu (kendi kendisiyle çelişki). | **42 sahne** olarak düzeltildi. | `ctaReport` = 42/koşum, 294 toplam |
| **N6-F5** MINOR | `blocked-external` "ör. 67" deniyordu; gerçek değer 84. | 84 olarak düzeltildi. | `grep blocked-external */log.txt` → 84 × 7 |
| **N6-F6** MINOR | §7.3'teki sayılar (77–531 px, ≤383 px, 332 px, 555 px) **hiçbir artefakttan türetilemiyordu**. | Sayılar **kaldırıldı**; niteliksel `NOT_MEASURED` ifadesi korundu, çünkü ölçüm aracı bu alanları `cta`'ya yazmıyor. | §7.3 |

### 7.45 Beşinci denetim düzeltmeleri (1 CRITICAL + 3 MAJOR + 4 MINOR)

Beşinci bağımsız tur da **`PARTIAL`** verdi. Dördüncü turun 12 bulgusundan 8'i gerçekten
kapanmıştı; 4'ü kapanmamış veya yanlış kapanmıştı. Düzeltmeler:

| # | Bulgu | Düzeltme | Kanıt (tahrifat testi) |
|---|---|---|---|
| **R5-F1** CRITICAL | **F2 yalnız yarı kapanmıştı.** `validateCta` içinde `if (!cta) continue;` olduğu için `cta: null` satırları hiçbir kurala takılmıyordu; ayrıca `--kapsam` `validateCta`'yı **hiç çağırmıyordu**. Sonuç: tüm CTA ölçümleri silinse, 17 practice + 17 feedback sahnesi kaldırılsa veya belgelenen `l25-summary` kusuru manifestlerden kazınsa bile iki kapı da `exit 0` veriyordu. | (a) `CTA_REQUIRED_SCENE_KINDS = ['lesson','practice','feedback']` — bu aşamalarda `cta` nesnesi **zorunlu**; yoksa ölçüm kırılması. (b) Tüm koşumda en az bir `lesson`/`practice`/`feedback` sahnesi zorunlu (glif-referans koşumu muaf). (c) `--kapsam` artık her manifest için `validateCta` çağırır. | Tüm `cta`+`ctaReport`+`productionFindings` boşaltıldı → `--dogrula rc=1`, `--kapsam rc=1`. Yalnız 17 feedback satırı boşaltıldı → `rc=1` `CTA ölçümü yok: l02-panel-yanlis (feedback)`. |
| **R5-F2** MAJOR | 0 bayt yakalanıyordu ama **kırpılmış** görüntü geçiyordu (39.046 B → 5.000 B, hash düzeltilmiş → `rc=0`); `imageSize()` yalnız başlığı okuyordu. | WebP'de RIFF uzunluk alanı (`size + 8 === dosya boyutu`) ve PNG'de `IEND` son-izi doğrulanır. Kırpılmış/bozuk dosya = ölçüm kırılması. | 5.000 B'a kırpılıp hash düzeltildi → `rc=1` `kırpılmış/bozuk WebP: RIFF 39046 bayt bildiriyor, dosya 5000 bayt`. |
| **R5-F3** MAJOR | "Beklenmeyen overflow/clipping = 0" alt kabulü **kapıda uygulanmıyordu**: manifestte `SERT:` bulgu beyan edilse bile geçiyordu (iki yönlü kontrol yalnız metni karşılaştırıyor, sınıfına bakmıyordu). | `validateManifest`, `issues` içinde `SERT:` önekli satır görürse hata verir. | `SERT:SAYFA-TAŞMASI` satır+`issues.txt` enjekte edildi → `rc=1`. |
| **R5-F4** MAJOR | EVIDENCE §7.5, `--kapsam`'ın CTA sözleşmesini doğruladığını **yanlış** söylüyordu (o zaman doğrulamıyordu). | Kod artık gerçekten çağırıyor (R5-F1c); iddia koda uygun hâle geldi ve çıktı `CTA sözleşmesi 7/7` yazıyor. | `PASS kapsam … · CTA sözleşmesi 7/7` |
| **R5-F5** MINOR | F12 düzeltmem **ters yönde yanlıştı**: "444 üretilemiyor (423)" demiştim. Diskte **444 tam olarak üretiliyor** (6 × 74); yanlış olan **474**'tü. | §2 ve F12 satırı düzeltildi. | 6 log × 74 sahne satırı = 444 (yeniden sayıldı) |
| **R5-F6** MINOR | §5 "`o2`–`o7` KAO ekranlarıdır" diyordu; `o2` KAO değil, `node=app`. | Yüzey dağılımı tek tek yazıldı (`o1` onboarding, `o2` app, `o3–o7` dialog). | log `node=` alanları |
| **R5-F7** MINOR | Fixture kontrol sayısı iki yerde **71** yazıyordu. | Gerçek sayı **93**'e çekildi (EVIDENCE + `tests/README.md`), tek doğru değer. | `node tests/app/test_local_visual_qa_manifest.js` → **93 PASS** |
| **R5-F8** MINOR | Round-4 F4 kanıtı `02ae386a…` hash'ini örnek veriyordu; **öyle bir hash hiçbir log'da yok**. | Gerçek 7 hash tek tek yazıldı. | `grep -o 'text=[0-9a-f]*'` çıktısı |

**Dürüst sınır (yeni):** `--dogrula`/`--kapsam`, manifestteki **ölçüm değerlerinin iç tutarlılığını**
ve beyan↔türetme eşleşmesini doğrular; manifest alanlarını (ör. `hiddenBy: true` → `false`) elle
değiştiren bir tahrifatı **yakalayamaz** — çünkü ölçümün kendisi manifestte yaşar, ayrı bir
makbuzda değil. Bu, "kanıt dosyalarına yazma yetkisi olan biri kanıtı bozabilir" sınıfındandır ve
hash tabanlı değildir; bağımsız denetçinin `EVIDENCE`/`COMMANDS` çapraz okuması bunun tek
karşı önlemidir. Bu sınır **gizlenmiyor**.

### 7.5 Dördüncü denetim düzeltmeleri (2 CRITICAL + 3 MAJOR + 7 MINOR)

Bağımsız dördüncü tur **`PARTIAL`** verdi; 12 bulgunun hepsi düzeltildi. En önemli ikisi
kapının kendisiyle ilgiliydi:

| # | Bulgu | Düzeltme | Kanıt |
|---|---|---|---|
| **F1** CRITICAL | `--glif-karsilastir` iki manifest **string**'ini karşılaştırıyordu, görüntüleri hash'lemiyordu → aynı görüntüyü iki kez çekmek `rc=0` ile geçiyordu (kartın hard stop'u) | Görüntü **diskten** hash'lenir; satır hash'i ve `glyphEvidence` hash'i ile de karşılaştırılır; `actualSha` eşitse reddedilir | Referans görüntüsü "sonra" üzerine kopyalanıp hash düzeltildi → `HATA önce ve sonra görüntüleri BİREBİR AYNI`, `rc=1` |
| **F2** CRITICAL | Doğrulayıcı `rows[].cta`, `ctaReport`, `productionFindings` alanlarına **hiç bakmıyordu** → tüm CTA ölçümleri silinse "hash/sayım/log/tema eşleşti" PASS veriyordu | Yeni `validateCta()` + `deriveFindings()`; `--dogrula` ve `--kapsam` artık CTA sözleşmesini **satırlardan** yeniden doğrular (görünürlük, ≥44 px, odak, kararlılık kaydı zorunluluğu, beyan↔ölçüm iki yönlü) | Beyan listesi boşaltılıp ölçüm silinen kopya artık `exit 1`; 9 negatif vaka fixture'da sabitlendi |
| **F3** MAJOR | 0 baytlık görüntü hash/sayım eşliğini "sağlıyordu" (`sha256('')` de 64 hanelidir) | `MIN_IMAGE_BYTES=4096` + PNG/WebP başlığından gerçek piksel boyutu; sıfır boyut ve yanlış genişlik reddedilir | Boş dosya ve 195 px'lik görüntü negatif testte kırmızı |
| **F4** MAJOR | Onboarding log satırı `#app`'ten (arkadaki uygulama) alınıyordu; 7 sahnenin 5'i bayt-eş aynı log'du | Çekilen yüzey ölçülür (`dialog`/`onboarding`/`app`), metin hash'i loglanır; `o3–o7` için diyalog zorunlu | 7/7 **farklı** metin hash'i (`ee15f17c…` o1, `0c2e73c5…` o2, `f78741eb…` o3, `70ef8661…` o4,
`c1a2ddbb…` o5, `4a071ffa…` o6, `ee8bde36…` o7 — 390 px açık koşumdan) |
| **F5** MAJOR | `captureScale` manifeste sabit `2` yazılıyordu → "aynı ölçek" kontrolü `2 ≠ 2` totolojisiydi | Ölçek görüntünün piksel genişliğinden hesaplanır ve **satır alanı** olur; doğrulayıcı beklenen genişlikle karşılaştırır | Ana satırlar **1×**, glif **4×** — beyan değil ölçüm |
| **F6** MINOR | "doğrulanmış örnek" ifadesi örnek düzeyinde doğrulanmıyordu | §8.1 kaynağı dürüstçe yazıldı: lemma `verified`, sûre kelimeleri **donmuş doğrulanmış modülden**; örnek düzeyi bayrak yok | §8.1 |
| **F7** MINOR | `--glif-karsilastir` tema farkını kabul ediyordu (açık ↔ koyu) | Tema eşitliği zorunlu | `glif-referans` (light) ↔ `dark-460` → `HATA tema farklı`, `rc=1` |
| **F8** MINOR | `.kao-choices` **kapsayıcısı** birincil eylem sayılıyordu (122–467 px) → ≥44 px 17/42 satırda totolojik | Kapsayıcı yerine içindeki **ilk düğme** ölçülür | practice hedefleri artık **56–109 px** |
| **F9** MINOR | 17 pratik sahnesinin 15'i `gorev-undefined` idi (kimlik sahneleri ayırt etmiyordu) | `practiceKind()`: `kind` → `type` → `errorClass`; hiçbiri yoksa **ölçüm kırılması** | 0 `-undefined`; gerçek türler: `word, meaning, order, grammar` |
| **F10** MINOR | `MAIN_WIDTHS` viewport **yüksekliğini** (844) sabitliyordu | Yalnız genişlik + güvenli alan karşılaştırılır | `zorunlu genişlik eksik: 460px` |
| **F11** MINOR | Metin kırpılması yalnız çocuksuz yapraklarda ölçülüyordu; geçici profiller elle siliniyordu | `Range.getClientRects()` ile yapıdan bağımsız **gerçek metin kırpılması** (`METIN-KIRPILIR`); profil temizliği araca taşındı (başlangıç + `exit` + sinyal) | `sweepProfiles()`; run log `tmp-profil:` satırı |
| **F12** MINOR | "474 kayıt" iddiası diskteki eski loglarla üretilemiyordu | Doğru sayı **444**'tür (6 × 74, diskten yeniden üretildi); yanlış olan **474**'tür (6 × 79). §2 buna göre düzeltildi | §2 |

## 8. 30 zor glif — gerçek önce/sonra

### 8.1 Dizi seçimi (elle yazılmadı)

`gorsel-qa-manifest.mjs → glyphSeries()`: doğrulanmış içerikten (`QuranLexiconV1` 524 lemma +
`QuranShortSurahsV1` 618 kelime) **Arapça işaret yoğunluğuna** göre deterministik seçim;
12 sözlük kelimesi + 6 kısa örnek + 12 sûre kelimesi = **30 dizi**. Doğrulama düzeyi
dürüstçe: lemma kayıtlarında `verified === true` aranır; örnek metinler **doğrulanmış
lemmaya ait** örneklerdir (örnek düzeyinde ayrı bayrak yoktur); sûre kelimeleri
**donmuş doğrulanmış içerik modülünden** (`QuranShortSurahsV1`) gelir.
Her dizi 5–20 karakter (tek kırpımda okunabilir), her birinin kaynağı ve SHA-256'sı kayıtlı.
Aynı girdi her zaman aynı 30 diziyi verir (fixture bunu doğrular).

### 8.2 Referans gerçekten eski build mi?

Evet. `git archive c9dd5962^` ile **font-face'in henüz olmadığı** gerçek build çıkarıldı
(`app/kao.css`'te `@font-face` sayısı **0**, `assets/kao/font/` dizini **yok**) ve aynı araç
`--glif-only` modunda o build'e karşı çalıştırıldı. Aynı 30 dizi, aynı 460 px genişlik,
aynı 40 px punto, aynı 2× kırpım ölçeği.

**Aynı yeni görünüm iki kez çekilmedi** — kartın hard stop'u tam olarak bunu yasaklıyor.

### 8.3 Karşılaştırma

[`GLIF-ONCE-SONRA.webp`](GLIF-ONCE-SONRA.webp) — sol: `c9dd5962^` (fallback yığını),
sağ: güncel (`K3P Scheherazade`). Her iki taraf da 30 satırın tamamını içerir.

| Ölçüm | Eski build (`c9dd5962^`) | Güncel |
|---|---|---|
| `K3P Scheherazade` yüklü | **hayır** (font yok) | **evet** (`status:loaded`) |
| woff2 isteği | 0 | 1 (`ScheherazadeNew-Regular.k3p.woff2?v=20261021a`, 25.360 B) |
| Metrik ayrımı (font vs fallback) | 2858 vs 4492 px = **0,636×** | 3011 vs 4492 px = **0,670×** |
| Dizi sayısı / satır yüksekliği | 30 / 68 px | 30 / 68 px |
| Görsel sonuç | harekeler çakışıyor/yer değiştiriyor | harekeler doğru konumda |

Örnek: **1** `نَفَّٰثَٰت` — eski build'de üst işaretler kelimenin soluna taşmış; güncelde
şedde/hareke doğru oturuyor. **2** `ضَلَّ`, **10** `حَرَّمَ`, **11** `حَتَّىٰ` aynı deseni gösterir.

Dosyalar ve hash'ler:

| Dosya | SHA-256 |
|---|---|
| `glif-referans/g0-30-zor-glif-referans.webp` | `ed26e3b2…6ef0c73` |
| `light-390/g1-30-zor-glif.webp` | `38e46400…952d89b6` |
| `light-460/g1-30-zor-glif.webp` | `38e46400…952d89b6` (bit-eydeş) |
| `GLIF-ONCE-SONRA.webp` | `c5c12f22…62ace4f` |

> `GLIF-ONCE-SONRA.webp` bu turda iki gerçek kırpımdan **yeniden birleştirildi** (sol:
> `glif-referans`, sağ: `light-460`; 24 px ayırıcı, WebP q90). Hash bu yüzden önceki
> kayıttan farklıdır; **kaynak iki görüntünün hash'i değişmedi**. Bileşik görüntü tanık
> değildir — iki kaynak hash'i tanıktır (§6.3'teki gibi).

### 8.4 Sınır (dürüstlük)

Bu bir **headless font/şekillendirme** kanıtıdır. Cihaz kabulü, ekran okuyucu turu ve L2 alan
uzmanı onayı **yapılmadı** ve iddia edilmiyor. 30 glif "okunabilir karşılaştırma" olarak
PASS'tır; "cihazda doğru görünüyor" iddiası değildir.

## 9. Güvenlik ve cleanup

| Kontrol | Sonuç |
|---|---|
| Guard 1 kaynağı (`sync.js devOrigin()`) + testi | Çekimden **önce** doğrulandı: `test_local_visual_qa_guard.js` 10/10 PASS |
| Origin | Yalnız `http://127.0.0.1:9000`; her koşumda `location.origin` doğrulandı |
| Token | Sentetik profil; `settings.ghToken` **false** (her koşumda loglandı) |
| `seyma-sync-force` | **null**; ayarlıysa araç durur |
| `?forceSync=1` | Kullanılmadı; URL'de görülürse araç durur |
| Dış ağ | CDP `Fetch` ile kesildi. `blocked-external` sayısı loglandı: bu kanıt kümesinde 7 koşumun **her birinde 84**, `glif-referans`'ta **0**. Bu sayı sayfanın kaç dış istek *denemesi* yaptığına bağlı bir koşum-zamanı artefaktıdır (±1 oynayabilir; 20. denetim N20-1'de bir koşum 83 ölçmüştü) ve **kabul ölçütü değildir** — güvenlik iddiası 'dış ağ kesildi'dir |
| Gerçek profil/veri | Kullanılmadı; ayrı geçici profiller (`os.tmpdir()`) |
| Sunucu | **Hiç açılmadı** (`cdp.mjs` sunucusuz; istekleri diskten karşılar) |
| Süreç cleanup | Her tarayıcı `close()`; glif-only modundaki sızıntı da kapatıldı |
| Geçici dosya cleanup | Artık **araç yapıyor** (elle değil): `sweepProfiles()` başlangıçta, normal çıkışta ve `SIGINT`/`SIGTERM`'de bu koşumun `<prof>`, `<prof>-onb`, `<prof>-glif` ad alanlarını siler; run log'da `tmp-profil: temizlendi=N` satırı yazılır. Doğrulandı: `os.tmpdir()` altında bu ad alanlarında **0** girdi |

## 9b. Kapsam dışı bırakılan korunmuş kirli dosyalar

Bu dosyalar kart başlamadan **önceden** kirliydi; programa ait değildir, sahne/commit edilmedi.
Hash'leri başlangıçta ve sonda **değişmedi** (4/4 aynı):

| Yol | Durum | SHA-256 |
|---|---|---|
| `kao3-premium/KAPANIS.md` | korunmuş (değiştirilmiş) | `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd` |
| `kao3-premium/README.md` | korunmuş (değiştirilmiş) | `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f` |
| `kao3-premium/kanit/sonraki/GORSEL-KANIT.md` | korunmuş (izlenmeyen) | `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28` |
| `kao3-premium/kanit/sonraki/GORSEL-KANIT.pdf` | korunmuş (izlenmeyen) | `05ae0071c87c7bad4ed5f050cbb07479e022e912a67ad401b59e00b52ca8811b` |

`DURUM.json → cards["K3PD-29"].changedPaths` **yalnız karta ait** yolları listeler; bu dört
korunmuş dosya bilinçli olarak listede **yoktur** (programa ait değil, `--check` bunları
`PROTECTED_PATHS` üzerinden ayrıca doğrular). Bu yüzden "Git'te değişen yollar = changedPaths"
karşılaştırması, bu dört yol ayrı tutularak okunmalıdır.

## 10. Değişen exact yollar

- `tools/kapi/gorsel-qa/shoot-modal.mjs` — iki tema sabitleme+doğrulama, onboarding profili,
  per-screenshot manifest, fail-closed, CTA matrisi, glif sayfası, `--glif-only` referans modu
- `tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs` — **yeni**: manifest şeması, `--dogrula`,
  `--kapsam`, `--negatif-test`, `--glif-liste`, 30 dizi seçimi
- `tools/kapi/gorsel-qa/cdp.mjs` — geriye uyumlu `insets` / `scale` / `shotClip` /
  `setViewportSize` / biçim seçenekleri (origin ve ağ engeli değişmedi)
- `tests/app/test_local_visual_qa_manifest.js` — **yeni** fixture (214 kontrol)
- `tests/README.md` — envanter
- `kao3-premium/duzeltme-plani/PROMPTLAR.md` — yalnız K3PD-29 allowlist satırı (exact paths)
- `kao3-premium/duzeltme-plani/{DURUM.json,GUNCEL-DURUM.md,KAYIT.md}`
- `kao3-premium/duzeltme-plani/kanit/K3PD-29/**` — bu kanıt klasörü

## 11. Açık sınırlamalar

1. **`l25-summary` CTA çakışması açık** (§7.2). Üretim kusuru; ayrı kart/karar ister.
   `app/kao.css` iki yapışkan kardeş butona aynı `bottom` veriyor.
2. Cihaz (fiziksel iPhone/Android) kabulü **yapılmadı**.
3. Ekran okuyucu turu **yapılmadı**.
4. L2 alan uzmanı onayı **yok**.
5. Sahne sayısı **sabitlenmedi** (kartın açık talimatı): ölçüm 74 sahne üretti; araç sahne
   envanterini manifestten türetir ve kombinasyonlar arasında aynı olmasını doğrular.
6. `releaseApproval=NOT_APPROVED`, `candidateSha=null`. Push/merge/tag/deploy **yok**.
   K3PD-32/33 sırası ve aday SHA'ya bağlı ayrı yayın onayı atlanmadı.
7. K3PD-30 başlatılmadı.
8. **Envanterin mutlak tabanı yoktur.** Kart ekran sayısını sabitlemeyi yasakladığı için
   "74 sahne" bir *ölçüm* dür, *kapı* değil: yedi koşumun hepsinden aynı sahne tutarlı biçimde
   silinirse (§`log.txt` + manifest + disk birlikte) hiçbir hash tabanlı denetim bunu görmez.
   Karşı önlem bağımsız denetçinin çapraz okumasıdır (10. denetim F10-4).
10. **Glif piksel↔font bağı makine ile denetlenmez.** `--glif-karsilastir` font kanıtını
    (`faces`/`requests`/`metrics`) log'dan çapalar ve bit-eydeş iki çekimi reddeder, ama
    "önce" görüntüsünün gerçekten **fontsuz** bir build'den geldiğini pikselden doğrulamaz;
    tek bayt oynatılmış bir kopya hash alanları da yamalanırsa geçer. Gönderilen referansın
    gerçekten fontsuz olduğu build düzeyinde doğrulanmıştır (`0beb6d0d`, `@font-face` 0).
11. **`issues.txt` bağımsız tanık değildir.** Çekim aracı onu manifestten türetir
   (`row.issues` → `issues.txt`) ve doğrulayıcı iki yönlü eşleşmeyi denetler; bu, manifestin
   kendi kendisiyle tutarlılığını gösterir, sahne taramasının bağımsız kaydını değil.
12. **`GLIF-ONCE-SONRA.webp` tanık değildir, sunumdur.** İki gerçek kırpımdan birleştirilir;
   doğrulanan şey iki **kaynak** görüntünün hash'i ve `--glif-karsilastir`'ın diskten
   okuduğu dizilerdir. Bileşik görüntünün hash'i sürümden sürüme değişebilir (bu turda
   değişti) ve bu bir kanıt kaybı değildir.


## 12. 2026-10-28 CTA düzeltmesi — bağımsız denetim bekliyor

Önceki §7.2 kusuru tarihsel ölçümdür. Kullanıcı onayıyla CSS ve ilgili fixture değiştirildi; eski görseller korunarak yedi özet ve bir süre sınırı için yeni dar kapsamlı sentetik kanıt alındı. Tam ölçüm, ham performans hataları ve açık sınırlar [CTA doğrulama kaydında](cta-dogrulama-20261028/README.md). Bu uygulayıcı ölçümü bağımsız PASS değildir; cihaz ve tüm içerik erişilebilirliği kabulü değildir.
# 2026-10-28 yöntem ve kabul düzeltmesi

Bu belgedeki önceki çekimlerin aracı, geçici sentetik profilde token alanını boolean kontrolü için okudu; gerçek profil/token kullanılmadı ve değer kaydedilmedi. Alan okuması G4 kuralına uymaz; geçmiş ölçüler ham gözlem olarak korunur, G4 uyumlu kabul sayılmaz. Bu okuma sonradan araçtan çıkarıldı. Yeni ve sınırları ayrıca açıklanmış [v4b ölçümü](v4b-20261028/README.md) 532 sahnede güncel kaynak/font/tema kapsamı sağlar; eski `layoutY` kararlılığı ve odaklanabilirlik kontrolü tek başına gerçek ekran y/Tab kanıtı değildir. 11/21 geç kabulü ve 29 bağımsız kabulü, 30/31/32/33 ve yayın açık kalır.

