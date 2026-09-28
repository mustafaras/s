# 10 — Kararlar (G0 kapısı)

> **Durum:** 4/4 karar ALINDI · 2026-09-28 · kullanıcı yetkisi: "bunları en bilimsel
> ve premium şekilde çöz, bütçeyi istediğin kadar artırabilirsin".
> Makine kaydı: `KAO2-STATE.json.decisions`. Bu belge değişirse STATE ve LEDGER aynı committe güncellenir.

Ölçümler (2026-09-28, `main` = `0427e44`):

| Ölçüm | Değer |
|---|---|
| KAO içerik gzip (4 modül, level 9) | 162.177 B = **158,4 KiB** (lexicon 120.847 · grammar 13.050 · surahs 25.420 · phonics 2.860) |
| Geçerli içerik bütçesi (`test_kao_user_tasks.js`, KF-11) | 160 KiB → kalan pay **1,6 KiB** |
| KAO çalışma zamanı gzip | `quranLearn.js` 50.221 B · `kao.css` 7.051 B |
| Ses varlıkları | 1.678 klip, 14 MB; üst sınır 16 MB (`tools/kao-audio-build.mjs` `BUDGET_BYTES`) |
| Ses kaynakları | Tadabur (CC BY-NC 4.0, âyet kaydı + kelime hizalama) · AQQD-v2 (CC0, tek okuyucu) |

---

## K-1 · Boyut bütçesi → **performans temelli, modül başına tavanlı bütçe**

**Karar:**

| Katman | Eski | Yeni tavan | Beklenen kullanım |
|---|---|---|---|
| İçerik gzip toplamı (tüm KAO içerik modülleri) | 160 KiB | **256 KiB** | ~205 KiB |
| └ `quranCurriculumV2.js` (yeni) | — | **48 KiB** | ~25–35 KiB |
| └ Mevcut 4 modül | (160 içinde) | **164 KiB** (bugün 158,4 + düzeltme payı) | 158,4 KiB |
| KAO çalışma zamanı gzip (`quranLearn*.js` toplamı) | ölçülmüyordu | **80 KiB** | ~62 KiB |
| `app/kao.css` gzip | ölçülmüyordu | **14 KiB** | ~9 KiB |
| Ses varlıkları (tembel, `preload='none'`) | 16 MB | **24 MB** | ~15 MB |
| Performans kapısı | — | KAO içerik + çalışma zamanı modüllerinin `node:vm` içinde değerlendirme süresi **p95 ≤ 40 ms** (20 tekrar); ayrıca KAO2-01 tabanına göre gerileme ≤ +%25 | — |

