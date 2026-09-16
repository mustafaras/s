# Şeyma v3.0 — "Hoş Geldin" Tanıtım Sayfası · YENİ OTURUM STARTER

> **Bu dosya bir devir belgesidir (handoff).** Yeni bir oturum açtığında bu dosyayı
> Claude'a/Copilot'a ver ve şunu söyle:
> **"`docs/v3-tanitim/STARTER.md` dosyasını oku ve uygula."**
> Başka bir şeye gerek yok — buradaki her şey kendi kendine yeterlidir.

---

## 0. İlk 3 dakika (ajan için zorunlu okuma)

Bu sırayla oku:

1. **Bu dosyanın tamamı** (özellikle §3 sözleşmeler ve §7 tuZaklar)
2. `CLAUDE.md` → "DATA SAFETY" bölümü (port 9000 kuralı) ve "Conventions" (madde 2, 5, 7)
3. `app/styles.css` → ilk 120 satır (98 tasarım token'ı: `--accent-*`, `--f-*`, `--dur-*`, `--ease-*`, `--elev-*`)
4. `panel-v2.html` (ayrı sayfa deseninin canlı örneği — 30 satır)
5. `archive/monolit-bolumlenme-plan-2/deliverables/MON2-SERI-KAPANIS.md` §1 (v3.0'ın sayısal kanıtı)

**Başlamadan önce:** `git status --short --branch` → çalışma ağacı temiz olmalı. Değilse **dur** ve kullanıcıya sor.

---

## 1. Görev (tek cümle)

Şeyma'ya **v3.0 sürüm tanıtımı için tek sayfalık, dikey kaydırılabilir, premium-elit-modern bir "hoş geldin" sayfası** yap; kullanıcı en sondaki **"Okudum, anladım"** butonuna bastığında **bir daha asla gösterilmeyecek**.

---

## 2. Kullanıcının tam isteği (değiştirilemez)

| Kural | Ayrıntı |
|---|---|
| **Sadece kullanıcı tarafında** | Bu sayfa yalnız `mustafaras/s` (kullanıcı) tarafında çalışır. `panel*` yüzeylerine **dokunma**. |
| **Yeni açılışta tetiklenir** | Uygulama açıldığında, daha önce okunmadıysa otomatik gösterilir. |
| **Tek sayfa, dikey kaydırma** | Sayfa içinde aşağı doğru kaydırılabilir tek akış; sekmeler/alt sayfalar **yok**. |
| **"Okudum, anladım" butonu** | Sayfanın **en sonunda**. Dokunulunca kalıcı olarak işaretlenir. |
| **Bir daha çıkmaz** | İşaretlendikten sonra **hiçbir koşulda** tekrar gösterilmez (sürüm düşürme, veri sıfırlama dahil — §3.4'e bak). |
| **Ton** | **Neşeli, pozitif, premium.** Suçlayıcı/teknik/kuru dil yasak. Kullanıcı bu uygulamayı sevgiyle kullanıyor — sayfa bunu hissettirmeli. |
| **Tasarım** | **Premium, elit, modern, first-class.** Emoji **yok** (uygulamanın genel dili emojisiz prestij tonuna kaydı). Altın/champagne palet + gerçek siyah zemin. |

---

## 3. Bağlayıcı sözleşmeler (bunlara uymayan çözüm reddedilir)

### 3.1 S1–S8 (MON programından devralınan)
- **S3 / I1** — `data` şekli **değişmez**; yeni alan ekliyorsan `migrate()`'e backfill ekle. `App.<name>` handler yüzeyi **bozulmaz** (554 handler sabit — `grep -cE '^App\.[A-Za-z0-9_$]+\s*=\s*function' app.js`).
- **S5** — Yeni `app/core/*` dosyası yüklemede DOM/ağ/timer/storage **okumaz**; yalnız registry kurar.
- **S7** — Yeni `app/core/*` dosyası eklenirse **dört listeye** de eklenir (MON-25 dersi):
  1. `index.html` script sırası, 2. `.claude/skills/run-seyma/driver.mjs` FILES, 3. `.claude/skills/run-seyma/zikr-harness.mjs` FILES, 4. `tests/app/test_state_rebind_boundary.js` boot listesi.
- **S8** — Aynı commit'te state/ledger dokümanları güncellenir (`docs/GELISTIRME-PLANI.md` changelog).

### 3.2 DATA SAFETY (CLAUDE.md'den — ihlal edilemez)
- **Port 9000 kuralı:** Yerel görsel doğrulama **yalnız** `python3 -m http.server 9000 --bind 127.0.0.1` + **disposable tarayıcı profili**. `forceSync=1` **yok**, `seyma-sync-force` **yok**, gerçek token/parola **yok**.
- **Turn bitmeden sunucuyu kapat:** `pkill -f "http.server 9000"`.
- **Varsayılan doğrulama** headless: `node .claude/skills/run-seyma/driver.mjs`.
- **`mustafaras/seyma-data`'ya yazma** — bu iş için hiç gerekmiyor.

### 3.3 Mevcut desenleri kullan (yeniden icat etme)

**Ayrı sayfa deseni** — `panel-v2.html`'i taklit et:
```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <title>Şeyma · Sürüm 3.0</title>
  <link rel="stylesheet" href="app/styles.css?v=YYYYMMDDx">   <!-- token'ları ödünç al -->
  <link rel="stylesheet" href="v3-tanitim/v3.css?v=YYYYMMDDx"> <!-- kendi stil dosyan -->
</head>
<body>
  <div id="v3-root">…</div>
  <script src="v3-tanitim/v3.js?v=YYYYMMDDx"></script>
</body>
</html>
```

**Tetikleme deseni** — iki seçenek var, **A'yı öner**:

| | Yaklaşım | Artı | Eksi |
|---|---|---|---|
| **A ✅** | Ayrı sayfa: `index.html` açılışında `localStorage` bayrağını okuyan **küçük bir redirect/overlay** → yoksa `v3-tanitim/index.html`'e yönlendir, "Okudum" → bayrağı yaz + `index.html`'e dön | İzole, app.js'e sızmaz, DATA SAFETY riski yok | 1 ek dosya |
| B | `app.js` içinde overlay HTML | tek dosya | `render.js`/`appSurface.js` sözleşmelerine dokunur — **riski yüksek** |

> ⚠️ A seçeneğinde bile **`app.js`'e dokunmak zorunda kalırsan önce dur ve kullanıcıya sor.** Tercih: `app.js`'e **hiç** dokunmadan, sadece `index.html`'e 3–5 satırlık inline bootstrap script eklemek.

### 3.4 "Bir daha çıkmaz" — kalıcılık tasarımı

**Anahtar:** `seyma-v3-welcome-v1` (kendi namespace'in, `seyma-reset-v1`'e dokunma).

```js
// Okundu işareti — sürümden bağımsız, silinmez
const SEEN_KEY = 'seyma-v3-welcome-v1';
const isSeen  = () => { try { return localStorage.getItem(SEEN_KEY) === 'done'; } catch(_) { return false; } };
const markSeen= () => { try { localStorage.setItem(SEEN_KEY, 'done'); } catch(_) {} };
```

**Kritik kural:** "Bir daha asla" = kullanıcı **bir kez** okuduysa, `data` sıfırlansa/versiyon düşse/yeni cihaz olmasa bile **bu cihazda** tekrar gösterilmez. `localStorage` silinirse (kullanıcı kendi yaptıysa) gösterilmesi **doğru davranıştır** — buna karşı koruma ekleme.

---

## 4. Sayfa içeriği — anlatılacak gerçek yenilikler (kanıtlı)

> Hepsi bu repoda **doğrulanmış** rakamlardır. Uydurma/abartma yok.

### 4.1 Sürüm başlığı
**"Şeyma 3.0 — Günışığı yenilendi"** (alt başlık önerisi: *"Aynı sıcaklık, çok daha sağlam bir temel."*)

### 4.2 Anlatılacak yenilikler (her biri bir kart/bölüm)

| # | Başlık (neşeli/premium ton) | Kanıt |
|---|---|---|
| **1** | **"Zemini baştan kurdum"** — uygulamanın kalbi %42 küçüldü, aynı işi yapıyor | `app.js` **13.139 → 7.603 satır** (−5.536, %42). *Not: MON2-08 kapanış değeri; sonraki iki bulgu düzeltmesi +7 satır yorum ekledi → güncel **7.610**. Sayfada "13.139 → 7.610 · %42 küçüldü" yazmak en doğrusu.* |
| **2** | **"Her şey kendi evinde"** — tek dev dosya yerine **30 modül + 11 içerik dosyası** | `app/core/*.js` = 30, `app/content/*.js` = 11 (doğrulandı) |
| **3** | **"Fısıltıyla rehberlik"** — sesli rehberlik: ilk dokunuşta "Başla, kalbin yumuşasın.", yarıda nefes molası, bitişte "Allah kabul etsin." Gece 23:00–07:00 sessiz. | `SeyAudio.guides` — 3 canlı ipucu doğrulandı |
| **4** | **"Canlı gökyüzü"** — başlık artık canvas parçacık motoru: yağmur, kar, 2 katman bulut, 3 bant sis, yıldırım; 4 zaman × 8 hava × 6 mevsim = **192 sahne**, tamamı zaten var olan hava verisinden (yeni ağ çağrısı yok) | `app/core/skyFx.js` (`SeySkyFx`), HEADER-V2 kanıtı: 60.2 fps, kontrast 11.58 |
| **5** | **"Dokunulunca hissedilir"** — mikro animasyonlar, altın/champagne palet, sesli-hareketli geri bildirim; hepsi tek anahtarla (`Premium Atmosfer`) kapatılabilir | FX-2 serisi 28 kart, M7 %62 (onaylı tavan) |
| **6** | **"114 sûre, 99 isim, 100 öncü"** — Kur'an Yolculuğu nüzul sırasıyla; Esmâü'l-Hüsnâ; günün öncüsü | `quranRevelationOrderV1`, `esmaulHusnaV1/V2`, `saygiPeople` |
| **7** | **"Zikirmatik yenilendi"** — sayaç, hatim takibi, geçmiş, esmâ içerikleri, manuel giriş | `app/core/zikir.js` (1.724 satır) |
| **8** | **"Güvenli ve sessiz"** — verin senin cihazında; yerel sunucudan asla buluta yazılmaz (Guard 1); parola düz metin olarak saklanmaz | `sync.js:223` Guard 1 |

### 4.3 Kapanış
En sonda **"Okudum, anladım"** butonu. Altında küçük, sıcak bir not:
> *"Bu sayfayı bir daha görmeyeceksin. Hoş geldin, Sevgili Günışığı."*

---

## 5. Tasarım yönü — premium / elit / modern / first-class

### 5.1 Palet (uygulamanın kendi dilinden)
- **Zemin:** gerçek siyah (`--page:#000000`) veya çok koyu lacivert-siyah gradient
- **Vurgu:** champagne altın — `#C9A227` (uygulamada zaten kullanılıyor), üstüne `--accent-*` token'ları
- **Metin:** yüksek kontrast beyaz + `--faint` ikincil
- **Yasak:** neon, mor-mavi "AI gradient", şekerli pastel, emoji

### 5.2 Tipografi
Mevcut ölçek token'larını kullan: `--f-title1/2/3`, `--f-headline`, `--f-body`, `--f-footnote`, `--f-caption1/2`.
Başlıklarda **geniş harf aralığı** (`letter-spacing: .02–.04em`) + ince ağırlık kontrastı (900 başlık / 400 gövde). Sistem font yığını veya Inter (panel-v2 zaten Inter kullanıyor: `wght@400;600;700;800;900`).

### 5.3 Hareket
- Yalnız token'lı süreler: `--dur-1…--dur-5`, egler: `--ease-premium`, `--ease-glide`, `--ease-spring`
- Giriş: kademeli fade+rise (stagger), `IntersectionObserver` ile scroll-reveal
- **`prefers-reduced-motion: reduce` zorunlu destek** — hareket kapanır, içerik görünür kalır
- 60 fps hedefi; uzun görev (long task) yok

### 5.4 Erişilebilirlik (pazarlık yok)
- Kontrast **≥ 4.5:1** gövde, **≥ 3:1** büyük başlık (uygulamanın kendi ölçüm standardı)
- Klavye: `Tab` sırası mantıklı, "Okudum" butonu ilk odaklanabilir öğe **değil** (sayfa sonunda), `Enter`/`Space` çalışır
- `role="main"`, başlık hiyerarşisi `h1 → h2 → h3` (atlama yok)
- Skip-to-end bağlantısı *isteğe bağlı* ama önerilir ("Sona git")
- `aria-label` Türkçe ve anlamlı

### 5.5 Mobil önceliği
Tasarım hedefi **≤460px viewport** (uygulamanın kuralı). Masaüstünde ortalanmış maks. ~560px kolon.

---

## 6. Yapılacaklar listesi (sıralı)

1. **Keşif** — `git status` temiz mi? `app/styles.css` token'larını oku, hangilerini kullanacağını listele.
2. **Dosya yapısı** — `v3-tanitim/` klasörü aç: `index.html`, `v3.css`, `v3.js`. (Kök `index.html`'e dokunmadan önce §3.3'ü uygula.)
3. **İçerik** — §4'teki 8 yeniliği yaz. Her kart: başlık + 1–2 cümle + (varsa) sayısal kanıt. Abartma yok.
4. **Tasarım** — §5'e göre uygula. Token kullan, hardcode hex minimumda.
5. **Kalıcılık** — §3.4 anahtar mantığını kur. **Test et:** okundu → yenile → görünmemeli.
6. **Tetikleme** — açılışta yönlendirme (§3.3-A). `index.html`'e yalnız minimal bootstrap.
7. **Cache-bust** — değiştirdiğin **her** asset + `index.html`'deki `?v=YYYYMMDDx` bump.
8. **Kapı** — `node --check` (yeni JS) · `node .claude/skills/run-seyma/driver.mjs` · `node tools/shell-inventory.mjs --gate` (app.js'e dokunmadıysan sayılar sabit kalmalı: **7.610 / 0 / 408 / 57**).
9. **Görsel QA** — port 9000 protokolü (§3.2). Ekran görüntüsü al, **sonra sunucuyu kapat**.
10. **Doküman** — `docs/GELISTIRME-PLANI.md` changelog satırı + durum tablosu; gerekirse `docs/v3-tanitim/README.md`.
11. **Commit** — tek yerel commit, Türkçe mesaj. **Push yok** (`LOCAL-ONLY`; push ayrı onay).

---

## 7. Tuzaklar (bunları yaşamamak için oku)

| Tuzak | Neden | Yapılacak |
|---|---|---|
| **`app.js`'e gövde eklemek** | `render.js`/`appSurface.js` sözleşmeleri, `App.x=554` ve `*HTML` sayımları **pinli** — kırılır | Ayrı sayfa yeğle; `app.js`'e dokunma |
| **`with(SCOPE)` + window metodu** | Çıplak referans `this`'i kaybeder → *Illegal invocation* | Gerekirse `.bind(window)` (BULGU-02) |
| **`ui.calMonth` benzeri "kurulmamış" state** | Doğrudan sekmeye girilince çöker | Savunmalı ilk-kurulum (BULGU-01) |
| **combinedSource sayımları** | fx2 fixture'ları `onclick=391`, `App.x=718` pinler | Yeni görünüm eklerken sayımı **yeniden ölç** |
| **`sed` ile toplu cache-bust** | Fazla kaçış ekler (`\\.`) | `perl -pi -e` kullan |
| **`migrate()`'e alan eklemek** | Eski kayıtlarda alan yok | Backfill ekle; `yeni alan == null` kontrolü |
| **Panel yüzeyine sızmak** | `panel*` **dondurulmuş** (K9) | Yalnız kullanıcı tarafı |
| **Emoji kullanmak** | Uygulamanın prestij tonu emojisiz | Metin + ince ikon (`icon()` veya SVG) |
| **Sunucuyu açık bırakmak** | DATA SAFETY kural 4 | Turn bitmeden `pkill -f "http.server 9000"` |

---

## 8. Kabul kriterleri (hepsi ✅ olmadan iş bitmez)

- [ ] `v3-tanitim/` altında çalışan, **tek sayfa dikey kaydırılabilir** tanıtım
- [ ] Açılışta, daha önce okunmadıysa **otomatik** gösterilir
- [ ] "Okudum, anladım" → işaretlenir → **yenilemede çıkmaz**
- [ ] `node --check` tüm yeni JS dosyalarında temiz
- [ ] `driver.mjs` exit 0 · `shell-inventory --gate` PASS · **sayılar değişmemiş** (7.610/0/408/57, `App.x=554`)
- [ ] tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders 21/21
- [ ] Kontrast ölçümü ≥4.5:1 gövde · `prefers-reduced-motion` destekli
- [ ] Port 9000 QA yapıldı, **sunucu kapatıldı**
- [ ] Cache-bust bump edildi
- [ ] Tek yerel commit · **push yok**

---

## 9. Referans dosyalar (hızlı erişim)

| Ne için | Dosya |
|---|---|
| Uygulama kuralları + DATA SAFETY | `CLAUDE.md`, `AGENTS.md` |
| Tasarım token'ları (98 adet) | `app/styles.css` (ilk 120 satır) |
| Ayrı sayfa örneği | `panel-v2.html`, `panel/v2/panel-v2.css` |
| v3.0'ın sayısal kanıtı | `archive/monolit-bolumlenme-plan-2/deliverables/MON2-SERI-KAPANIS.md` |
| Post-MON2 bulgular (yaşanmış tuzaklar) | `archive/monolit-bolumlenme-plan-2/deliverables/MON2-SONRASI-BULGULAR.md` |
| Sesli rehberlik mekanizması | aynı belge → "Sesli rehberlik nasıl çalışıyor" |
| FX/SKY/PREM kapanışları | `premium-fx-plan/deliverables/FX2-KAPANIS.md`, `HEADER-V2-20260909.md` |
| Headless doğrulama harness'i | `.claude/skills/run-seyma/SKILL.md`, `driver.mjs` |
| Yol haritası (changelog buraya) | `docs/GELISTIRME-PLANI.md` |

---

## 10. İlk mesajın (ajanın ilk cevabı ne olmalı)

Kısa olsun:

1. Okuduğunu ve anladığını bildir (3 madde: görev · kalıcılık · tasarım yönü)
2. `git status` + `app/styles.css` token taramasının sonucunu paylaş
3. **Plan öner:** hangi dosyaları oluşturacaksın, `index.html` bootstrap'ı kaç satır, hangi yaklaşım (A/B)
4. **Onay iste** — özellikle `index.html`'e dokunma izni için
5. Kullanıcı onaylayınca **tek commit'te** bitir ve §8'i madde madde raporla

---

*Starter hazırlandı: 2026-09-15 · Dal: `premium-fx-gorsel-yuzey` · Repo durumu: MON2 kapalı (8/8), iki bulgu düzeltildi, ağaç temiz.*
