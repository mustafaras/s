# KAO2-19 — Sûre bağlamı ve okuyucu v2 (S-09)
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: 795461f6

Kapatılan bulgular: **01 Y-12** · **02 T-20** · **02 T-21**.

## Yapılan

### (a) Sûre tanıtım kartı
Okuyucunun başında **katlanabilir** `<details class="kao-reader-surah">`: sûre adı +
`Mekke’de indi · 8 âyet · 34 kelime` künyesi + donmuş `QuranRevelationOrderV1.themeTr`.
K-4 kuralı gereği `contextTr` **yalnız `sourced`/`expert` ise** görünür; `kaoReaderContext()`
draft metni hiç döndürmez. Katlanabilir olduğu için tanıtım **okuma alanını daraltmaz**.

### (b) WordChip (T-20)
Kelime çipi artık **kenarlıksız**: eski `border:1px solid` + min 72×68 px "düğme ızgarası"
gitti (mushaf akışı parçalanıyordu). Bilinmeyen kelime **altı noktalı** (`2px dotted`).
Anlam kelime **içinde basılmaz**; dokununca `<section class="kao-reader-panel">` olarak
**alt panelde** açılır → satır akışı bozulmaz.

### (c) Dinle, kelime kelime
`kaoReaderPlayWords()` sûrenin kelimelerini sırayla çalar:
`assets/kao/audio/s-<sûre>-<âyet>-<i>.m4a`. **618 kelimenin 618'i için klip mevcut**
(ölçüldü) → sözleşme gerçekten uygulanabilir. Çalan kelime `aria-current="true"` alır ve
CSS'te görsel olarak vurgulanır. Ses yoksa/çalınamazsa **sessiz yol**: hata notu düşer,
okuyucu okunuş ve Türkçe anlamla sürer.

### (d) Seçili sûre kaydırma hedefi (T-21)
Kaydırma **motorda** belirlenir (`kaoReaderScrollTarget()`), render yalnız
`data-kao-scroll` işaretini taşır. Seçili sûre görünür alanın dışında kalmaz.

### (e) "Anladım" öncesi 3 soruluk hızlı kontrol (Y-12)
Öz-beyan artık **tek dokunuşla** değil: birincil eylem `Anladım · 3 soru` → 3 soru
(sûrenin **kendi** kelimelerinden, belirlenimci sırayla) → ancak 3/3 yanıtlanınca
`Anladım · kaydet` açılır ve mevcut 7 günlük gecikmeli test planlanır.

### Ek: sessiz saat tutarlılığı
Uygulamanın genel kuralı sesin **23:00–07:00** çalmamasıdır (`SeyAudio`). Okuyucu bunu
atlıyordu; artık `isQuietTime` ise çalma hiç başlamaz ve neden kullanıcıya söylenir.

## TDD
- **Kırmızı:** `node tests/kao/test_kao2_reader.js` → "tanıtım kartı var" (yok).
- **Kendi hatalarım (yakalandı ve düzeltildi):**
  1. Testte sûre kimliğini **1** (Fâtiha) varsaydım; gerçek kısa sûreler **95–114**.
  2. Testte API adı uydurdum (`kaoReaderWord`); gerçek imza `kaoReader('word', i)`.
  3. `kaoSurahCheck().available`'ı "sorular yüklendi mi" diye yazdım; doğrusu
     "**sorulabilir mi**" (havuz yeterli mi) — yoksa kontrol başlamadan "yetersiz" derdi.
  4. VM realm dizi karşılaştırması (`deepEqual` klip listesinde) — bilinen tuzak;
     indeks bazlı karşılaştırmaya çevrildi.
  5. CSS'te `--kao-drop`/`--kao-drop-bg` kullandım; token sözleşmesi bunları kabul
     etmiyor → `--kao-fix`/`--kao-fix-bg` (izinli) ile değiştirildi.
- **Yeşil:** `test_kao2_reader.js` **12/12** · KAO ailesi **37/37**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **37/37** |
| `tests/app/test_*.js` | PASS · **77/77** |
| `tests/panel`, `tests/panel-v2`, `tests/quran` | PASS · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · contrast | PASS |
| `git diff --check` | temiz |

### K-1 bütçe ölçümü
| Ölçü | Değer | Bütçe | Durum |
|---|---|---|---|
| çalışma zamanı `quranLearn*` | **83.962 KiB** | 88 | ✅ %95 |
| içerik toplam | 173.298 KiB | 256 | ✅ |
| `app/kao.css` | 11.074 KiB | 14 | ✅ |
| VM p95 | 4.443 ms | ≤40 ms | ✅ |

## Arayüz kanıtı (headless render)
- Tanıtım kartı → **VAR** (katlanabilir) · künye `Mekke’de indi · 8 âyet · 34 kelime`
- Anlam kelime içinde → **YOK** (T-20 doğru) · alt panel → `yemin olsun incire`
- Kaydırma hedefi → `95` · picker işareti → **VAR**
- 3 soru → **VAR** · sorular sûrenin kendi kelimelerinden → **true**
- "Anladım" öncesi doğrudan kayıt → **YOK** (Y-12 doğru)
- 3/3 sonrası kayıt düğmesi → açıldı · anladım → kaydedildi, 7 günlük test planlandı

## Kimlik pinleri (gerçek ölçümlerle güncellendi)
- `App.x=` benzersiz yüzey **761 → 762** (tek yeni handler: `App.kaoReader`)
- `App.kao*` sayısı **40 → 41**
- `app.js` işlev ataması **599 → 600**
- `onclick=` sayımı **değişmedi** (393): `app/core/quranLearn.js` bu taramaya girmiyor.

## Dürüstçe açık
- **20 sûre `contextTr` metni yazılmadı** (kartın 2. adımı). Gerekçe: kartın kendi kuralı
  "iddia başına kaynak" der; kaynak künyesi (`diyanet-kuran-i-kerim-meali-sure-basliklari`,
  `tdv-islam-ansiklopedisi-sure-maddeleri`) başlık/theme içindir, giriş yazısı için değil.
  Kaynaksız bağlam yazmak K-4'ü ihlal ederdi. Kartın (a) maddesi bu yüzden **draft'ta
  doğru** çalışıyor: bağlam yoksa gizlenir. Bu metin ayrı bir içerik işidir (kaynak seçimi
  kullanıcı kararı) ve **açıkça** bırakıldı.
- **Cihaz kabulü** hiç yapılmadı; gerçek ekran okuyucu testi ajan tarafından yapılmadı.
- Çalma yolunda klip kapsamı tam (618/618) ama **gerçek ses dinlemesi** yapılmadı —
  yalnız sıra ve sessiz-yol davranışı doğrulandı.
