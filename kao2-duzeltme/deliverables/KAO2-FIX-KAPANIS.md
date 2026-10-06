# KAO2-FIX — Kapanış belgesi (K2F-42)

Tarih: 2026-10-06 · Kaynak: `FIX-STATE.json`, `evidence/K2F-*/KANIT.md`, `denetim/KUSUR-RAPORU.md`.
Bu belge **kanıt düzeylerini ayırır**: kaynak/test · yayın · cihaz. "Cihazda düzeldi" ifadesi yalnız kullanıcı bildirimiyle yazılır; şu an hiçbir madde için yoktur.

## 1. Özet
- 49 bulgunun 49'u bir prompta eşlendi ve kaynak/test düzeyinde kapatıldı (aşağıdaki tablo; eşleme `PROMPTLAR.md` §3).
- `tekrar-uret.cjs`: **10/10 PASS** (başlangıç 0/10; R-01…R-10 kalıcı: `tests/kao/test_kao2_denetim.js`).
- Kabul A-1…A-10: gerçek handler/render/alt süreç ölçümüyle PASS (K2F-36). A-11/A-12 cihazda/kullanıcıdadır.
- Pinler: App.kao* 45 · App yüzeyi 766 · atama 604 · `onclick` 393. Bütçe: runtime ≤128 KiB, css ≤14 KiB (güncel ölçüm CURRENT-STATE "Canlı gerçekler").

## 2. Kanıt düzeyleri
| Düzey | Durum |
|---|---|
| Kaynak/test | Tüm 49 bulgu ✓ (K2F-00…41 KANIT.md; kapılar eşdeğer paralel koşuyla geçti, `kapilar.sh` bu konteynerde tamamlanmadı) |
| Yayın | K2F-18 … K2F-39 canlıda (son: pin 20261006d, run 37498517193 success); K2F-40/41/42 K2F-43'te. Canlı bayt eşitliği kullanıcı terminalinde (github.io konteynerden engelli) |
| Cihaz | Hiçbir madde cihazda doğrulanmadı |

