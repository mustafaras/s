# KAO2-22 — Hece sesi hattı (K-3 kademe A)
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `9fd48b70`

## Bilimsel çerçeve (04 D-10 · 10 K-3)
- **D-10** "Seviye 0 sistematik: harf → konum şekli → hareke → hece → kelime;
  harekeli metin, ses eşliğinde" — sistematik fonik öğretim (NRP 2000; Ehri 2005).
  KAO2-21 bunu kurdu; bu kart **ses katmanını** bağlar.
- **K-3 bulgusu:** izole hece (بَ بِ بُ) Kur'an'da kelime olarak geçmez; âyet
  kaydından kesmek ses geçişlerini bozar; **TTS yasak** (kademe C).
- **K-3 kademe A (hedef):** nitelikli muallim, **iki ses** (erkek + kadın), stüdyo
  protokolü. Gerekçe ●●: yüksek değişkenlikli fonetik eğitim, çok-konuşmacıyla
  algının yeni seslere genellenmesini artırır (Logan, Lively & Pisoni 1991;
  Thomson 2018). Mevcut minimal çiftler tek okuyucuya dayanıyor.
- **K-3 kademe B (geçici):** harf gerçek Kur'an kelimesi içinde — **bilimsel olarak
  geçerli ara yol** (fonik, harf-ses eşlemesini gerçek kelimeyle birleştirdiğinde
  etkilidir, Ehri 2005) ve **hâlihazırda çalışıyor** (KAO2-21: 28/28 kelime sesi).

**Bu kart SES ÜRETMEZ.** K-3 kademe A'nın **hattını** kurar ve zorlar; kayıt
gelmeden uygulama kademe B ile çalışmaya devam eder (kartın 3. adımı).

## Yapılan
- **`tools/kao2-syllable-audio.mjs` (yeni):** envanter · ad biçimi doğrulaması ·
  sha256 · lisans zorunluluğu · `--check` ile ffmpeg `loudnorm` ölçümü.
  1. **`--inventory`**: 28 harf × (3 hareke + sükûn) + 3 med = **115 klip/ses**,
     iki ses → **230**.
  2. **`--self-test`**: ad biçimi, sha256, lisans, rol kuralı, envanter kapısı.
  3. **`--validate <id>`**: ad biçimini tek tek doğrular (test bunu koşar).
  4. **`--check --source <dizin>`**: ffmpeg **önce** sorulur (ölçümsüz doğrulama
     yok); −18 LUFS ±1, −1 dBTP, ≥48 kHz; kural dışı klip **reddedilir**;
     bütçe tavanı.
     Kayıt yoksa `awaiting-recording` — **hiçbir şey uydurulmaz**.
- **Ad biçimi:** `y-<harf>_<hareke|sükûn|med>-<m|f>.m4a`. **Med kendi taşıyıcı
  harfine bağlıdır**; elif (ا) 28 harfte olmadığı için `alef` taşıyıcı kimliği
  **açıkça beyan edilir** (gizlenmez). Örnek: `y-ba_fatha-m`, `y-alef_madd_alef-m`.
- **`safeClipId` genişletildi:** kelime klibi (`w-l_<id>_<hex6>`) **ve** hece klibi
  kabul edilir; başka biçim reddedilir (tek doğrulayıcı, motor içinde).
- **Kademe planı (`kaoS0ClipPlan`):** hece klibi varsa **A**, yoksa **B** (harf
  kelime içinde). Kayıt yokken hece klibi çağrılmaz → çalışmayan kontrol
  gösterilmez (K-3 kademe C ve P10).
- **Manifest ayrımı (dürüstlük):** kaydedilmemiş malzeme `datasets[]`e **konmaz**
  — o liste kaynaklı/yayınlanmış (lisans + atıf + URL) ve ayarların "kaynaklar"
  bölümüne yansır. Yeni `planned[]` altında `status:'awaiting-recording'` durur.

## Ölçülen yan düzeltmeler
- **Manifest `budgetBytes` bayattı: 16 MiB → 24 MB.** K-1 ve
  `tools/kao-audio-build.mjs` `BUDGET_BYTES` 24 MB der; K-1 esastır. Tutarsızlık
  testle yakalandı, düzeltildi ve `budgetNote` ile kayda geçti.
- **ffmpeg kapısı sıralaması:** kaynak kontrolü ffmpeg'den önce koşuyordu; boş
  dizinde ffmpeg hiç sorulmuyordu → kapı anlamsızdı. Artık **ffmpeg önce**.
- Ortam: **ffmpeg 8.1.2 kurulu** → kayıt günü `--check` gerçekten koşabilir.

## TDD
- **Kırmızı:** `test_kao2_syllable_audio.js` → `--inventory çalışır` (araç yok).
- **Kendi hatalarım (testler yakaladı):**
  1. Testte `y-qaf_madd_alef-m` "geçerli" varsaydım — **araç haklıydı**: med
     taşıyıcıya bağlıdır. Med kuralı dürüstçe tanımlandı (`alef` beyan edildi).
  2. Manifest girdisini `datasets[]`e koydum → ayarlar "kaynaklar" bölümünü
     bozdu (`test_kao_render` haklı olarak kırmızı). `planned[]` ayrımı yapıldı.
  3. ESM aracını VM'de çalıştırmaya çalıştım (kırılgan) → `--validate` modu
     eklendi; test gerçek aracı koşuyor.
  4. ffmpeg kapısının sırası yanlıştı (yukarıda).
- **Yeşil:** `test_kao2_syllable_audio.js` **11/11** · KAO ailesi **40/40**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **40/40** |
| `tests/app/test_*.js` | PASS · **77/77** |
| `tests/panel`, `tests/panel-v2`, `tests/quran` | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · contrast · iip_22 | PASS |
| `git diff --check` | temiz |

### K-1 bütçe ölçümü
| Ölçü | Değer | Bütçe | Durum |
|---|---|---|---|
| çalışma zamanı `quranLearn*` | **87.900 KiB** | 88 | ⚠️ **%99.9 — pay 0.1 KiB** |
| içerik toplam | 175.459 KiB | 256 | ✅ |
| ses (mevcut) | 10.9 MB | 24 MB | ✅ (hece A gelince ~+? MB) |
| `app/kao.css` | 11.911 KiB | 14 | ✅ |

**⚠️ Çalışma zamanı payı 0.1 KiB.** Kart `quranLearn.js`e yalnız 3 küçük
yardımcı ekledi; sonraki kart **yeni çalışma zamanı kodu getirmemeli**.

## Dürüstçe açık
- **Kademe A kaydı YOK** (kullanıcı işi): 230 klip, iki ses, muallim, lisans +
  atıf. Bu kart **hattı** teslim eder; ses değil. Kayıt gelince:
  `node tools/kao2-syllable-audio.mjs --check --source <dizin>` → temiz çıkarsa
  klipler `assets/kao/audio/`e alınır ve `planned[]` → `datasets[]`e taşınır.
- Kayıt sırasında **L2 mahreç dinlemesi** ve **kullanıcı lisans/atıf beyanı**
  gerekir; ajan yapamaz.
- Cihaz kabulü yapılmadı; gerçek ses dinlemesi yapılmadı.