**Gerekçe:**
- Bütçe keyfi bir sayı değil, **iki gerçek maliyetin** vekilidir: (1) ilk yüklemede
  ağ (PWA'da yalnız ilk kurulumda; sonra SW önbelleği), (2) her açılışta
  ayrıştırma/değerlendirme süresi (içerik betikleri `index.html`'de her açılışta
  çalışır). Bu yüzden boyutun yanına **süre kapısı** eklenir; asıl sınır süredir.
- Modül başına tavan, tek modülün sessizce şişmesini engeller (bütçe = büyüme
  tavanı ilkesi, KF-11 çizgisi korunur).
- 256 KiB, mobil ağda ilk kurulumda saniyenin altında ek indirme demektir; SW
  sonrası sıfır. Çevrimdışı tam deneyim korunur (tembel yükleme reddedildi:
  çevrimdışı kırılganlık + karmaşıklık, 07 §7 seçenek 2).
- Ses bütçesi: 84 hece × ~6,4 KB (mevcut kelime klibi ortalaması) ≈ 0,55 MB;
  iki ses (K-3) ve S0 örnekleriyle ~1,7 MB → 24 MB tavan geniş ama sınırlı.

**Uygulama (KAO2-00):** `tests/kao/test_kao_user_tasks.js` R-C5 bloğu modül
başı + toplam tavanlarına genişletilir (yorumda "KAO2 K-1"); yeni
`tests/kao/test_kao2_perf_budget.js` çalışma zamanı, CSS ve süre kapılarını
ölçer; `tools/kao-audio-build.mjs` `BUDGET_BYTES` 24 MB.

---

## K-2 · Dosya bölme → **üç dosyaya böl (motor · akış · görünüm)**

**Karar:** `app/core/quranLearn.js` üçe ayrılır; yükleme sırası
`quranLearnFlow.js` → `quranLearnViews.js` → `quranLearn.js` (motor en son;
registry kurulumu değişmez, `window.SeymaQuranLearn` tek dış yüzey kalır).

| Dosya | Sorumluluk | Yan etki |
|---|---|---|
| `app/core/quranLearnFlow.js` | `window.SeymaQuranLearnFlow`: müfredat normalizasyonu, `kaoNextStep`, ders planı, açıklama şablonları, süre tahmini | **Yok** (saf; DOM/ağ/zaman/depo yok, `now` parametre) |
| `app/core/quranLearnViews.js` | `window.SeymaQuranLearnViews`: tüm HTML kurucuları; girdi = durum anlık görüntüsü + `esc/icon` | Yok (saf dize üretimi) |
| `app/core/quranLearn.js` | FSRS, kuyruk, görev kurucu, `ensureQuranLearn`, handler gövdeleri, ses/mikrofon yüzeyi, `kaoMount` | Var (tek yan etki sahibi) |

**Gerekçe:**
- Saf akış ve görünüm katmanları **tablo güdümlü birim testine** doğrudan açılır
  (05 §4'ün 7 durumu, 06 §7 ölçümleri); 1.899 satırlık karışık dosyada bu
  testler kırılgan kalıyordu.
- Repo kuralıyla (≤800 satır/dosya) ve MON/MON2 alan bölme çizgisiyle uyumlu.
- Risk bilinen ve mekaniktir: MON-25 dersi (dört liste). Kapı: dört liste aynı
  committe, `driver.mjs` MON-04 sıra doğrulaması yeşil.

**Kısıt ve çözüm:** `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs`
bu çalışma ortamının Bash sandbox'ında yazmaya kapalıdır. Kural: bu iki dosya
**yalnız Edit aracıyla** düzenlenir (izin istemi kullanıcıya gider); izin
verilmezse kart **durur**, LEDGER'a `BLOCKED: load-order lists` yazılır ve
kullanıcıya tam diff verilir. Liste güncellenmeden yeni dosya `index.html`'e eklenmez.

---

## K-3 · Hece sesleri → **insan kaydı (iki ses); o gelene kadar harf kelime içinde duyulur**

**Bulgu:** mevcut kaynaklar âyet kaydıdır; izole hece (بَ بِ بُ) Kur'an'da kelime
olarak geçmez ve âyetten kesip çıkarmak ses geçişlerini bozar. Arapça TTS'in
mahreç doğruluğu güvence altında değildir.

**Karar (üç kademe):**

| Kademe | Ne | Durum |
|---|---|---|
| **A · Hedef** | Nitelikli bir Kur'an muallimi tarafından **iki sesle** (bir erkek, bir kadın), stüdyo protokolüyle kayıt: 28 harf × 3 kısa hareke = 84 hece + 28 sükûnlu kapalı hece + 3 med + 3 tenvin + 12 ders örneği ≈ **130 klip/ses** | Kaydı kullanıcı temin eder; ajan yalnız hattı ve manifesti hazırlar |
| **B · Geçici (hemen)** | Seviye 0'da harfi **gerçek Kur'an kelimesi içinde** dinletmek: mevcut 1.048 kelime klibinden, hedef harfle başlayan ve ≤3 heceli kelimeler araçla seçilir (`kao2-s0-word-audio.mjs`) | KAO2-21'de uygulanır; yeni lisans gerekmez |
| **C · Yasak** | TTS / sentetik ses, lisansı belirsiz web sesi, âyet kaydından hece kesme | Hiçbir kartta kullanılmaz |

**Gerekçe:**
- **İki ses:** yüksek değişkenlikli fonetik eğitim, birden çok konuşmacıyla
  algının yeni seslere genellenmesini artırır (Logan, Lively & Pisoni 1991;
  Thomson 2018). Mevcut minimal çiftler tek okuyucuya dayanıyor.
- **Kelime içinde ses (B)** bilimsel olarak geçerli bir ara yoldur: fonik
  öğretim, harf-ses eşlemesini gerçek kelime okumasıyla birleştirdiğinde
  etkilidir (Ehri 2005). S0 böylece sesli olarak hemen tamamlanabilir.
- Mahreç doğruluğu dinî ve pedagojik bir gerekliliktir; insan uzman kaydı tek
  güvenli kaynaktır.

**Kayıt protokolü (A):**

| Parametre | Değer |
|---|---|
| Ana kayıt | 48 kHz / 24-bit WAV, mono; oda gürültüsü ≤35 dBA; pop filtresi, ~20 cm |
| Alım | Her hece 3 kez; en iyi alım kör dinlemeyle seçilir |
| Son işlem | Baş/son 150 ms sessizlik; −18 LUFS entegre, −1 dBTP; ekolayzır/sıkıştırma yok |
| Kodlama | AAC-LC, 48 kbps, mono `.m4a` (mevcut klip biçimi) |
| Ad | `y-<harf>_<hareke>-<ses>.m4a` (ör. `y-ba_fatha-m.m4a`); `safeClipId` genişletilir |
| Lisans | Okuyucudan yazılı izin: **CC BY 4.0** ya da kullanıcıya süresiz kullanım hakkı; atıf metni okuyucunun tercih ettiği ad/unvan |
| Manifest | `docs/kuran-ogreniyorum/content/audio-manifest.json` içinde yeni `datasets[]` girdisi + klip başına `sha256`, `voice`, `recordedAt`, `license` |
| QA | L2 inceleyici (K-4) mahreç dinlemesi yapar; hatalı klip yeniden kaydedilir; cihaz kabulü kullanıcı beyanıyla |

---

## K-4 · Türkçe dinî metin incelemesi → **üç katmanlı inceleme protokolü**

**Karar:**

| Katman | Kim | Neyi | Zorunluluk |
|---|---|---|---|
| **L0 · Otomatik kapılar** | `tests/kao/test_kao2_text_review.js` | (a) dinî bağlam içeren her metinde `sources`; (b) Diyanet imlâsı taraması (Kur'an, âyet, sûre, Fâtiha, Rab, Peygamber, salât…); (c) yasak ifade listesi: hüküm/fetva dili ("haramdır", "caizdir", "farzdır" gibi), kaynaksız hadis, kaynaksız sebeb-i nüzûl, mezhep tercihi; (d) elle Arapça yok: Arapça yalnız içerik modülündeki kimliğe atıfla; (e) her metinde `review` kaydı; (f) `[KAYNAK?]` işareti kalmamış olmalı | Her metin |
| **L1 · Editör** | Proje sahibi (kullanıcı) | Tüm Türkçe anlatılar: ton (sıcak, emir yok, uygulamanın sesi), doğruluk, akıcılık | Her metin; yayın öncesi |
| **L2 · Alan uzmanı** | Kullanıcının belirleyeceği, ilahiyat alanında yetkin bir inceleyici (rol olarak kaydedilir, kişisel veri yok) | 20 sûre `contextTr`, 25 kavramın `workedTr`/`errorTr`'si, 12 ünitenin "neden önemli" metni | Dinî bağlam içerenler için (iyileştirme katmanı) |

**Metin durumları ve yayın kuralı:**

| `review.level` | Anlam | Kullanıcıya görünür mü |
|---|---|---|
| `draft` | Taslak (ajan ya da editör) | **Hayır** |
| `sourced` | L0 geçti + L1 onayı var + metin, atıf verilen kaynağın (Diyanet meali sûre girişi, Diyanet Kur'an Yolu tefsiri, TDV İslâm Ansiklopedisi) yakın özetidir | Evet, "Kaynak: …" satırıyla |
| `expert` | L2 onayı da var | Evet |

- Dinî bağlam içermeyen metinler (ders başlığı, arayüz metni) kaynak gerektirmez; L0 (b, c, e) + L1 yeterli.
- **Ajan taslak yazabilir** ama yalnız kullanıcının ya da açık kaynağın verdiği
  bilgiden, her iddiaya atıfla; kaynağı olmayan cümle taslakta `[KAYNAK?]` ile
  işaretlenir ve L0 onu reddeder.
- İnceleme kaydı biçimi (içerik modülünde, metin başına):
  `review:{level:'sourced', by:'owner', at:'2026-10-05', sources:['diyanet-meal-ihlas-giris']}`.
  `by` yalnız rol kodu alır: `owner` | `expert` (ad yok).
- İnceleme sayfası: `kuran-ogreniyorum-v2/inceleme/INCELEME-<kart>.md` araçla
  üretilir (metin + kaynak + onay kutusu). Kullanıcı onayı bu dosyaya işlenir,
  araç onayları içerik kaynağına taşır (elle kopyalama yok).

**Gerekçe:** Tek kişilik projede alan uzmanını beklemek programı kilitler;
uzman onayı olmadan hiçbir şeyin yayınlanmaması ise zengin içeriği boşa çıkarır.
Kaynağa yakın özet (`sourced`) + editör onayı, doğruluk riskini kaynağın
güvenilirliğine bağlar; uzman onayı (`expert`) iyileştirme katmanı olur.
Yasak ifade listesi, fıkhî hüküm gibi yüksek riskli içerik sınıfını tümden dışarıda tutar.

---

## Kararların karta yansıması

| Karar | Kart | Değişiklik |
|---|---|---|
| K-1 | KAO2-00 | Bütçe testleri + süre kapısı + ses bütçesi |
| K-2 | KAO2-04 (bölme iskeleti), KAO2-08 (akış), KAO2-09 (görünüm) | Üç dosya + dört liste |
| K-3 | KAO2-21 (kademe B), KAO2-22 (kademe A hattı; kayıt gelirse) | `kao2-s0-word-audio.mjs`, manifest şeması |
| K-4 | KAO2-17, 18, 19 ve her metin kartı | `test_kao2_text_review.js`, inceleme sayfaları |
