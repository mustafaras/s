# K2F-30 — Ayarlar 2/2 — otomatik geç, başlangıç noktası
Tarih: 2026-10-03 · Dal: kao2-duzeltme · Önceki commit: 980f8466 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K2-06 · K6-03 · K7-03 · R değişimi: yok (10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-30, dal kao2-duzeltme
- [x] kırmızı testler yazıldı (settings/onboarding/feedback) ve kırmızı görüldü
- [x] `kaoToggleAutoAdvance` (motor + App shim) ve pinler 45/766/604
- [x] Ayarlar "Öğrenme" grubu (Okuma ile Gölgeleme arası); `groupRow` Views'a çıkarıldı
- [x] `kaoOnboard('change-start')` değişim modu (yalnız `onboarding.start`)
- [x] varsayılan `settings.dailyNew` 10→5 (onboarding.minutes ile hizalı)
- [x] kapılar YEŞİL, mutasyon doğrulaması

## Yapılan
- `quranLearn.js`: `kaoToggleAutoAdvance`; `kaoSettingsHTML` "Öğrenme" grubu (switch + "Başlangıç noktasını değiştir" satırı, geçerli başlangıç değeri); `kaoOnboardChangeStart/Step/Leave` — `ui.kaoOnboard.change===true` modu: 2. adım → seçim (none/fluent doğrudan, slow → yerleştirme) → yalnız `onboarding.start` yazılır, Ayarlar'a dönülür; Geri (2. adım) ve Vazgeç hiçbir şey yazmaz; `kaoApplyView` bayat değişim modunu temizler; varsayılan dailyNew `KAO_ONBOARD_MINUTES[0]` (5).
- `quranLearnViews.js`: `groupRow` (groupedList satırı çıkarıldı, davranış aynı), `onboardScreen` `skipLabel` ("Vazgeç").
- `app.js`: tek shim `App.kaoToggleAutoAdvance`.
- Pinler (ölçüldü): App.kao* 44→45 · yüzey 765→766 · atama 603→604; pin dosyaları aynı committe.

## TDD
- Kırmızı: `node tests/kao/test_kao2_settings.js` → `AssertionError: grup sırası 06/KAO2-23`; `test_kao2_feedback.js` → `api.kaoToggleAutoAdvance is not a function`; `test_kao2_onboarding.js` → handler sayacı 45 beklentisi.
- Yeşil: üç dosya PASS; mutasyon: start yazımı silindi / bayat mod temizliği silindi / toggle hep-açık / Vazgeç etiketi → hepsi testlerce yakalandı (killed).

## Kapılar (P3)
kapilar.sh YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync) · tekrar-üret 10/10 · perf: runtime 115,015 KiB (tavan 128) · css 13,442 KiB (tavan 14; CSS eklenmedi).

## Bilerek değişen testler (eski beklenti → yeni beklenti · gerekçe)
- test_kao2_settings.js: grup sırası + `Öğrenme`; anahtar sayısı 5→6; handler 44→45 · K2F-30.
- test_kao2_design_contract.js: anahtar sayısı 5→6 (otomatik geç anahtarı) · K2F-30.
- test_kao2_word.js, test_kao2_onboarding.js: App.kao* pin 44→45 · P8.
- tests/app fx2/v3/surface pinleri 765→766, 603→604 · P8.
- test_kao_migration.js: boş kayıtta `dailyNew` 10→5 · P1 (c): 08 §1 — dailyNew süreden türetilir, varsayılan süre 5; kayıtlı ayar (ör. 10) korunur (settings testi).
- test_kao_requirements.js: ilk-oturum yön testi `dailyNew=10`'u açıkça kurar · varsayılan 5 olunca bütçe yönü test amacından kaymasın diye.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (değişen: quranLearn.js · quranLearnViews.js · app.js) · cihaz — (Öğrenme grubu yerleşimi, başlangıç değişim akışı, odak gözlenmedi).

## Sürprizler / sonraki promptlara not
- `kaoCommitSetting` görev önbelleğini (`ui.kaoTasks`) temizler; testlerde ayar değişimi `show(task)`'tan ÖNCE yapılmalı.
- Varsayılan dailyNew=5 ile kaoStart'ın 5 yeni kart seçiminde kelime kartı çıkmayabilir (aday öncelik/tür sınırı); onboarding sonrası 5 dk kullanıcıda da aynı olabilir → kapsam dışı, CURRENT-STATE "Açık riskler".
- Değişim modunda yerleştirme sonucu (placement kaydı) yazılmaz: yalnız `onboarding.start`.

## Bağımsız inceleme (code-reviewer): APPROVE · CRITICAL/HIGH 0, MEDIUM 1, LOW 3
- **MEDIUM kapandı:** değişim modu giriş/çıkışında `focusDialog('sey-ov-card')` (gerçek tarayıcı odağı gözlenmedi).
- **LOW kapandı:** aynı start seçilirse gereksiz `kaoSave` yok (test eklendi).
- **LOW (bilerek açık):** `dailyNew` fallback'i 10 olan 3 yer (quranLearn.js kaoBuildQueue, Flow) — ensure normalize ettiğinden ulaşılmaz; eski `onboarding.placement` kaydı start değişince korunur (spec: yalnız start değişir).
