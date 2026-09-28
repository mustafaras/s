# KAO-FIX-14 · R-A5 anlam komşuları sözlükten — O-7

**Tarih:** 2026-09-27 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test + sim (cihaz yok; yayın ayrı satır)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_lexicon_contract.js` (eski JSON/modül) | 1 | `D-12 doğrulanmış komşu satırı: 0` |
| `node tests/kao/test_kao_requirements.js` (eski kod) | 1 | `elle yazılmış küme kaldırılmalı` |
| ikisi (düzeltme sonrası) | 0 | ≥79 alan, kimlikler var, simetrik, kümeden türer; hidâyet↔dalâlet 0/1000, dışlanan anfaqa↔kafara 1000/1000, katalog seçeneği korunur |

## D-12 doğrulaması (kural: aynı anlam alanı VE karışma riski)
- 12 kök temelli kümenin 79 lemması incelendi (`tools/kao-lexicon-build.mjs` `SEM_NEIGHBOR_REVIEW`, `claude-opus-5-5`, 2026-09-27).
- 70'i kümede kaldı. 9'u alan dışı olduğu için dışlandı, gerekçe satırda (`excludedReason`): anfaqa, amina, âlemîn, hasiba, rîh, zulumât, tahiyye, istetâa, taâm. Kök komşuluğu uygulamada `root` anahtarıyla sürer.
- `--sem-verify` modu JSON'a yalnız `semNeighbors`'ı yazar (`proposed:false`, `verifiedBy`, `verifiedAt`). İkinci koşu `changed=false` (idempotent). HEAD'e göre `semNeighbors` dışındaki her alan bayt-eş.
- `--import-md` aynı kararı uygular (taslaktan yeniden kurulumda doğrulama kaybolmaz). İncelenmemiş yeni kök önerisi `--freeze`'i durdurur.
- `lexicon.review.md` değişmedi (`semClusters` sütunu öneri olarak kalır; karar tablosu bağlayıcı).

## Modül ve kod
- `--freeze`: `SEM_GROUPS` (12 grup, bir kez) + satırda grup sırası. Yükleyici `semNeighbors:['id',…]`'yi (sıralı, donmuş) türetir. 79 lemma alanlı (70 dolu, 9 `[]`); öneri satırı `null`.
- Tam listeyi satıra yazmak içerik gzip tavanını 137 B aşıyordu (163.977 > 163.840, `test_kao_user_tasks.js`). Grup depolamasıyla 162.177 (HEAD ≈160,9 K).
- `quranLearn.js`: `KAO_SEMANTIC_CLUSTERS` + `KAO_CLUSTER_BY_LEMMA` silindi (`grep -c` = 0); `metaFor` komşuları `QuranLexiconV1.byId(id).semNeighbors`'tan alır; `opts.catalog` korunur. 1.854 satır.

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `tests/kao/*.js` · `test_kao_freeze_repro.js` | 0 · 0 | 17/17 · 4 modül bayt-eş |
| `kao-lexicon-build --self-test` | 0 | PASS |
| driver · zikr · rebind · shell · plan-check · diff --check | 0 | PASS (plan-check 1 warn, önceden var) |
| `tests/app` · `panel` · `panel-v2` · `quran` | 0 | 77/77 · 23/23 · 27/27 · 9/9 |
| `kao-sim.js . 365` | 0 | iki yön 524/524, bilinen kod=plan 506 (HEAD aynı gün 507: R-A5 sıra farkı), newMax 8, hata 0 |
| `kao-mutate.mjs $TMPDIR/kao-mut-*` | 0 | 17/17 |
| `kao-content-check.js . 20260926` | 0 | örneklem temiz |
| Boyut | — | `quranLexiconV1.js` 324.328 B ≤ 340 KB |
| PIN-P `20260926k → 20260926l` | — | 9 dosya; SW iki sürüm; eski pin 0; JSON_SHA256 güncel |

## Kalan risk
- İçerik gzip payı ~1,6 KB (tuzak 21).
- Dışlama kararları tek doğrulayıcının (D-12). Kullanıcı itiraz ederse `SEM_NEIGHBOR_REVIEW` düzenlenir, `--sem-verify` + `--freeze` koşulur.
