# Şeyma & ÆON — iOS 27 Tasarım Uygulama Promptları (AD-01 … AD-52)

> **Tek dosya, sıralı, atlanamaz.** Her prompt bağımsız bir ajan tarafından soğuk başlangıçtan uygulanabilir.
> **Plan:** [`IOS27-TASARIM-PLANI.md`](IOS27-TASARIM-PLANI.md) · **Durum:** [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) · **Kayıt:** [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md) · **Makine:** [`APPLE-DESIGN-STATE.json`](APPLE-DESIGN-STATE.json)

---

## 0. Ajan için ilk 60 saniye

Bu dosyayı açan her ajan, **hangi promptu çalıştıracağını seçmeden önce** şunu yapar:

```bash
cat docs/apple-design/APPLE-DESIGN-STATE.json          # activePrompt / lastCompletedPrompt / blockedPrompt
sed -n '1,60p' docs/apple-design/.anti-amnesia/CURRENT-STATE.md
git log --oneline -5
```

- `blockedPrompt` doluysa **dur**. Engel kullanıcı tarafından çözülmeden ilerlenmez.
- `activePrompt` doluysa o prompt yarım kalmıştır: `git status` ile çalışma ağacını incele, ya tamamla ya `git checkout -- .` ile geri al. **Bir sonrakine atlama.**
- Aksi hâlde çalıştırılacak prompt = `lastCompletedPrompt` + 1. **Sıra atlanmaz.**

---

## 1. Ortak sözleşme (her prompt bunu miras alır)

Aşağıdaki adımlar her promptta geçerlidir. Prompt gövdelerinde tekrar edilmez.

### S1 · Ön koşul
`APPLE-DESIGN-STATE.json` içindeki `lastCompletedPrompt`, bu promptun bir öncekine eşit olmalı. Değilse dur ve kullanıcıya bildir.

### S2 · Değişmezler (ihlali commit'i iptal ettirir)
Planın I1–I6 sözleşmesi bağlayıcıdır:

| | Kural |
| --- | --- |
| I1 | `data` nesnesinin şekli değişmez — alan eklenmez/silinmez/yeniden adlandırılmaz |
| I2 | `App.<name>` yüzeyi değişmez — handler adı ve imzası korunur |
| I3 | `migrate()` dokunulmaz |
| I4 | `render()` çağrı grafiği değişmez — değişiklikler class/style/attribute düzeyinde |
| I5 | `sync.js`, Guard 1, Guard 2 dokunulmaz |
| I6 | Tek prompt = tek commit; her prompt tek başına geri alınabilir |

### S3 · Veri güvenliği (CLAUDE.md)
**Uygulamayı tarayıcıda açma.** Görsel doğrulama `driver.mjs --dump <sekme>` çıktısı okunarak yapılır. `mustafaras/seyma-data` deposuna yazma yok.

### S4 · Doğrulama kapısı
```bash
node --check app.js && node --check sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

### S5 · Değişmezlik kanıtı
Promptun **öncesinde ve sonrasında** çalıştır; iki çıktı birebir aynı olmalı:
```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l     # handler sayısı
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # handler çağrı dağılımı
```
Fark varsa I2 ihlal edilmiştir → `git checkout -- .` ve kullanıcıya bildir.

### S6 · Üç dosyayı güncelle (atlanamaz)

**a) `.anti-amnesia/LEDGER.md`** — tabloya satır ekle:
```markdown
| AD-NN | <kısa ad> | ✅ TAMAMLANDI | `<commit>` | S4 geçti | <bir cümle sonuç> |
```
Başarısızsa `❌ BLOKE` + engelin ne olduğu.

**b) `.anti-amnesia/CURRENT-STATE.md`** — "Durum" bölümünü güncelle: hangi dalga, hangi prompt, sıradaki ne, açık kapı var mı.

**c) `APPLE-DESIGN-STATE.json`**:
```json
{ "lastCompletedPrompt": "AD-NN", "activePrompt": null, "blockedPrompt": null,
  "currentWave": "<dalga>", "updatedAt": "YYYY-MM-DD" }
