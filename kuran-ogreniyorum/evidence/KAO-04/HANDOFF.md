# KAO-04 · Devir — **DONE**

**Tarih:** 2026-09-23 · **Ajan:** Claude Code (claude-opus-5-5) · **Onay:** D-12

## Ne yapıldı
- `tools/kao-grammar-build.mjs` (yeni, ağsız): `--build`, `--review-md`, `--import-grammar`, `--example S:A[:ilk-son]`, `--self-test`.
- `content/grammar.draft.json`: 25 kavram (g0_5 + G1–G24), 86 şablon, 93 örnek, Ünite 11 türev tablosu (73 kök, 242 türev).
- **Arapça yazılmadı:** tüm Arapça korpustan çözülür; Türkçe alana Arapça sızarsa araç reddeder.
- `grammar.review.md` → D-12 imza → `grammar.verified.json` (26/26, tutarlılık 0).

## Kontroller
| Komut | Sonuç |
|---|---|
| `node tools/kao-grammar-build.mjs --self-test` | PASS |
| `node tools/kao-grammar-build.mjs --build` | issues=0 (idempotent) |
| `node tools/kao-grammar-build.mjs --import-grammar` | verified=26/26 consistency=0 |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | PASS (0 warn) |

## Bilinen sınırlar
- Çekim tablolarında 26 hücre Kur'an'da geçmez (2FS/2FD/2FP gibi); uydurulmadı, "Kur'an'da geçmez" gösterilir.
- R-A7 partial (hata taksonomisi `order` → KAO-13); R-A8 partial (fixture sayımı → KAO-14).
- GAP-01: KAO-04 kısmı kapandı; KAO-05 `--freeze` ve KAO-06 `--freeze-*` hâlâ açık.

## Sonraki
`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-23`. Push/merge/tag/deploy yapılmadı.
