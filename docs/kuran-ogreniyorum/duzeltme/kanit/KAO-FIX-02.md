# KAO-FIX-02 · Kanıt (bulgu K-1, Y-3 — araç kısmı)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (yayın yok, cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_surah_import.js` (önce) | 1 | `validateSurahRow dışa aktarılmalı` |
| `freezeSurahs`→`collectSurahs()` ayrımı + 4 dışa aktarım + 2 alt komut + `IS_MAIN`; `test_kao_freeze_repro.js` | 0 | 4 modül bayt-eş |
| `node tests/kao/test_kao_surah_import.js` (sonra) | 0 | PASS: (a) missing (b) copy, parantez iki biçimi (c) language, tam kelime (d) verifiedBy/verifiedAt (e) geçerli + tablo gidiş-dönüşü, yineleme, bilinmeyen kimlik |

## Çalışma kitabı ve içe alma
| Komut | Exit | Sonuç |
|---|---|---|
| `node tools/kao-content-freeze.mjs --surah-workbook` | 0 | 837 satır: A 230 · B 210 · C 178 · D 219 (29 Fâtiha + 158 `ls_` + 32 `lp_`) |
| `node tools/kao-content-freeze.mjs --surah-import` | 0 | `{"total":837,"filled":0,"copy":0,"language":0,"missing":837,"invalid":0}` |
| Geçici kopyada: workbook ×2, import ×2 | 0 | ikisi de idempotent (`importedAt` korunur) |
| Geçici kopyada: 1 geçerli + 1 İngilizce satır | 1 | `filled 1, language 1`; yeniden üretim iki dolu satırı da korur |
| `node tools/kao-content-freeze.mjs` (argümansız) · `--part X` | 64 · 1 | kullanım · `--part A\|B\|C\|D olmalı` |
| Kabul ölçümünde üretilen `surahs.verified.json` | — | izinli değil → silindi (FIX-03 doğurur) |

## Kontroller (STD Ö4 + prompt)
| Komut | Exit | Sonuç |
|---|---|---|
| `for f in tests/kao/*.js` (16 dosya) | 0 | FAIL yok |
| driver · zikr · rebind · shell-inventory · kao-plan-check · diff --check | 0 (hepsi) | zikr 95/95, plan 1 warn (taban) |
| `tests/app` + `tests/quran` | 0 | 86/86 |
| `git diff --stat app/content` · `fixture-map-build --write` | — · 0 | boş · harita değişmedi (tuzak 8) |

## Plan sapmaları (gerekçeli)
- Parti D tamamlayıcıları yalnız `ls_` değil; 32 `lp_` (Diyanet dua anlamı) de var. 837 ve FIX-04 `filled=837` ancak böyle tutar. `lp_` için quran.com referansı yok → kopya denetimi atlanır, ipucu Diyanet anlamıdır.
- `counts`'a `invalid` eklendi (dolu ama doğrulayıcı/tarih/biçim hatalı); exit 1 verir. Beş zorunlu anahtar aynen var.
- `--part` dosyayı daraltmaz (doldurulmuş satır silinmez kuralı); yalnız o partinin özetini basar.
- 24 karakterden kısa referanslarda ipucu tam metni gösterir (plan kuralı); kopya bekçisi bunu yakalar.

## Değişen dosyalar
`tools/kao-content-freeze.mjs`, `tests/kao/test_kao_surah_import.js` (yeni), `tests/kao/README.md` (+1), `kuran-ogreniyorum/content/surahs.review.md` (yeni, üretilmiş), `kuran-ogreniyorum/duzeltme/**`

## Kalan risk
- `his` Türkçede de kelime ("his" = duygu); plan listesi aynen uygulandı, FIX-03'te yanlış pozitif çıkarsa not edilmeli. `ls_` Arapçası bağlam şeddesi taşır (ör. `تِّين`) — FIX-05 kapsamı (tuzak 5).
