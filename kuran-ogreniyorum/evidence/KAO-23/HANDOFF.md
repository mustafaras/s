# KAO-23 · Devir — **DONE**

**Tarih:** 2026-09-23 · **Ajan:** gpt-5-codex · **Onay:** D-12

## Ne yapıldı

- 28 benzersiz harf için kova, mahreç, Türkçe ipucu ve kaynak kaydı üretildi (A=16, B=4, C=8).
- 12 algı çifti B/C hedeflerinin tamamını kapsar; 24 örnek kimliğinin tamamı `lexicon.verified.json` içinde gerçekten vardır.
- Yedi çekirdek okuma kuralı ve 28 anahtarlı okunuş + DİA tablosu eklendi; DİA çıktıları 28/28 benzersizdir.
- Aynı sagittal temel geometriyi kullanan 13 SVG eklendi; `currentColor`, geçerli XML ve dosya başına ≤4 KB kapıları geçti.
- Belgedeki qaf ikili rolü uzlaştırıldı: veri modelinde tek C harfi; B kaf↔qaf karşılaştırması ayrı görsel varyant.

## Kontrol sonuçları

| Komut | Exit | Sonuç |
|---|---:|---|
| JSON parse | 0 | draft + verified geçerli |
| Inline KAO-23 contract check | 0 | fail=0; 28 harf, B/C 12/12, 7 kural, 13 SVG |
| `xmllint --noout` (13 SVG) | 0 | 13/13 geçerli |
| `node tools/kao-lexicon-build.mjs --self-test` | 0 | PASS (50 satır) |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs --self-test` | 0 | 16/16 PASS |
| `node kuran-ogreniyorum/tools/kao-plan-check.mjs` | 0 | PASS (0 warn) |
| `git -c core.fsmonitor=false diff --check` | 0 | PASS |

Değişen `.js`/`.mjs` yok; `node --check` uygulanabilir değil (N/A).

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-B6 | partial | 13 ortak-siluet SVG hazır; ekranda kullanım fixture'ı KAO-26 |
| R-A9 | partial | Fonetik ipuçları + iki transliterasyon katmanı hazır; ayarlar/kontrast KAO-15/17/18 |

## Kalan sınır

- Kaynak/test kanıtı tamam; cihazda telaffuz pedagojisi ve ekran kabulü doğrulanmadı.
- Push, merge, tag, deploy ve `seyma-data` yazma yapılmadı.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-24` yalnız bir sonraki kartı gösterir; bu devir KAO-24 uygulama yetkisi vermez.
