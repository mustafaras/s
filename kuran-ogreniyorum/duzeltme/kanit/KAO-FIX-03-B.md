# KAO-FIX-03/B · Kanıt (K-1, Y-3 — içerik, Parti B: Zilzâl–Fîl, 99–105)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Doğrulayıcı:** `claude-opus-5.5` (D-12 YZ doğrulaması) · **Kanıt düzeyi:** kaynak/test

## Sûre sûre içe alma (`node tools/kao-content-freeze.mjs --surah-import`)
| Sûre | Satır | Exit | filled / copy / language / missing / invalid |
|---|---|---|---|
| 99 Zilzâl | 36 | 0 | 266 / 0 / 0 / 571 / 0 |
| 100 Âdiyât | 40 | 0 | 306 / 0 / 0 / 531 / 0 |
| 101 Kâria | 36 | 0 | 342 / 0 / 0 / 495 / 0 |
| 102 Tekâsür | 28 | 0 | 370 / 0 / 0 / 467 / 0 |
| 103 Asr | 14 | 0 | 384 / 0 / 0 / 453 / 0 |
| 104 Hümeze | 33 | **1** | 416 / **1** / 0 / 420 / 0 — `s-104-5-3` "nedir" referansla aynı |
| 104 düzeltme (`ne olduğunu`) + 105 Fîl | 23 | 0 | **440** / 0 / 0 / 397 / 0 |

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_surah_import.js` | 0 | PASS |
| Satır diff (HEAD ↔ çalışma), ilk 6 araç sütunu | — | hepsi aynı; değişen 210, hepsi Parti B |
| `surahs.verified.json` | — | 440 satır (A 230 + B 210) |
| `git status` | — | yalnız `surahs.review.md`, `surahs.verified.json` (+ bana ait olmayan `tools/seyma-notes-export.mjs`, dokunulmadı) |

**Yöntem:** A ile aynı (tuzak 11): `Allah Teâlâ`, `asla` (kellâ), `insanoğlu`, `sana bildirdi`; ek olarak `Kâria`, `Hutame`, `Cahîm`, `yakîn` özel adları. Tefsir parantezi yok; Arapça hücrelere dokunulmadı.

## Öz-denetim örneği (ilk 5 + tohumlu rastgele 5, `random.seed(20260926)`)
| id | ar | okunuş | tr |
|---|---|---|---|
| s-99-1-1 | إِذَا | izâ | ne zaman ki |
| s-99-1-2 | زُلْزِلَتِ | zulzilati | sarsıldı |
| s-99-1-3 | ٱلْأَرْضُ | al-ardu | yeryüzü |
| s-99-1-4 | زِلْزَالَهَا | zilzâlahâ | kendine has sarsıntısıyla |
| s-99-2-1 | وَأَخْرَجَتِ | va-ahracati | ve dışarı attı |
| s-99-6-6 | أَعْمَـٰلَهُمْ | aʿmâlahum | amelleri |
| s-99-5-3 | أَوْحَىٰ | avhâ | vahyetti |
| s-99-3-3 | مَا | mâ | ne var |
| s-104-1-2 | لِّكُلِّ | li-kulli | her birine |
| s-100-9-4 | بُعْثِرَ | buʿsira | altüst edilip çıkarıldı |

**Kalan risk:** anlam doğrulaması YZ (D-12); insan/cihaz kabulü yok. Kapı bir kopya yakaladı ve düzeltildi (bekçi çalışıyor).
