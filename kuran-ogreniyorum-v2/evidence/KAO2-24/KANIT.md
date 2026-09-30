# KAO2-24 — Birleşik İlerleme (S-12)
Tarih: 2026-09-30 · Dal: kao2-yeniden-tasarim (= main) · Önceki commit: `ddeee0e3`

## Bulgu (05 §2 S-12 · 03 §1)
İki ayrı ekran (`map` = "Mushaf haritası", `stats` = "İstatistik/Tutunma ve kalibrasyon")
vardı ve modülün **en güçlü motivasyon anlatısı** olan kapsam eğrisi (03 §1: "50 kelimeyle
Kur'an'ın %45'i") **hiçbir yerde gösterilmiyordu**.

## Yapılan
Tek **İlerleme** ekranı (`view=stats`), bölüm sırası P10 kararına göre:
1. **Tanıdık kelime + kapsam** — `N / 524 lemma` · `%X` + kapsam eğrisi noktaları
   (`İlk 50 kelime ≈ %45,2`) + sıradaki hedef (kaç kelime kaldı).
2. **Taşlar** — kazanılanlar ve **sıradaki taş koşul metniyle** (uygulama niyeti, D-18).
3. **Bu hafta** — 7 gün, yumuşak seri ("Bu hafta 4 gün çalıştın"); **kırık seri cezası yok** (D-19).
4. **Mushaf haritası** — ayrı görünüm değil, ekranın bölümü (114 hücre gömülü).
5. **Algı doğruluğu + kalibrasyon** — işaretlenen harf/ses sınıfı, son 2 hafta doğruluğu,
   R-bandı tablosu, gece tekrarı, haftalık aktarım testi.
6. Eski `map` görünümü **kaldırıldı**; `kaoSetView('map')` ve `kaoNav('map')` tek noktadan
   `kaoViewAlias()` ile `stats`'a akar.

### Kapsam eğrisi gerçek veriden
`KAO_QURAN_TOKENS=77430` ve lexicon `freq` toplamı ile **çalışma zamanında** hesaplanır
(`kaoCoverageAt`), sabit yüzde yazılmaz. Doğrulama: 50/100/200/300/524 noktaları
03 §1 tablosuyla **±0,1** içinde eşleşiyor (45,2 · 54,8 · 64,5 · 70,3 · 77,4).

## TDD
- **Kırmızı:** `tests/kao/test_kao2_progress.js` → `tanıdık kelime etiketi yok` (14 kontrol).
- **Kendi hatalarım (test/kapılar yakaladı):**
  1. `kaoStatsHTML` gövdesinde kapsam alanı yokken `q` değişkenine atıf → `ReferenceError`.
  2. Haritanın `<main>` kabuğunu İlerleme içine **iç içe** koydum → `<main>` içinde `<main>`
     ve iki `<h2>`; gövde başlıksız bölüme ayrıldı (`kaoSurahMapHTML`).
  3. Başlık değişiminde **artık metin kalıntısı** bıraktım ("…üstü.</p>it yok…") — temizlendi.
  4. **`<main>` kapanışını `</div>` yapmadım** → dengesiz etiket.
  5. Modelin **saf** olması gerektiğini testte yanlış yazdım: taş kazandırma yan etkisini
     modele koydum, sonra ekran açılışına (uzlaştırma = `recordMilestones`) taşıdım.
  6. Yeni bölüm başlıklarına `letter-spacing` verdim → **strict tasarım sözleşmesi** ihlali
     (tracking 0 olmalı); kaldırıldı.
  7. Sıra işareti ve kazanma tikini `::before` ile koydum → **dekoratif sözde-öğe** ihlali
     (deco 0 olmalı); gerçek metne (`●/○`, `✓`) çevrildi.
  8. Kazanılmış işaret `--kao-accent` ile **2,20:1** kaldı (AA altı) → `--kao-ok` (10,02:1).
  9. `kaoOpenMap` yalnız `kaoNav`'ı çağırıyordu; takma adı `kaoSetView`'e koyunca
     **her iki yol da kapsanmadı** → tek noktadan `kaoViewAlias()`, iki girişte de.
- **Yeşil:** `test_kao2_progress.js` **14/14** · KAO ailesi **42/42**.

## Kapılar (P3)
| Aile | Sonuç |
|---|---|
| `tests/kao/test_*.js` | PASS · **42/42** (yeni: progress 14 kontrol) |
| `tests/app/test_*.js` · panel · panel-v2 · quran | PASS · 77/77 · 23/23 · 27/27 · 9/9 |
| reminders · driver · zikr · iip_22 | PASS |
| `kao-verify-contrast.mjs` | PASS (726 çift, 0 eşik altı) |
| `kao2 design contract --strict` | PASS (deco 0 · tracking 0 · serif 0) |
| `git diff --check` | temiz |

### K-1 bütçe (128 KiB tavanı)
çalışma zamanı **91.567 / 128 KiB** · içerik 177.657/256 · css 12.631/14 · p95 4,6 ms.

## Kimlik pinleri — DEĞİŞMEDİ
App.kao* **43** · app.js `App.*=function` **602**. Bu kartta yeni handler yok; `map`
görünümü kaldırıldı ama `App.kaoOpenMap` uyumluluk için korundu (İlerleme'ye akar).

## Yan düzeltmeler (kartın gereği, pin kayması)
- `tests/kao/test_kao2_navigation.js`: `map` satırı navigasyon tablosundan çıkarıldı.
- `tests/kao/test_kao_render.js` E10: `kaoOpenMap()` artık `stats`'a gider; harita
  girişi yerine **gömülü 114 hücre** doğrulanır (aynı aria-label/liste kontrolleri korunur).
- `tests/kao/test_kao2_today.js`: harita girişi → gömülü hücre sayısı.

## Dürüstçe açık
- Cihaz kabulü ve gerçek ekran okuyucu testi yapılmadı.
- `kaoMapHTML` uyumluluk sarmalayıcısı kaldı (dış çağrı yok); KAO2-27 kapanışında
  ölü yüzey taraması yapılacak.
