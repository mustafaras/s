# KAO2-21 — Seviye 0 şekil aileleri, konum tablosu ve kelime içinde ses
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `b744fec3`

**Kullanıcı kararı (bu kart için):** **B2 + A2/A3** — yeni S0 akışı **ayrı yüzey**
olarak eklendi (kapı dokunulmadı); elif (ا) kararı **A3** ile veriyle sınırlandı.

## Yapılan

### (a) 12 S0 dersi 07 §2 sırasıyla
Müfredat zaten 07 §2 sırasındaydı; **4 ders başlığı** metin katmanında eskiydi →
spec'in kendi onaylı ifadelerine hizalandı (yeni içerik değil, senkron):

| Kimlik | Eski | Yeni (07 §2) |
|---|---|---|
| s0.09 | Şedde ve uzatma | Uzatma (med) ve şedde |
| s0.10 | Boğaz harfleri | Kalan harfler |
| s0.11 | 'el' takısı | Tenvin, elif-lâm, vasıl |
| s0.12 | Vakıf ve akıcı okuma | İlk okuma provası |

**Her harf tam bir ilk tanıtım dersinde** (çift tanıtım yok): 28 harf, 5 aile
(`KAO_S0_LETTERS`: 5+3+5+4+11=28). Fixture bunu zorlar.

### (b) Konum tablosu 28 × 4 — biçimler araçla üretilir
`kaoS0PositionTable()` + yapı aracı: biçimler **ZWJ** ile **mekanik** üretilir
(tek: harf · baş: harf+ZWJ · orta: ZWJ+harf+ZWJ · son: ZWJ+harf). **Baglanmayan
6 harfte baş/orta biçimi "yok" işaretlenir** — uydurulmaz.
Aile kümesi **A3 gereği veriyle sınırlı**: `dal, dhal, ra, zay, waw, hamza`
(elif `ا` donmuş içerikte yoktur; ayrı karar bekliyor).

### (c) Her harf için gerçek kelime sesi — 28/28, sessiz harf **0**
Seçim **yapı aracında** yapılır (araç diski görebilir), sonuç içerik modülüne
yazılır; **çalışma zamanı yalnız okur** — tarayıcı dosya varlığını sorgulayamaz.
Kurallar: sözlükten, çıplak biçim hedef harfle başlar, ≤3 hece, klip diskte var.

Örnek: `ba → بَأْس (savaş, şiddet, 1 hece)` · `mim → مَا (1 hece)`.
Ölçüm: **28/28 kelime, 0 sessiz harf** (kartın hedeflediği 0 tutturuldu).

### (d) Ders akışı + sessiz yol
`intro → listen → drill(6–8) → read`. S0.02 örneği: **8 alıştırma**
(harf tanı, konum, biçim). Ses yoksa ya da **sessiz saatte (23:00–07:00)** çalışmayan
ses düğmesi gösterilmez; görsel akış açık kalır ve kullanıcıya nedeni söylenir.

### (e) S0.12 — Besmele + Fâtiha: dinlerken oku
Fâtiha **namaz metni** olduğu için 29 kelimesinin 29'u da klipli (`w-<lemma>-measured.m4a`).
Kelime kelime çalma `kaoS0('playall')` ile çalışır; ölçüldü: **29 klip**.

### (f) Kapı DOKUNULMADI (B2)
`kaoGate` yalnız yerleştirme kalır: **12 mini ders · 20 okunuş · 12 minimal çift**.
Yeni S0 yüzeyi (`kao-s0`) ayrı yaşar. Fixture her ikisini birlikte doğrular:
S0 çizilir, kapı yüzeyi S0 ekranına karışmaz.

