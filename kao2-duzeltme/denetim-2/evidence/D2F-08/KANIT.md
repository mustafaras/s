# D2F-08 · Test listesi tam olsun · KANIT

Oturum: https://claude.ai/code/session_1f48752b-ccea-476d-8043-aecb83e71957
Tarih: 2026-10-07 · önceki commit `7ad82a93` (D2F-07) · dal `d2f-07`.

## İlerleme günlüğü
1. ORTAK-KURALLAR okundu; `nextPrompt` = `D2F-08` (uyuşuyor).
2. Yeni test `tests/kao/test_kao2_inventory.js` yazıldı, README'siz değişiklikle koşuldu → kırmızı.
3. README tamamlandı → yeşil.

## Yapılan
- `tests/kao/README.md`: `test_kao_pronunciation_contract.js` satırı, `test_kao2_inventory.js` satırı, "Yardımcılar ve sabit veri" tablosu
  (`helpers/kao-harness.js`, `fixtures/fsrs-vectors.json`, `fixtures/qac-lemma-morph.json`), sayım notu 55.
- `tests/kao/test_kao2_inventory.js` (yeni): (1) her `test_*.js` README'de ters tırnaklı tam adla bir satırda; (2) README'de adı geçen her
  `test_*.js` diskte; (3) `helpers/*.js` ve `fixtures/*.json` `\`helpers/…\``/`\`fixtures/…\`` olarak listeli. Ağsız, salt okunur.

## TDD
Kırmızı (değişiklikten önce): `AssertionError [ERR_ASSERTION]: README envanterinde olmayan test dosyaları: test_kao2_inventory.js, test_kao_pronunciation_contract.js`
Yeşil: `PASS test_kao2_inventory: 55 test + 3 yardımcı/fixture envanterde`.

## Kapılar
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh`: tests/kao (55) PASS · tests/app (77) · panel (23) · panel-v2 (27) · quran (9) ·
reminders · driver · zikr · kontrast · l2-paket · fix-sync-check --repro PASS · `tekrar-uret` 10/10 · perf PASS (p95 4.249 · steady 2.935) ·
`kao-plan-check` **FAIL** (`8e583a9` "denetim-2:" öneki; D2F-07'de kaydedilen ortam kırmızısı, bu işle ilgisiz) → `SONUÇ: KIRMIZI KAPI VAR`.
Ayrı: `tekrar-uret-2.cjs` **6/9** (N-05 PASS) · `tekrar-uret.cjs` 10/10.

## Ölçümler
`tests/kao` 55 test dosyası, `helpers/` 1, `fixtures/` 2; hepsi README'de.

## Bilerek değişen testler
Yok.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — · cihaz —

## Sürprizler
`fixtures/fsrs-vectors.json` da listelenmemişti; yeni test onu da yakaladı. Not: yalnız `kao-plan-check` kırmızısı kapılarda açık kalıyor.
