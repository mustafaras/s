# KAO · Güncel durum (üretilmiş dosya — elle düzenleme; `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`)

**Güncelleme:** 2026-09-24 · **Durum:** `in_progress` · **Sürüm:** plan-v4 · **Tamamlanan kart:** 11/30
**activePrompt:** — · **lastCompletedPrompt:** KAO-08 · **blockedPrompt:** — · **Sıradaki:** **KAO-09**
**releaseApproval:** APPROVED · **Baseline:** 0436405 (main)

## Açık kararlar
- (yok)

## Prompt sırası ve durum
| Prompt | Başlık | Durum | Gereksinimler |
|---|---|---|---|
| KAO-P00 | Başlangıç (branch, tests/kao iskeleti, plan-check) | done | — |
| KAO-01 | Sözlük derleme aracı (ağsız) | done | — |
| KAO-25 | Plan denetleyici (kao-plan-check) sertleştirme | done | — |
| KAO-02 | Aday liste, kognat/komşu önerisi, inceleme tablosu | done | R-A5 R-A8 |
| KAO-03 | Yapay zekâ doğrulaması ve içe alma (D-12) | done | R-A8 |
| KAO-04 | Gramer içeriği (24 mikro-kavram + G0.5) | done | R-A7 R-A8 |
| KAO-23 | Fonetik içeriği + mahreç SVG | done | R-B6 R-A9 |
| KAO-24 | Ses varlık hattı (alt küme + AAC) | done | R-C2 |
| KAO-05 | quranLexiconV1.js dondurma + 4 yükleme listesi | done | — |
| KAO-06 | quranGrammarV1 + quranShortSurahsV1 + quranPhonicsV1 (+prayerTexts) | done | R-A6 R-B2 |
| KAO-07 | Registry iskeleti + ensureQuranLearn + migrate kancası | done | R-C7 |
| KAO-08 | FSRS saf JS portu | done | R-A3 |
| KAO-09 | Kuyruk, görev üretici, çeldirici, gece tekrarı | pending | R-A1 R-A2 R-A5 |
| KAO-10 | Overlay kabuğu + E1 Home + geçici Ayarlar girişi | pending | — |
| KAO-11 | E2 oturum çekirdeği: anlam seç / Arapça seç, ses düğmesi, geri al | pending | R-A4 R-B7 R-B8 R-C2 R-C3 R-C5 |
| KAO-12 | E2 gramer görevleri | pending | — |
| KAO-13 | E2 parça görevleri + E3 Done + kalibrasyon kaydı | pending | R-A3 R-A7 R-B4 |
| KAO-14 | E4 Üniteler + E5 Kelime (üç dokunuş, kök ağacı, bayrak) | pending | R-A8 R-B3 R-B7 R-C1 |
| KAO-15 | Seviye 0 kapısı (harf–ses–hareke) + renkli hareke | pending | R-A9 |
| KAO-16 | E6 Okuyucu (20 kısa sûre) + vakıf noktaları + gecikmeli test kaydı | pending | R-A6 R-C6 |
| KAO-17 | E7 Ayarlar + ses stili + soldurma + CSV | pending | R-A4 R-A9 R-B5 R-B8 R-C4 |
| KAO-26 | E8 Telaffuz stüdyosu | pending | R-B6 R-C2 |
| KAO-27 | Gölgeleme (bellek-içi kayıt) | pending | — |
| KAO-28 | E9 Anlayabildiğin âyet | pending | — |
| KAO-28b | E10 Mushaf ısı haritası + gecikmeli sûre testi | pending | R-B1 R-C6 |
| KAO-16b | E11 Namazda ne diyorum | pending | R-B2 |
| KAO-18 | Kontrast ve erişilebilirlik ölçümü | pending | R-A9 |
| KAO-19 | Panel aynası (manifest + özet projeksiyon) | pending | R-C1 R-C8 |
| KAO-20 | Tam regresyon + kullanıcı görevleri + kalibrasyon raporu | pending | R-A1 R-A3 R-C5 R-C9 |
| KAO-21 | Hub kartı bileşimi + köprüler (IIP koordineli) | pending | — |
| KAO-22 | Kapanış belgesi | pending | R-C9 |
| KAO-D1 | Dalga 1 denetimi | pending | — |
| KAO-D2 | Dalga 2 denetimi | pending | — |
| KAO-D3 | Dalga 3 denetimi | pending | — |
| KAO-D4 | Dalga 4 denetimi | pending | — |
| KAO-D5 | Dalga 5 denetimi | pending | — |
| KAO-D6 | Dalga 6 denetimi | pending | — |

## Gereksinim durumu (12-EK-GEREKSINIMLER)
R-A1:pending · R-A2:pending · R-A3:partial · R-A4:pending · R-A5:pending · R-A6:partial · R-A7:partial · R-A8:partial · R-A9:partial · R-B1:pending · R-B2:partial · R-B3:pending · R-B4:pending · R-B5:pending · R-B6:partial · R-B7:pending · R-B8:pending · R-C1:pending · R-C2:partial · R-C3:pending · R-C4:pending · R-C5:pending · R-C6:pending · R-C7:done · R-C8:pending · R-C9:pending

## Son ledger satırı
| 52 | 2026-09-24 | KAO-08 bitti: `ts-fsrs@4.5.2` BasicScheduler davranışı 19 sabit parametre ve hedef R=0,90 ile saf JS'e taşındı; otomatik Again/Hard/Good/Easy eşlemesi ve kalibrasyon için `predictedR` eklendi. | 24 yayımlanmış vektör ±1e-6 PASS; monotonluk/grade/predictedR PASS; npm MIT/gitHead ve git tag eşit; `evidence/KAO-08/EVIDENCE.json` |
