# KAO-FIX-05 · Kanıt (Y-4 başlık bağlam şeddesi, D-6)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** kaynak/test (yayın yok, cihaz yok)

## Kırmızı → yeşil
| Komut | Exit | Sonuç |
|---|---|---|
| `node tests/kao/test_kao_lexicon_contract.js` (önce) | 1 | başlık ilk harf kümesinde şedde: sözlük 26 (+ tamamlayıcı 17); DİA çift ünsüz 26 |
| `headwordBw` + `HEADWORD_NOTES` + `headwordFields`/`withHeadword` (`buildDraft` ve `readDraft`); `--rehead`; self-test 4 vaka; `kao-content-freeze` tamamlayıcı `ar` | — | `node --check` 0 · `--self-test` 0 |
| `--rehead` → `--import-md` → `--freeze` → `JSON_SHA256` (`lexicon.verified.json`=`1b87b5…`) → `--freeze-surahs` | 0 (hepsi) | rehead 26 satır (2. koşu 0); import yalnız 26 lemma: `ar/translit/verifiedAt/approval` (+ 1 `headwordNote`) |
| `node tests/kao/test_kao_lexicon_contract.js` (sonra) | 0 | şeddeli başlık 0 · çift ünsüzlü okunuş 0 · `{ll~ah` iç şeddesi korunur |

`--draft` koşulmadı: `evidence/KAO-02/draft-report.json`'a yazar (V8). Bayat taslak `readDraft` normalizasyonu ile zararsız.

## D-12 yeniden doğrulama (26 satır, gözle)
Hepsinde yalnız ilk harf şeddesi kalktı; iç şedde korundu (`مَيِّت`, `نَبِىّ`, `مُكَذِّبِين`, `مُسَمًّى`, `نَفَّٰثَٰت`). DİA: `rraḥīm→raḥīm`, `nnās→nās`, `ṣṣamad→ṣamad` …; `tr1` değişmedi; `verifiedAt` 2026-09-26.

## `m~a$a` (`l_m_a_a_fb0e46`) — karar bekliyor
`grep 'ROOT:m\$y' … | grep -o 'LEM:[^|]*' | sort | uniq -c` → `21 m~a$a · 1 ma$oy · 1 m~a$~aA^'`. `m~a$aY`/`ma$aY` **yok** → başlık `مَشَ` (şeddesiz, son harf kesik) kaldı, `headwordNote:'QAC lemma biçimi kesik; sözlük biçimi korpusta yok'`. Arapça tamamlanmadı (V3). Kullanıcıya soruldu.

## D-6 · `l_bad_ala_16265e` 2:181
Örnek `ar` 5 belirteç, okunuş 4. QAC 2:181:3 = `baEoda`+`maA` **tek kelime** (iki STEM); Tanzil `بَعْدَ مَا` iki belirteç → okunuş `baʿdamâ`. 1.563 örnekte tek uyuşmazlık. **Belgeli istisna** (korpus kelime sınırı ≠ Tanzil yazımı); araç değişmedi.

## Kabul + kontroller
| Ölçü / komut | Sonuç |
|---|---|
| Şeddeli başlık (sözlük · tamamlayıcı) | 26 → **0** · 17 → **0** |
| DİA/TR çift ünsüzle başlayan | 26 → **0** |
| `ٱللَّه` | değişmedi |
| Sözlük boyutu | 320.159 bayt (≤340 KB) |
| Kısa sûre: words/prayer/vakıf/tamamlayıcı tr | değişmedi (yalnız 17 tamamlayıcı `ar`) |
| PIN-P `20260926c`→`20260926d` (9 dosya, SW iki sürüm) | eski pin 0 · phonics `20260924b` aynı |
| app 77/77 · kao 16/16 · panel 23/23 · panel-v2 27/27 · quran 9/9 | exit 0 |
| driver · zikr 95/95 · rebind · shell · kao-plan-check · diff --check · self-test · repro | exit 0 (plan 1 warn, taban) |
| requirements (DİA 524/524) · fixture-map `--json` ↔ dosya | PASS · aynı |

**Ek (kullanıcı: "her şeyi düzelt"):** `headwordAr` (524/524 `headwordBw` ile denk, self-test) → `family` 286 şeddeli girdi 0; family↔sözlük başlık tutarlılığı testte. `--workbook` yeniden üretildi: 26 başlık + KAO-03'ten bayat `yarcûâ`→`yarcû` (verified ile hizalı). Modüller bayt-eş (pin gerekmedi); `JSON_SHA256` lexicon=`071ea7…`. Contract önce kırmızı → PASS; app 77/77, kao, STD, self-test, repro exit 0.
