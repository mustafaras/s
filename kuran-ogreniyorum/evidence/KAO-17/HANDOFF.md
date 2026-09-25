# KAO-17 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `35cb69781cd0d28068030906d35bf83ac6d068e5` · **Durum:** done

## Ne yapıldı

- E7 Ayarlar ekranı (`ui.kaoView='settings'`, E1'den “Ayarlar ve dışa aktarma”): günlük yeni 5/10/15, otomatik ses kapalı/yavaş/doğal, Okunuş/DİA katmanı, harekeleri göster, tekrarda soldur, satır aralığı, kelime boşluğu, renkli hareke, Seviye 0'ı yeniden aç, CSV.
- Sekiz handler: `kaoSetDailyNew`, `kaoSetAudioStyle`, `kaoToggleHarakat`, `kaoToggleFade`, `kaoSetTranslit`, `kaoSetReadability`, `kaoReopenGate`, `kaoExportCsv`; hepsi `data.quranLearn.settings/readability`'ye yazar, geçersiz girdiyi reddeder.
- Hareke soldurma (R-B5): tekrar kartında iki katmanlı metin; harekeli katman `--dur-5` ile solar, dokununca geri gelir; reduced-motion ve uygulama hareket ayarı (`premiumAtmosphere`) kapalıyken anında.
- DİA katmanı: derleme aracının algoritmasının çalışma zamanı eşi; 524/524 lemmada doğrulanmış çıktıyla birebir. Âyet/parça okunuşları Okunuş katmanında kalır.
- CSV (R-C4): Blob + `<a download>`, ağ yok, Blob URL iptal edilir.
- Önbellek pini `20260925d`; App yüzey pinleri 742/580.
- KAO-07'den kalan harness borcu (6 fixture) onarıldı; tam regresyon yeşil.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A4 | done | otomatik ses stili + sessiz saat fixture'ı |
| R-A9 | partial | ayarlar ve değişkenler tamam; kontrast ölçümü KAO-18 |
| R-B5 | done | soldurma markup + CSS token + reduced-motion/instant dalı |
| R-B8 | done | iki hız düğmesi ve klavye eşdeğeri korunur; stil ayarı tek düğmede |
| R-C4 | done | CSV başlık/satır + Blob URL iptali (privacy fixture) |

## Kalan sınır

Fiziksel cihazda CSV indirme (iOS Safari “Dosyalar'a kaydet” akışı), soldurma animasyonu ve VoiceOver kabulü yapılmadı. Push/merge/deploy yapılmadı; ayrı kullanıcı onayı gerekir.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-26` yalnız yeni kullanıcı yetkisiyle uygulanır.
