# KAO · Güncel durum (üretilmiş dosya — elle düzenleme; `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render`)

**Güncelleme:** 2026-09-23 · **Durum:** `in_progress` · **Sürüm:** plan-v4 · **Tamamlanan kart:** 3/30
**activePrompt:** — · **lastCompletedPrompt:** KAO-02 · **blockedPrompt:** — · **Sıradaki:** **KAO-03**
**releaseApproval:** NOT_APPROVED · **Baseline:** 0436405 (main)

## Açık kararlar
- **D-01** — QAC (GPL) verisinden türetilmiş sıklık/kök etiketleri + atıf
- **D-02** — Tanzil metni kesitleri (CC BY 3.0) + âyet referansı + link
- **D-11** — Hedef kapsam %80: ölçüm 503 adayla LEM havuzunun %78.7'si; içerik sıra eşiğini 500→600 yükseltmek hedefi tutturur (rapor: coverage.alternatives) _(öneri: eşiği yükseltme kararı kullanıcıya bırakıldı; araç kendi kendine değiştirmez)_
- **D-03** — KAO stili ayrı app/kao.css (IIP ile çakışmasız) mı, styles.css bloğu mu _(öneri: app/kao.css (IIP sürerken))_
- **D-04** — FSRS saf JS portu, ts-fsrs MIT atıfı
- **D-05** — Repo LICENSE kararı; lexicon public push öncesi
- **D-06** — Geçici giriş Ayarlar satırı; kalıcı giriş hub kartı (Dalga 5, IIP koordinasyonu)
- **D-07** — Seviye 6 (tam Kur'an kelime kelime, ~3 MB) bu programın dışında _(öneri: dışarıda)_
- **D-08** — Ses veri seti köken/lisans doğrulaması (HF zaibihassan Apache 2.0, okuyucu kökeni belirsiz) — yayına girmeden önce
- **D-09** — Ses klipleri repo içinde (~16 MB, assets/kao/audio) mi, ayrı public depo/CDN mi (yine salt-GET) _(öneri: repo içinde alt küme; büyürse ayrı depo)_
- **D-10** — Gölgeleme için mikrofon: bellek-içi kayıt, izin metni; kullanıcı istemezse özellik tamamen kapalı _(öneri: açık, varsayılan kapalı ayar)_

## Prompt sırası ve durum
| Prompt | Başlık | Durum | Gereksinimler |
|---|---|---|---|
| KAO-P00 | Başlangıç (branch, tests/kao iskeleti, plan-check) | done | — |
| KAO-01 | Sözlük derleme aracı (ağsız) | done | — |
| KAO-25 | Plan denetleyici (kao-plan-check) sertleştirme | done | — |
| KAO-02 | Aday liste, kognat/komşu önerisi, inceleme tablosu | done | R-A5 R-A8 |
| KAO-03 | İnsan doğrulaması (kullanıcı görevi) ve içe alma | pending | R-A8 |
| KAO-04 | Gramer içeriği (24 mikro-kavram + G0.5) | pending | R-A7 R-A8 |
| KAO-23 | Fonetik içeriği + mahreç SVG | pending | R-B6 R-A9 |
| KAO-24 | Ses varlık hattı (alt küme + AAC) | pending | R-C2 |
| KAO-05 | quranLexiconV1.js dondurma + 4 yükleme listesi | pending | — |
| KAO-06 | quranGrammarV1 + quranShortSurahsV1 + quranPhonicsV1 (+prayerTexts) | pending | R-A6 R-B2 |
| KAO-07 | Registry iskeleti + ensureQuranLearn + migrate kancası | pending | R-C7 |
| KAO-08 | FSRS saf JS portu | pending | R-A3 |
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
R-A1:pending · R-A2:pending · R-A3:pending · R-A4:pending · R-A5:pending · R-A6:pending · R-A7:pending · R-A8:pending · R-A9:pending · R-B1:pending · R-B2:pending · R-B3:pending · R-B4:pending · R-B5:pending · R-B6:pending · R-B7:pending · R-B8:pending · R-C1:pending · R-C2:pending · R-C3:pending · R-C4:pending · R-C5:pending · R-C6:pending · R-C7:pending · R-C8:pending · R-C9:pending

## Son ledger satırı
| 14 | 2026-09-23 | KAO-25 tamamlandı: 13 gömülü self-test ayrı test dosyasına taşındı, IIP kapsam ihlali / `SeyAudio.say` / prompt sırası için 3 regresyon eklendi; kapsam ihlali artık izinli desenleri açıklıyor; `--card` bağımlılık ve kapı durumundan `startable` üretiyor. | self-test 16/16 PASS; `--card KAO-02`: KAO-01 done, gate approved, `startable=true`; `evidence/KAO-25/EVIDENCE.json` |
