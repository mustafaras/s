# Handoff — ÆON Panel-v2 Premium — Prompt 34 Audit Remediation

## Prompt Bilgisi

- **Prompt No:** `34` kalite düzeltmesi
- **Prompt Kısa Adı:** `Prompt 0–34 doğrulama kapıları`
- **Uygulayan Ajan:** `OpenAI Codex (GPT-5)`
- **Tarih:** `2026-08-11`
- **Başlangıç Commit:** `085d330`
- **Bitiş Commit:** `188bdbc` (ledger metadata commit'i `4733e38`)

## Yapılanlar

- [x] Eski sabit cache sürümü bekleyen üç kalite fixture'ı sürüm-bağımsız cache-bust sözleşmesine taşındı.
- [x] Kur'an kartındaki tüm sabit `font-size` değerleri `--ae-scale-*` tokenlarına taşındı.
- [x] CSS fixture'ı `px/rem/em` sabit font-size regresyonunu artık yakalıyor.
- [x] Tüm test paketi çalıştırıldı.

### Değiştirilen Dosyalar

- `panel-v2.css` — `--ae-scale-base`, `--ae-scale-compact` ve Kur'an kartı tipografi eşlemeleri
- `tests/test_panel_p5_responsive_a11y.js` — legacy panel cache-bust kontratı
- `tests/test_panel_p6_qa_release.js` — release cache-bust kontratı
- `tests/test_quran_panel_parity.js` — iki shell cache-bust kontratı
- `tests/test_panel_v2_css.js` — rem/em dahil sabit font-size taraması
- `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md` — Prompt 34 kalite kanıtı

## Teknik Kararlar

| Karar | Gerekçe |
|---|---|
| Cache testleri exact tarih yerine zorunlu `?v=` pattern'i kontrol ediyor | Her meşru cache bump'ında testlerin stale olup kalite kapısını yanlış kırmaması |
| Kur'an kartı için `--ae-scale-base` ve `--ae-scale-compact` eklendi | Mevcut 16px/11px yüzeyleri tokenlaştırırken görsel hiyerarşiyi korumak |
| Gerçek tarayıcı açılmadı | Repo'nun data-safety lock kuralı; headless testler kullanıldı |

## Test Sonuçları

```text
- tüm tests/test_*.js                         → 54/54 PASS
- tests/test_panel_v2_*.js                    → 22/22 PASS
- node --check (app/sync/panel kaynakları)    → PASS
- node .claude/skills/run-seyma/driver.mjs   → PASS
- Panel P2/P4 ve Quran transport fixtures   → PASS
- git diff --check                            → PASS
- sabit font-size taraması                    → PASS
- Pages run `31500908612`                    → SUCCESS
- deployment `5852262209`                   → SUCCESS
- canlı panel-v2 HTTP/cache                  → 200 / `20260811i`
```

### Önceki Hatalar ve Çözümleri

- `test_panel_p5_responsive_a11y.js`, `test_panel_p6_qa_release.js` ve `test_quran_panel_parity.js` eski cache sürümlerini sabitliyordu; gerçek cache-bust varlığına göre doğrulanacak şekilde düzeltildi.
- Kur'an kartının sonradan eklenen rem/em font değerleri tipografi tokenlarına taşındı.

## Sıradaki Adım

- **Bir sonraki prompt:** `35 — Polling & Telemetry Testleri`
- **Öneri:** Prompt 35'e geçmeden önce bu remediation handoff'unu oku; runtime kodu ve 54/54 kalite kapısı yeşil.

## Context / Token Notu

- Bu düzeltme sonunda context kullanımı: `orta`
- `/compact` önerisi: `Hayır`
- Yeni oturum önerisi: `Hayır`

## Ek Notlar

- Önceki handoff korunmuştur; bu dosya yalnızca audit remediation ek kanıtıdır.
- Gerçek kullanıcı verisi, `data/`, `sync.js` ve `mustafaras/seyma-data` değiştirilmedi.