## 3. Bulgu → prompt → kanıt (49/49)
| Bulgu | Prompt | KANIT |
|---|---|---|
| K2-01 | K2F-27 | [27](../evidence/K2F-27/KANIT.md) |
| K2-02 | K2F-29 | [29](../evidence/K2F-29/KANIT.md) |
| K2-03 | K2F-40 | [40](../evidence/K2F-40/KANIT.md) |
| K2-04 | K2F-36 | [36](../evidence/K2F-36/KANIT.md) |
| K2-05 | K2F-36, 37 | [36](../evidence/K2F-36/KANIT.md), [37](../evidence/K2F-37/KANIT.md) |
| K2-06 | K2F-30 | [30](../evidence/K2F-30/KANIT.md) |
| K2-07 | K2F-27, 39 | [27](../evidence/K2F-27/KANIT.md), [39](../evidence/K2F-39/KANIT.md) |
| K3-01 | K2F-23 | [23](../evidence/K2F-23/KANIT.md) |
| K3-02 | K2F-24 | [24](../evidence/K2F-24/KANIT.md) |
| K3-03 | K2F-31 | [31](../evidence/K2F-31/KANIT.md) |
| K3-04 | K2F-39 | [39](../evidence/K2F-39/KANIT.md) |
| K3-05 | K2F-16 | [16](../evidence/K2F-16/KANIT.md) |
| K3-06 | K2F-16 | [16](../evidence/K2F-16/KANIT.md) |
| K3-07 | K2F-20, 41 | [20](../evidence/K2F-20/KANIT.md), [41](../evidence/K2F-41/KANIT.md) |
| K3-08 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| K3-09 | K2F-31, 35 | [31](../evidence/K2F-31/KANIT.md), [35](../evidence/K2F-35/KANIT.md) |
| K4-01 | K2F-05…08 | [05](../evidence/K2F-05/KANIT.md), [06](../evidence/K2F-06/KANIT.md), [07](../evidence/K2F-07/KANIT.md), [08](../evidence/K2F-08/KANIT.md) |
| K4-02 | K2F-09…11 | [09](../evidence/K2F-09/KANIT.md), [10](../evidence/K2F-10/KANIT.md), [11](../evidence/K2F-11/KANIT.md) |
| K4-03 | K2F-28 | [28](../evidence/K2F-28/KANIT.md) |
| K4-04 | K2F-11, 35 | [11](../evidence/K2F-11/KANIT.md), [35](../evidence/K2F-35/KANIT.md) |
| K5-01 | K2F-15 | [15](../evidence/K2F-15/KANIT.md) |
| K5-02 | K2F-12…14 (+15) | [12](../evidence/K2F-12/KANIT.md), [13](../evidence/K2F-13/KANIT.md), [14](../evidence/K2F-14/KANIT.md) |
| K5-03 | K2F-19…21 | [19](../evidence/K2F-19/KANIT.md), [20](../evidence/K2F-20/KANIT.md), [21](../evidence/K2F-21/KANIT.md) |
| K5-04 | K2F-21, 22 | [21](../evidence/K2F-21/KANIT.md), [22](../evidence/K2F-22/KANIT.md) |
| K5-05 | K2F-25 | [25](../evidence/K2F-25/KANIT.md) |
| K5-06 | K2F-34 | [34](../evidence/K2F-34/KANIT.md) |
| K6-01 | K2F-36 | [36](../evidence/K2F-36/KANIT.md) |
| K6-02 | K2F-02, 37 | [02](../evidence/K2F-02/KANIT.md), [37](../evidence/K2F-37/KANIT.md) |
| K6-03 | K2F-29, 30 | [29](../evidence/K2F-29/KANIT.md), [30](../evidence/K2F-30/KANIT.md) |
| K6-04 | K2F-32 | [32](../evidence/K2F-32/KANIT.md) |
| K6-05 | K2F-33 | [33](../evidence/K2F-33/KANIT.md) |
| K6-06 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| K6-07 | K2F-39 | [39](../evidence/K2F-39/KANIT.md) |
| K7-01 | K2F-25, 41 | [25](../evidence/K2F-25/KANIT.md), [41](../evidence/K2F-41/KANIT.md) |
| K7-02 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| K7-03 | K2F-30 | [30](../evidence/K2F-30/KANIT.md) |
| M-01 | K2F-21, 22, 41 | [21](../evidence/K2F-21/KANIT.md), [22](../evidence/K2F-22/KANIT.md), [41](../evidence/K2F-41/KANIT.md) |
| M-02 | K2F-26, 36 | [26](../evidence/K2F-26/KANIT.md), [36](../evidence/K2F-36/KANIT.md) |
| M-03 | K2F-26 | [26](../evidence/K2F-26/KANIT.md) |
| M-04 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-05 | K2F-41 (+P4 kuralı) | [41](../evidence/K2F-41/KANIT.md) |
| M-06 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-07 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-08 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-09 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-10 | K2F-01 | [01](../evidence/K2F-01/KANIT.md) |
| M-11 | K2F-04 | [04](../evidence/K2F-04/KANIT.md) |
| M-12 | K2F-41 | [41](../evidence/K2F-41/KANIT.md) |
| M-13 | K2F-39 | [39](../evidence/K2F-39/KANIT.md) |

## 4. D-kararları ve kabul ölçütleri
- **D-12** ("zaten biliyorsun" kognat turu): bilerek **ertelendi** (K2F-25, LEDGER seq 74); kodda yok.
- **D-21** (T-hattı ↔ ünite): hiçbir karta bağlanmadı; ayrı onay ister.
- Diğer D-kararları KAO2 programında uygulanmıştır (arşiv `10-KARARLAR.md`; bayat ifadeler `DUZELTME-NOTU.md`).
- A-1…A-10 PASS (K2F-36 `A-KABUL.md`); A-11/A-12 cihaz.

## 5. Kullanıcıda kalanlar
- Cihaz kabulü (K2F-26…40 görsel/odak/dakika metinleri, NavBar/alt çubuk/panel-v2 dar ekran) ve ekran okuyucu turu (lang/dir etiketleri).
- L2 uzman onayı listeleri (`evidence/K2F-24/L2-PAKET.md`); gerçek alan uzmanı onayı yoktur.
- K-3: hece sesi katman A kayıtları (`tools/kao2-syllable-audio.mjs`).
- D-12 ertelenen karar; D-21.
- perf bandı: `test_kao2_perf_budget` göreli p95 bandı yavaş konteynerde kırmızıdır; referans makinede bir kez koşulmalı.
- Canlı bayt eşitliği (pin 20261006d ve K2F-43 pini) kullanıcı terminalinde.