```
Promptu **başlatırken** `activePrompt` doldurulur, **bitirirken** `null` yapılır. Bu, yarım kalan işi sonraki ajana görünür kılan tek mekanizmadır.

### S7 · Commit
```bash
git add -A
git commit -m "tasarım: AD-NN <kısa Türkçe açıklama>"
```
Commit mesajı Türkçe, kısa, madde adını taşır (repo konvansiyonu). **Push ve deploy ayrıca onaya tabidir** — prompt tek başına push etmez.

### S8 · Cache busting
`app/styles.css`, `app.js` veya `sync.js` değiştiyse [`index.html`](../../index.html) içindeki `?v=YYYYMMDDx` bump edilir. Her dalganın kapanış promptunda zorunlu.

---

## 2. Dalga haritası

| Dalga | Promptlar | Konu | Onay |
| --- | --- | --- | --- |
| 1 | AD-01 … AD-05 | Sıfır risk erişilebilirlik | — |
| 2 | AD-06 … AD-13 | `-ink` renk token ailesi | — |
| 3 | AD-14 … AD-16 | Dokunma hedefleri | — |
| 4 | AD-17 … AD-25 | Klavye erişimi (div → button) | — |
| 5 | AD-26 … AD-29 | Malzeme tutarlılığı (koyu cam, scroll edge) | — |
| 6 | AD-30 … AD-32 | Sistem teması takibi | **evet** |
| 7 | AD-33 … AD-37 | 11pt tipografi tabanı | **evet** |
| 8 | AD-38 … AD-42 | Liquid Glass katman ayrımı | **evet** |
| 9 | AD-43 … AD-50 | Tipografi ölçeği / Dynamic Type | **evet** |
| 10 | AD-51 … AD-52 | Panel + kapanış | — |

**Onay sütunu "evet" olan dalgalar:** ilk promptunu çalıştırmadan önce kullanıcıdan açık onay al. Onay yoksa `blockedPrompt` alanına yaz ve dur.

---

# DALGA 1 — Sıfır risk erişilebilirlik

## AD-01 · Yakınlaştırma kilidini kaldır

**Kaynak:** Plan §5/A1

[`index.html`](../../index.html) satır 5'te `maximum-scale=1` ifadesini sil. Virgülü de temizle, başka hiçbir şeye dokunma.

```html
<!-- önce -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<!-- sonra -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**Kabul:** `grep -c 'maximum-scale' index.html` → `0`. `viewport-fit=cover` yerinde kalmalı.

---

## AD-02 · `--faint` metin kontrastını AA'ya çıkar

**Kaynak:** Plan §5/A2 — ölçülen 3.06:1, hedef 4.50:1

[`app/styles.css`](../../app/styles.css) satır 209, **yalnızca açık tema bloğunda** (`#root{`):

```css
/* önce */ --faint:#9C8C92;
/* sonra */ --faint:#816F76;
```

Koyu temadaki `--faint:#858590` (5.21:1) **değişmez** — zaten geçiyor.

**Kabul:** `grep -c '#9C8C92' app/styles.css` → `0`. `grep -c '#858590' app/styles.css` → `1`.

---

## AD-03 · Increase Contrast desteği ekle

**Kaynak:** Plan §6/B2

[`app/styles.css`](../../app/styles.css) içinde `#root{...}` bloğundan **sonra** yeni blok:

```css
/* Sistem "Increase Contrast" açıkken ikincil metinleri yükselt. */
@media (prefers-contrast: more){
  #root{
    --muted:var(--text2);
    --faint:var(--muted);
    --card-bd:rgba(0,0,0,.28);
  }
}
```

Varsayılan yola dokunulmaz; blok yalnızca sistem ayarı açıkken devreye girer.

