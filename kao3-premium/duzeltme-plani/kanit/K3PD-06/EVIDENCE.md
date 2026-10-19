# K3PD-06 — Ara uygulama kanıtı

Durum: `done`; bağımsız salt-okur denetim `PASS`; K3PD-06 tek yerel commit ile kapandı.

## Taban ve karar

- Taban: branch `k3pd-denetim-duzeltmeleri`, HEAD `27620d4fae1ef6c09f04ff54e33d0ed238be73eb`; `HEAD...origin/main` `0/0`.
- K3PD-04 `timeBudget` kararı A yürürlükte: tüm görevler korunur, seçili 5/10/15 dk sınırına göre ardışık parçalanır; tek görev sığmıyorsa otomatik başlatılmaz, süre aşımı açıkça seçilebilir; tam özet bitmeden tamamlanma/ustalık ödülü yoktur.
- Korunan kirli dosyalar aynı SHA-256’da kaldı: `KAPANIS.md` `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`, `README.md` `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0`, `kanit/sonraki/GORSEL-KANIT.md` `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`.

## Uygulama incelemesi

- `quranLearnFlow.js` bütçeyi seçili gerçek görevlerin maliyet toplamından kuruyor; tam planı önce doğrulayıp bölüyor; görevleri sessizce çıkarmıyor; `partEnd` ile aynı çözülmemiş göreve resume ve açık `budget-overrun` seçeneği veriyor.
- `quranLearn.js` süre medyanı ve doğrulanmış review listesini Flow’a parametre olarak aktarıyor; mevcut `onboarding.minutes` ayarı için Ayarlar’daki mevcut `kaoOnboard` akışını açıyor. Yeni kalıcı alan, migration veya App handler eklenmedi.
- İzinli beş test uyarlaması: `test_kao2_view_resolution.js` gerçek `partEnd` sonrası açık overrun seçimini izliyor; dört app-surface fixture’ı değişmemiş `index.html` pinini doğruluyor (`20261019a`).

## Doğrulama

- K3PD kart testleri: `test_k3p_budget.js`, `test_k3p_rhythm.js`, `test_k3p_resume.js`, `test_kao2_lesson_flow.js`, `test_kao2_next_step.js`, `test_kao2_mastery.js` ve ilgili T(queue) / grammar, lesson coherence, denetim ve bileşen fixture’ları PASS.
- `test_k3p_distractors.js`: 2,203 görev, tekrar eden seçenek 0; eski sıra karşılaştırma fixture’ı yok olduğundan tarihsel sıralama alt kanıtı `UNVERIFIABLE` olarak tutuldu; fixture üretilmedi.
- G0+G1 komutları PASS; migration×2 ve schema kontrolleri değişiklik göstermedi. `App.kao*` sayısı `45`; runtime gzip `135.563 KiB`; production pin freshness `61 fresh / 2 deferred / 0 blockingStale`.
- Önceki `test_kao2_kabul.js` sonucu `215/219` idi. Kullanıcının ayrıca verdiği exact-path izniyle `tests/app/test_header_celestial_timeline.js`, `tests/app/test_header_night_contrast.js`, `tests/app/test_iip_09.js`, `tests/app/test_v3_welcome.js` pin beklentileri değişmemiş `index.html`/`sw.js` sürümlerine eşitlendi; yalnız bu dört yol K3PD-06 allowlist satırına eklendi. Dört fixture tekil koşuda sırasıyla `10/10`, `23/23`, `34/34`, `287` kontrol PASS. Ardından tam A-9 koşusu `219/219` dosya exit 0 ile PASS oldu; A-10 ölçümü runtime `135.563 KiB`, CSS `15.877 KiB`, content `184.591 KiB`, p95 `4.358 ms`.
- Onaylanan dokuz yeni fixture tekrar koşusu PASS: view resolution `12/12`; app-surface boot/domain/lifecycle/overlay `22/22`, `58/58`, `16/16`, `49/49`; pin fixture’ları `10/10`, `23/23`, `34/34`, v3 `287` kontrol. `durum.mjs --check` PASS, nextPrompt K3PD-06.
- `index.html`, `sw.js`, `app/core/state.js` HEAD ile byte-eşit. Pin değişikliği yok. Bağımsız denetim ve commit beklemede.

## Açık kabul

1. Bağımsız read-only denetim.
2. Kapanış belgelerini senkronlayıp tek mantıksal yerel commit; korunan kirli dosyalar commit dışında.

## Ek denetim bulgusu ve düzeltme — 2026-10-19

- Bağımsız denetim önce `PARTIAL` verdi: runtime, Flow öncesinde ilk 20 review kartıyla sınırlıydı; test de yalnız bu kümede R sıralamasını karşılaştırıyordu. Böylece 21+ due kartta global düşük-R önceliği kanıtlanmıyordu.
- Düzeltme plan bağlantısında yapıldı: mevcut 20-review plan tavanı korunurken sıralama tüm güncel due kuyruğundan yapılır; en kararlı en çok beş warmup önce, kalan alan en düşük R kartlarına ayrılır. FSRS vadesi, görev geçmişi veya kalıcı veri değişmez.
- Yeni negatif test iki yönlü 60 due kart kurar; ilk 20 yüksek R, sonraki 40 daha düşük ve tekil R değerindedir. Gerçek `kaoLesson(start, lessonId)` planında warmup dışı seçimin küresel en düşük-R prefix’i olduğu doğrulanır. `test_k3p_budget.js` 11/11 ve `test_k3p_rhythm.js` 5/5 geçti.
- Kart durumu `in_progress`/audit `PARTIAL`; tam G0+G1+G2 doğrulaması ve yeni bağımsız audit bekleniyor.

