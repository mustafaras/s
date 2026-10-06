# KAO2-FIX — CURRENT STATE

<!-- k2f-sync
nextPrompt: K2F-39
lastSeq: 115
status: active
-->

Son güncelleme: 2026-10-06 · LEDGER seq 115 · K2F-00…38 tamam (39/44), sıradaki K2F-39. R-01…R-10 PASS (10/10).

## Şu an neredeyiz
**K2F-38 bitti (seq 109–110):** `tests/kao/test_kao2_denetim.js` R-01…R-10 kalıcı (10/10; R-04 güçlendirildi). Ek FIX: Seviye 0 "Örnek kelimeler" satırı (daralan kutu + binen Dinle) `app/kao.css`te düzeltildi, pin `20261006c`; yayın kaydı seq 111. Tam kapilar.sh bu konteynerde tamamlanmadı (LEDGER seq 115). Tüm yüzey taraması yapıldı (seq 112): NavBar etiketi kırılması düzeltildi; küçük notlar ve taranmayanlar LEDGER seq 115'de. Sıradaki: K2F-39.
**Metin taşma taraması (seq 107):** gerçek tarayıcıda her yüzey 390/320/200 px'te tarandı; 390/320'de metin taşması/kırpılması 0, 200 px'te 322 → 4 (yalnız kaydırmalı alanlar). Düzeltmeler `app/kao.css`; ayrıntı [EKRAN-TASMA.md](../evidence/K2F-37/EKRAN-TASMA.md).
**Ek (seq 106, canlıya alındı seq 108):** modal ekran görüntüsü taraması (390/320/karanlık, [EKRAN.md](../evidence/K2F-37/EKRAN.md)) iki kusur buldu ve düzeltti: ünite ilerleme kutusunda kırpılan halka (ölü CSS kuralı) ve ders kavram tablosunda Arapça yerine âyet referansı gösteren hücreler. Canlı pin 20261006a.
K2F-37 bitti ve **CANLIYA ALINDI** (main 8558b2cc, pin 20261006a, run 37457305595 success; bayt eşitliği kullanıcı terminalinde bekliyor — YAYIN.md): a11y/tasarım matrisi 445 yüzey (18 görünüm kaynaktan türetilir × boş/tohumlu + ilk açılış + ders aşamaları/panel + ustalık/onarım + S0 + odak modu) ve 42 dokunma-hedefi imzası ≥44 px; matris 3 gerçek kusur buldu ve düzeltildi (gate başlıklarında/kavram tablosunda lang/dir'siz Arapça, kök arama kutusunda etiket yok). Ayrıntı: [KANIT.md](../evidence/K2F-37/KANIT.md). 
**Ek (seq 102–103): CANLIYA ALINDI (main 59160810, pin 20261005b, run 37349172650 success; bayt eşitliği kullanıcı terminalinde bekliyor — YAYIN-2.md):** ekran görüntüsü kanıtı üretildi ([EKRAN.md](../evidence/K2F-35/EKRAN.md)); görüntüde bulunan kalan "N%" biçimi (Bugün kapsam satırı + tekrar doğruluğu `pct`) kaynakta `%N` yapıldı. Eski `47%’i` metni artık canlıda düzeltildi.
K2F-36 bitti (**yalnız test/kanıt; main'e alındı, run 37343918991 success, varlıklar bayt aynı, pin 20261005a**): `test_kao2_kabul.js` baştan yazıldı — A-1…A-10 gerçek handler/render/alt süreç ölçümü (A-1 iki yol 3 dokunuş · A-2 109 ders/1097 görev/524 lemma ihlal 0 · A-3 66 yüzey · A-4 9 durum + 12 ünite simülasyonu · A-5 · A-6 v1 ilerler · A-7 · A-8 gerçek kaoContinue · A-9 188/188 dosya çıkış 0 · A-10 bütçe). Mutasyon kanıtı kayıtlı. `KAO2_ACCEPT_SLOW_HOST=1` yalnız A-10'un makineye bağlı göreli p95 bandını atlar. Ayrıntı: [KANIT.md](../evidence/K2F-36/KANIT.md), [A-KABUL.md](../evidence/K2F-36/A-KABUL.md).
Önceki: K2F-35 bitti ve canlıya alındı (bkz. aşağı).
K2F-35 bitti (**canlıya alındı, bkz. YAYIN.md**; ek: dinleme şık konumu dengelendi, seq 98): ilerleme halkası Türkçe yüzde yazar (`%20`, görünür metin + aria-label); ünite satırı "x / y kalıcı kelime · a / b ders"; `namaz` taşı etiketi/koşulu gerçek kapsamı söyler ("Namazda geçen N kelime tanıdık", N = doğrulanmış namaz lemması); onboarding testi özet satırı "KAO2-11". Yeni handler/CSS yok. Ayrıntı: [KANIT.md](../evidence/K2F-35/KANIT.md).
Önceki: K2F-34 bitti (**yerel, yayınlanmadı**): okuma çeldiricileri en sık 60 kelimeden ve uzunlukça dengeli; doğru şık dönüşümlü konumda. Ayrıntı: [KANIT.md](../evidence/K2F-34/KANIT.md).
Önceki: K2F-33 bitti (**yerel, yayınlanmadı**): kelime detayında "Bu kelimenin dersi: Ünite N · başlık" + "Derse git" (kaoNav unit); eşlemesiz lemmada satır gizli, "Derse dön" yedeği; ders varken tek düğme. Yeni handler yok. Ayrıntı: [KANIT.md](../evidence/K2F-33/KANIT.md).
Önceki: K2F-32 bitti (**yerel, yayınlanmadı**): İlerleme ekranı kendi başlığını taşır (h2 "İlerleme"; "İstatistik / Tutunma ve kalibrasyon" kalktı); 10 R-bandı tablosu "Tekrar doğruluğu" bölümünde kapalı `<details class="kao-flag">` içinde, tek cümle özetle. Yeni CSS/handler yok. Ayrıntı: [KANIT.md](../evidence/K2F-32/KANIT.md).
Önceki: K2F-31 bitti (**yerel, yayınlanmadı**): cevapta `daily[today].ms` (0–120 s sınırlı) kaydedilir, geri alma süreyi de geri alır; ders dakikası tekrar + dersin gerçek görev sayısından (`lessonTaskCount`: tanış+alıştırma+uygula) hesaplanır, ölçülmüş ms varsa ortalama kullanılır; tekrar 0 iken alt satır "N yeni kelime · ~M dk". Ayrıntı: [KANIT.md](../evidence/K2F-31/KANIT.md).
Önceki: K2F-30 bitti (**yerel, yayınlanmadı**): Ayarlar'a "Öğrenme" grubu (Okuma ile Gölgeleme arası): "Doğruda otomatik geç" switch'i (`App.kaoToggleAutoAdvance`, pinler 45/766/604) ve "Başlangıç noktasını değiştir" (`kaoOnboard('change-start')`: ilk açılışın 2. adımı, Vazgeç/Geri yazmaz, yalnız `onboarding.start` yazılır, Ayarlar'a dönülür). Varsayılan `settings.dailyNew` 10→5 (onboarding.minutes ile hizalı; kayıtlı ayar korunur). Ayrıntı: [KANIT.md](../evidence/K2F-30/KANIT.md).
Önceki: K2F-29 bitti (**yerel, yayınlanmadı**): Ayarlar gruplu listeye geçti — Günlük hedef · Ses · Okuma · Gölgeleme · Görünürlük · Veri · Hakkında; beş aç/kapat ayarı gerçek `switchRow` (etiket değer içermez), yeni handler yok. "Öğrenme" grubu K2F-30'da gelecek. Ayrıntı: [KANIT.md](../evidence/K2F-29/KANIT.md).
Önceki: K2F-28 bitti (**yerel, yayınlanmadı**): ders ve tekrar oturumunda NavBar/LargeTitle yok; üstte yalnız ✕ (`aria-label="Dersten çık"`, ≥44 px) ve içeriğin kendi ince ilerleme çubuğu. ✕ derste `kaoLesson('exit')`, tekrarda `kaoSetView('home')`; yeni görev çizilince odak soruya gider. Ayrıntı: [KANIT.md](../evidence/K2F-28/KANIT.md).
Önceki: K2F-27 bitti (**yerel, yayınlanmadı**): eski modal başlığı (`kao-header`, sabit h1, X) kalktı. NavBar tek üst çubuk; kökte "Kapat", diğer görünümlerde "‹ önceki"; dialog `aria-labelledby` görünümün LargeTitle h2'sine işaret eder (ders oynatıcıda `aria-label`). Ders oynatıcının görev/özet aşamasında NavBar'a tek "Kapat" eklenir (ders ekranı kendi "Kapat"ını taşır). Escape/Tab sözleşmesi aynı. Bağımsız code-reviewer APPROVE (CRITICAL/HIGH 0). Ayrıntı: [KANIT.md](../evidence/K2F-27/KANIT.md).
**Canlıda (2026-10-05, kullanıcı isteğiyle): K2F-34 + K2F-35 + dinleme konumu — `main` `5a1aea85`, pin `20261005a`, Pages run 37330041514 success; canlı bayt eşitliği 9/9 + gizlilik 404 kullanıcı terminalinde doğrulandı (YAYIN.md).**
Önceki yayın (2026-10-04): K2F-19…33 + görsel QA düzeltmeleri — `main` `2715ad50`, pin `20261004b`, Pages run 37202523139, 9/9 bayt-eşit. Cihaz doğrulaması kullanıcıda.
**Kullanıcı yönergesi: sırayla, her seferinde tek madde; cihaz doğrulamasını kullanıcı yapıp bildirecek.**

## Sıradaki promptun tek cümlesi
**K2F-39 (CSS ve ölü kod temizliği):** `PROMPTLAR.md` §K2F-39 (`grep -n "^#### K2F-39"`); CSS payı 13,896 / 14 KiB; genel `.kao-secondary{width:100%}` gibi flex içinde tuzak olan kuralları tara.

## Canlı gerçekler (araçla ölçüldü, 2026-10-03)
- Dal: `kao2-duzeltme` = canlı `main` (`dc3f3f06`) + K2F-27 kod commit'i + `kao2-duzeltme/` belge commit'leri. Sonraki push yalnız kullanıcı isteğiyle / K2F-43 kapısında.
- Yayın pini: `20261006c`; yerel dal: `App.kao*` 45 · App yüzeyi 766 · atama 604 · `onclick` 393 (canlı main artık yerel dalla aynı: 45/766/604).
- Kapılar (K2F-26 yayını sonrası): KAO 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders/driver/zikr/kontrast/l2-paket/plan-check/sync PASS.
- `tekrar-uret.cjs`: **10/10 PASS**.
- Bütçe (perf): içerik 183,544 KiB (tavan 256) · runtime 115,478 KiB (tavan 128) · **css 13,661 KiB (tavan 14 — kalan ≈0,34 KiB) · runtime 116,270 KiB (K2F-34 sonrası)** · p95 4,2 ms.
- Testler: `test_kao2_lesson_flow.js` 23 · `test_kao2_review_apply.js` 15 · `test_kao2_reader.js` 14 · `test_kao2_hub.js` 10 · `test_kao2_arabic_tab.js` 4 (yeni) · `test_kao2_kabul.js` 10/10 ölçüt.
- Namaz eşlemesi: 19/32 `lp_*` eşli. Veri kapsamı (524 lemma): 162 unit11 köküne, 113 kognat kaymasına sahip.
- Metin durumu: üniteler 12/12 · dersler 109/109 · S0 12/12 · kavramlar 25/25 sourced; sûre tanıtımı metni yok (kaldırıldı).

## Açık riskler
- **CSS payı çok dar:** 13,872 / 14 KiB (≈0,13 KiB kaldı); K2F-39 CSS temizliği payı açmalı, aksi hâlde yeni kural P6.
- **Ders kavram tablosu dar ekranda yatay kaydırır:** 390 px'te 3. sütun kısmen taşar (tablo sarmalayıcısı kaydırılabilir, sayfa taşmaz — sw=cw her yüzeyde ölçüldü); tasarım kararı gerekirse sütun/yazı küçültme ayrı iş.
- **K2F-37 cihazda/ekran okuyucuda gözlenmedi:** lang/dir sarmalayıcıları ve etiketler VoiceOver ile dinlenmedi (yalnız kaynak/test).
- **Kabul testi süresi:** A-9 aileleri çalıştırdığı için `test_kao2_kabul.js` ≈3–4 dk; `kapilar.sh` içinde aileler iki kez koşar. Gerekirse sonraki promptta (K2F-38/39) paylaşılan sonuç önbelleği düşünülebilir.
- **Kök dizindeki geçici dosyalar:** K2F-36 oturumunda `$TMPDIR` boştu; `/mut`, `/kabul.log`, `/A-KABUL.md` vb. kök dizine yazıldı (depoyu etkilemez, ephemeral konteyner). Silme güvenlik denetimince engellendi; yeni oturumda gerek yok.
- **Perf (K2F-35 sonrası):** konteyner ≈1,8× yavaş olduğundan `test_kao2_perf_budget`/`test_kao2_kabul` göreli bandı (5,09 ms×1,25) burada düşer; makineden bağımsız A/B (`tools/perf-ab.cjs`, cari vs `07802fa6`, aynı süreç) en iyi-3 oranı 1,10–1,13 → +%25 bandının içinde. Referans makinede bir kez koşulup teyit edilmeli.
- **K2F-35 cihazda gözlenmedi:** halka `%N` metninin 44/28 px halkada sığması, ünite satırı "kalıcı kelime" uzunluğu, namaz taşı etiketi.
- **K2F-34 cihazda gözlenmedi:** yerleştirme/kapı okuma şıklarının yeni dağılımı (doğru şık 1./2./3. düğmede).
- **Görsel QA düzeltmeleri canlıda** (LEDGER seq 90–94); yalnız cihazda gözlenmedi: ›/yapışık çubuk/sarılan Niyet/ikon hizası/--f-N aralıkları telefonda teyit edilmeli.
- **K2F-32 cihazda gözlenmedi:** İlerleme ekranında katlanan öngörü bölümünün (summary ≥44 px) görünümü ve dokunma davranışı.
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
- **Oturum başlatıcı:** [OTURUM-BASLATICI-K2F-38.md](../OTURUM-BASLATICI-K2F-38.md) (yeni oturumda yapıştır).
- Cihaz doğrulaması (telefonda canlı site) kullanıcıdadır ve ayrıca bildirilecektir. Kalan kapı: K2F-43 YAYIN-2.
- **L2 (GATE seq 71, waiting):** gerçek alan uzmanı onayı yoktur ve Claude veremez. `L2-PAKET.md` tek oturumda işaretlenecek madde listesidir. Uygunsa ilgili sayfada L2 kutusu `[x]` yapılıp **"L2 işaretlendi"** yazılır; kapı sonraki promptları engellemez.
- Cihaz teyidi (K2F-26 yayını): Arapça sekmesinde "Başla/Aç" düğmesi ya da "Ders kartı gizli · Göster" kartı görünmeli; "Göster"e basınca düğme gelmeli ve odak ona geçmeli (odak gerçek tarayıcıda gözlenmedi). Düğme hiç yoksa/hata varsa bana bildir.
- Cihaz doğrulaması (odak davranışı dahil — tarayıcıda gözlenmedi): Arapça sekmesinde düğmenin geri geldiğini (ya da "Ders kartı gizli · Göster" kartını) teyit et; gelmezse cihazdaki veri farklı bir durumda demektir.
