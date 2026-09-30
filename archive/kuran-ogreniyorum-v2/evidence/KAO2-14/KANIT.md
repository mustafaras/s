# KAO2-14 — Ders ve tekrar özeti (S-07)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: c1ebe168dfc4d79cfe6dfa446528c6b60603cdf1

## Yapılan
- Özet, bu dersin gerçekten tanıtılmış sözlük kelimelerini Arapça + anlamla gösterir; en çok 10 kelimeyi listeler ve kalanı “ve N daha” diye bildirir.
- Pekiştirme yüzdesi yalnız cevap varsa görünür; ilk yedi program gününde s≥21 “kalıcı oldu” sayısı gizlenir, sonrasında yalnız pozitif oturum sayısı görünür.
- Yarın satırı ile sıradaki adım aynı `SeymaQuranLearnFlow.nextStep` tahmininden gelir; tahmin, mevcut durumu değiştirmeyen bir kopya üzerinde hesaplanır.
- “Bugün yeter” Bugün ekranına döner. “5 dakika daha” dersi tamamlar ve son 7 günlük ölçülen görev süresine göre beş dakikaya sığan ek kuyruğu açar.
- Ders içindeki taş kazanımı tek sakin satırla özetlenir; konfeti tek kez ve yalnız `SeyFx.shouldAnimate()` izin verirse gösterilir.
- KAO modalı 06 tokenlarını ve var olan kart/buton kurallarını yeniden kullanır. `app/kao.css`, İlham & İbadet dosyaları ve yayın pinleri değişmedi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_summary.js` → `AssertionError: Expected values to be strictly equal: 0 !== 10` (özet kelime listesi yoktu).
- Yeşil: `node tests/kao/test_kao2_summary.js` → PASS (9 kontrol).
- P2.4: `tests/kao/test_kao_user_tasks.js` değişmedi; regresyon PASS.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check app/core/quranLearn.js` | PASS |
| `node --check app/core/quranLearnViews.js` | PASS |
| Flow ve curriculum sözdizimi | PASS |
| `tests/kao/test_*.js` | PASS · 30/30 |
| `tests/app/test_*.js` | PASS · 77/77 |
| `tests/panel/test_*.js` | PASS · 23/23 |
| `tests/panel-v2/test_panel_v2_*.js` | PASS · 27/27 |
| `tests/quran/test_*.js` | PASS · 9/9 |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` · `zikr-harness.mjs` | PASS · zikr 95/95 |
| `kao-verify-contrast.mjs` | PASS · 562 çift, 0 ihlal |
| `kao2-sync-check.mjs` | PASS · 15/28 done · next KAO2-15 · seq59 |
| `test_kao2_perf_budget.js` (yalıtılmış ölçüm) | PASS · içerik 168.483 KiB · runtime 76.767 KiB · CSS 9.990 KiB · p95 4.671 ms |
| `git diff --check` | PASS |

## Ölçümler
- Özet fikstürü: 9/9; 12 kelimelik tohumda 10 + “ve 2 daha”; sentetik doğruluk %75; yarın 2 tekrar kartı / yaklaşık 2 dk.
- İlk hafta ve sıfır doğruluk/kelime boş hâlleri uydurma sayı göstermiyor.
- Ek oturum kuyruğu, sentetik 15 vadeli kartta tahmini süre ≤5 dk ile sınırlandı.
- P10/06 kaynak fikstürü KAO karanlık tema token seçicisini, daralabilir `minmax(0,1fr)` satırlarını, 44 px ikincil hedefi, odak halkasını ve forced-colors kuralını doğruladı. Gerçek 320 px/%200 tarayıcı yerleşimi açılmadı; veri güvenliği/P5 nedeniyle tarayıcı veya sunucu kullanılmadı.

## Bilerek değişen testler
- Yok. Yeni `tests/kao/test_kao2_summary.js` eklendi.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: yapılmadı / yetki KAO2-13’te sona eriyor · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- Kapsam dışı dosya değişikliği gerekmedi; mevcut KAO görünüm kuralları kullanıldı. Yeni kart başlatılmadı.
