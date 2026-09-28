# KAO-FIX-03/A · Kanıt (K-1, Y-3 — içerik, Parti A: Tîn–Beyyine, 95–98)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Doğrulayıcı:** `claude-opus-5.5` (D-12 YZ doğrulaması) · **Kanıt düzeyi:** kaynak/test

## Sûre sûre içe alma (`node tools/kao-content-freeze.mjs --surah-import`)
| Sûre | Satır | Exit | filled / copy / language / missing / invalid |
|---|---|---|---|
| 95 Tîn | 34 | 0 | 34 / 0 / 0 / 803 / 0 |
| 96 Alak | 72 | 0 | 106 / 0 / 0 / 731 / 0 |
| 97 Kadr | 30 | 0 | 136 / 0 / 0 / 701 / 0 |
| 98 Beyyine | 94 | 0 | **230** / 0 / 0 / 607 / 0 |

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_surah_import.js` | 0 | PASS |
| `surahs.verified.json` satırları | — | 230, hepsi `s-95…s-98`, tek doğrulayıcı + `2026-09-26` |
| Satır diff (HEAD ↔ çalışma): ilk 6 araç sütunu | — | 837 satırın hepsinde aynı; değişen 230, hepsi Parti A |
| `git diff --stat` | — | yalnız `surahs.review.md` (+ yeni `surahs.verified.json`) |

## Yöntem
- Her `tr` Arapça kelimenin o âyetteki anlamından yazıldı; ipucu yalnız hizalama bağlamı için görüldü.
- Doğal karşılık referansla çakışınca eş anlamlı ve doğru bir ifade seçildi (kapı normalize eşitliği reddeder): `Allah`→`Allah Teâlâ`, `kadir`→`Kadr` (sûre adı), `melekler`→`melâike`, `oku`→`sen oku`, `hayır`→`asla` (kellâ), `bin`→`bin tane`, `Kitap`→`kitabın`/`o Kitap`.
- Ön ek/edat kelimeye dâhil (`وَ`→"ve …", `لَـ`→"elbette …", `بِـ`→"… ile"); tefsir parantezi yok. Arapça hücrelere dokunulmadı.

## Öz-denetim örneği (ilk 5 + tohumlu rastgele 5, `random.seed(20260926)`)
| id | ar | okunuş | tr |
|---|---|---|---|
| s-95-1-1 | وَٱلتِّينِ | va-al-tîni | yemin olsun incire |
| s-95-1-2 | وَٱلزَّيْتُونِ | va-al-zaytûni | ve zeytin ağacına |
| s-95-2-1 | وَطُورِ | va-tûri | ve Tûr Dağı'na |
| s-95-2-2 | سِينِينَ | sînîna | Sînâ'daki |
| s-95-3-1 | وَهَـٰذَا | va-hâzâ | ve şu |
| s-95-6-7 | أَجْرٌ | acrun | ecir |
| s-95-5-4 | سَـٰفِلِينَ | sâfilîna | alçakların |
| s-95-4-3 | ٱلْإِنسَـٰنَ | al-insâna | insanoğlunu |
| s-98-3-2 | كُتُبٌ | kutubun | yazılı hükümler |
| s-96-8-3 | رَبِّكَ | rabbika | senin Rabbine |

**Kalan risk:** anlam doğrulaması YZ (D-12); insan/cihaz kabulü yok. Eş anlamlı zorunluluğu birkaç satırda üslubu ağırlaştırır (ör. `bin tane`).
