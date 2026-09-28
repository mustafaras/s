# KAO2-03 — Tokenlar ve süs temizliği
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: a488e5c

## Yapılan
- `.kao-dialog` ve `.kao-hub-card` kapsamında açık/koyu tema için 06 §1 tokenları eklendi; değerler yalnız mevcut `--quran*` ailesinden türetildi.
- Ağırlıklar sadeleştirildi; uppercase, harf aralığı, serif arayüz yığını, görsel hover/gölge efektleri ve 06 §4'teki 13/13 eski seçici kaldırıldı. Karşılık gelen dekoratif span'lar markup'tan çıkarıldı; Arapça içerik tipografisine dokunulmadı.
- Tasarım sözleşmesi fixture'ı strict moda geçirildi. Ayar switch semantiği bu kartın açık istisnası olarak `TODO KAO2-09` şeklinde raporlanıyor.

## TDD
- Kırmızı: `node tests/kao/test_kao2_design_contract.js` → strict modda `AssertionError: strict tasarım ihlalleri`; taban değerleri 9 ağırlık, 4 uppercase, 5 dekoratif pseudo öğe ve 3 serif idi. Tam çıktı: `strict-red.log`.
- Yeşil: `node tests/kao/test_kao2_design_contract.js` → strict PASS; tam çıktı: `strict-green.log`.
- `node tests/kao/test_kao_render.js` → PASS.

## Kapılar (P3)
| Komut / aile | Sonuç |
|---|---|
| `node --check app/core/quranLearn.js` ve 164 komutluk kapı turundaki diğer sözdizimi kontrolleri | PASS; isteğe bağlı `quranLearnFlow.js`, `quranLearnViews.js`, `quranCurriculumV2.js` dosyaları mevcut değil |
| KAO / app / panel / panel-v2 / quran fixture'ları | 19 + 77 + 23 + 27 + 9 = 155/155 PASS |
| `node tests/reminders/run-reminder-smoke.mjs` | 21 küratörlü fixture PASS; sözleşme 73 assertion PASS |
| `.claude/skills/run-seyma/driver.mjs` | PASS |
| `.claude/skills/run-seyma/zikr-harness.mjs` | 95/95 PASS |
| P3 tam turu | 164/164 PASS |
| `node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` | 328 çift, 0 ihlal PASS |
| `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` | PASS · 4/28 done · nextCard KAO2-04 · ledger seq 15 |
| `git diff --check` | PASS |

## Ölçümler
- Strict CSS: 2 kullanılan `font-weight` değeri (600/700; izin verilen ≤4), uppercase 0, normal dışı letter-spacing 0, dekoratif pseudo öğe 0, serif 0, kaldırılacak seçiciler 0/13.
- Boş/tohumlu durumların 24 görünümünde primary eylem ≤1; 5 ayar switch'i KAO2-09'a kadar açık TODO.
- `app/kao.css` gzip: 6,411 B = 6.26 KiB ≤ 14 KiB.
- Performans fixture'ı: içerik 158.372 KiB, runtime 48.923 KiB, CSS 6.261 KiB, p95 5.073 ms.
- Kontrast: 35 elle seçilmiş + 129 otomatik bildirim çifti × 2 tema = 328; eşik altı 0.

## Bilerek değişen testler
- `tests/kao/test_kao_render.js`: kaldırılan dekoratif span'ların varlık beklentisi yokluğa çevrildi; `.kao-dialog-frame`, `.kao-header-mark`, `.kao-hero-rosette` seçici beklentileri kaldırıldı. Amaç 06 §4 gereği dekoratif katmanın DOM'dan kalktığını doğrulamak; işlevsel/erişilebilir içerik beklentileri korunuyor.
- Aynı testte dokunma hedefi denetimi, `.kao-hub-card` için `min-height:var(--kao-row)` değerini tanıyacak biçimde genişletildi; token 44 px olarak çözülüyor ve ≥44 px şartı aynen korunuyor.
- `tests/kao/test_kao2_design_contract.js`: baseline ölçüm sabitleri (9/4/5/3) korunarak strict ölçümlere harf aralığı eklendi; switch kontrolü silinmedi, kartın izin verdiği KAO2-09 TODO'su olarak görünür bırakıldı.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: KAO2-03 için yok · Cihaz: doğrulanmadı (kullanıcıda).
- Bu dalın öncesindeki ayrı konum kapısı düzeltmesi canlıya alındı: `c7d5190`, Pages run `36415570405` başarı ve 12 canlı varlıkta byte/hash eşliği; KAO2-03 bu yayın kapsamında değildir.

## Sürprizler / backlog
- Eski `node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` tam taraması 19 kapsam uyarısı/hatası veriyor: önceki yayımlanmış `c7d5190` ve `a488e5c` `chore(kao)` teslim/kanıt commit'lerini KAO kartı dosya kapsamı dışında sayıyor. Araç `--self-test` 19/19 PASS; tam tarama §1 P3 listesinde değil. Düzeltme araç/önceki yayımlanmış commit kapsamını gerektireceğinden bu karta alınmadı.
- Gerçek cihaz, tarayıcı görüntüsü ve 390 px hub yüksekliği ölçümü yapılmadı; KAO2-03'ün kabul koşulu olan CSS/kontrast ölçümleri headless kapılarla doğrulandı.
