# KAO2-13 — Yol (S-03) ve Ünite (S-04)
Tarih: 2026-09-29 · Dal: kao2-yeniden-tasarim · Önceki commit: 31b63d600e1a840a7eff3734d3ab9080e492ab29

## Yapılan
- Yedi seviyeli Yol, müfredat ünite satırları, gerçek ilerleme, ünite ayrıntısı, ders adımları ve kelime listesi kart kapsamıyla eklendi.
- Seq54'teki P6 engeli kullanıcı onayıyla çözüldü (LEDGER seq55). Yalnız `tests/kao/test_kao_user_tasks.js` bölüm (b) eski ünite-listesi → ilk kelime/kök rotasından Yol → Ünite → ilk ders ve kelime listesi akışına geçirildi; rapor satırı aynı görevin iki dokunuşunu gösteriyor.
- IIP Arapça keşif sekmesi ayrı yüzey olarak kaldı. `saygi.js`, `app/styles.css`, sekme dosyaları ve sürüm pinleri değiştirilmedi.

## TDD
- Kırmızı: seq54 öncesi `node tests/kao/test_kao_user_tasks.js` → satır 80: `TypeError: api.kaoUnitsHTML is not a function`; eski API/rota uyuşmazlığını gösterdi.
- Yeşil: `node tests/kao/test_kao_user_tasks.js` → PASS; görev A 3 adım, görev B Yol → ders 2 dokunuş (≤2), ses nesnesi 0.
- Yeşil: `node tests/kao/test_kao2_path.js` → 4/4 PASS; `node tests/kao/test_kao_render.js` → PASS.

## Kapılar (P3)
| Komut/grup | Sonuç |
|---|---|
| `node --check` quranLearn, quranLearnFlow, quranLearnViews, quranCurriculumV2 | PASS |
| `tests/kao/test_*.js` | 29/29 PASS |
| `tests/app/test_*.js` | 77/77 PASS |
| `tests/panel/test_*.js` | 23/23 PASS |
| `tests/panel-v2/test_panel_v2_*.js` | 27/27 PASS |
| `tests/quran/test_*.js` | 9/9 PASS |
| `node tests/reminders/run-reminder-smoke.mjs` | 21 seçili fikstür PASS |
| `.claude/skills/run-seyma/driver.mjs` | PASS |
| `.claude/skills/run-seyma/zikr-harness.mjs` | PASS |
| `node docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` | 562 çift, 0 ihlal PASS |
| `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` | PASS (seq56 kapanışında) |
| `git diff --check` | PASS |

## Ölçümler
- Yol → ünite → ilk ders: 2 dokunuş, hedef ≤2; ünite kelime listesi görünür.
- Tam içerik gzip: 172.527 B / 262.144 B bütçe.
- Kullanıcı görevi VM geçişleri: p50 0,192 ms; en yüksek 1,154 ms / 50 ms bütçe.
- Sentetik FSRS kalibrasyonu: 955 tekrar, ECE 0,0131; gece oturumu 8 kart.

## Bilerek değişen testler
- `tests/kao/test_kao_user_tasks.js` bölüm (b): kaldırılmış `kaoUnitsHTML()` ve eski ilk-kelime/kök akışı → yeni Yol → Ünite → ilk ders/kelime-listesi rotası. P6 kapsam onayı LEDGER seq55'tedir; diğer görev senaryoları değişmedi.

## Kanıt düzeyleri
- Kaynak/test: PASS · Yayın: yapılmadı (release approval `approved_through_KAO2-12`) · Cihaz: doğrulanmadı.

## Sürprizler / backlog
- Seq54'teki eski fikstür engeli onaylı test kapsamıyla çözüldü. KAO2-14 sıradaki karttır; bu kapanışta uygulanmadı.
