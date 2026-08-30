# Şeyma 🦩 & ÆON — iOS 27 Uyumlu Tasarım İyileştirme Planı

> **Durum:** Denetim ve uygulama programı **tamamlandı (AD-01 … AD-52, 52/52)**. Ayrıntılı
> kanıt ve geri alınabilir commit zinciri için [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md)
> ve [`APPLE-DESIGN-STATE.json`](APPLE-DESIGN-STATE.json) kanonik kayıtlardır.
> **§4 puan tablosu 2026-08-24 kapanışındaki kaynak/fixture durumunu gösterir.** Başlangıç
> denetiminin tarihsel bulguları aşağıdaki ilgili bölümlerde korunur.
> **Tarih:** 2026-08-24 · **Denetim yöntemi:** statik analiz + hesaplanmış kontrast + headless fixture (tarayıcı açılmadı)
> **Yüzeyler:** `index.html` + `app.js` + `app/styles.css` (kullanıcı) · `panel.html` + `panel/panel.css` (ÆON v1) · `panel-v2.html` + `panel/v2/panel-v2.css` (ÆON v2 Premium)

---

## 0. Bu belge ne değildir

Bu bir yeniden tasarım önerisi **değil**. Şeyma'nın görsel kimliği — flamingo, sıcak pastel gradyan, "Sevgili Günışığı" tonu — denetimin konusu dışında ve korunuyor. Burada ölçülen tek şey, o kimliğin Apple'ın erişilebilirlik ve malzeme kurallarıyla nerede çeliştiği.

Başlangıç denetimi sırasında **hiçbir dosya değiştirilmedi**; sonrasında 52 sıralı prompt,
I1–I6 sözleşmesi ve headless doğrulama kapılarıyla uygulandı. Gerçek cihaz/tarayıcı kabulü
ve Pages deploy'u bu kaydın dışında, ayrı kanıt ve onay kapılarıdır.

---

## 1. İşlevsellik sözleşmesi (en önemli bölüm)

Talep açıktı: *"işlevsellikler kesinlikle bozulmamalı"*. Bu planın tamamı bu kısıta göre kurgulandı. Bağlayıcı kurallar:

| # | Kural | Neden |
| --- | --- | --- |
| I1 | **`data` nesnesinin şekli değişmez.** Hiçbir alan eklenmez, yeniden adlandırılmaz, silinmez. | `sync.js` tam değiştirme yapıyor; şema kayması gerçek veriyi siler. |
| I2 | **`App.<name>` yüzeyi değişmez.** Hiçbir handler yeniden adlandırılmaz veya imzası değiştirilmez. | Üretilen HTML `onclick="App.xxx(...)"` ile bağlı; bir isim değişirse buton sessizce ölür. |
| I3 | **`migrate()` dokunulmaz.** | Bu plan hiçbir kalıcı alan eklemiyor; migrate'in değişmesi gerekmiyor. Gerekiyorsa madde plan dışıdır. |
| I4 | **`render()` çağrı grafiği değişmez.** Değişiklikler `class`/`style`/attribute düzeyinde kalır. | Sekme geçişi ve overlay açma/kapama mantığı test edilmemiş bir alan. |
| I5 | **Ağ davranışı değişmez.** `sync.js`'e ve Guard 1/Guard 2'ye dokunulmaz. | [CLAUDE.md](../../CLAUDE.md) veri güvenliği bölümü. |
| I6 | **Her faz kendi başına geri alınabilir.** Tek commit = tek faz. | Regresyon çıkarsa tüm plan değil, tek faz geri alınır. |

**Bu planın tamamı sunum katmanında kalır:** CSS token değerleri, `font-size`, `class`, `role`, `aria-*`, `tabindex`, `<meta>`. Tek istisna Faz A5 (`<div onclick>` → `<button>`), ve orada da handler adı ve argümanları birebir korunur.

---

## 2. Kanıt tabanı

[CLAUDE.md](../../CLAUDE.md) veri güvenliği kuralı gereği **uygulama tarayıcıda açılmadı**. Bulguların tamamı şuradan:

- **Statik tarama** — `app/styles.css` (1442 satır), `panel/panel.css` (789), `panel/v2/panel-v2.css` (5349), `app.js` (18 636), `panel/panel.js` (6042), `panel/v2/panel-v2.js` (6747).
- **Hesaplanmış kontrast** — WCAG 2.x göreli parlaklık formülü, kart yüzeyi sayfa gradyanının üç durağı üzerine alfa-kompozit edilerek; en kötü durak raporlandı.
- **HIG referans korpusu** — `apple-design` skill'inin 53 dosyalık `references/hig/` ağacı. Aşağıdaki her atıf bu dosyalardan birebir alıntıdır.