**Kabul:** `grep -c 'prefers-contrast' app/styles.css` → `1`.

---

## AD-04 · forced-colors güvenlik ağı

**Kaynak:** Plan §6/B3

[`app/styles.css`](../../app/styles.css) sonuna:

```css
/* Zorlanmış renk modunda cam ve gölge okunabilirliği bozar. */
@media (forced-colors: active){
  .glass{backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid CanvasText;}
  button{forced-color-adjust:none;}
}
```

**Kabul:** `grep -c 'forced-colors' app/styles.css` → `1`.

---

## AD-05 · Dalga 1 kapanışı

1. S8 uygula — `index.html` içindeki `?v=` bump (`app/styles.css` değişti).
2. S4 doğrulama kapısının tamamını çalıştır, çıktıyı ledger'a yaz.
3. S5 değişmezlik kanıtını çalıştır.
4. Kontrastı yeniden ölç ve `--faint` için ≥4.5 doğrula (AD-13'teki script henüz yoksa elle hesapla).
5. S6 + S7.

**Kabul:** Dalga 1'in dört promptu ledger'da ✅; `currentWave` → `2`.

---

# DALGA 2 — `-ink` renk token ailesi

> **Amaç:** dolgu/kenarlık renkleri markayı korumak için olduğu gibi kalır; yalnızca **metin** kullanımları AA sağlayan kardeş token'a taşınır. Görsel yoğunluk değişmez, yazı okunur olur.

## AD-06 · `-ink` tokenlarını tanımla

[`app/styles.css`](../../app/styles.css) — açık tema `#root{}` bloğuna ekle (mevcut satırlar **silinmez**):

```css
  --accent-ink:#B55471;   /* 4.50:1 */
  --warn-ink:#E0252B;     /* 4.50:1 */
  --ok-ink:#368343;       /* 4.50:1 */
  --watch-ink:#A16729;    /* 4.50:1 */
  --listen-ink:#0D808C;   /* 4.50:1 */
  --drop-ink:#9F6647;     /* 4.50:1 */
```

Koyu tema `#root[data-theme="dark"]{}` bloğuna — koyu tokenlar zaten AAA, ink = token:

```css
  --accent-ink:var(--accent); --warn-ink:var(--warn); --ok-ink:var(--ok);
  --watch-ink:var(--watch);   --listen-ink:var(--listen); --drop-ink:var(--drop);
```

**Kabul:** `grep -c '\-ink:' app/styles.css` → `12`. Bu prompt hiçbir kullanımı değiştirmez, yalnızca ekler — render birebir aynı kalmalı.

---

## AD-07 · `--accent` metin kullanımlarını taşı

Yalnızca **`color:var(--accent)`** kalıbı `color:var(--accent-ink)` olur. `background`, `border`, `box-shadow`, `color-mix` içindeki kullanımlara **dokunulmaz**.

```bash
# Önce envanter çıkar — kaç yerde, hangi dosyada
grep -c 'color:var(--accent)' app.js app/styles.css
```

Dönüşüm mekaniktir ancak `--accent2`, `--accent-bg` gibi komşu tokenları yakalamamalı: kalıp tam olarak `color:var(--accent)` — kapanış parantezi dahil.

**Kabul:** Dönüşüm sonrası `color:var(--accent-ink)` sayısı, öncesindeki `color:var(--accent)` sayısına **eşit** olmalı. İki sayıyı da ledger'a yaz.

---

## AD-08 · `--warn` metin kullanımlarını taşı
AD-07 ile birebir aynı yordam, token `--warn` → `--warn-ink`. Beklenen ~12 site.

## AD-09 · `--ok` metin kullanımlarını taşı
Token `--ok` → `--ok-ink`. Beklenen ~15 site. **Dikkat:** `--ok-bg` ayrı bir token, dokunma.

## AD-10 · `--watch` metin kullanımlarını taşı
Token `--watch` → `--watch-ink`. Beklenen ~11 site. **Dikkat:** `--watch-bg` dokunma.

## AD-11 · `--listen` metin kullanımlarını taşı
Token `--listen` → `--listen-ink`. Beklenen ~5 site. **Dikkat:** `--listen-bg` dokunma.

## AD-12 · `--drop` metin kullanımlarını taşı
Token `--drop` → `--drop-ink`. Beklenen ~1 site. **Dikkat:** `--drop-bg` dokunma.

---

## AD-13 · Kontrast doğrulama scripti + Dalga 2 kapanışı

`docs/apple-design/verify-contrast.mjs` oluştur: `app/styles.css` içindeki `#root` ve `#root[data-theme="dark"]` bloklarından tokenları okur, kart yüzeyi üzerinde WCAG oranını hesaplar, **4.5'in altında metin tokenı bulursa `exit 1`** verir.

- Zemin (açık): `rgba(255,255,255,.72)`, sayfa gradyanının en koyu durağı `#F1EBFF` üzerine kompozit.
- Zemin (koyu): `rgba(17,17,20,.96)`, `#000000` üzerine kompozit.
- Denetlenecek metin tokenları: `--text --text2 --muted --faint` + altı `-ink`.

```bash
node docs/apple-design/verify-contrast.mjs   # 0 = tüm metin tokenları AA
```

Sonra S8, S4, S5, S6, S7.

**Kabul:** script `exit 0`; `currentWave` → `3`.

---

# DALGA 3 — Dokunma hedefleri

## AD-14 · Küçük hedefleri şeffaf alanla büyüt

**Kaynak:** Plan §5/A6 — HIG mobil kontrol minimumu 44×44pt

[`app/styles.css`](../../app/styles.css)'e yardımcı sınıf:

```css
/* Görsel boyut korunur, dokunma alanı 44pt'ye tamamlanır. */
.sey-tiny-hit{position:relative;}
.sey-tiny-hit::after{content:"";position:absolute;inset:-14px;}
```

`min-height:16px` taşıyan 4 kontrolü bul (`grep -n 'min-height:16px' app.js app/styles.css`) ve sınıfı ekle.

**Kabul:** 4 kontrol de `sey-tiny-hit` taşıyor. Görsel çıktı değişmemeli — `driver.mjs --dump` öncesi/sonrası yalnızca class farkı göstermeli.

**Uyarı:** Üst üste binen hedeflerde `::after` alanları çakışabilir. Yan yana iki `sey-tiny-hit` varsa `inset` değerini `-10px`'e düşür.

---

## AD-15 · 40px hedefleri 44px'e çıkar

`min-height:40px` taşıyan 5 kontrolü `min-height:44px` yap. 4px fark, düzen riski düşük.

**Kabul:** `grep -c 'min-height:40px' app.js` → `0`.

---

## AD-16 · Dalga 3 kapanışı
S8, S4, S5, S6, S7. `currentWave` → `4`.

---

# DALGA 4 — Klavye erişimi

> **Kaynak:** Plan §5/A5. `app.js`'te 54 `<div onclick>`, `panel/panel.js`'te 8. Aynı dosyada 394 `<button onclick>` var — kalıp zaten doğru, bunlar istisna.

## AD-17 · `.sey-asbtn` yardımcı sınıfı

[`app/styles.css`](../../app/styles.css)'e:

```css
/* Buton semantiği, div görünümü. */
.sey-asbtn{appearance:none;-webkit-appearance:none;background:none;border:0;padding:0;margin:0;
  font:inherit;color:inherit;text-align:inherit;width:100%;display:block;cursor:pointer;}
```

Bu prompt hiçbir öğeyi dönüştürmez — yalnızca sınıfı hazırlar.

---

## AD-18 · Dönüşüm envanteri çıkar (kod değişmez)

`docs/apple-design/div-onclick-envanteri.md` oluştur. Her `<div onclick>` için:

| # | Dosya:satır | Handler | İçinde başka `<button>` var mı | Strateji |
| --- | --- | --- | --- | --- |

**Strateji sütunu iki değerden biri:**
- `button` — içinde buton yok → `<button type="button" class="… sey-asbtn">`
- `role` — içinde buton var (iç içe buton geçersizdir) → `role="button" tabindex="0"` + `onkeydown` ile Enter/Space

`onkeydown` kalıbı — yeni `App` handler'ı **eklemez**, mevcut olanı çağırır:
```html
onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.foo('a',1);}"
```

**Kabul:** Envanterde 62 satır (54 app + 8 panel). Kod dosyaları değişmemiş olmalı — `git status` yalnızca yeni envanter dosyasını göstermeli.

---

## Dönüşüm partileri — AD-19 … AD-23 ortak yordamı

AD-18 envanterini 5 partiye böl (her parti ~11 öğe), sekme/bölüm sınırlarına saygı göster. **Her parti ayrı bir prompttur: ayrı commit, ayrı ledger satırı.**

**Her partide:**
1. Envanterdeki stratejiye uy (`button` veya `role`).
2. Handler adı ve argümanları **karakteri karakterine** korunur.
3. S5 değişmezlik kanıtı — `onclick="App.…"` dağılımı birebir aynı kalmalı.
4. `driver.mjs --dump <ilgili sekme>` ile üretilen HTML'i incele: metin içeriği ve sıra değişmemeli.

**Dur koşulu:** Bir öğenin dönüşümü sırasında iç içe buton, form kontrolü veya `contenteditable` bulursan o öğeyi **atla**, envanterde `ERTELENDI` işaretle, ledger'a not düş. Zorlama.

## AD-19 · Dönüşüm partisi 1/5
Envanter satırları 1–11. Yukarıdaki ortak yordam.

## AD-20 · Dönüşüm partisi 2/5
Envanter satırları 12–22. Yukarıdaki ortak yordam.

## AD-21 · Dönüşüm partisi 3/5
Envanter satırları 23–33. Yukarıdaki ortak yordam.

## AD-22 · Dönüşüm partisi 4/5
Envanter satırları 34–44. Yukarıdaki ortak yordam.

## AD-23 · Dönüşüm partisi 5/5
Envanter satırları 45–54. Yukarıdaki ortak yordam. Bitince `app.js` içinde `<div onclick` sayısı **0** olmalı.

---

## AD-24 · Panel v1 dönüşümü

`panel/panel.js` içindeki 8 `<div onclick>` aynı yordamla. Panel v1 emekliye ayrılan yüzey — **yalnızca bu güvenlik ağı**, renk/tipografi çalışması yapılmaz.

**Kabul:** `node tests/panel/test_faz11_panel.js` geçer.

---

## AD-25 · Dalga 4 kapanışı
S8, S4, S5, S6, S7. Ertelenen öğeler varsa `CURRENT-STATE.md`'nin "Bilinen açık kapı" bölümüne yaz. `currentWave` → `5`.

---

# DALGA 5 — Malzeme tutarlılığı

## AD-26 · Koyu temada cam paritesi

**Kaynak:** Plan §7/C2 — [`app/styles.css:386`](../../app/styles.css#L386) camı koyu temada tamamen kapatıyor

Kapatma kuralını koyu varyantla değiştir:

```css
/* önce */
#root[data-theme="dark"] .glass{backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none!important;}
/* sonra */
#root[data-theme="dark"] .glass{
  background:rgba(22,22,26,0.72);
  backdrop-filter:blur(24px) saturate(130%);
  -webkit-backdrop-filter:blur(24px) saturate(130%);
  border:1px solid rgba(255,255,255,0.12);
}
```

**Kabul:** `grep -c 'data-theme="dark"\] .glass{backdrop-filter:none' app/styles.css` → `0`.

---

## AD-27 · Koyu tema kontrastını yeniden ölç

Koyu tema bu repodaki en iyi ölçülen yüzey (14/14 AAA/AA). AD-26 zemini `#000` → `≈#101013` yaptı; bu **mevcut kart rengiyle pratik olarak aynı**, ama doğrulanmadan geçilmez.

```bash
node docs/apple-design/verify-contrast.mjs
```

Herhangi bir koyu token AA'nın altına düştüyse AD-26'yı geri al (`git revert`) ve `blockedPrompt` işaretle.

---

## AD-28 · Kaydırma kenarı efekti

**Kaynak:** Plan §7/C3 — `.sey-appheader.is-scrolled` sınıfı zaten var, yeni JS gerekmez

```css
.sey-appheader{--glass-blur:14px;backdrop-filter:blur(var(--glass-blur)) saturate(170%);
  -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(170%);transition:backdrop-filter .28s ease;}
.sey-appheader.is-scrolled{--glass-blur:28px;}
@media (prefers-reduced-motion: reduce){ .sey-appheader{transition:none;} }
```

**Kabul:** `is-scrolled` sınıfını yazan JS **değişmemiş** olmalı (I4).

---

## AD-29 · Dalga 5 kapanışı
S8, S4, S5, S6, S7. `currentWave` → `6`.

> **DUR.** Dalga 6'dan itibaren her dalga kullanıcı onayı ister. Onay yoksa `blockedPrompt: "AD-30"` yaz ve bekle.

---

# DALGA 6 — Sistem teması takibi · **ONAY GEREKİR**

## AD-30 · `data-theme` yazan kodu denetle (salt okuma)

Kod değişmez. Şunu belgele ve ledger'a yaz:
- `data-theme` attribute'unu hangi `App` handler'ı yazıyor?
- Üç durum (`light` / `dark` / seçilmemiş) ayırt ediliyor mu, yoksa yalnızca iki mi?
- Kullanıcı hiç seçim yapmamışsa attribute ne oluyor?

**Bu cevaplar AD-31'in şeklini belirler.** Attribute her zaman yazılıyorsa (yani "seçilmemiş" durumu yoksa), `prefers-color-scheme` hiçbir zaman devreye giremez — o hâlde AD-31 handler değişikliği gerektirir ve I2/I4 gereği **ayrı onay** ister.

---

## AD-31 · `prefers-color-scheme` bloğu

```css
/* Açık tema = taban :root, dokunulmaz. */
@media (prefers-color-scheme: dark){
  #root:not([data-theme="light"]){ /* koyu token bloğunun birebir kopyası */ }
}
/* Elle seçim her zaman kazanır — mevcut blok aynen kalır. */
#root[data-theme="dark"]{ … }
```

⚠️ Koyu token bloğu artık **iki yerde** yaşayacak. CSS'e şu yorumu düş:
```css
/* SENKRON UYARISI: koyu tokenlar iki blokta tanımlı —
   @media (prefers-color-scheme: dark) ve #root[data-theme="dark"].
   Birini değiştiren diğerini de değiştirmek zorundadır. */
```

**Kabul:** `verify-contrast.mjs` her iki koyu blok için de geçer.

---

## AD-32 · Dalga 6 kapanışı
S8, S4, S5, S6, S7. `currentWave` → `7`. Yeni onay iste.

---

# DALGA 7 — 11pt tipografi tabanı · **ONAY GEREKİR**

> **Kaynak:** Plan §5/A4. HIG mobil minimum 11pt. Mevcut: 52 × 9px, 11 × 9.5px, 2 × 8.5px.
> **Bu dalganın düzen riski var** — dar rozetlerde satır kaydırma olabilir.

## AD-33 · `app/styles.css` içindeki 11px altı
`8.5px`, `9px`, `9.5px`, `10px`, `10.5px` değerlerini `11px`'e çıkar. Tek dosya, kolay geri alınır.

**Kabul:** `grep -oE 'font-size:(8(\.5)?|9(\.5)?|10(\.5)?)px' app/styles.css | wc -l` → `0`.

## AD-34 · `app.js` — 8.5px (2 site)
## AD-35 · `app.js` — 9px (52 site)
## AD-36 · `app.js` — 9.5px (11 site)

**Her birinde zorunlu görsel denetim:**
```bash
node .claude/skills/run-seyma/driver.mjs --dump bugun
node .claude/skills/run-seyma/driver.mjs --dump rapor
```
Taşma görürsen **fontu geri küçültme** — kapsayıcıya `min-width` veya `flex-wrap:wrap` ver. Fontu geri küçültmek bu dalganın amacını ortadan kaldırır.

---

## AD-37 · Dalga 7 kapanışı
S8, S4, S5, S6, S7. Düzeltilemeyen taşmalar `CURRENT-STATE.md` açık kapı bölümüne. `currentWave` → `8`. Yeni onay iste.

---

# DALGA 8 — Liquid Glass katman ayrımı · **ONAY GEREKİR**

> **Kaynak:** Plan §7/C1. HIG: *"Don't use Liquid Glass in the content layer."*
> **Bu, planın görsel olarak en görünür değişikliği.** Kullanıcı reddederse dalga tamamen atlanır — Dalga 9'a geçilir, bu meşru bir karardır.

## AD-38 · İçerik katmanı yüzeyini tanıt

```css
#root{ --card-solid:#FFFDFC; }
#root[data-theme="dark"]{ --card-solid:#111114; }
.surface{background:var(--card-solid);border:1px solid var(--card-bd);}
```

Hiçbir öğe henüz değişmez — yalnızca ekleme. Render birebir aynı kalmalı.

## AD-39 · `.glass`'ı fonksiyonel katmana daralt

`.glass` yalnızca şunlarda kalır: `.sey-appheader`, alt sekme çubuğu, `--nav`/`--chatbar` taşıyan yüzeyler, yüzen aksiyonlar. Envanterini çıkar ve ledger'a yaz.

## AD-40 · İçerik kartları — parti 1 (~35 site)
## AD-41 · İçerik kartları — parti 2 (~34 site)

`class="glass"` → `class="surface"`. Bileşik sınıflarda (`glass sey-room-card` vb.) yalnızca `glass` kelimesi değişir.

**Her partide:** `driver.mjs --dump` ile sekmeyi incele; kart sınırlarının hâlâ görünür olduğunu (`--card-bd` kenarlığı) doğrula.

## AD-42 · Dalga 8 kapanışı
S8, S4, S5, S6, S7. `verify-contrast.mjs` — opak zemin kontrast hesabını değiştirdiği için **zorunlu**. `currentWave` → `9`. Yeni onay iste.

---

# DALGA 9 — Tipografi ölçeği · **ONAY GEREKİR**

> **Kaynak:** Plan §8. Panel-v2'de kalıp zaten var (221 kullanım, sıfır ham px). Uygulamada 1400+ satır içi px.
> **Acil değil.** Dalga 1–8 bittiğinde uygulama zaten erişilebilir; bu dalga onu *sürdürülebilir* yapar.

## AD-43 · Ölçek tokenlarını tanımla

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

`rem` tabanı Dynamic Type'ın ön koşuludur; `px` kullanıcı metin boyutuyla ölçeklenmez.

## AD-44 · `app/styles.css` eşlemesi
~380 `font-size` kuralını en yakın token'a eşle. Eşleme tablosu: 11→caption2, 11.5/12/12.5→caption1, 13/13.5→footnote, 14/14.5/15/15.5→subhead, 16/17→body, 20→title3, 22+→title2.

### `app.js` sekme sekme — AD-45 … AD-49 ortak yordamı

Her prompt tek bir sekmeyi dönüştürür: o sekmenin HTML üreten fonksiyonundaki `font-size:NNpx` değerleri AD-43 tokenlarına eşlenir. **Her biri ayrı commit, ayrı ledger satırı.** Zorunlu doğrulama: `node .claude/skills/run-seyma/driver.mjs --dump <sekme>` — üretilen metin ve sıra değişmemeli.

## AD-45 · `bugun` sekmesi
`bugunHTML()` ve çağırdığı yardımcılar.

## AD-46 · `rapor` sekmesi
`raporHTML()` ve çağırdığı yardımcılar.

## AD-47 · `mesaj` sekmesi
`mesajHTML()` ve sohbet bileşenleri.

## AD-48 · Overlay hub'ları
📖 okuma, 🎬 izleme, 🎧 dinleme, İlham & İbadet. Doğrulama: `zikr-harness.mjs` de çalıştırılır.

## AD-49 · Kalan yüzeyler
Ayarlar, modal'lar, rozetler ve yukarıdaki dördüne girmeyen her şey. Bitince `grep -c 'font-size:[0-9]' app.js` → **0**.

## AD-50 · Dalga 9 kapanışı
S8, S4, S5, S6, S7. `currentWave` → `10`.

---

# DALGA 10 — Panel ve kapanış

## AD-51 · Panel-v2 reduced-motion kapsamı

`panel/v2/panel-v2.css` 5349 satır ama yalnızca **1** `prefers-reduced-motion` kuralı var. `transition` ve `animation` taşıyan bileşenleri tara, kapsamı genişlet.

```bash
grep -c 'transition:\|animation:' panel/v2/panel-v2.css
```

**Kabul:** 27 fixture'ın tamamı geçer.

---

## AD-52 · Program kapanışı

1. S4 kapısının tamamı, çıktı ledger'a.
2. `verify-contrast.mjs` → `exit 0`.
3. [`IOS27-TASARIM-PLANI.md`](IOS27-TASARIM-PLANI.md) §4 puan tablosunu gerçek duruma göre güncelle.
4. [`docs/GELISTIRME-PLANI.md`](../GELISTIRME-PLANI.md) durum tablosuna satır ekle (repo konvansiyonu).
5. `APPLE-DESIGN-STATE.json` → `"status": "completed"`, `"activePrompt": null`.
6. `CURRENT-STATE.md` → kapanış özeti, atlanan/ertelenen maddeler listesi.
7. **Push/deploy ayrıca onay ister** — `main`'e push GitHub Pages'i yeniden yayımlar.

---

## 3. Başarısızlık yordamı

Herhangi bir promptta S4 veya S5 başarısız olursa:

```bash
git checkout -- .                                  # çalışma ağacını temizle
```
Sonra:
1. `APPLE-DESIGN-STATE.json` → `"blockedPrompt": "AD-NN"`, `"activePrompt": null`.
2. `LEDGER.md` → `❌ BLOKE` satırı + hangi kapının hangi çıktıyla düştüğü.
3. `CURRENT-STATE.md` → "Bilinen açık kapı" bölümüne bir paragraf.
4. Kullanıcıya bildir. **Bir sonraki prompta geçme.**

Commit edilmiş bir prompt sonradan sorun çıkarırsa: `git revert <commit>` — I6 gereği her prompt tek başına geri alınabilir.

---

## 4. Prompt sayacı

| Dalga | Promptlar | Adet |
| --- | --- | --- |
| 1 | AD-01 … AD-05 | 5 |
| 2 | AD-06 … AD-13 | 8 |
| 3 | AD-14 … AD-16 | 3 |
| 4 | AD-17 … AD-25 | 9 |
| 5 | AD-26 … AD-29 | 4 |
| 6 | AD-30 … AD-32 | 3 |
| 7 | AD-33 … AD-37 | 5 |
| 8 | AD-38 … AD-42 | 5 |
| 9 | AD-43 … AD-50 | 8 |
| 10 | AD-51 … AD-52 | 2 |
| | **Toplam** | **52** |
