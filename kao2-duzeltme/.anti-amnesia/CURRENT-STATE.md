# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-32
lastSeq: 86
status: active
-->

Son güncelleme: 2026-10-03 · LEDGER seq 86 · K2F-00…31 tamam (32/44), sıradaki K2F-32. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
K2F-31 bitti (**yerel, yayınlanmadı**): cevapta `daily[today].ms` (0–120 s sınırlı) kaydedilir, geri alma süreyi de geri alır; ders dakikası tekrar + dersin gerçek görev sayısından (`lessonTaskCount`: tanış+alıştırma+uygula) hesaplanır, ölçülmüş ms varsa ortalama kullanılır; tekrar 0 iken alt satır "N yeni kelime · ~M dk". Ayrıntı: [KANIT.md](../evidence/K2F-31/KANIT.md).
Önceki: K2F-30 bitti (**yerel, yayınlanmadı**): Ayarlar'a "Öğrenme" grubu (Okuma ile Gölgeleme arası): "Doğruda otomatik geç" switch'i (`App.kaoToggleAutoAdvance`, pinler 45/766/604) ve "Başlangıç noktasını değiştir" (`kaoOnboard('change-start')`: ilk açılışın 2. adımı, Vazgeç/Geri yazmaz, yalnız `onboarding.start` yazılır, Ayarlar'a dönülür). Varsayılan `settings.dailyNew` 10→5 (onboarding.minutes ile hizalı; kayıtlı ayar korunur). Ayrıntı: [KANIT.md](../evidence/K2F-30/KANIT.md).
Önceki: K2F-29 bitti (**yerel, yayınlanmadı**): Ayarlar gruplu listeye geçti — Günlük hedef · Ses · Okuma · Gölgeleme · Görünürlük · Veri · Hakkında; beş aç/kapat ayarı gerçek `switchRow` (etiket değer içermez), yeni handler yok. "Öğrenme" grubu K2F-30'da gelecek. Ayrıntı: [KANIT.md](../evidence/K2F-29/KANIT.md).
Önceki: K2F-28 bitti (**yerel, yayınlanmadı**): ders ve tekrar oturumunda NavBar/LargeTitle yok; üstte yalnız ✕ (`aria-label="Dersten çık"`, ≥44 px) ve içeriğin kendi ince ilerleme çubuğu. ✕ derste `kaoLesson('exit')`, tekrarda `kaoSetView('home')`; yeni görev çizilince odak soruya gider. Ayrıntı: [KANIT.md](../evidence/K2F-28/KANIT.md).
Önceki: K2F-27 bitti (**yerel, yayınlanmadı**): eski modal başlığı (`kao-header`, sabit h1, X) kalktı. NavBar tek üst çubuk; kökte "Kapat", diğer görünümlerde "‹ önceki"; dialog `aria-labelledby` görünümün LargeTitle h2'sine işaret eder (ders oynatıcıda `aria-label`). Ders oynatıcının görev/özet aşamasında NavBar'a tek "Kapat" eklenir (ders ekranı kendi "Kapat"ını taşır). Escape/Tab sözleşmesi aynı. Bağımsız code-reviewer APPROVE (CRITICAL/HIGH 0). Ayrıntı: [KANIT.md](../evidence/K2F-27/KANIT.md).
**Canlıda (2026-10-03, kullanıcı isteğiyle):** K2F-19…26 + ek turlar — `main` `dc3f3f06`, pin `20261003d`. K2F-27 canlıda DEĞİL (yayın yalnız kullanıcı "canlıya al" derse). Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-32 (İlerleme başlığı):** `PROMPTLAR.md` §K2F-32 (≈satır 951); `kaoStatsHTML` LargeTitle "İlerleme" (eski "İstatistik / Tutunma ve kalibrasyon" yok), R-bandı kalibrasyon tablosu kapalı `<details>` içinde tek cümlelik özetle; `tests/kao/test_kao2_progress.js` (R değişmez; yeni handler YOK, pinler 45/766/604 sabit).

## Canlı gerçekler (araçla ölçüldü, 2026-10-03)
- Dal: `kao2-duzeltme` = canlı `main` (`dc3f3f06`) + K2F-27 kod commit'i + `kao2-duzeltme/` belge commit'leri. Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini (canlı): `20261003d`; yerel dal: `App.kao*` 45 · App yüzeyi 766 · atama 604 · `onclick` 393 (canlı main 44/765/603).
- Kapılar (K2F-26 yayını sonrası): KAO 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/l2-paket/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 183,544 KiB (tavan 256) · runtime 115,478 KiB (tavan 128) · **css 13,442 KiB (tavan 14 — kalan ≈0,56 KiB)** · p95 4,6 ms.
- Testler: `test_kao2_lesson_flow.js` 23 · `test_kao2_review_apply.js` 15 · `test_kao2_reader.js` 14 · `test_kao2_hub.js` 10 · `test_kao2_arabic_tab.js` 4 (yeni) · `test_kao2_kabul.js` 10/10 ölçüt.
- Namaz eşlemesi: 19/32 `lp_*` eşli. Veri kapsamı (524 lemma): 162 unit11 köküne, 113 kognat kaymasına sahip.
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı metni yok (kaldırıldı).

## Açık riskler
- **K2F-31 ölçüm sınırları (kapatılanlar sonrası kalan):** `daily.ms` artık gecikmeli sûre cevabında da yazılır (ms/answered paydası tutarlı; seq 86). Kalan, spec'e bağlı: 120 sn üst sınırı (K2F-31 spec'i clamp ister) sekme arka planda beklenirse cevap başına 120 sn ekler → ortalama şişebilir; tahmin onboarding süresiyle (5/10/15 dk) sınırlıdır (05 §4) → 5 dk seçen kullanıcıda uzun ders "~5 dk" gösterir. `lessonPlan` maliyeti ölçüldü: `kaoNextStep` ≈0,09 ms/çağrı (200 çağrı ortalaması) → risk kapandı.
- **K2F-31 cihazda gözlenmedi:** Bugün/hub/özet dakika metinleri; tahmin onboarding süresiyle (5/10/15 dk) sınırlı olduğundan uzun ders 5 dk seçen kullanıcıda "~5 dk" gösterir (spec 05 §4 üst sınırı).
- **K2F-30 cihazda gözlenmedi:** Öğrenme grubu yerleşimi (switch + satır aynı yüzeyde), "Başlangıç noktasını değiştir" akışı (Ayarlar → ana ekranın yerine 2. adım → seçim → Ayarlar'a dönüş), "Vazgeç" etiketi, odak.
- **dailyNew varsayılanı 5 / eski kuyruk:** yalnız yeni/boş kayıtları etkiler (kayıtlı ayar korunur); onboarding sonunda `dailyNew=minutes` zaten yazılır. Ölçüm (seq 86): kartsız kullanıcıda `kaoStart` (eski aday yolu) 5'te 4 öğe (2 gramer + 2 parça, kelime 0), 10'da 9 öğe (3 kelime) üretir — kelime önceliği düşüktür, `dailyNew`'den bağımsızdır. Ana yol ders oynatıcıdır (`kaoLesson`, `lessonPlan` bütçesi) ve etkilenmez; `kaoStart` yalnız gece/ısınma/ek oturumda (kart varken) kullanılır. `kaoBuildQueue` kuralları P5 gereği değişmez → bilerek açık, kod değişikliği yok.
- **K2F-29 cihazda gözlenmedi:** gruplu yerleşim, anahtar/seg iç boşlukları, switch odak halkası (`outline-offset:-3px`). Kontrast aracı artık `.kao-group-surface` zeminini kullanır.
- **K2F-28 cihazda gözlenmedi:** ✕ ve ilerleme çubuğu yerleşimi, odağın soruya geçişi (yalnız `paintTask` yolunda; ders aşamaları arasında odak değişmez).
- **K2F-27 cihazda gözlenmedi:** `.kao-body` `padding-top:22px` NavBar üstüne ek boşluk bırakabilir, NavBar (`--kao-bg`) ve dialog yüzeyi farklıysa bant görünebilir; görev aşamasında NavBar "Kapat" overlay'i kapatır (`ui.kaoLesson` bellekte kalır; ders ekranının "Kapat"ı kaydedip ana ekrana döner) — eski X ile aynı, ilerlemenin kaydı ayrıca doğrulanmadı.
- **CSS payı dar (≈0,39 KiB):** K2F-27…29 CSS ekler/çıkarırsa 14 KiB tavanına dayanabilir; K2F-27 eski başlık CSS'ini kaldıracağı için pay büyüyebilir. Bütçeyi aşmak P6 durma koşuludur.
- **Silinen veri için tarama dersi:** bir alanı kaldırırken yalnız alan adlarını değil, nesnenin genel okumalarını da (`QuranCurriculumV2&&…surahs`, `Object.keys(...)`) tara; K2F-26'da böyle bir gizli tüketici yalnız kod incelemesiyle yakalandı.
- **"Neden böyle?" kapsamı sınırlı:** kök anlamı yalnız unit11 köklerinde (162/524 lemma); 12 ünitenin ilk dersi gerçek akışla ölçüldü.
- **Namaz eşlemesi muhafazakârdır:** fiil 1. tekil, kırık/müennes çoğul, birleşik ifadeler ve iki adaylı ʿabduhu eşlenmez → `NAMAZ-ESLEME-L2.md` (13 kelime), L2-PAKET.md. Artık risk: homograf fâil lemması; küme testi görünür kılar, önlemez.
- **Gerçek L2 uzman onayı yok:** dinî bağlamlı metinlerin onayı kullanıcı devriyle yapay zekâ incelemesidir (canlıda da böyle). L2 paketi: `kao2-duzeltme/evidence/K2F-24/L2-PAKET.md` (`kao2-duzeltme/tools/l2-paket-build.mjs --check` kapıda; seçim tarama tabanlıdır).
- g14-k2 çeldiricileri ("gelecek zaman/olumsuzluk/emir anlamı") genel yanlış seçeneklerdir, doğrulanmış veri değildir.
- Üretici araç inceleme kutularını korur; metni değişen satırın onayı taşınmaz (UYARI satırı kimlikleri söyler) ve yeniden işaretleme gerekir.
- Seviye 0 zinciri, Uygula cümleleri, yeni tanış kartı katmanları ve K2F-26 tanıtım kartı canlıda/cihazda gözle doğrulanmadı (kullanıcıda).
- P8: yeni handler hakkı bitti (K2F-12, 16, 30 kullanıldı); sonraki promptlarda yeni `App.kao*` gerekirse P6.
- Tarih-bağımlı test: `test_kao_requirements.js` bağ kur bölümü günün tohumuna bağlı (aralık 30; 45 simüle günde 0 hata).
- `tests/kao/README.md` envanterinde 24 test dosyası yok (K2F-41); K2F-41'de ayrıca D-12 kognat turu "ertelendi (K2F-25, seq 74)" notu eklenecek.
- iCloud Drive `… 2.*` kopyaları üretebilir (seq 12): `git add` yalnız açık dosya yollarıyla.
- Sandbox'ta `mktemp -d` ve `diff -` (stdin) reddediliyor; geçici işler için `$TMPDIR` altında elle dizin/dosya kullan. `$TMPDIR` ortak bir dizin: yalnız kendi oluşturduğun dosyaları sil.
- VM içinden dönen diziler başka realm'den: testlerde `assert.deepEqual` öncesi `Array.from(…)`/`plain()` kullan.
- Draft durumunu sınayan testler için `tests/kao/helpers/kao-harness.js` `legacyDraftState` (gerçek veride draft kalmadı).
- Sözlüğü sahtelemek için `t.win.QuranLexiconV1` değiştirilebilir (K2F-25 testi); her varyant taze `bootKao()` ister.

## Bekleyen kullanıcı işleri
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2.
- **L2 (GATE seq 71, waiting):** gerçek alan uzmanı onayı yoktur ve Claude veremez. `L2-PAKET.md` tek oturumda işaretlenecek madde listesidir. Uygunsa ilgili sayfada L2 kutusu `[x]` yapılıp **"L2 işaretlendi"** yazılır; kapı sonraki promptları engellemez.
- Cihaz teyidi (K2F-26 yayını): Arapça sekmesinde "Başla/Aç" düğmesi ya da "Ders kartı gizli · Göster" kartı görünmeli; "Göster"e basınca düğme gelmeli ve odak ona geçmeli (odak gerçek tarayıcıda gözlenmedi). Düğme hiç yoksa/hata varsa bana bildir.
- Cihaz doğrulaması (odak davranışı dahil — tarayıcıda gözlenmedi): Arapça sekmesinde düğmenin geri geldiğini (ya da "Ders kartı gizli · Göster" kartını) teyit et; gelmezse cihazdaki veri farklı bir durumda demektir.
