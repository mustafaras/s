# KAO2-15 — Gramer notları kütüphanesi (S-10)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 86e646be

## Durum
**BLOCKED (P6)** — uygulama yazıldı ve yeni fikstür yönlendirici dışında 5/5 yeşil,
ancak kabul için kartın Dokun listesinde olmayan bir dosyada tek belirteçlik
değişiklik gerekiyor.

## Yapılan
- `tests/kao/test_kao2_grammar_notes.js` (yeni, 5 kontrol): liste gruplaması, kavram
  sayfası, 25/25 erişilebilirlik, Keşfet + ünite girişleri, P10/06 CSS kuralı.
- `app/core/quranLearnViews.js`: `grammarScreen` + `grammarConceptScreen` + ortak
  `grammarTable` yardımcısı; ünite ekranındaki Kavramlar satırları `kaoNav('concept',id)`
  düğmesine dönüştü.
- `app/core/quranLearn.js`: `KAO_VIEW_TITLES`'a `grammar`/`concept`; `kaoRouteParam`
  (`ui.kaoConceptId`), `kaoViewTitle`, `kaoApplyView` (concept → grammar), `kaoNav`/
  `kaoSetView` doğrulaması; `kaoGrammarConcept`/`kaoGrammarLessonsOf`/
  `kaoGrammarNoteModel`/`kaoGrammarHTML`/`kaoConceptModel`/`kaoConceptHTML`;
  `kaoOverlayHTML` bağlantısı; `kaoUnitModel` kavramları nesne olarak taşır; Keşfet
  listesine "Gramer notları" satırı ('quote' ikonu); API dışa aktarımı.
- `app/kao.css`: `/* KAO2-15 … KAO2-15 son */` bloğu (yalnız `--kao-*`/`--f-*`
  tokenları, tablo sarmalayıcısında `overflow-x:auto`, 44 px hedefler, odak halkası,
  `forced-colors` kuralı).
- Yeni **App handler'ı yok**: `App.kaoNav` ve `App.kaoSetView` shim'leri mevcut;
  fx2/v3/surface pinleri oynamadı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_grammar_notes.js` → `AssertionError: Expected values to be strictly equal: false !== true` (grammar rotası yok).
- Yeşile yakın: yönlendirici sorunu geçici yamayla doğrulandıktan sonra 5/5 PASS
  (kanıt aşağıda).

## Kapılar (P3)
| Komut | Sonuç |
|---|---|
| `node --check app/core/quranLearn.js` | PASS |
| `node --check app/core/quranLearnViews.js` | PASS |
| `node tests/kao/test_kao2_grammar_notes.js` | **FAIL (P6, aşağıdaki engel)** |
| `node tests/kao/test_kao2_perf_budget.js` | PASS · içerik 168.483 KiB · runtime 76.767 → **78.314** KiB (≤80) · CSS 9.990 → **10.421** KiB (≤14) · p95 4.545 ms |
| `tests/kao/test_*.js` diğer 30 dosya | PASS · 30/30 |
| `tests/app/test_*.js` | PASS · 77/77 |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` · `zikr-harness.mjs` | PASS |
| `kao-verify-contrast.mjs` | PASS |
| `kao2-sync-check.mjs` | PASS · 15/28 done · next KAO2-15 · seq60 |

> Tek kırmızı, kartın kendi yeni fikstürüdür ve nedeni kartın yetkisi dışındaki
> router belirtecidir; diğer bütün aileler regresyonsuz geçer.

## Engel (P6)
- **Neden:** KAO'nun gezinme yığını `app/core/quranLearnFlow.js` içinde kendi görünüm
  beyaz listesini tutar: `var VIEWS={home,units,word,reader,settings,phonics,ayah,map,
  prayer,stats,gate,session}`. `grammar` bu listede yok; `entry()` bilinmeyen görünümde
  `null` döndürdüğü için `kaoNav('grammar')` `true` dönse de yığın evde (home) kalıyor ve
  `kaoOverlayHTML` `kao-screen-home` üretiyor. Keşfet satırı çizilse bile ölü giriş olur.
- **Denenen:** Yalnız test/teşhis amaçlı, listede `grammar:true` geçici olarak denendi →
  fikstür ilerledi ve **5/5 PASS** oldu; ardından `git checkout` ile geri alındı
  (`grep -c 'grammar:true'` = 0).
- **Önerilen çözüm:** `app/core/quranLearnFlow.js` satır 4 `VIEWS` listesine `grammar:true`
  eklemek (tek belirteç). Bu dosya **kartın Dokun listesinde değil**; KAO2-15 kartı
  yalnız `quranLearnViews.js`, `quranLearn.js`, `app/kao.css` ve yeni testi yetkilendiriyor.
- **Kapsam isteği:** yalnız söz konusu `VIEWS` listesine `grammar` anahtarını ekleme
  yetkisi; router sözleşmesinde ya da motor davranışında başka değişiklik yok.
- **Öncül:** KAO2-13 aynı sınıfta bir engelde (mevcut fikstür kapsam dışı) `BLOCKED`
  kaydı bırakıp kullanıcı onayıyla `FIX` ile sürmüştü (seq 54→55→56).

## Ölçümler
- Liste: 12 ünite grubu, 25 kavram satırı, ünite sırası birebir.
- Kavram sayfası: `plainTr` + tablo (`<table>`, `<th scope>`), hücreler içerik
  modülünden ve Latin okunuşlarıyla; terim katlanabilir; ders bağlantıları gerçek
  `App.kaoLesson('start',id)` rotasına gider.
- 25/25 kavramın en az bir dersi var; bilinmeyen kavram açılmıyor.

## Bilerek değişen testler
- `tests/kao/test_kao2_today.js` (P2.4): Keşfet dizisine "Gramer notları" eklendi ve
  "ilgili kartlar gelene kadar gizli" iddiasından `Gramer notları` çıkarıldı · gerekçe:
  KAO2-15 kartı bu satırı görünür kılar, "Kök aileleri" (KAO2-20) hâlâ gizli kalır.

- Bütçe (K-1): içerik 168.483 KiB · runtime 78.314 KiB (≤80) · CSS 10.421 KiB (≤14)
  · p95 4.545 ms — hepsi sınır içinde.

## Kanıt düzeyleri
- Kaynak/test: yönlendirici dışında PASS (5/5) · Yayın: yok · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- Kapsam dışı dosya zorunlu olduğu için kart kapanmadı; `KAO2-STATE.json.nextCard`
  KAO2-15'te kalır.