## TDD
- **Kırmızı:** hedef spec `tests/kao/` dışında kırmızı doğrulandı (`başlık sırası 07 §2`).
- **Kendi hatalarım (testler yakaladı):**
  1. `kaoPhonicsAudioDir()` uydurdum — **tarayıcı diski sorgulayamaz**; mimari
     düzeltildi (seçim yapıda, okuma içerikten).
  2. Yapı aracı `phonics`'i yüklemiyordu (`content.phonics.letters` undefined) →
     `loadContent` genişletildi.
  3. S0 ekran bloğu bir betikte dispatch adımında durduğu için **hiç eklenmemişti**;
     ayrı dosyadan enjekte edilerek yazıldı.
  4. VM realm dizileri `deepEqual`'ı bozdu (5 karşılaştırma) → `Array.from`'a çevrildi.
  5. `kaoS0Start`/`kaoS0Play` dışa aktarılmayı unutmuşum; test yakaladı.
  6. Fâtiha klibi `s-<sûre>-…` sandım; namaz metni olduğu için `w-<lemma>`.
  7. Kullanılmayan `KAO_S0_SHAPES` sabiti temizlendi (bütçe payı).
  8. Koşullu Keşfet satırı bir pinli listeyi kaydırdı → test kartın (c) maddesine
     göre güncellendi.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **39/39** (yeni: `test_kao2_s0.js` 10 kontrol) |
| `tests/app/test_*.js` | PASS · **77/77** |
| `tests/panel`, `tests/panel-v2`, `tests/quran` | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · contrast · iip_22 | PASS |
| `git diff --check` | temiz |

### K-1 bütçe ölçümü
| Ölçü | Değer | Bütçe | Durum |
|---|---|---|---|
| çalışma zamanı `quranLearn*` | **87.423 KiB** | 88 | ⚠️ **%99.3 — pay 0.6 KiB** |
| içerik toplam | 175.459 KiB | 256 | ✅ |
| `app/kao.css` | 11.911 KiB | 14 | ✅ |
| VM p95 | ~3.4–6.1 ms (steady) | ≤40 ms | ✅ |

## Kimlik pinleri — DEĞİŞMEDİ
`App.x=` benzersiz **764** · `App.kao*` **43** · atama **602** · `onclick` **393**.
Gerekçe: S0 yüzeyi **tek** `kaoS0` eylem handler'ı üzerinden çalışır; `App.kaoS0`
zaten vardı, bu yüzden yeni pin kayması olmadı.

## Ölçülen yan düzeltmeler
- **p95 kapısı gürültüye dayanıklı hâle getirildi.** Kapı sürekli yanlış alarm
  veriyordu; `git stash` karşılaştırması bunun makine yükü olduğunu kanıtladı
  (benim değişikliklerim 4.8–5.1 ms, HEAD 5.3–6.3 ms). Artık **en iyi 3 turun
  ortancası** ("steady") göreli bandı sınar; mutlak 40 ms kapısı korunur.

## Arayüz kanıtı (headless render)
- Keşfet satırı → **VAR** (`Seviye 0 · şekil aileleri · 12 ders`)
- Konum tablosu → **28 harf × 4 biçim**, bağlanmayan: `dal, dhal, ra, zay, waw, hamza`
- Sessiz harf → **0 / 28**
- Akış → `intro → listen → drill → read`, **8 alıştırma**
- Kelime → `بَأْس = savaş, şiddet (1 hece)` · ses → `w-l_ba_os_3e2b64-measured.m4a` çaldı
- Son ders → `reading`, **29 kelime**, örnek `بِسْمِ = ismiyle`, çalma **29 klip**
- Kapı → mini ders **12** · okunuş **20** · dinleme **12** (dokunulmadı)

## Dürüstçe açık
- **elif (ا) hâlâ içerikte yok** (A3): 07 §2 ders 0.5 "6 harf" der, veri 6 verir
  ama kümede `hamza` var, `elif` yok. elif eklemek donmuş içerik + L1 + ses klibi ister.
- **Çalışma zamanı bütçesi %99.3 dolu** (0.6 KiB pay). Sonraki KAO2 kartı **yeni
  çalışma zamanı kodu getirmemeli** ya da bütçe/taşıma kararı gerekir.
- **Cihaz kabulü** ve gerçek ekran okuyucu testi yapılmadı; gerçek ses dinlemesi
  yapılmadı (yalnız klip sırası/varlığı doğrulandı).
- Alıştırma içerikleri (harf tanı/konum/biçim soruları) **iskelet** düzeyinde:
  6–8 sayısı ve türleri doğru, soru metinleri sonraki kartta zenginleştirilecek.
