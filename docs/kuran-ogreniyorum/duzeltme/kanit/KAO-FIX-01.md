# KAO-FIX-01 · Kanıt (bulgu O-4)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (yayın yok, cihaz yok)

## Kök neden
`shasum -a 256 kuran-ogreniyorum/content/*.json`: `lexicon.verified.json` = `16a159…`, pin `cf65aa…` (bayat, `cf5e0d7`). Diğer üç pin (reference/grammar/phonics) gerçek hash ile eş → değişmedi.

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_freeze_repro.js` (düzeltme öncesi) | 1 | `--freeze-surahs`: `lexicon.verified.json: sha256 uyuşmuyor (16a159…)` |
| `tools/kao-content-freeze.mjs:19` pini + hata metnine `(pini güncelle: shasum -a 256 …)` | — | `node --check` 0 |
| `node tests/kao/test_kao_freeze_repro.js` (sonrası) | 0 | PASS, 4 modül bayt-eş |
| Aynı test, girdisiz geçici kök (`$TMPDIR` kopyası, sonra silindi) | 0 | `SKIP: girdi yok (…)` |
| `git diff --stat app/content` | — | boş (içerik modülleri değişmedi) |

## Test tasarımı
Kopya `git archive HEAD` yerine **çalışma ağacından** alınır (yalnız 2 araç + `kuran-ogreniyorum/content`, `.claude` hariç; `app/content` boş başlar). Gerekçe: HEAD arşivi commit edilmemiş düzeltmeyi göremez, kırmızı→yeşil commit'ten önce kanıtlanamaz. Test repodaki 4 modülün SHA'sını önce/sonra karşılaştırır (repoya yazmadığını doğrular). Süre ~1,5 sn.

## Kontroller (STD Ö4)
| Komut | Exit | Sonuç |
|---|---|---|
| `for f in tests/kao/*.js` (15 dosya) | 0 | FAIL yok |
| `driver.mjs` · `zikr-harness.mjs` | 0 · 0 | zikr 95/95 |
| `test_state_rebind_boundary.js` | 0 | — |
| `shell-inventory.mjs --gate` | 0 | PASS |
| `kao-plan-check.mjs` | 0 | PASS (1 warn, taban ile aynı) |
| `git diff --check` | 0 | diffcheck-ok |
| `node tools/fixture-map-build.mjs --write` | 0 | yazıldı |
| `archive/ilham-ibadet-premium-plan/tools/plan-check.mjs` (haritanın tek tüketicisi) | 0 | PASS |

## FIXTURE-MAP notu
`--write` farkı (+155/−72) tamamen önceden birikmiş kaymadır (app 76→77, `test_aeon_mail_outbox.js` `58e0ceb`'den, KAO dönemi `quranLearn.js`/içerik bağları). Araç `tests/kao`'yu taramadığı için yeni test haritada yok (tuzak 8).

## Değişen dosyalar
`tools/kao-content-freeze.mjs`, `tests/kao/test_kao_freeze_repro.js` (yeni), `tests/kao/README.md` (+1), `tests/FIXTURE-MAP.json` (araç çıktısı), `kuran-ogreniyorum/duzeltme/**`

## Kalan risk
- Girdiler yalnız bu makinede; başka makinede test SKIP olur (koruma yalnız burada etkin).
- Yayın pini değişmedi (içerik modülü/app kodu değişmedi, PIN-P gerekmez).
