# KAO2-15 — Gramer notları kütüphanesi (S-10)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 86e646be

## Yapılan
- **Liste:** 25 kavram 12 ünite grubunda, ünite sırasıyla; her grup başlığı
  "Seviye N · <seviye adı> · Ünite N <ünite adı>". Her satır kavram başlığı + düz
  Türkçe ilk cümlesi ve `kaoNav('concept',id)` eylemi.
- **Kavram sayfası:** başlık, `plainTr` (günlük Türkçe) en üstte; `tables[]`
  tabloları `<table>` + `<th scope="col">`/`<th scope="row">` ile; Arapça hücreler
  içerik modülünden `[ref, ar, okunuş]` üçlüsüyle ve görünür Latin okunuşla;
  `termTr` yalnız `<details>` "Terimlere bak" bölümünde; "Bu kavramın geçtiği
  dersler" bağlantıları gerçek `App.kaoLesson('start',id)` rotasına gider.
- **Girişler:** Bugün → Keşfet'te "Gramer notları" satırı (`quote` ikonu, 05 §2
  sırası); Ünite ekranındaki Kavramlar satırları dokunulabilir düğme oldu.
- `app/core/quranLearnViews.js`: `grammarScreen`, `grammarConceptScreen`, ortak
  `grammarTable` yardımcısı; `unitScreen` kavramları nesne olarak çizer.
- `app/core/quranLearn.js`: `KAO_VIEW_TITLES` += `grammar`/`concept`;
  `kaoRouteParam` (`ui.kaoConceptId`), `kaoViewTitle`, `kaoApplyView`
  (concept → grammar yolu), `kaoNav`/`kaoSetView` doğrulaması; `kaoGrammarConcept`,
  `kaoGrammarLessonsOf`, `kaoGrammarNoteModel`, `kaoGrammarHTML`,
  `kaoConceptModel`, `kaoConceptHTML`; `kaoOverlayHTML` görünüm bağlantısı;
  `kaoUnitModel` kavramları `{id,title}` taşır; API dışa aktarımı.
- `app/kao.css`: `/* KAO2-15 … KAO2-15 son */` bloğu; yalnız `--kao-*`/`--f-*`
  tokenları, kaydırma yalnız `.kao-grammar-table-wrap` içinde, 44 px hedefler,
  odak halkası ve `forced-colors` kuralı.
- **Yeni `App.kao*` handler'ı yok** (`App.kaoNav`/`App.kaoSetView` shim'leri
  kullanılır); fx2/v3/surface pinleri ve yayın pini değişmedi.
- **Kapsam onayı (FIX):** engel, `app/core/quranLearnFlow.js` satır 4'teki `VIEWS`
  beyaz listesinin `grammar` görünümünü tanımamasıydı (kartın Dokun listesinde
  değildi). Kullanıcı 2026-09-29'da kapsam genişletmeyi açıkça onayladı; listeye
  `grammar` anahtarı eklendi — başka değişiklik yok.

## TDD
- Kırmızı: `node tests/kao/test_kao2_grammar_notes.js` → `AssertionError: Expected
  values to be strictly equal: false !== true` (grammar rotası yok).
- Engel: aynı fikstür `kao-screen-home` üretiyordu (`kaoNav` true, yığın evde).
- Yeşil: `VIEWS` onayı sonrası → **PASS (5 kontrol)**.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check` (quranLearn / Flow / Views / CurriculumV2) | PASS |
| `tests/kao/test_*.js` | PASS · **31/31** |
| `tests/app/test_*.js` | PASS · 77/77 |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` | PASS |
| `zikr-harness.mjs` | PASS · 95/95 |
| `kao-verify-contrast.mjs` | PASS · 594 çift, 0 ihlal |
| `test_kao2_perf_budget.js` | PASS · içerik 168.483 KiB · runtime 78.316 KiB · CSS 10.421 KiB · p95 4.743 ms |
| `git diff --check` | PASS |
| `kao2-sync-check.mjs` | PASS · 16/28 done · next KAO2-16 · seq 62 |

## Ölçümler
- Liste: 12 ünite grubu, **25** kavram satırı, ünite sırası birebir (1…12).
- Kavram sayfası: `plainTr` + tablo + katlanır terim + ders bağlantıları.
- **25/25 kavram erişilebilir**; her kavramın en az bir dersi var; bilinmeyen
  kavram açılmıyor.

## Bilerek değişen testler
- `tests/kao/test_kao2_today.js`: Keşfet dizisine "Gramer notları" eklendi ve
  "ilgili kartlar gelene kadar gizli" iddiasından `Gramer notları` çıkarıldı ·
  gerekçe: KAO2-15 bu satırı görünür kılar; "Kök aileleri" (KAO2-20) hâlâ gizli.
- `app/core/quranLearnFlow.js` `VIEWS` listesi: kullanıcı onayıyla kapsam genişledi
  (FIX kaydı `LEDGER seq 61`).

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: kullanıcı onayıyla yayınlanacak · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- Router beyaz listesi motorun `KAO_VIEW_TITLES` tablosundan ayrı yaşıyor; yeni
  görünüm eklerken üç yer birlikte güncellenmeli (motor + route map + flow VIEWS).
  Bu tuzak backlog'a not edildi.
- 320 px/%200 metin koşulu kaynak fikstürüyle denetlendi; tarayıcıda açılmadı.
