# KAO-FIX-03/C · Kanıt (K-1, Y-3 — içerik, Parti C: Kureyş–Nâs, 106–114)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Doğrulayıcı:** `claude-opus-5.5` (D-12 YZ doğrulaması) · **Kanıt düzeyi:** kaynak/test

## Sûre sûre içe alma (`node tools/kao-content-freeze.mjs --surah-import`)
| Sûre | Satır | Exit | filled / copy / language / missing / invalid |
|---|---|---|---|
| 106 Kureyş | 17 | 0 | 457 / 0 / 0 / 380 / 0 |
| 107 Mâûn | 25 | 0 | 482 / 0 / 0 / 355 / 0 |
| 108 Kevser | 10 | 0 | 492 / 0 / 0 / 345 / 0 |
| 109 Kâfirûn | 26 | 0 | 518 / 0 / 0 / 319 / 0 |
| 110 Nasr | 19 | 0 | 537 / 0 / 0 / 300 / 0 |
| 111 Tebbet | 23 | 0 | 560 / 0 / 0 / 277 / 0 |
| 112 İhlâs | 15 | 0 | 575 / 0 / 0 / 262 / 0 |
| 113 Felak | 23 | 0 | 598 / 0 / 0 / 239 / 0 |
| 114 Nâs | 20 | 0 | **618** / 0 / 0 / 219 / 0 |

## Kontroller
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_surah_import.js` | 0 | PASS |
| Satır diff (HEAD ↔ çalışma), ilk 6 araç sütunu | — | hepsi aynı; değişen 178, hepsi Parti C; verified 618, boş 219 = Parti D |

**Yöntem:** A/B ile aynı (tuzak 11): `Allah Teâlâ`, `insanoğulları`, `bölük bölük`, `hesap gününü`; `Rabbine`↔`Rabbi olana` (Felak/Nâs), `Ebû`/`Leheb`, `Samed`, `Kevser`. Tefsir parantezi yok; Arapça hücrelere dokunulmadı.

## Öz-denetim örneği (ilk 5 + tohumlu rastgele 5, `random.seed(20260926)`)
| id | ar | okunuş | tr |
|---|---|---|---|
| s-106-1-1 | لِإِيلَـٰفِ | li-îlâfi | kaynaşması sebebiyle |
| s-106-1-2 | قُرَيْشٍ | kurayşin | Kureyş'in |
| s-106-2-1 | إِۦلَـٰفِهِمْ | ilâfihim | onların kaynaşması |
| s-106-2-2 | رِحْلَةَ | rihleta | seferine |
| s-106-2-3 | ٱلشِّتَآءِ | al-şitâ'i | kışın |
| s-107-2-3 | يَدُعُّ | yaduʿʿu | sertçe iter |
| s-106-4-7 | خَوْفٍۭ | havfin | korku |
| s-106-3-4 | ٱلْبَيْتِ | al-bayti | Beyt'in |
| s-113-5-3 | حَاسِدٍ | hâsidin | kıskancın |
| s-109-3-5 | أَعْبُدُ | aʿbudu | taptığım |

**Yayın notu:** FIX-03/B sonrası kullanıcı onayıyla `main` `58e0ceb..9fa910a` fast-forward; Pages run `36247414265` success; canlı pin `20260926b` (arayüz değişmedi); `kuran-ogreniyorum/` Pages'ten dışlı (404, beklenen). **Kalan risk:** anlam doğrulaması YZ (D-12); insan/cihaz kabulü yok.
