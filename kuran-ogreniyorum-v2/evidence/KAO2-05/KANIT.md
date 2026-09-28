# KAO2-05 — Bileşen kütüphanesi
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: 3d0b2a0

## Yapılan
- `SeymaQuranLearnViews` saf HTML kurucularına `groupedList`, `switchRow`, `progressRing`, `choice`, `feedbackSheet` ve `primaryButton` eklendi.
- Metin girdileri `esc` üzerinden geçiyor; eylemler yalnız `kao*` handler adı ve ilkel argümanları kabul edip güvenli `App.kao*()` çağrısına serileştiriyor. Bağlantılarda yalnız iç `#id` biçimi kabul ediliyor; geçersiz eylem/argüman devre dışı kalıyor.
- Halka değeri 0–100 aralığına kıskaçlanıyor, ölçüler 28/44/64 px ve erişilebilir adı var. Doğru/yanlış şıkları simge ve ekran okuyucu metniyle ayırıyor; geri bildirim metninin `status/polite` canlı bölgesi etkileşim düğmelerinden ayrıldı.
- CSS grouped list ayırıcısını ikon sütunundan başlatıyor; satırlar ≥44 px, şıklar ≥52 px, birincil düğme ≥50 px. Sabit CSS yüksekliği, dekoratif sözde öğe veya yeni token ailesi eklenmedi; focus-visible ve forced-colors karşılıkları var.

## TDD
- Kırmızı: `node tests/kao/test_kao2_components.js` → `AssertionError [ERR_ASSERTION]: groupedList bileşeni olmalı` (başlangıç API'si `undefined`).
- Yeşil: aynı komut → `KAO2 components: PASS` (kaçış, erişilebilirlik, güvenli eylem, ölçü ve durum bileşenleri).
- Bir P3 ara koşusunda bu kartın ilk `.kao-sr-only` kuralı `white-space:nowrap` nedeniyle `test_kao_render.js` ile çatıştı. CSS `white-space:normal` yapıldı; test değiştirilmedi/zayıflatılmadı ve son tam P3 koşusu geçti.

## Kapılar (P3)
| Kapı | Sonuç |
|---|---|
| `node --check` quranLearn / Flow / Views | PASS |
| CurriculumV2 sözdizimi | Dosya henüz yok; uygulanmadı |
| `tests/kao/test_*.js` (21 fixture) | PASS |
| `tests/app/test_*.js` | PASS |
| `tests/panel/test_*.js` | PASS |
| `tests/panel-v2/test_panel_v2_*.js` | PASS |
| `tests/quran/test_*.js` | PASS; iki yerel koruma uyarısı testlerin beklenen çıktısı |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |
| `driver.mjs` / `zikr-harness.mjs` | PASS / PASS |
| `kao-verify-contrast.mjs` | PASS; 374 çift, eşik altı 0 |
| `kao2-sync-check.mjs` | PASS; 6/28 kart, nextCard KAO2-06, seq23 |
| Bileşen testi + strict design contract | PASS / PASS |
| `test_kao2_perf_budget.js` | PASS |

## Ölçümler
- İçerik gzip: **158.372 KiB / ≤256 KiB**.
- quranLearn* runtime gzip: **53.770 KiB / ≤80 KiB**.
- `app/kao.css` gzip: **7.329 KiB / ≤14 KiB**.
- İzole VM p95: **4.896 ms / ≤40 ms**; taban +%25 sınırı da PASS.
- Strict tasarım: 2 font ağırlığı, büyük harf dönüşümü 0, dekoratif sözde öğe 0, serif 0.

## Bilerek değişen testler
- Yalnız yeni `tests/kao/test_kao2_components.js` eklendi. Mevcut test beklentileri değiştirilmedi.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: yok (bu kart yayınlanmadı) · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- İlk P3 denemesinde bulunan satır-sarma çakışması kart CSS kapsamı içinde düzeltildi; son kapılarda açık bulgu yok.
- Strict design fixture'ının switch görünüm semantiğine ilişkin mevcut KAO2-09 TODO'su kaldı; yeni tekrar kullanılabilir bileşenin kendi `role="switch"` ve `aria-checked` sözleşmesi bu kartta PASS.
- KAO2-06 sıradaki tek kart. KAO2-05 için ayrıca yayın onayı verilmedi.