## Son düzeltme sonrası doğrulama — 2026-10-19

- Seq49’dan sonra tam G0+G1+G2 tekrarlandı. Canlı HEAD `27620d4fae1ef6c09f04ff54e33d0ed238be73eb`; `durum.mjs --check` PASS, aday hâlâ K3PD-06. Sözdizimi, güvenli driver, zikr harness `95/95`, kontrol düzlemi `33` negatif + `34` politika + `6` eski pin senaryosu, migration testleri, G1 ve G2 komutlarının tamamı exit 0.
- Davranış kanıtı: `test_k3p_budget.js` `11/11`; 60 vadeli kart gerçek `kaoLesson(start, lessonId)` yoluna veriliyor. İlk 20 adayın R değeri yüksek, sonraki 40’ın daha düşük; gerçek plan en kararlı en çok 5 warmup sonrasında global düşük-R kuyruğundan alıyor ve toplam review tavanını 20’de tutuyor. Plan FSRS/kart ilerlemesini yazmıyor. `test_k3p_rhythm.js` `5/5`, 109 dersin tarihsel ±20% görev sayısı bandını koruyor.
- İlgili yürüyüş sınırları: lesson flow `24/24`, coherence `9/9`, mastery `45/45`, grammar tasks `39`, denetim `10/10`, budget `11/11`, resume `7/7`, next-step `25/25`, view-resolution `12/12`, lesson ayah `5/5`. A-9 tam koşusu `env -u KAO2_EVIDENCE_OUT node tests/kao/test_kao2_kabul.js`: `219/219` dosya exit 0; iç A-10 p95 `5.315 ms`.
- İzole G1 perf koşusu `env -u KAO2_WRITE_BASELINE node tests/kao/test_kao2_perf_budget.js`: runtime gzip `135.569 KiB`, CSS `15.877 KiB`, content `184.591 KiB`, p95 `6.317 ms`, steady `3.076 ms`; baseline yazılmadı. Pin tazeliği `61 fresh / 2 deferred / 0 blocking stale`; deferred iki çalışma ağacı kaydı yalnız izinli quranLearn dosyalarıdır.
- `App.kao*` adet sayımı `45`. HEAD’e göre `index.html`, `sw.js`, `app/core/state.js`, `app/core/quranLearnViews.js`, `app.js`, `sync.js`, K3P legacy state ve ledger farkı yok. Schema veya migration değişikliği yok.
- Tam çalışma ağacı kapsam sayımı: K3PD-06 allowlist’inde `34/34` yol; korunan üç kirli dosya mevcut; dış kapsam `0`. Korunan SHA-256’lar değişmedi: `d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd`, `1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f`, `d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28`.
- `test_k3p_distractors.js` `2,203` sentetik görevde yinelenen seçenek üretmedi. Tarihsel sıra tabanı yok; sıra karşılaştırması `UNVERIFIABLE` olarak açık kalıyor.
- Şimdiki durum `ready_for_audit` / `NOT_MEASURED`; seq48 `PARTIAL` önceki implementasyona aittir. Taze bağımsız read-only denetim bekleniyor. Henüz kart kapatma veya commit yapılmadı.

## Bağımsız denetim ve kapanış — 2026-10-19

- Bağımsız denetçi düzeltilmiş diff’i yeniden inceledi ve K3PD-06’ya `PASS` verdi. Önceki seq48 `PARTIAL`, yalnız Flow öncesi 20-review kırpmasının bulunduğu eski diff’e aittir; taze denetimde aynı kusur yeniden üretilmedi.
- Denetçi gerçek bağlantıyı doğruladı: `kaoLessonReviewItems` tam due kuyruğunu aktarır; Flow review’ları R’ye göre sıralayıp en kararlı en çok beş warmup’tan sonra mevcut 20-review tavanına kadar seçer. `test_k3p_budget.js` gerçek `kaoLesson('start')` ile 60 due adayı kurup ilk 20 dışındaki düşük-R seçimi kanıtladı (`11/11`).
- Bağımsız davranış tekrarları: rhythm `5/5`, resume `7/7`, next-step `25/25`, lesson-flow `24/24`, budget `11/11`. Bağımsız tam A-9: `env -u KAO2_EVIDENCE_OUT node tests/kao/test_kao2_kabul.js` → `219/219`, exit 0; iç A-10 runtime `135.569 KiB`, CSS `15.877 KiB`, content `184.591 KiB`, p95 `6.116 ms`.
- Denetçi kapsamı PROMPTLAR allowlist’i ile karşılaştırdı: `34/34` izinli yol, `0` dış kapsam. Üç korunan kirli dosyanın başlangıç hashleri aynı. `App.kao*` `45`; schema, migration, production pin, legacy K3P state ve ledger farkı yok.
- `durum.mjs --check` exit 0. Tarihsel distractor sırası karşılaştırması baseline yokluğundan `UNVERIFIABLE` kaldı; 2,203 görevde yinelenen seçenek görülmedi ve bu alt kanıt bloklayıcı değil.
- K3PD-06 `done/PASS`, nextPrompt `K3PD-07` adayı. Program `releaseApproval=NOT_APPROVED`; push, merge, tag ve deploy yapılmadı. K3PD-07 başlatılmadı.
