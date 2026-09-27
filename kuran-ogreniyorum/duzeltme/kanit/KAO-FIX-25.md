# KAO-FIX-25 · FX: dokunma sesi/titreşim, taş kutlaması, görev geçişi, kapsam sayacı (04 §4, KF-6)

Dal `kao-duzeltme`, taban `07c897a`. Yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35); yeni CSS yok.

## Önce kırmızı
- `node tests/kao/test_kao_requirements.js` (HEAD kodu + yeni test) → exit 1: "doğru cevapta dokunma sesi + titreşim".

## Değişiklikler (`quranLearn.js`)
- `kaoFx(kind,node)`: doğru → `SeyHaptics.tap` + `SeyAudio.tap`; yeni kilometre taşı → `.success` + konfeti (`SeymaHelpers.confetti`, yalnız `SeyFx.shouldAnimate()` — konfeti kendi kapısını denetlemez); geçiş → `SeyFx.enter(#kao-task düğümü)`. Ayar/sessiz saat/reduced-motion kapıları FX modüllerinde; modül yoksa atlanır.
- Çağrı yerleri: kelime/gramer/parça cevabı, gecikmeli test, bağ kur, aktarım testi (yalnız doğruysa); `recordMilestones` sonrası yeni taş; `paintTask` yalnız görev kimliği değişince (`ui.kaoPaintedId`; dizme görevinde her çipte yeniden animasyon yok).
- Ana ekran kapsam sayısı `<span data-countup data-countup-key="kao-coverage">` → `render.js` her render sonrası `SeyFx.sweepCounters` → `SeyFx.countUp`.

## Kontroller
- Test: doğru → tap ikilisi + enter; yanlış → yok; taş → success + konfeti; hareket kapalı → konfeti yok; FX modülü yoksa hata yok; sayaç işaretli
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok
- `node tools/fx-coverage.mjs`: M1–M13 HEAD ile birebir aynı (bu kart ölçümü değiştirmedi)
- `quranLearn.js` 1.890 satır (≤1.900) · PIN-P `20260927e` → `20260927f` (9 dosya, eski 0)
- 04 §4 durum satırı → Uygulandı (KAO-FIX-25)

## Kalan risk
- Ses, titreşim ve animasyon yalnız cihazda kabul edilebilir (K3). iOS'ta titreşim desteği sınırlı (FX-2 notu).
