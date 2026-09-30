# KAO2-00 — BLOCKED: mevcut sözlük süre tavanını aşıyor
Tarih: 2026-09-28 · Dal: kao2-yeniden-tasarim · Önceki commit: d4faa17

## Yapılan
- Kullanıcının açık onayıyla plan commit'i d4faa17 üzerinden uygulama dalı açıldı.
- Yeni K-1 fixture'ı: içerik toplamı 256 KiB, mevcut dört modül 164 KiB, varsa curriculum 48 KiB; runtime 80 KiB, CSS 14 KiB; boş VM'de 20 tekrarın nearest-rank p95'i ≤40 ms; varsa KAO2-01 tabanına göre ≤+%25.
- Kaynak okuma ve gzip süre ölçümünün dışında; bağlam her tekrarda boş window ile yeniden kurulur. Değerlendirme kaynak metninden yapılır; maliyet gizlemek için ön-çözülmüş içerik veya ön-derlenmiş betik kullanılmaz.
- R-C5 toplam/mevcut modül tavanları ve isteğe bağlı curriculum sayımı güncellendi; ses aracı tavanı 24 MiB yapıldı; fixture envantere eklendi.
- Üretim runtime'ı ve donmuş içerik değiştirilmedi.

## TDD
- Kırmızı (kartın istediği geçici 1 KiB tavan): `node tests/kao/test_kao2_perf_budget.js`, exit 1: `content 162177 bytes exceeds budget`.
- Gerçek 256 KiB tavana dönüş: boyut kapıları geçti; süre kapısı exit 1: `p95 82.948 ms exceeds 40 ms`.
- Bağımsız tekrar: exit 1: `p95 80.949 ms exceeds 40 ms`.
- Yeşil aşama tamamlanamadı; test gevşetilmedi ve kart kapatılmadı.

## Kapılar (P3)
| Komut | Sonuç |
|---|---|
| `node tests/kao/test_kao2_perf_budget.js` | FAIL, süre tavanı (iki çalışma) |
| `node tests/kao/test_kao_user_tasks.js` | PASS; p50 0,130 ms, max 0,792 ms; ECE 0,0131 |
| `node tools/kao-audio-build.mjs --self-test` | PASS, 4 sentetik klip / 14.223 bayt |
| `node kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs` | PASS, blocked kapanışında doğrulandı |
| P3 diğer aileler, driver, zikr, kontrast | Çalıştırılmadı: P6 kapsam engelinde duruldu; tam regresyon PASS iddiası yok |

## Ölçümler
Node v26.3.1. İçerik gzip 162.177 B = 158,376 KiB; runtime 50.221 B = 49,044 KiB; CSS 7.051 B = 6,886 KiB. Boyutlar level 9.

Süre teşhisi için ayrı 20 tekrar; her dosyanın kendi p95'i (toplam p95 ile toplanmaz):
| Dosya | p95 ms |
|---|---:|
| quranLexiconV1.js | 84,421 |
| quranGrammarV1.js | 0,483 |
| quranShortSurahsV1.js | 0,472 |
| quranPhonicsV1.js | 0,088 |
| quranLearn.js | 0,186 |

Sözlük yükleme gövdesinde her DICTIONARY girdisi için packed üzerinde split/join döngüsü var. Ölçüm maliyeti bu modülde yoğunlaştırıyor; satır düzeyinde profiler yapılmadığından döngünün tek neden olduğu iddia edilmiyor.

## Bilerek değişen testler
- R-C5: toplam 160 → 256 KiB, ayrıca mevcut dört modül ≤164 KiB. Kullanıcı onaylı K-1 büyüme tavanları; diğer kullanıcı görevi kontrolleri korundu.
- Yeni perf fixture'ındaki geçici 1 KiB yalnız kırmızı kanıt içindi; kalıcı tavan 256 KiB. 40 ms kapısı korunuyor.

## Engelin nedeni / önerilen çözüm
KAO2-00 Dokun listesi sözlük üreticisi `tools/kao-lexicon-build.mjs` veya üretilmiş `app/content/quranLexiconV1.js` optimizasyonunu kapsamıyor. Mevcut içerik tek başına 40 ms'yi aşıyor. P6 gereği bu dosyalara dokunulmadı; STATE ve LEDGER BLOCKED olarak kapatıldı.

Öneri: ayrı açık kapsam onayıyla üretici ve yeniden üretilen sözlüğün yükleme maliyetini inceleyip optimize et; içerik semantiği/freeze eşliği, ilgili fixture'lar ve tam P3 kapılarıyla doğrula. Elle Arapça düzenleme veya süre tavanı artırma önerilmiyor. İnceleme başka dosya gerektirirse tekrar kapsamı belirle.

## Tamamlanmayan işler
- 04 kaynakçasının toplu teyidi ve işaretleri yapılmadı (38 künye); ilk iki ağ araması sonrası süre engelinde duruldu. Kaynakçaya doğrulanmış işareti eklenmedi.
- Tam P3 regresyonu ve KAO2-00 done kapanışı bekliyor. KAO2-01'e geçilmedi, taban yazılmadı.

## Kanıt düzeyleri
Kaynak/test: kısmi PASS, süre FAIL; kart BLOCKED. Yayın: yok (push/deploy/tag/merge yapılmadı). Cihaz: yok; tarayıcı/sunucu açılmadı, kullanıcı verisi veya sır okunmadı.
