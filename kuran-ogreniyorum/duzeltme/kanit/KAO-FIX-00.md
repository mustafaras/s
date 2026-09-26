# KAO-FIX-00 · Kanıt

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` (taban `main` @ `58e0ceb`) · **Kanıt düzeyi:** kaynak/test (yayın yok, cihaz yok)

## Adımlar
- `git switch -c kao-duzeltme` → exit 0
- Kararlar KF-1…KF-9: kullanıcı "Karar:" satırı vermedi → hepsi `varsayılan` (tablo değişmedi)
- CLAUDE.md (s.96) ve AGENTS.md (s.33): KAO maddesinin hemen arkasına birebir aynı KAO-FIX satırı
- Kırmızı test: yok (bu prompt kod/test değiştirmez)

## Taban ölçümü
| Komut | Sonuç |
|---|---|
| `for d in kao app panel panel-v2 quran …` | kao 14/14 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 |
| `node kuran-ogreniyorum/duzeltme/araclar/kao-sim.js "$PWD" 120 0.9` | exit 0 · lemmasBothDirections 0 · knownByCode 524 · knownByPlanDefinition 0 · codeCoveragePct 77.42 · grammarMax 4 · maxSameTypeRun 4 |
| Yayın pini | `quranLearn.js?v=20260926b` · `quranPhonicsV1.js?v=20260924b` |
| `wc -l app.js` | 7.798 |

## Kontroller (STD Ö4 + araç sözdizimi)
| Komut | Exit | Sonuç |
|---|---|---|
| `for f in tests/kao/*.js …` | 0 | FAIL yok |
| `driver.mjs` | 0 | — |
| `zikr-harness.mjs` | 0 | 95/95 assertion pass |
| `test_state_rebind_boundary.js` | 0 | — |
| `tools/shell-inventory.mjs --gate` | 0 | PASS |
| `kao-plan-check.mjs` | 0 | PASS (1 warn: quranLearn.js MediaRecorder+save elle inceleme, 05 §4) |
| `git diff --check` | 0 | diffcheck-ok |
| `node --check duzeltme/araclar/*` (dosya dosya, 4) | 0 | sözdizimi hatası yok |

## Commit'ler
- `201ff6d` KAO-DENETIM: bağımsız uygunluk denetimi raporu (yalnız rapor, içerik değişmedi)
- KAO-FIX-00: düzeltme programı iskeleti, kararlar ve taban ölçümü (`git log --grep=KAO-FIX-00`)

## Değişen dosyalar
`kuran-ogreniyorum/duzeltme/**` (plan, araçlar, durum, günlük, bu kanıt), `CLAUDE.md`, `AGENTS.md` (+1 satır)

## Kalan risk
- `kao-plan-check` uyarısı taban durumudur (bu prompt kod değiştirmedi).
- Push/merge/deploy yapılmadı (KF-8).
