# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-01
lastSeq: 8
status: blocked
-->

Son güncelleme: 2026-09-28 · LEDGER seq 8

## Şu an neredeyiz
KAO2-00 done, KAO2-01 BLOCKED. Dal kao2-yeniden-tasarim; başlangıç f09987f5. Taban, kaynak ölçümleri ve 24 HTML üretildi; P3 163 komut PASS. 08 §7 eski plan kapısı KAO2 commit öneklerini reddettiği için kart kapanmadı.

## Sıradaki kartın tek cümlesi
KAO2-01: eski denetleyici için kapsam onayı sonrası önek uyumunu düzelt, kapıları doğrula ve kartı kapat; KAO2-02'ye geçme.

## Canlı gerçekler
- Taban: evidence/KAO2-01/perf-baseline.json; Node v26.3.1, p95 5,087625 ms; relatif tavan +%25.
- İçerik 162173 B, runtime 50221 B, CSS 7051 B gzip.
- 22 boş/tohumlu dialog + izole hub + driver saygi sekmesi =24 HTML; sabit saat ve sentetik veri; görsel cihaz kanıtı değil.
- Runtime 1899 satır; CSS 93 satır, 9 farklı font-weight; CSS link seçici 2, runtime sınıf metni 13; KAO handler 35.
- P3: KAO18/app77/panel23/panel-v2 27/quran9 PASS; reminder/driver/zikr/kontrast PASS.
- Eski kao-plan-check: a47a68f ve f09987f öneklerinde 2 FAIL. Üretim/pin/diğer testlerde değişiklik yok.

## Açık riskler
KAO2-01'in izinli dosyaları eski denetleyiciyi kapsamıyor. Perf tabanı wx korumalı; sonraki kartlar tabanı sessizce değiştiremez. HTML dökümleri screenshot değildir; ikonlar özel VM'de stub.

## Bekleyen kullanıcı işleri
- docs/kuran-ogreniyorum/tools/kao-plan-check.mjs içinde KAO2 kart öneklerini tanıma için sınırlı kapsam onayı.
- Önceki Ausubel birincil teyit uyarısı ve sonraki K-3/G2/G3/L2 kararları aynen açık.
