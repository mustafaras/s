# KAO · Güncel durum (üretilmiş dosya — elle düzenleme; `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`)

**Güncelleme:** 2026-09-25 · **Durum:** `in_progress` · **Sürüm:** plan-v4 · **Tamamlanan kart:** 23/30
**activePrompt:** — · **lastCompletedPrompt:** KAO-28 · **blockedPrompt:** — · **Sıradaki:** **KAO-28b**
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
| KAO-09 | Kuyruk, görev üretici, çeldirici, gece tekrarı | done | R-A1 R-A2 R-A5 |
| KAO-10 | Overlay kabuğu + E1 Home + geçici Ayarlar girişi | done | — |
| KAO-11 | E2 oturum çekirdeği: anlam seç / Arapça seç, ses düğmesi, geri al | done | R-A4 R-B7 R-B8 R-C2 R-C3 R-C5 |
| KAO-12 | E2 gramer görevleri | done | — |
| KAO-13 | E2 parça görevleri + E3 Done + kalibrasyon kaydı | done | R-A3 R-A7 R-B4 |
| KAO-14 | E4 Üniteler + E5 Kelime (üç dokunuş, kök ağacı, bayrak) | done | R-A8 R-B3 R-B7 R-C1 |
| KAO-15 | Seviye 0 kapısı (harf–ses–hareke) + renkli hareke | done | R-A9 |
| KAO-16 | E6 Okuyucu (20 kısa sûre) + vakıf noktaları + gecikmeli test kaydı | done | R-A6 R-C6 |
| KAO-17 | E7 Ayarlar + ses stili + soldurma + CSV | done | R-A4 R-A9 R-B5 R-B8 R-C4 |
| KAO-26 | E8 Telaffuz stüdyosu | done | R-B6 R-C2 |
| KAO-27 | Gölgeleme (bellek-içi kayıt) | done | — |
| KAO-28 | E9 Anlayabildiğin âyet | done | — |
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
R-A1:partial · R-A2:done · R-A3:partial · R-A4:partial · R-A5:done · R-A6:done · R-A7:partial · R-A8:done · R-A9:partial · R-B1:pending · R-B2:partial · R-B3:done · R-B4:pending · R-B5:pending · R-B6:partial · R-B7:done · R-B8:partial · R-C1:pending · R-C2:partial · R-C3:done · R-C4:pending · R-C5:partial · R-C6:partial · R-C7:done · R-C8:pending · R-C9:pending

## Son ledger satırı
| 84 | 2026-09-25 | KAO-28 bitti: E9 günün âyeti (≥%95, görülmemiş önce, gün boyu sabit), kelime kelime ses + Türkçe, Anladım (tekil, ≤400), E1/hub satırı; ortak kaoCoverage/kaoKnownLemmaSet; E1 yüzdesi token kapsamına düzeltildi; önbellek 20260925g; App pini 751/589. | `evidence/KAO-28/EVIDENCE.json`; tam regresyon 120/120 PASS |
