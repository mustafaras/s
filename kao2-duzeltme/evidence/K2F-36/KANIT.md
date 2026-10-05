# K2F-36 — Kabul testi gerçek ölçüm
Tarih: 2026-10-05 · Dal: claude/nifty-feynman-y2kva3 · Önceki commit: a88d7066 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K6-01 · K2-04 · K2-05 · M-02 (ölçüm) · R değişimi: yok (10/10 → 10/10)

## İlerleme günlüğü
- [x] P1: sync PASS, STATE in_progress
- [x] test_kao2_kabul.js baştan yazıldı (harness + gerçek handler'lar)
- [x] A-1…A-10 + P10 PASS (yavaş konteyner bayrağıyla; bayrak yalnız A-10 göreli bandını atlar)
- [x] mutasyon kanıtı (/mut kopyası, commit edilmez)
- [x] A-KABUL.md üretildi (KAO2_EVIDENCE_OUT)

## Yapılan
- A-1: iki yol (rahat okur / harf bilmez), her dokunuş ekranda GERÇEKTEN var olan onclick'ten yapılır ve sayılır; "sabit 3" totolojisi kalktı. Sonuç: ikisi de 3 dokunuş (session/intro ve s0 Aşama 1).
- A-2: 109 dersin tamamı gerçek handler'larla oynatılır (1097 görev); her yeni lemma için planda tanış kartı, aynı lemmanın her alıştırmasından önce gelir ve `introducedLemmas` kaydına düşer; 524 yeni lemma, ihlal 0.
- A-3: 66 yüzey — 17 görünüm × {boş, tohumlu}, ilk açılış 5 ekran (yerleştirme dahil), ders aşamaları, cevap sonrası panel-açık, ustalık, S0; birincil düğme ≤1, NavBar ≤1, görünüme özgü işaretçi doğrulanır. (K2-05 kapsam açığı kapandı.)
- A-4: 9 durum × beklenen tür (onboarding, s0-lesson, daily, night-review [gerçek kaoNightWindow], rest, mastery, next-unit, repair, warmup) + 12 ünite simülasyonu (Ünite 3 bir kez kalır → onarım → geçer; son "Tüm üniteler tamam ✓"). Regex ile tür sayımı kalktı.
- A-5: 524/524 lemma → derse bağlı ve ders listesinde doğrulandı; 25/25 kavram bağlı ve sayfası boş değil; 20/20 sûre tanıtımı render ile. (Önceki M-02 K2F-26'da kapanmıştı; ölçüm sıkılaştı.)
- A-6: v1 verisi 9 kök alanda birebir korunur; ayrıca v1 kullanıcısı gerçekten ilerler (ısınma oturumu oynanır) ve eski değerler/işaretler kalır; sûrenin gecikmeli kontrol sayacı ilerler (kayıp değil). `measure(..., true)` sabit geçişi kalktı.
- A-7: tasarım sözleşmesi + kontrast (778 çift, 0 ihlal) + ayarlarda ≥5 switch, ham checkbox 0.
- A-8: gerçek `kaoAnswer` → panel 3 yeniden çizimde görünür kalır (Devam + geri bildirim) → gerçek `kaoContinue` ile kapanır ve ilerler. Eski "paneli elle kapat" kaldırıldı.
- A-9: aileler GERÇEKTEN çalıştırılır (alt süreç, çıkış kodu): 188/188 dosya (kao 51 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders 1). Dosya sayımı kalktı. Bu dosya ve A-10'un çalıştırdığı bütçe testi hariç.
- A-10: bütçe testi alt süreç olarak çalışır ve çıkış koduna bakılır; PASS koşuluna içerik ≤256 KiB eklendi. `KAO2_ACCEPT_SLOW_HOST=1` YALNIZ testin göreli p95 bandını (KAO2-01 makinesine bağlı) atlar, satırda açıkça yazılır; varsayılan katıdır.

## TDD
- Bu prompt test dosyasının kendisidir: "kırmızı" yerine ölçüm + mutasyon.
- Eski dosyanın totolojileri (K6-01) gözle ve çalıştırarak kanıtlandı: `const taps = 3`, regex tür sayımı, dosya sayımı.

## Kapılar (P3)
- `KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js` → 10/10 PASS (A-9 dahil 188/188 çıkış 0).
- Bayraksız (katı) koşuda bu konteynerde yalnız A-10 göreli bandı düşer (makine ≈1,8× yavaş; bkz. K2F-35 YAYIN.md A/B ölçümü). Referans makinede beklenen: PASS.
- kapilar.sh: aşağıdaki "Kapılar sonucu" bölümüne işlenmiştir.
tekrar-uret: 10/10 PASS (önceki 10/10)

## Mutasyon kanıtı (commit edilmez; /mut kopyasında)
1. `kaoMasteryRecord`ta `masteryAt` yazımını kaldır → **A-4 FAIL** ("sıradaki adım 500 adımda sona ermedi (ünite ilerlemiyor)").
2. Onboarding'in S0 dalında ilk S0 dersini açan satırı kaldır → **A-1 FAIL** ("harf bilmez 3 dokunuş → home (Aşama 1)").
3. `kaoPanel` cevap sonrası `open:false` → test kırmızı (simülasyon/A-8 yolu; uygulama panelini kapatan sürüm yakalandı).
Dosya hepsinde geri alındı (`cmp` ile doğrulandı).

## Ölçümler
- Kabul: 10/10 ölçüt + P10 gerçek değerlerle, A-KABUL.md (bu klasörde).
- Süre: kabul testi ≈3–4 dk (A-9 aileleri çalıştırdığı için).

## Bilerek değişen testler
- test_kao2_kabul.js: baştan yazıldı · K6-01/K2-04/K2-05/M-02 · tüm A-satırları artık gerçek ölçüm.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (A-11/A-12 kullanıcıda)

## Sürprizler / sonraki promptlara not
- Bu kabuk oturumunda `$TMPDIR` boş çıktı: önceki komutlarda `$TMPDIR/…` yolları kök dizine (`/…`) yazıldı (`/mut`, `/kabul.log`, `/A-KABUL.md` vb.). Depoyu etkilemez; güvenlik denetimi kök yoldaki silmeyi engellediği için silinmedi, kullanıcıya bildirildi. Sonraki işler `/tmp/claude-0/.../scratchpad` kullanmalı.
- `kaoStart` true değil kuyruk uzunluğu (sayı) döndürür; tek tip dönüş K2F-38/39 temizliğinde değerlendirilebilir (bu promptta değişmedi).
- Kabul testi artık bütün aileleri çalıştırdığı için kapilar.sh içinde aileler iki kez koşar (≈+3 dk).
