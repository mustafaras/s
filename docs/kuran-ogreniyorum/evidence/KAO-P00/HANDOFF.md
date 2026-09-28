# KAO-P00 · Devir

**Tarih:** 2026-09-23 · **Başlangıç HEAD:** `aded41ea85150826bc340ad6ad86717b65a00d80` · **Durum:** done

## Ne yapıldı

- Var olan yerel `kuran-ogreniyorum` branch'ine geçildi; `main` merge edilmedi.
- `tests/kao/README.md` içinde ortak `tests/repo-root.js` kullanımı ve 13 planlı fixture kaydedildi.
- `kuran-ogreniyorum/content/.gitignore` ile ham `inputs/` korpus dosyaları Git dışında bırakıldı.
- STATE `in_progress`, `lastCompletedPrompt=KAO-P00`, `nextCard=KAO-01` olarak güncellendi; ledger başlangıç/bitiş kayıtları eklendi.
- `app/`, `app.js`, `index.html` ve `sync.js` üretim yüzeylerinde diff oluşturulmadı.

## Kontrol sonuçları

- `node kuran-ogreniyorum/tools/kao-plan-check.mjs` → exit 0 → PASS (0 warn)
- `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` → exit 0 → 13/13 PASS
- `node tests/quran/test_quran_catalog.js` → exit 0 → 70/70 PASS
- `git -c core.fsmonitor=false diff --check` → exit 0 → çıktı yok
- `git diff --stat HEAD -- app app.js index.html sync.js` → exit 0 → üretim diff'i yok
- Değişen `.js`/`.mjs` dosyası yok; `node --check` uygulanabilir değil.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| — | n/a | KAO-P00 bağlayıcı R-id kapatmaz. |

## Kalan iş / bilinen sınır

- `--card KAO-P00` bootstrap tanımını göstermiyor ve `kart yok` ile exit 1 veriyor; P00 kapsamı doğrudan `KAO-STATE.json.bootstrap.files` ile doğrulandı. Bu araç iyileştirmesi P00 izinli dosyaları dışında kaldığı için yapılmadı.
- Push, merge, tag, deploy, canlı veri yazımı ve cihaz kabulü yapılmadı.

## Sonraki yetkili eylem

Kullanıcı ayrıca yetki verirse `node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-01` ile yalnız KAO-01 başlatılır. Bu oturum KAO-01'e ilerlemez.
