# D3F-14 — F-14: D2F-05 ve D2F-09 mutasyon kanıtları depoya alındı ve bugünkü kodda yeniden üretildi

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-14

## Kök neden
- **D2F-05:** KANIT iki mutasyonu komutlarıyla yazmış ("scratchpad; commit edilmedi"):
  (a) `masteryAt` yazımı kapatılır → R-01 kırmızı; (b) `test_kao2_kabul.js`'e girintili koşulsuz kanıt yazımı eklenir → R-10 kırmızı. Betik depoda yok.
- **D2F-09:** "sahte git geçmişiyle mutasyon harness'i (scratchpad)". Betik depoda yok.
  Kapsadığı vakalar: KONTROL, a, b (öneksiz, D2F-99), c, d (bölüm, Oturum, paylaşılan oturum), e (closed, waiting), f.
- D3F-04'ün `d2f-mutasyon.sh`'ı yalnız (a) kuralını ve kapanış SONRASI önekleri sınıyordu. b (aralık içi), c, d, e, f ve D2F-05 eksikti.

## Yapılan
- `kao2-duzeltme/denetim-3/evidence/D3F-14/d2f-0509-mutasyon.sh`: her vaka `$TMPDIR`'de taze klon, ağsız, depoya yazmaz.
  Mutasyon noktası bulunamazsa senaryo geçersiz sayılır (çıkış 2, sessiz geçmez). Her kırmızı, çıktıdaki beklenen gerekçe metniyle eşleştirilir.
- D2F-05 ve D2F-09 KANIT'larının sonuna, betiğe işaret eden "Düzeltme notu" eklendi; mevcut satırlar değişmedi.
- denetim-2 LEDGER **seq 29 NOTE · D2F-09** · `D2F-STATE.ledgerLastSeq` 28 → 29 · CURRENT-STATE senkron bloğu ve "Son güncelleme".

## Sonuç (bugünkü kodda)
`bash kao2-duzeltme/denetim-3/evidence/D3F-14/d2f-0509-mutasyon.sh` → **13/13 PASS**

| vaka | beklenen | gerçek |
|---|---|---|
| D2F-09 K0 kontrol | yeşil | `D2F senkron: PASS` |
| b öneksiz commit | kırmızı | `[strict-b] … öneksiz commit: "ek düzeltme"` |
| b bilinmeyen önek | kırmızı | `bilinmeyen önek D2F-99` |
| c D2F-14 pin değiştirir | kırmızı | `[strict-c]` |
| d Oturum yok | kırmızı | `[strict-d] D2F-14: KANIT'ta "Oturum:" satırı yok` |
| d bölüm eksik | kırmızı | `[strict-d] D2F-14: KANIT bölümü eksik: Sürprizler` |
| d oturum paylaşılıyor | kırmızı | `… ile paylaşılıyor` |
| e D2F-15 closed değil | kırmızı | `[strict-e] D2F-15` |
| e D2F-14 waiting değil | kırmızı | `[strict-e] D2F-14` |
| f Canlı gerçekler bayat | kırmızı | `[strict-f] CURRENT-STATE` |
| D2F-05 M0 kontrol | yeşil | `test_kao2_denetim` PASS |
| D2F-05 (a) | kırmızı | `R-01 (K4-01) · doğru: masteryAt=false …` |
| D2F-05 (b) | kırmızı | `… KAO2_EVIDENCE_OUT koşulsuz=1` |

D2F-09'un (a) kuralı ve kapanış sonrası önekler: `D3F-04/d2f-mutasyon.sh` 8/8 (her commit sonrası hızlı sette koşuluyor).
**Yeniden üretilemeyen vaka kalmadı.** İlk koşuda 10/10'du; özgün harness'la karşılaştırınca b ×2 ve e-waiting eksikti, eklendi.

## Sınır
- Vakalar özgün harness'ın vaka listesine göre yeniden kuruldu; özgün betiğin kendisi yok. Birebir aynı sahte commit'ler değil, aynı kuralları tetikleyen eşdeğerleri.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (kod/pin yok) · cihaz —
