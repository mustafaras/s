# KAO-03 · Devir — **DONE** (D-12 düzeltmesiyle)

**Tarih:** 2026-09-23 · **Ajan:** Claude Code (claude-opus-5-5) · **Onay kuralı:** D-12 (06 §3)

## Kural
Kullanıcı kararıyla (D-12) insan teyidi yoktur: doğrulayıcı yapay zekâdır. Satır onayı =
`verifiedBy` + tek geçerli `verifiedAt` + `tr1` (referans kopyası değil) + `--import-md`
tutarlılık denetimi 0. Alan kuralları 06 §3.1 (kalıp sözlüğü, kognat biçimi, parantez kuralı).

## Sonuç
| Komut | Exit | Sonuç |
|---|---|---|
| `node tools/kao-lexicon-build.mjs --self-test` | 0 | PASS |
| `node tools/kao-lexicon-build.mjs --import-md` | 0 | verified=524 · unknown=0 · duplicates=0 · consistency=0 · kopya 0 |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | 0 | PASS (0 warn) |
| `git -c core.fsmonitor=false diff --check` | 0 | çıktı yok |

- 524/524 satır: kalıp sabit sözlükte, 3 örnek çevirisinin hepsi `verified.json`'da (eksik 0).
- Kognat 385 (113 anlam kayması) · kovalar A=22 B=346 C=93 D=63 · kapsam %80,9.
- Transliterasyon araçta düzeltildi (80 lemma: salât, huden, av, şay', hadâ, mu'min …).
- `--draft` artık doğrulanmış alanları `verified.json`'dan taşır: yeniden taslak veri silmez.

## Bilinen sınırlar
1. B kovası 346 (03 §9 tahmini ~225): 06 §3.1 kök düzeyindeki türevleri kognat sayar; kayma olan 113 kart SRS'e girer.
2. freq 1–2 olan 10 lemmada korpus 3. örneği vermiyor → gerekçeli istisna (uydurulmadı).
3. R-A8 `partial`: türev başına ayrı kalıp etiketi listesi KAO-04/KAO-14 kapsamında.

## Sonraki yetkili eylem
`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-04`. Push/merge/tag/deploy yapılmadı.
