# KAO-FIX-03/D · Kanıt (K-1, Y-3 — içerik, Parti D: Fâtiha + tamamlayıcı sözlük)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Doğrulayıcı:** `claude-opus-5.5` (D-12 YZ doğrulaması) · **Kanıt düzeyi:** kaynak/test

## Grup grup içe alma (`node tools/kao-content-freeze.mjs --surah-import`)
| Grup | Satır | Exit | filled / copy / language / missing / invalid |
|---|---|---|---|
| Fâtiha `f-1-*` | 29 | 0 | 647 / 0 / 0 / 190 / 0 |
| `ls_` ilk 80 | 80 | **1** | 726 / **1** / 0 / 110 / 0 — `ls_hiYa` "o (dişil zamir)" parantez atılınca "o" = referans |
| düzeltme `o, dişil zamir` | 1 | 0 | 727 / 0 / 0 / 110 / 0 |
| `ls_` kalan 78 | 78 | 0 | 805 / 0 / 0 / 32 / 0 |
| `lp_` (Diyanet dua kelimeleri) | 32 | 0 | **837** / 0 / 0 / **0** / 0 |

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_surah_import.js` | 0 | PASS |
| Satır diff (HEAD ↔ çalışma), ilk 6 araç sütunu | — | hepsi aynı; değişen 219, hepsi Parti D |
| Tüm katman: >5 kelime · boş `tr` · doğrulayıcı/tarih | — | 0 · 0 · tek `claude-opus-5.5` / `2026-09-26` |

**FIX-04 ön koşulu sağlandı:** `filled=837, missing=0, copy=0, language=0`.

**Yöntem:** Fâtiha bağlam anlamı (A–C ile aynı: `Allah Teâlâ`, `hesap`; `Rahmân`/`Rahîm`/`âlemlerin` Diyanet imlâsı). Tamamlayıcı sözlükte **lemmanın sözlük anlamı**, bağlam çekimi değil (kural 1; sözlük biçimi "a, b"): `incir`, `kalem`, `sabır`, `kış mevsimi`. `lp_` satırlarında quran.com referansı yok (kopya denetimi yok); koddaki Diyanet anlamı tekrarlanmadı, sözlük anlamı yazıldı. Arapça hücrelere dokunulmadı.

## Öz-denetim örneği (ilk 5 + tohumlu rastgele 5, `random.seed(20260926)`)
| id | ar | okunuş | tr |
|---|---|---|---|
| f-1-1-1 | بِسْمِ | bi-smi | ismiyle |
| f-1-1-2 | ٱللَّهِ | allahi | Allah Teâlâ'nın |
| f-1-1-3 | ٱلرَّحْمَـٰنِ | al-rahmâni | Rahmân |
| f-1-1-4 | ٱلرَّحِيمِ | al-rahîmi | Rahîm |
| f-1-2-1 | ٱلْحَمْدُ | al-hamdu | hamd |
| f-1-7-4 | عَلَيْهِمْ | ʿalayhim | onlara |
| f-1-5-4 | نَسْتَعِينُ | nastaʿînu | yardım dileriz |
| f-1-3-2 | ٱلرَّحِيمِ | al-rahîmi | Rahîm |
| ls_juwE_0d57cbb2 | جُوع | — | açlık |
| ls_hiYa_874e9600 | هِىَ | — | o, dişil zamir |

**Kalan risk:** anlam doğrulaması YZ (D-12); insan/cihaz kabulü yok. `ls_` Arapçası bağlam şeddesi taşır (ör. `تِّين`) — FIX-05.
