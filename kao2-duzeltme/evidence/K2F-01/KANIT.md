# K2F-01 — kao-plan-check: K2F öneki ve taban commit
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: d19b4576 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: M-10 · R değişimi: yok

## İlerleme günlüğü
- [x] P1: sync PASS, dal kao2-duzeltme, K2F-01 in_progress
- [x] self-test kırmızı görüldü: 23/29 (6 yeni durum FAIL)
- [x] regex (`K2F-(?:[0-3]\d|4[0-3])`) + `resolvePlanBase` + `beforePlanBase` + `planBaseMissing` yazıldı
- [x] `planCheckBase` = `d19b4576aad643fb12e61c86fef112c24163924c` (K2F-00 commit'i)
- [x] plan-check exit 0, self-test 30/30
- [x] P4 kapanış, kapilar.sh YEŞİL

## Yapılan
- `kao-plan-check.mjs`: `KAO_SUBJECT_RE` ve `CARD_OF_SUBJECT_RE`'e `K2F-00…43` eklendi (tek hane, `K2FX`, 44+ reddedilir).
- `--since <hash>` seçeneği; verilmezse `kao2-duzeltme/FIX-STATE.json.planCheckBase` (`resolvePlanBase`, dışa açık).
- Taban öncesi commitler (`beforePlanBase`) §6 (kart/chore kapsamı) ve §7 (önek) taramasından çıkarıldı; CLI `INFO` satırı taranmayan/denetlenen sayısını yazar.
- Taban çözülemezse (`planBaseMissing`) sessizce atlamak yerine FAIL.
- `kao-plan-check.test.mjs`: 11 yeni self-test durumu (19 → 30).

## TDD
- Kırmızı: `node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` → `self-test 23/29` (FAIL: K2F-07 commit KAO dosyasına dokunabilir · K2F-43 tanınır · plan taban öncesi tanınmayan önek taranmaz · plan taban öncesi chore(kao) kapsamı taranmaz · commitCounts K2F · planBase çözümü)
- Yeşil: aynı komut → `self-test 30/30`; `node kao-plan-check.test.mjs` → 30/30; `node kao-plan-check.mjs` → `kao-plan-check: PASS (1 warn)`, exit 0

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (45) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders smoke · driver · zikr · kontrast PASS
kao-plan-check PASS · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 92.431 KiB · css 12.815 KiB)
```
tekrar-uret: 0/10 PASS (önceki 0/10)

## Ölçümler
- plan-check FAIL: 23 (22 tarihsel + K2F-00 commit'i) → 0.
- Taban davranışı: `--since HEAD~1` → 0 FAIL; `--since deadbeef0` (çözülemez) → FAIL (23), sessiz atlama yok.
- Bu commit'ten sonra plan-check gerçekten taranan commit sayısı artar (şu an 0 denetlenen: taban = HEAD).

## Bilerek değişen testler
- yok (mevcut 19 self-test durumu olduğu gibi geçiyor; yalnız ekleme).

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Plan-check tarihsel FAIL'lerin 2'si `chore(kao)` kapsam ihlaliydi (a488e5c, c7d5190), gerisi önek; hepsi tabanla ayrıldı, kod tarafında gevşetme yok.
- Sandbox'ta `git` çıktısında `fsmonitor_ipc` uyarısı gürültüsü var; zararsız (plan-check `core.fsmonitor=false` kullanır).
