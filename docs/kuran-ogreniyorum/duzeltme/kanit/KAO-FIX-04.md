# KAO-FIX-04 · Kanıt (K-1, Y-3 — dondurma, atıf, pin)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (yayın yok, cihaz yok)
**Ön koşul:** `--surah-import` → `filled 837, missing 0, copy 0, language 0` ✓

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_lexicon_contract.js` (eski modül) | 1 | (a) İngilizce: tüm katmanda 26 (618 kelimede 20); ayrıca kopya 618/618, quran.com source 158 |
| `freezeSurahs`: tr yalnız `surahs.verified.json` (`trFor`, satır yoksa throw), referans yalnız kopya kapısı (throw); `lp_` de yerel katmandan; `JSON_SHA256['surahs.verified.json']=83194a…`; source + `verification` + METHODOLOGY metinleri | — | `node --check` 0 |
| `node tools/kao-content-freeze.mjs --freeze-surahs` | 0 | `quranShortSurahsV1.js` 87.497 bayt (≤90 KB) |
| `node tests/kao/test_kao_lexicon_contract.js` | 0 | PASS: (a) İngilizce 0 · (b) Quran.com source/atıf 0 · (c) verification → surahs.verified.json + D-12 · her tr = doğrulanmış satır · referans kopyası 0 |

(b) ilk hâli `corpus.quran.com` (QAC) adresine takıldı; yanlış pozitifti → ad + tam host `quran.com` denetimine daraltıldı.

## Kabul ölçümleri
| Ölçü | Denetim | Şimdi |
|---|---|---|
| 618 kelimede referansla birebir / normalize aynı (ikinci yol, `node -e`) | 618 | **0 / 0** |
| İngilizce işaret (tüm katman) | 26 | **0** |
| Quran.com `source` | 158 | **0** |
| Kısa sûre Tanzil (`kao-content-check.js … 20260926`) | — | 618/618 |
| Eski ↔ yeni modül: Arapça, okunuş, lemma, vakıf, sûre, Diyanet dua satırı tr | — | hepsi aynı; değişen yalnız yerel `tr` |

## PIN-P
`20260926b` → `20260926c` (9 dosya: index.html, sw.js, 7 tests/app); `SW_VERSION` ve `SW_OFFLINE_VERSION='iip22-20260926c'`; eski pin 0 kalan; phonics `20260924b` değişmedi.

## Kontroller (STD + tests/app + repro)
| Komut | Exit | Sonuç |
|---|---|---|
| `tests/app/*.js` | 0 | 77/77 |
| `tests/kao/*.js` | 0 | 16/16 |
| driver · zikr · rebind · shell-inventory · kao-plan-check · diff --check | 0 (hepsi) | zikr 95/95; plan 1 warn (taban) |
| `node tests/kao/test_kao_freeze_repro.js` | 0 | 4 modül bayt-eş |
| `test_kao_surah_import.js`; geçici kopyada workbook + import | 0 | PASS; review.md ve verified.json bayt-eş (hash sabit) |
| `fixture-map-build --json` ↔ `tests/FIXTURE-MAP.json` | 0 | aynı |

**Değişen:** `tools/kao-content-freeze.mjs`, `app/content/quranShortSurahsV1.js` (araç çıktısı), `tests/kao/test_kao_lexicon_contract.js`, 9 pin dosyası, `duzeltme/**`.
**Kalan risk:** Kullanıcıya görünen kısa sûre/Fâtiha Türkçesi değişti (YZ D-12 çevirisi); cihaz kabulü yok. `content-check` sözlük örneklerinde `UYUMSUZ` satırları sürüyor (KF-5, bu kart dışı).
