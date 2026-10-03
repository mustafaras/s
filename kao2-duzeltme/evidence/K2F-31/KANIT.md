# K2F-31 — Süre ölçümü ve tahmini
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: 4ce74803 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K3-03 · K3-09 · R değişimi: yok (10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-31, dal kao2-duzeltme
- [x] kırmızı testler (next_step +4, feedback +ms) görüldü
- [x] `applyAnswer`: `daily.ms += clamp(şimdi − kaoTaskStartedAt, 0, 120000)` (`KAO_TASK_MS_CAP`)
- [x] Flow `lessonTaskCount` + `lessonStep` alt satırı
- [x] kapılar YEŞİL, mutasyon 4/4 öldürüldü

## Yapılan
- `quranLearn.js`: cevapta günlük kayda ölçülen süre (ms); geri alma günlüğü bütün hâlde geri yazdığı için süre de geri alınır. Yeni handler/alan normalizasyonu yok (`daily` serbest sayı alanı; `estimateMinutes` zaten `ms` okuyordu).
- `quranLearnFlow.js`: `lessonTaskCount` — `lessonPlan`'dan intro+practice+apply sayısı (plan yoksa yeni kelime sayısı); `lessonStep` dakikası `estimateMinutes(günlük, tekrar + görev sayısı)`; alt satır tekrar 0 iken "N yeni kelime · ~M dk".

## TDD
- Kırmızı: `test_kao2_feedback.js` → `800 ms → 800` (ms yok); `test_kao2_next_step.js` yeni 4 kontrol dakika/alt satır uyuşmazlığı.
- Yeşil: next_step 23 · today 7 · hub 10 · state_budget PASS; mutasyon (görev sayısı→eski, "0 tekrar" biçimi, cap kaldırma, ms yazımı) hepsi killed.

## Kapılar (P3)
kapilar.sh YEŞİL · tekrar-üret 10/10 · perf: runtime 115,478 KiB (tavan 128) · css 13,442 KiB (CSS yok) · p95 4,067 ms.

## Bilerek değişen testler
- test_kao2_summary.js: yarın dakikası `~2 dk` → `~4 dk` · K3-03: tahmin artık dersin gerçek görev sayısından (eski: tekrar + yeni kelime).
- test_kao2_next_step.js: üretim yolunu sınayan kontrol eklendi (motor kontrolünün verisi `motorData` ile paylaşılır).

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (quranLearn.js · quranLearnFlow.js) · cihaz — (gerçek ders süresi/dakika metni gözlenmedi).

## Sürprizler / sonraki promptlara not
- `lessonPlan` içeriği olmadan da kurulabilir (curriculum yeter); "plan yok" yedek yolu pratikte ulaşılmaz, savunmacı.
- Tahmin onboarding süresiyle (5/10/15 dk) sınırlı: 17 görevlik ders 5 dk seçen kullanıcıda "~5 dk" gösterir.

## Bağımsız inceleme (code-reviewer): ilk WARNING → düzeltildi
- **HIGH kapandı:** üretimde `nextStep` yalnız `{curriculum}` ile çağrılıyordu → `lessonPlan` intro/concept üretmiyor, hub/Bugün/özet dakikası ~yarıya düşüyordu (testler `fullContent` kullandığı için yakalamamıştı). Üç çağrı noktası (`kaoNextStepFor`, `kaoHubModel`, panel özeti) `kaoLessonContent()` kullanır; ses haritası sözlük başına önbelleklenir. Üretim yolu testi eklendi; eski çağrıya geri alma mutasyonu → killed.
- **LOW kapandı:** `elapsed` tek değişkene çıkarıldı.
- **MEDIUM (bilerek açık):** (2) `ms` yalnız kart cevabında artar, gecikmeli sûre/bağlantı/transfer yolları `answered`'ı ms'siz artırır → ortalama hafif düşük sapar; (3) sekme arka planda bekleyince cevap başına 120 sn eklenir (spec sınırı) → ortalama şişebilir; (4) `lessonPlan` her `nextStep`'te çalışır, performans ölçülmedi (perf kapısı p95 4,8 ms). Hepsi CURRENT-STATE "Açık riskler"de.