Ölçülemeyen şey: gerçek cihazda algılanan hareket, haptik, canlı `backdrop-filter` performansı. Bunlar cihaz doğrulamasına ayrıldı.

---

## 3. iOS 27 / macOS Golden Gate bağlamı

Bir düzeltme: **"Golden Gate" macOS 27'nin adı**, iOS 27'nin değil. İkisi 8 Haziran 2026'daki WWDC'de birlikte duyuruldu ve aynı görsel dili paylaşıyor — bu planın hedefi de o ortak dil.

Doğrulanabilir olan:

- iOS 27 + macOS Golden Gate, **Liquid Glass**'ı (iOS 26, 2025) devam ettiriyor ve rafine ediyor — sıfırdan yeni bir dil getirmiyor.
- HIG'in 2025–2026 güncellemeleri Liquid Glass, özelleştirilebilir widget'lar, Control Center uzantıları ve Apple Intelligence entegrasyonu etrafında yoğunlaşıyor.
- Erişilebilirlik tabanı (11pt minimum metin, 44×44pt kontrol, 4.5:1 kontrast) **değişmedi** — bu plandaki kritik maddelerin tamamı bu değişmeyen tabana dayanıyor.

**Dürüst sınır:** iOS 27'ye özgü, iOS 26'dan farklı yeni bir ölçü/spesifikasyon elimde doğrulanmış hâlde yok. Bu plan iOS 26'da yerleşen ve iOS 27'de sürdürülen Liquid Glass sözleşmesine hizalanıyor. iOS 27'ye özel bir bileşen çıkarsa plan güncellenmeli — uydurulmuş spesifikasyon üzerine iş yapılmadı.

