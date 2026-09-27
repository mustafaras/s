# KAO-FIX-19 · Kanıt (kapanış regresyonu ve yeniden denetim)

**Tarih:** 2026-09-27 · **Dal:** `kao-duzeltme` · **Taban:** HEAD `3cc9ffb` (FIX-26) · **Kanıt düzeyi:** kaynak/test (yayın ve cihaz kabulü ayrı)
**Kod değişmedi.** İzinli yazımlar: bu kanıt, `deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md` (§8 eki), `duzeltme/.anti-amnesia/*`. Taban kasıtlı `3cc9ffb` (FIX-19 "FIX-20…26'dan sonra" koşar).

## Kırmızı → yeşil
Kod değişmediği için kırmızı test yok. Denetim "önce" tabanı: TAM 86 · TESTSİZ 4 · KISMİ 31 · EKSİK 10 · ÇELİŞKİLİ 2 · KULLANICI-KARARI 9 · ATLANDI 3 (145).

## Adım komutları
| # | Komut | Exit | Sonuç |
|---|---|---|---|
| 1 | `for d in kao app panel panel-v2 quran; …` + reminder smoke | 0 | kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminder 21 PASS |
| 2 | STD (Ö4) + `kao-verify-contrast` | 0 (hepsi) | driver 0 · zikr 95/95 · rebind 0 · shell PASS (7.800 tavan, 7.603 ölçüm) · plan-check PASS (6 warn) · 336/336 kontrast 0 altında · diff-check ok |
| 3 | `test_kao_user_tasks.js --report` | 0 | içerik gzip **162.177 B** / tavan 163.840 (`overBudget:false`), geçiş bütçesi 50 ms |
| 4 | `kao-sim.js "$PWD" 365 0.9` | 0 | `lemmasBothDirections/lemmasSeen = 524/524 = 1,0` · `knownByCode = knownByPlanDefinition = 513` · `maxSameTypeRun 2` · `grammarMax 4` · `errorCount 0` · taşlar 5/6 · 365. gün **471,9 KB** (KF-10: sınır yok) |
| 5 | `kao-content-check.js "$PWD" 20260926` | 0 | Tanzil 6236 · QAC 6236 · sûre **618/618** Tanzil'de · frekans 518/524 QAC ile eşit (6 homograf) |
| 5b | `test_kao_lexicon_contract.js` | 0 | PASS (524 lemma, 324.328 B) — kopya 0 · İngilizce 0 · şeddeli başlık 0 · DİA çift ünsüz 0 · `{ll~ah` iç şeddesi korunur |
| 6 | `kao-ui-probe.js "$PWD"` | 0 | 15 görünüm × (boş · 60 gün) sorunsuz; 5 migrate vakası idempotent; snapshot 5.074 B **sızıntı yok** |
| 7 | `kao-mutate.mjs` (kopya `$TMPDIR/kao-mut-19`) | 0 | **17/17 YAKALANDI** (M04, M09, M16, M17 dâhil) |
| 8 | `test_kao_freeze_repro.js` | 0 | 4 modül bayt-eş |

## Taşlar (sim) ve bütçe
`fatiha · namaz · half · twoThirds · eighty` kazanıldı; `shortSurahs` null **beklenen** (koşul ≥20 onaylı kısa sûre, gecikmeli yol `quranLearn.js:937`; sim tetiklemez) — O-3 kapandı.
KF-2: quranLearn 1.899/1.900 satır · kao.css 40.209/43.008 B · sözlük 324.328/348.160 B · içerik ham 472.696/491.520 B · gzip 162.177/163.840 B — hepsi tavan içinde (satır payı 1).

## Matris geçişi (145 satır)
| Durum | Önce | Sonra |
|---|---|---|
| TAM | 86 | **121** |
| KISMİ | 31 | 9 |
| EKSİK | 10 | **0** |
| ÇELİŞKİLİ | 2 | **0** |
| TESTSİZ | 4 | 1 |
| KULLANICI-KARARI | 9 | 11 |
| ATLANDI-GEREKÇELİ | 3 | 3 |

K-1, Y-1…Y-4 kapandı. ORTA bulguların tamamı kapandı ya da gerekçeli/kullanıcı kararı (O-2/KF-10, O-8/FIX-16, O-9 cihaz bekliyor).

## Kalan açık (kırmızı değil)
- **DOC03-§9** global %80 token kapsamı: 524 lemmanın tavanı %77,42; `eighty` KF-12 ile %75 → global hedef **içerik genişletme** ister (sonraki program).
- **TESTSİZ 1:** `DOC06-ilke` — Tanzil karşılaştırma fixture'ı yok (girdiler repoda değil).
- **KISMİ 9:** DOC03-§9, DOC04-§4b (cihaz), DOC05-§2b, DOC06-§2b (D-3), C-02 (6 homograf), C-05 (belgeli), S7 (geçmiş), D-02, DOCS (KAPANIŞ §8 V8).
- **Cihaz kabulü (yalnız kullanıcı):** O-9 Arapça yazı tipi, R-C9b (≤90 sn), DOC04-§4f (%200/320 px), VoiceOver.

## Değişen dosyalar
`deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md` (yalnız §8 eki), `duzeltme/kanit/KAO-FIX-19.md`, `duzeltme/.anti-amnesia/{LEDGER,CURRENT-STATE}.md`. Pin `20260927g` sabit (kod değişmedi).
