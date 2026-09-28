# KAO-05 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `62551fc5c1813078ed01e2bd2e29eb6b6ea131a4` · **Durum:** done

## Ne yapıldı

- Kullanıcı onayıyla GAP-01 kapsam boşluğu onarıldı; KAO-05 `tools/kao-lexicon-build.mjs` ve `--freeze` üretiminin sahibi oldu.
- `quran-lexicon-tr-v1` içindeki 524 `verified:true` lemma, `window.QuranLexiconV1` salt içerik modülüne donduruldu.
- Modül kimlik, harekeli Arapça, transliterasyon, anlamlar, kök, kalıp, POS, sıklık, kognat, örnek ve D-13 nihai istisnalarını korur; `roots` ve `byId()` indekslerini yükte kurar.
- Üretim deterministiktir: art arda iki çalıştırma aynı `4a46fc44…371` SHA-256 değerini verdi. Dosya 256.327 bayttır ve 260 KiB bütçesi içindedir.
- `index.html`, driver, zikr harness ve state-rebind boot listeleri aynı sırada güncellendi.

## Kontrol sonuçları

- `node tests/kao/test_kao_lexicon_contract.js` → 0 → 524 lemma, 256.327 bayt PASS
- `node tests/kao/test_kao_lexicon_coverage.js` → 0 → 59.948/77.430 = %77,42 PASS
- `node .claude/skills/run-seyma/driver.mjs` → 0 → Done
- `node .claude/skills/run-seyma/zikr-harness.mjs` → 0 → 95/95 PASS
- `node tests/app/test_state_rebind_boundary.js` → 0 → 37/37 PASS
- `node tools/shell-inventory.mjs --gate` → 0 → PASS
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` → 0 → PASS (0 warn)
- `git -c core.fsmonitor=false diff --check` → 0 → çıktı yok

## Gereksinim kapanışı

KAO-05'e atanmış R-id yoktur. Kartın donmuş modül, dört yükleme listesi, iki fixture ve boyut kabulü karşılandı.

## Kalan iş / bilinen sınır

- Yaklaşık %80 hedefi resmî 77.430 paydasında %77,42; LEM etiketli 74.122 token paydasında %80,88'dir. İki payda kanıtta ayrıştırılmıştır.
- Bu teslim kaynak/headless test kanıtıdır; gerçek cihaz/üretim kabulü değildir.
- Push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

Sıradaki kart KAO-06'dır; bu devir KAO-06 için uygulama yetkisi vermez.