Kaynaklar: [MacRumors — 250+ değişiklik listesi](https://www.macrumors.com/2026/06/10/apple-lists-250-changes-ios-27-and-more/) · [iOS 27 — Wikipedia](https://en.wikipedia.org/wiki/IOS_27)

---

## 4. Puan tablosu

| Eksen | Şeyma (açık) | Şeyma (koyu) | ÆON v1 | ÆON v2 |
| --- | --- | --- | --- | --- |
| Metin kontrastı | ✅ 10/10 AA/AAA | ✅ 10/10 AA/AAA | 🟡 denetlenmedi | ✅ tümü AA+ |
| Tipografi ölçeği | ✅ 1687 site rem; 13 dekoratif muaf | ✅ 1687 site rem; 13 dekoratif muaf | 🟡 ham px | ✅ adlandırılmış ölçek |
| Dynamic Type | ✅ rem tabanı + metin ölçeği | ✅ rem tabanı + metin ölçeği | ❌ yok | 🟡 adlandırılmış ölçek, px tabanı |
| Dokunma hedefi | ✅ 44px kapısı | ✅ 44px kapısı | ✅ | ✅ |
| Safe area | ✅ 35 kullanım | ✅ | ✅ 4 | ✅ 7 |
| Reduced motion | ✅ 29 kural | ✅ | ✅ 5 | ✅ 2 blok + global güvenlik ağı |
| Increase Contrast | ✅ `prefers-contrast` | ✅ `prefers-contrast` | ✅ 1 | ❌ yok |
| Sistem teması takibi | ✅ 3 durum | ✅ 3 durum | ✅ | ❌ yok |
| Liquid Glass katmanı | ✅ içerik/işlev ayrımı | ✅ içerik/işlev ayrımı | 🟡 2 kullanım | 🟡 20 kullanım |
| Semantik / ARIA | ✅ 413 native + role yüzeyleri | ✅ 413 native + role yüzeyleri | ✅ 53 native + role yüzeyi | ✅ 139 aria |

**Tek cümlelik özet:** 52/52 uygulama ve headless kapı kapanışıyla Şeyma'nın erişilebilirlik tabanı
ile ÆON yüzeyleri kanıtlanmış duruma getirildi; Panel-v2 reduced-motion kapsamı artık global
güvenlik ağıyla gelecekteki sonradan eklenen bileşenlere de fail-safe uygulanıyor.

---

## 5. Faz A — Kritik (erişilebilirlik)

Bu fazdaki hiçbir madde estetik tercih değil; her biri ölçülmüş bir ihlal.

### A1 · Yakınlaştırma kilidi

**Ne:** [index.html:5](../../index.html#L5) — `maximum-scale=1`. Kullanıcı sayfayı parmakla büyütemiyor.

**Neden:** Görme güçlüğü olan kullanıcının en temel telafi aracını kapatıyor. Panel yüzeylerinin ikisinde de bu kilit yok — yani zaten tutarsız.

**Düzeltme:**
```html
<!-- önce -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<!-- sonra -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**Risk:** Yok. Tek attribute silme. iOS 10+ zaten bu kilidi Safari'de yok sayıyor; asıl etkisi PWA modunda.
**Doğrulama:** `node .claude/skills/run-seyma/driver.mjs` — render değişmemeli.

---

### A2 · `--faint` metin kontrastı

**Ne:** `--faint:#9C8C92` açık temada kart yüzeyinde **3.06:1**. `app.js` + `app/styles.css` içinde **316 kez metin rengi** olarak kullanılıyor.

**Neden:**
> **HIG — Accessibility:** "Text size: Up to 17 pts · All weights · Minimum contrast ratio **4.5:1**"

Uygulamadaki metinlerin tamamı 17pt altında. 3.06:1 eşiğin çok altında ve bu tek token en yaygın ikincil metin rengi.

**Düzeltme** — [app/styles.css:209](../../app/styles.css#L209):
```css
/* önce */ --faint:#9C8C92;   /* 3.06:1 — FAIL */
/* sonra */ --faint:#816F76;   /* 4.50:1 — AA  */
```
Hue ve saturation birebir korundu; yalnızca lightness düşürüldü. Renk ailesi değişmiyor.

**Risk:** Düşük. Tek token değeri. Koyu temadaki `--faint:#858590` (5.21:1) **değişmiyor** — zaten geçiyor.

---

### A3 · Açık tema semantik renk tokenları

**Ne:** Sekiz token daha 4.5:1'in altında. Ama bunların bir kısmı dolgu/kenarlık olarak kullanılıyor ve dolgular için WCAG eşiği 3:1 — hepsini koyulaştırmak markayı gereksiz yere karartır.

Ölçülen kullanım dağılımı:

| Token | Mevcut | Oran | Metin | Zemin | Kenarlık | Karar |
| --- | --- | --- | --- | --- | --- | --- |
| `--accent` | `#C77D93` | 2.97 | 36 | 8 | 2 | çift token |
| `--warn` | `#E5484D` | 3.76 | 12 | 5 | 11 | çift token |
| `--ok` | `#3F9A4F` | 3.39 | 15 | 14 | 21 | çift token |
| `--watch` | `#B5732E` | 3.69 | 11 | 0 | 9 | çift token |
| `--listen` | `#0E8F9C` | 3.71 | 5 | 0 | 7 | çift token |
| `--drop` | `#B0714E` | 3.79 | 1 | 4 | 3 | çift token |
| `--pause` | `#8A7BB0` | 3.64 | 0 | 0 | 1 | **dokunma** |
| `--sun` | `#F5A623` | 1.94 | 0 | 0 | 0 | **dokunma** (yalnız gradyan) |

**Düzeltme — `-ink` kalıbı.** Mevcut token dolgu/kenarlık için olduğu gibi kalır; metin için AA sağlayan bir kardeş token eklenir:

```css
#root{
  /* mevcut değerler dolgu ve kenarlık için korunur */
  --accent:#C77D93;   --accent-ink:#B55471;   /* 4.50:1 */
  --warn:#E5484D;     --warn-ink:#E0252B;     /* 4.50:1 */
  --ok:#3F9A4F;       --ok-ink:#368343;       /* 4.50:1 */
  --watch:#B5732E;    --watch-ink:#A16729;    /* 4.50:1 */
  --listen:#0E8F9C;   --listen-ink:#0D808C;   /* 4.50:1 */
  --drop:#B0714E;     --drop-ink:#9F6647;     /* 4.50:1 */
}
#root[data-theme="dark"]{
  /* koyu temada tüm tokenlar zaten AAA — ink = token */
  --accent-ink:var(--accent); --warn-ink:var(--warn); --ok-ink:var(--ok);
  --watch-ink:var(--watch);   --listen-ink:var(--listen); --drop-ink:var(--drop);
}
```

Sonra yalnızca `color:var(--X)` geçen yerler `color:var(--X-ink)` olur. `background`/`border` kullanımlarına dokunulmaz — **görsel yoğunluk aynı kalır, sadece yazı okunur hâle gelir.**

**Neden çift token, tek token değil:**
> **HIG — Color:** "Avoid using the same color to mean different things."

Zaten burada tek renk iki iş yapıyor (dolgu + yazı). Ayırmak hem kontrastı çözüyor hem de kılavuza yaklaşıyor.

**Risk:** Orta — 80 civarı `color:` sitesi dokunuluyor. Ama hepsi mekanik `sed` ile yapılabilir ve hiçbiri mantığa değmiyor. Faz A'nın en uzun maddesi; kendi commit'i olmalı.

---

### A4 · 11pt altı tipografi

**Ne:** `app.js` içinde ölçülen: **52 × `9px`**, **11 × `9.5px`**, **2 × `8.5px`** — toplam 65 ihlal. `app/styles.css` içinde ayrıca `8.5px`, `9px`, `9.5px` kuralları var.

**Neden:**
> **HIG — Typography:** "Platform: Mobile · Default size **17 pt** · Minimum size **11 pt**"

9px ≈ 6.75pt. Minimumun **%39 altında**. Bu boyut ince ağırlıkla birleştiğinde okunabilir değil:
> **HIG — Typography:** "In general, avoid light font weights… which can be difficult to see, especially when text is small."

**Düzeltme — taban yükseltme:** 11px'in altındaki her değer 11px'e çıkarılır. Bu, bu yüzeydeki en küçük metni HIG tabanına oturtur.

> ⚠️ **Bu maddenin düzen riski var.** 9px → 11px, dar rozet/etiket alanlarında satır kaydırma yapabilir. Bu yüzden A4, Faz A içinde **son** sıradadır ve `--dump` ile sekme sekme görsel doğrulama gerektirir:
> ```bash
> node .claude/skills/run-seyma/driver.mjs --dump bugun
> node .claude/skills/run-seyma/driver.mjs --dump rapor
> ```
> Taşma görülen yerde çözüm fontu küçültmek değil, kapsayıcıya `min-width`/`flex-wrap` vermektir.

---

### A5 · Klavye erişilemeyen tıklama hedefleri

**Ne:** `app.js` içinde **54 × `<div onclick=...>`**, `panel/panel.js` içinde **8 ×**. Bunlar klavye ile odaklanamaz, Enter/Space ile tetiklenemez, VoiceOver bunları buton olarak duyurmaz.

Ölçek için: aynı dosyada **394 × `<button onclick=...>`** var — yani kalıp zaten doğru, bu 54 tanesi istisna.

**Düzeltme:** Her birini `<button type="button">` yap; handler adı ve argümanları **birebir korunur**.
```html
<!-- önce -->
<div class="sey-x" onclick="App.foo('a',1)">…</div>
<!-- sonra -->
<button type="button" class="sey-x sey-asbtn" onclick="App.foo('a',1)">…</button>
```
Buton varsayılan stilini sıfırlayan yardımcı sınıf eklenir:
```css
.sey-asbtn{appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;text-align:inherit;width:100%;display:block;cursor:pointer;}
```

**Risk:** Orta. `<button>` içinde `<button>` iç içe geçemez — dönüştürmeden önce her birinin iç yapısı tek tek kontrol edilmeli. İçinde başka buton olan durumlarda alternatif: `role="button"` + `tabindex="0"` + `onkeydown`. Bu yüzden madde **elle**, toplu `sed` ile değil.

---

### A6 · Dokunma hedefi boyutu

**Ne:** `min-height:16px` (4 kullanım), `min-height:40px` (5 kullanım) tespit edildi.

**Neden:**
> **HIG — Accessibility:** "Platform: Mobile · Default control size **44x44 pt** · Minimum control size 28x28 pt"
> "Consider spacing between controls as important as size… about 12 points of padding around elements that include a bezel."

**Düzeltme:** 16px olanlar görsel boyutu korunarak şeffaf dokunma alanıyla büyütülür — **görünüm değişmez, hedef büyür**:
```css
.sey-tiny-hit{position:relative;}
.sey-tiny-hit::after{content:"";position:absolute;inset:-14px;}
```
40px olanlar 44px'e çıkarılır (4px fark, düzen riski düşük).

**Risk:** Düşük. `::after` overlay hiçbir görsel değişiklik yapmaz. Yalnızca üst üste binen hedeflerde çakışma kontrolü gerekir.

---

## 6. Faz B — Platform uyumu

### B1 · Sistem teması takibi

**Ne:** `app/styles.css` içinde **`prefers-color-scheme` hiç yok** (0 kullanım). Tema yalnızca `#root[data-theme="dark"]` ile, elle değiştiriliyor. `panel/panel.css` bunu doğru yapıyor (1 kullanım).

**Neden:** iOS kullanıcısı sistem görünümünü değiştirdiğinde uygulamanın uymasını bekler. Şu an Şeyma bunu görmezden geliyor.

**Düzeltme — mevcut elle geçişi bozmadan:** Üç durumlu model. Kullanıcı açıkça seçtiyse seçim kazanır; seçmediyse sistem karar verir.
```css
/* açık = taban :root, dokunulmaz */
@media (prefers-color-scheme: dark){
  #root:not([data-theme="light"]){ /* koyu token bloğunun aynısı */ }
}
#root[data-theme="dark"]{ /* mevcut blok, aynen kalır — elle seçim her zaman kazanır */ }
```

**Risk:** Düşük–orta. Koyu token bloğu iki yerde yaşayacağı için **kopyala-yapıştır tekrarı riski** var; ikisi birlikte güncellenmeli notu CSS'e yorum olarak düşülmeli.

**Ön koşul:** `data-theme` yazan `App` handler'ı bulunup davranışının değişmediği doğrulanmalı (I2).

---

### B2 · Increase Contrast desteği

**Ne:** `prefers-contrast` desteği: `app/styles.css` **0**, `panel/v2/panel-v2.css` **0**, `panel/panel.css` **1**.

**Neden:**
> **HIG — Accessibility:** "If your app doesn't provide this minimum contrast by default, ensure it at least provides a higher contrast color scheme when the system setting **Increase Contrast** is turned on."

**Düzeltme:** Faz A3'ün `-ink` tokenları zaten hesaplanmış olacağı için bu ucuz:
```css
@media (prefers-contrast: more){
  #root{
    --muted:var(--text2);          /* 4.87 → 7.74 */
    --faint:var(--muted);          /* 4.50 → 4.87 */
    --card-bd:rgba(0,0,0,.28);     /* kenarlıklar görünür olsun */
  }
}
```

**Risk:** Yok. Yalnızca opsiyonel bir medya sorgusu ekleniyor; varsayılan yol değişmiyor.

---

### B3 · Yüksek kontrast / forced-colors

**Ne:** `forced-colors` desteği hiçbir yüzeyde yok.

**Düzeltme:** Minimum güvenlik ağı — cam ve gölge kapatılır, kenarlıklar sistem rengine bırakılır:
```css
@media (forced-colors: active){
  .glass{backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid CanvasText;}
  button{forced-color-adjust:none;}
}
```

**Risk:** Yok. Yalnızca zorlanmış renk modunda etkin.

---

### B4 · Safe area — durum iyi

Ölçüm: `app/styles.css` 14 + `app.js` 21 = **35 `safe-area-inset` kullanımı**; panel v1 4, panel v2 7. Üç yüzeyin üçünde de `viewport-fit=cover` var.

**Aksiyon:** Yok. Bu doğru yapılmış; planın geri kalanında bozulmadığı doğrulanmalı, o kadar.

---

## 7. Faz C — Liquid Glass ve malzeme sistemi

Bu, iOS 26/27 uyumu açısından planın **kavramsal olarak en önemli** fazı.

### C1 · Cam yanlış katmanda

**Ne:** `.glass` sınıfı `app.js` içinde **69 kez**, ve neredeyse tamamı **içerik kartlarında**: `class="glass"` (61), `glass sey-room-card`, `glass sey-daily-photo`, `glass sey-ccard`…

**Neden — doğrudan ihlal:**
> **HIG — Liquid Glass:** "Liquid Glass establishes a clear visual hierarchy between two layers: **1. Content layer** — the main app content… **2. Functional layer** — controls and navigation that float above the content layer."
> "**Don't use Liquid Glass in the content layer.** It works best when providing a clear distinction between interactive elements and content. Including it in the content layer creates unnecessary complexity and confusing visual hierarchy."

Şu an cam, ayırt edici olması gereken şeyi (gezinme/kontroller) içerikten ayırt edilemez kılıyor: her şey cam olduğunda hiçbir şey cam değil.

**Düzeltme — malzeme sözleşmesi:**

| Katman | Öğeler | Malzeme |
| --- | --- | --- |
| **Fonksiyonel** | `.sey-appheader`, alt sekme çubuğu, `--nav`, `--chatbar`, yüzen aksiyonlar | Liquid Glass — `backdrop-filter: blur(20px) saturate(170%)` |
| **İçerik** | `.glass` taşıyan kartlar, rozetler, satırlar | Opak yüzey — `background:var(--card-solid)`, camsız, hafif kenarlık |

```css
/* yeni: içerik katmanı için opak yüzey */
#root{ --card-solid:#FFFDFC; }
#root[data-theme="dark"]{ --card-solid:#111114; }

.surface{background:var(--card-solid);border:1px solid var(--card-bd);}
/* .glass yalnızca fonksiyonel katmanda kalır */
```

**Kademeli geçiş — tek seferde 69 yeri değiştirme.** `.glass`'ı bırakıp yanına `.surface` ekle, `.glass`'ı fonksiyonel katmana daralt, sonra içerik kartlarından `glass` sınıfını kaldır. Her adım ayrı commit.

**Risk:** Orta–yüksek. Bu planın görsel olarak **en görünür** değişikliği. Kullanıcı onayı alınmadan uygulanmamalı — teknik olarak doğru olması, o görünümün sevileceği anlamına gelmez.

> **Not:** Bu maddeyi reddetmek tamamen meşru bir karar. O durumda C2 yine de yapılmalı, çünkü o bir tutarlılık hatası, estetik tercih değil.

---

### C2 · Koyu temada cam tamamen kapalı

**Ne:** [app/styles.css:386](../../app/styles.css#L386):
```css
#root[data-theme="dark"] .glass{backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none!important;}
```
Koyu temada Liquid Glass **hiç yok**. Yani iki tema iki farklı malzeme sistemi kullanıyor.

**Neden:** Malzeme markanın parçasıdır ve görünümler arasında tutarlı olmalıdır. Apple'ın koyu görünümde Liquid Glass'ı kaldırdığı bir kural yok — koyu zeminde cam daha az doygun, daha koyu bir varyanta geçer.

**Düzeltme:** Kapatmak yerine koyu varyant tanımla:
```css
#root[data-theme="dark"] .glass{
  background:rgba(22,22,26,0.72);
  backdrop-filter:blur(24px) saturate(130%);
  -webkit-backdrop-filter:blur(24px) saturate(130%);
  border:1px solid rgba(255,255,255,0.12);
}
```

**Risk:** Düşük–orta. Koyu tema şu an ölçülen en iyi yüzey (14/14 AAA/AA) — değişiklik sonrası kontrast yeniden hesaplanmalı. `rgba(22,22,26,.72)` siyah üzerinde ≈ `#101013`, yani mevcut kart rengiyle pratik olarak aynı; tokenlar korunur.

**Ayrıca:** C1 kabul edilirse bu madde otomatik daralır — koyu cam yalnızca header/nav'da kalır.

---

### C3 · Kaydırma kenarı efekti

**Ne:** `.sey-appheader.is-scrolled` var, yani kaydırma durumu zaten izleniyor. Bu, iOS 26/27'nin scroll edge effect'i için hazır bir kanca.

**Düzeltme:** İçerik header'ın altına girdiğinde cam yoğunluğunu artır:
```css
.sey-appheader{--glass-blur:14px;backdrop-filter:blur(var(--glass-blur)) saturate(170%);transition:backdrop-filter .28s ease;}
.sey-appheader.is-scrolled{--glass-blur:28px;}
@media (prefers-reduced-motion: reduce){ .sey-appheader{transition:none;} }
```

**Risk:** Düşük. Mevcut sınıf kullanılıyor, yeni JS yok.

---

## 8. Faz D — Tipografi ölçeği ve Dynamic Type

### D1 · Kalıp zaten repoda var

Panel-v2 doğru kalıbı kullanıyor: `--ae-scale-xs/sm/md/lg/xl/2xl` — **221 kullanım**, tek bir ham px yok. Uygulama ise 1400'den fazla satır içi `font-size:NNpx` taşıyor ve 20'den fazla farklı boyut değeri kullanıyor (`8.5px` → `20px` arası, `.5px` adımlarla).

Bu bir üslup farkı değil, **ölçek disiplininin olmaması**. `11px`, `11.5px`, `12px`, `12.5px` aynı ekranda yan yana kullanıldığında hiyerarşi taşımıyor, sadece gürültü üretiyor.

### D2 · Hedef ölçek

Panel-v2'nin adlandırma kalıbına uyumlu, HIG tabanına oturan yedi basamak:

```css
#root{
  --f-caption2: 0.6875rem;  /* 11px — HIG mobil minimum */
  --f-caption1: 0.75rem;    /* 12px */
  --f-footnote: 0.8125rem;  /* 13px */
  --f-subhead:  0.9375rem;  /* 15px */
  --f-body:     1.0625rem;  /* 17px — HIG mobil varsayılan */
  --f-title3:   1.25rem;    /* 20px */
  --f-title2:   1.375rem;   /* 22px */
}
```

`rem` tabanı kritik: kullanıcı iOS'ta metin boyutunu büyüttüğünde `px` sabit kalır, `rem` ölçeklenir. Dynamic Type'a giden tek yol bu.

### D3 · Kademeli geçiş — tek seferde değil

1400+ satır içi stili bir commit'te değiştirmek regresyon garantisidir. Sıralama:

1. Ölçek tokenlarını tanımla (hiçbir şeyi değiştirmez, sadece ekler).
2. **Yalnızca `app/styles.css`** içindeki `font-size` değerlerini tokenlara eşle — 380 civarı kural, tek dosya, kolay geri alınır.
3. `app.js` içinde **sekme sekme** dönüştür: `bugunHTML()` → doğrula → commit; `raporHTML()` → doğrula → commit; …
4. Her adımdan sonra `driver.mjs --dump <sekme>` ile üretilen HTML karşılaştır.

**Risk:** Yüksek hacim, düşük tekil risk. Bu faz aylara yayılabilir ve **acil değildir** — Faz A bittikten sonra uygulama zaten erişilebilir olur; D onu *sürdürülebilir* yapar.

---

## 9. Faz E — Panel tarafı

### E1 · ÆON v2 — koru, bozma

Ölçülen: her iki temada **tüm tokenlar AA veya üstü**, adlandırılmış tipografi ölçeği, 139 `aria-*`, 53 `role`, 24 `tabindex`, 7 safe-area kullanımı.

**Aksiyon: tamamlandı (AD-51).** Panel-v2 bu repodaki referans uygulama olarak korunuyor;
`panel/v2/panel-v2.css` içindeki reduced-motion kapsamı iki medya bloğu ve dosya sonundaki
global güvenlik ağıyla tüm animasyon/geçişleri kapsıyor. 27 Panel-v2 fixture'ının tamamı geçti.

Panel-v2'nin 27 fixture'lık test takımı bu yüzeydeki her değişikliğin kapısıdır:
```bash
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done
```

### E2 · ÆON v1 — yalnızca güvenlik ağı

Panel v1 koyu-tek-tema, altın vurgulu bir yüzey. Panel-v2 varken v1'e tasarım yatırımı yapmak yanlış olur.

**Aksiyon:** Sadece 8 `<div onclick>`'i butona çevir (A5 ile aynı gerekçe). Renk/tipografi çalışması **yapılmasın** — bu yüzey Panel-v2 lehine emekliye ayrılıyor.

### E3 · Panel ayna kuralı

[CLAUDE.md](../../CLAUDE.md) konvansiyon 4: her kalıcı kullanıcı kaydı panelde de görünmeli. Bu plan **hiçbir yeni veri alanı eklemiyor** (I1/I3), dolayısıyla ayna borcu doğmuyor. Bu bilinçli bir tercih — tasarım planı veri modeline dokunmamalı.

---

## 10. Uygulama sırası

| Sıra | Madde | Efor | Risk | Onay gerekir mi |
| --- | --- | --- | --- | --- |
| 1 | A1 · viewport kilidi | 1 dk | yok | hayır |
| 2 | A2 · `--faint` kontrastı | 5 dk | düşük | hayır |
| 3 | B2 · Increase Contrast | 15 dk | yok | hayır |
| 4 | B3 · forced-colors | 15 dk | yok | hayır |
| 5 | A3 · `-ink` token ailesi | 2–3 sa | orta | hayır |
| 6 | A6 · dokunma hedefleri | 1 sa | düşük | hayır |
| 7 | A5 · div → button (app + panel v1) | 3–4 sa | orta | hayır |
| 8 | C2 · koyu tema cam paritesi | 1 sa | düşük–orta | hayır |
| 9 | C3 · scroll edge efekti | 30 dk | düşük | hayır |
| 10 | B1 · sistem teması takibi | 1–2 sa | orta | **evet** |
| 11 | A4 · 11pt tabanı | 2–4 sa | düzen riski | **evet** |
| 12 | C1 · cam katman ayrımı | 1–2 gün | görsel | **evet** |
| 13 | D · tipografi ölçeği | kademeli | hacim | **evet** |
| — | E1 · panel-v2 reduced-motion | 1 sa | düşük | hayır |

**1–9 arası uygulanabilir hâlde:** ölçülmüş ihlaller, düşük risk, görsel kimliğe dokunmuyor.
**10–13 senin kararını bekliyor:** görünümü fark edilir biçimde değiştiriyor ya da geniş yüzeye yayılıyor.

---

## 11. İşlevselliği koruma protokolü

Her commit öncesi, istisnasız:

```bash
# 1. Sözdizimi
node --check app.js && node --check sync.js

# 2. Uygulama render'ı (onboarding + tohumlanmış durum + gerçek etkileşimler)
node .claude/skills/run-seyma/driver.mjs

# 3. İbadet hub'ı
node .claude/skills/run-seyma/zikr-harness.mjs

# 4. Panel yüzeyleri
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done

# 5. Senkron sözleşmesi (veri alanına dokunulmadıysa değişmemeli)
node tests/app/test_faz10_sync.js
```

**Ek kapılar:**

- **Handler sayımı sabit kalmalı.** Değişiklik öncesi ve sonrası:
  ```bash
  grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
  ```
  Sayı değişirse I2 ihlal edilmiştir — commit edilmez.

- **`onclick` hedefleri korunmalı.** A5 dönüşümünde:
  ```bash
  grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
  ```
  Dönüşüm öncesi/sonrası çıktı **birebir aynı** olmalı — yalnızca kapsayıcı etiket değişiyor.

- **Cache busting.** Konvansiyon 5: `app/styles.css`, `app.js` veya `sync.js` değiştiyse [index.html](../../index.html)'deki `?v=YYYYMMDDx` bump edilmeli, yoksa PWA eski varlığı servis eder.

- **Tarayıcı varsayılan değildir.** [CLAUDE.md](../../CLAUDE.md) veri güvenliği kuralı 1. Görsel doğrulama önce `driver.mjs --dump <sekme>` çıktısıyla yapılır. Kullanıcı açıkça isterse ajan; Guard 1 preflight'ı, geçici boş profil ve `127.0.0.1:9000` sınırıyla yerel ekran görüntüsü alabilir. `forceSync=1`, `seyma-sync-force`, gerçek profil/token ve non-loopback adresler kesinlikle kapsam dışıdır; iş bitince sunucu durdurulur.

---

## 12. Kapsam dışı

Bilinçli olarak **yapılmayacaklar** ve nedenleri:

- **Marka kimliği** — flamingo, gradyan, Türkçe sıcak ton. Denetimin konusu değil.
- **Yeni veri alanı / `migrate()` değişikliği** — bu bir tasarım planı; veri modeline dokunmak ayrı bir iş ve ayrı bir risk sınıfı.
- **`sync.js`, Guard 1/2, token yönetimi** — [CLAUDE.md](../../CLAUDE.md) kapsamı.
- **ÆON v1 görsel yenileme** — Panel-v2 varken yatırım yanlış yere gider (E2).
- **Framework/bundler getirmek** — repo bilinçli olarak vanilya; ölçek tokenları düz CSS ile çözülüyor, araç zinciri gerekmiyor.
- **iOS 27'ye özgü doğrulanmamış bileşenler** — spesifikasyon elimde doğrulanmış hâlde olmadan iş yapılmadı (§3).

---

## 13. Sonraki adım

Bu belge tek başına hiçbir şeyi değiştirmedi. Devam için iki yol:

1. **Dar başlangıç** — sıra 1–4 (A1, A2, B2, B3). Toplam ~40 dakika, sıfır görsel risk, dört ölçülmüş ihlal kapanır.
2. **Faz A'nın tamamı** — sıra 1–7. Uygulama erişilebilirlik tabanına oturur; A4 ve C1 ayrı kararlara bırakılır.

Onay verildiğinde her madde kendi commit'inde, §11 protokolü her adımda çalıştırılarak uygulanır.
