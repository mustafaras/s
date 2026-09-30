# KAO2 · Tam denetim — kusur raporu

**Tarih:** 2026-09-30 · **Denetlenen:** `main` = `origin/main` = `kao2-yeniden-tasarim` = `07802fa6`
**Kapsam:** `kuran-ogreniyorum-v2/` klasörünün tamamı (denetimden sonra `archive/kuran-ogreniyorum-v2/` altına taşındı) (01–10 plan belgeleri, `UYGULAMA-PROMPTLARI.md`
28 kart + P1–P10 protokolü, STATE/LEDGER/CURRENT-STATE, 28 kartın kanıtı, kapanış belgesi) ve bu
belgelerin iddia ettiği kod: `app/core/quranLearn{,Flow,Views}.js`, `app/kao.css`, KAO içerik
modülleri, `tests/kao/`, KAO araçları.
**Düzeltme planı:** [`DUZELTME-PLANI.md`](DUZELTME-PLANI.md) · **Yeniden üretme:** `node kao2-duzeltme/denetim/tekrar-uret.cjs`

---

## 0. Tek paragraf özet

Programın **kodu testlerin gözünde yeşil** (KAO 45/45 · app 77/77 · panel 23/23 · panel-v2 27/27 ·
quran 9/9 · reminders/driver/zikr/kontrast/sync PASS), ama **öğrenme deneyimi ana yollarda
kırık**. Dört kritik kusur canlı yayında: (1) Ünite ustalığı hiç kaydedilmiyor, bu yüzden her
kullanıcı — **v1 ilerlemesi olan mevcut kullanıcı dahil, ilk açılıştan itibaren** — "Ustalık: Fâtiha"
adımına kalıcı olarak kilitleniyor; (2) gramer alıştırmaları yanlış Arapça dilbilgisini "doğru"
olarak öğretiyor; (3) Arapça okuyamayan kullanıcının Seviye 0 yolu içeriksiz (48 dokunuşta,
hiç harf görmeden "bitiyor"); (4) KAO2-21'in Seviye 0 ekranı üretimde hiç çalışmıyor (tanımsız
handler + 12 dersin 6'sında çökme). Kusurların testlerden kaçmasının ana nedeni, kapanıştaki
"A-1…A-10 10/10 PASS" tablosunun çoğu ölçütü **gerçekte ölçmemesi** (sabit değer, dosya sayımı,
regex sayımı). Program belgeleri de gerçek durumu yanlış anlatıyor (onay durumu, backlog, kapılar).

| Önem | Sayı | Anlamı |
|---|---:|---|
| 🔴 KRİTİK | **4** | Canlıda öğrenmeyi durduran ya da yanlış öğreten |
| 🟠 YÜKSEK | **11** | Kullanıcıya görünür hata / temel vaat ya da kanıt zinciri kırık |
| 🟡 ORTA | **24** | Plan–kod sapması, eksik gereksinim, zayıf test |
| ⚪ DÜŞÜK | **10** | Kalıntı, belge ve etiket tutarsızlığı |
| **Toplam** | **49** | + 3 geri çekilen ara bulgu (§9) |

> Ara raporlarda verdiğim bölüm sonu toplamları (ör. "9 yüksek") birkaç kez yanlış toplanmıştı;
> bu tablo her bulgu tek tek sayılarak kesinleştirildi.

## 1. Yöntem ve kanıt düzeyi

- **Salt okur.** Tarayıcı açılmadı, sunucu başlatılmadı, `seyma-data`'ya dokunulmadı (CLAUDE.md
  DATA SAFETY). Hiçbir üretim dosyası değiştirilmedi.
- **Kaynak/test kanıtı:** tüm kapı komutları yeniden koşuldu; her iddia `node:vm` içinde
  gerçek `SeymaQuranLearn` motoruyla **gerçek handler'lar üzerinden** yeniden üretildi (109 dersin
  tamamı uçtan uca yürütüldü: 1087 görev, 0 çalışma zamanı hatası).
- **Yeniden üretme betiği:** [`tekrar-uret.cjs`](tekrar-uret.cjs) — 10 kontrol, doğru davranışı
  bekler. **Bugün: 0/10 PASS · 10 FAIL** (çıkış kodu 10). Düzeltmelerden sonra 10/10 PASS olmalıdır.
- **Yapılmayanlar:** cihaz, ekran okuyucu ve gerçek tarayıcı gözlemi yok. "Canlıda" ifadesi,
  canlıdaki dosyaların yereldekiyle bayt-eşit olduğunu gösteren kanıtlara (`evidence/KAO2-2x/YAYIN.md`)
  dayanır; davranış cihazda gözlenmedi.
- Kod bir yerde "kapandı" diyor ama davranış göstermiyorsa bulgu olarak yazıldı; kod ve davranış
  doğruysa (testler zayıf olsa bile) kusur yazılmadı, yalnız test zayıflığı not edildi.

## 2. 🔴 Kritik bulgular

### K4-01 · Ünite ustalığı hiç kaydedilmiyor → kullanıcı Ünite 1'de kalıcı kilitli
- **Belirti:** Ünite 1'in 5 dersi bitince Bugün ve hub kartı "Ustalık: Fâtiha" der. Başlatınca
  ustalık kontrolü değil, **u01.05'in alıştırmaları** yeniden oynatılır (plan: goal, 10×practice,
  apply, summary). Bitince hiçbir şey yazılmaz; ertesi gün yine "Ustalık: Fâtiha". Sonsuz döngü.
- **v1 kullanıcıları:** Ünite 1–3 kelimeleri kartlı mevcut kullanıcı, KAO2'yi **ilk açtığı an**
  aynı adıma kilitlenir (dersler karttan türetilerek "tamam" sayılır; 08 §1).
- **Kök neden:** üretim kodunda `path.units[id].masteryAt` yazan satır **yok**
  (yalnız normalizasyon `quranLearn.js:3196`). `kaoLessonStart` ünite kimliğini ünitenin son
  içerik dersine çözer (`quranLearn.js:1400-1402`). 07 §3'teki ustalık kontrolü (çapa metnini
  dokunmadan oku + 10 soruluk karma test, ≥8/10, altında onarım dersi) **hiç uygulanmadı**.
- **Yan etki:** `u1…u12` taşları kazanılamaz; Yol ekranı %100 biten Ünite 1'i `aria-current="step"`
  işaretler; elle Ünite 2'ye geçilse bile "sıradaki adım" Ünite 1'e döner (D-13 ve A-4 bozulur).
- **Neden kaçtı:** `test_kao2_next_step.js:120,144` ve `test_kao2_milestones.js:50` `masteryAt`'ı
  **elle** yazıyor; ustalık akışını uçtan uca süren test yok.
- **Yeniden üret:** `tekrar-uret.cjs` R-01, R-02.

### K4-02 · Gramer alıştırmaları yanlış Arapça dilbilgisini "doğru" diye öğretiyor
- **Belirti ("Ek çöz"):** cevap her kavramda `'el + ' + satır` kalıbıyla kurulur; yalnız g1 ("el-")
  için doğrudur. Doğru kabul edilen örnekler: بِسْمِ → "el + ile", إِلَىٰ → "el + -e doğru",
  قَبْلِكَ → "el + -in", مِّثْلِهِۦ → "el + -ı (onun)", نِعْمَة → "el + nimet", خَرَجْتَ → "el + sen (erkek)",
  قُلْ → "el + sen", أَيُّهَا → "el + ey". g8/g13/g15'te uyaran Arapça değil Türkçe metin
  ("-dığı, ki", "biz", "yaptınız (ikiniz)").
- **Belirti ("Kelime dizme / Parça çevir / Anlam seç"):** yönerge şablondan, uyaran ve cevap
  tablodan rastgele satırdan gelir: "'hesap gününün sahibi' tamlamasını diz" + ٱللَّهِ → doğru
  "Allah'ın adı"; "'bizi dosdoğru yola ilet' parçasını diz" + ٱلْكِتَـٰبُ → doğru "kitap".
  **Herkesin ilk dersi u01.01'in 4 gramer görevinin 4'ü tek şıklıdır** (şık "Arapça sıra" hep doğru).
- **Ölçek:** 109 dersin gerçek yürüyüşünde **78 gramer görevinin 45'i kusurlu (%58)**:
  4 tek şık (u01.01) · 11 "Ek çöz" yanlış "el +" cevabı (g3, g5, g8, g11, g13, g15, g17, g18) ·
  2 Arapça olmayan uyaran · 4 "Çekim tablosu" yönerge ≠ uyaran ('o yaptı' ↔ 'biz') · 24 görevde
  uyaran, şablonun bağlı olduğu doğrulanmış âyet örneğinde hiç geçmiyor (ör. g9-e3 = 2:134
  تِلْكَ أُمَّةٌ قَدْ خَلَتْ yerine ذَٰلِك; g24-e3 = 3:144 yerine غَفُورٌ). Kural seti `tekrar-uret.cjs`
  R-03'te. FSRS bu kartları sonraki günlere serpiştirdiği için (D-05) yanlış bilgi tekrar tekrar pekiştirilir.
- **Kök neden:** doğrulanmış kaynak `docs/kuran-ogreniyorum/content/grammar.verified.json` 86
  şablonun 43'ünü çözümlü âyet örneğine bağlar (43/43 çözümlenebilir; ör. g0_5-e1 = 2:127
  يَرْفَعُ إِبْرَٰهِـۧمُ ٱلْقَوَاعِدَ). Çalışma zamanı modülü `QuranGrammarV1` dondurulurken **`examples`
  ve `explanation` alanları atılmış** → `exampleId`'ler sarkık; `kaoBuildGrammarTask`
  (`quranLearn.js:1135-1161`) seed ile rastgele tablo satırına düşer.
- **Köken:** kod KAO-12'den (`8d1f9f4a`, v1) miras; KAO2-12 onu her kavram dersine yaydı; 03
  pedagoji analizi ve KAO2-18 (hata açıklamaları) fark etmedi. KAO/KAO-FIX kapanışları "açık bulgu
  yok" diyor — o programların kapanış iddiası da bu noktada yanlıştır.
- **Yeniden üret:** R-03.

### K5-01 · Okuyamayan kullanıcının Seviye 0 yolu içeriksiz
- **Belirti:** İlk açılışta "Henüz değil · harflerle başlayalım" → Bugün'ün tek düğmesi
  `kaoLesson('start','s0.01')` → ders oynatıcı; **12 S0 dersinin 12'si** plan = `goal, apply, summary`
  ("Bu derste 0 kelimeyle çalışacağız. Önce tanış, ardından kavramı gör…"). 48 dokunuşta Seviye 0
  "biter", hiç harf gösterilmeden Fâtiha dersine geçilir ve **`besmele` taşı kazanılır**.
- **Kök neden:** `nextStep` S0 adımını ders oynatıcıya yönlendirir (`quranLearn.js:2625`); oynatıcı
  S0 derslerinde `lemmaIds` olmadığı için boş plan üretir. KAO2-21'in içerikli S0 akışı ayrı
  yüzeydedir (B2 kararı) ve bu yoldan hiç açılmaz. D-10 fiilen uygulanmamış.
- **Yeniden üret:** R-04.

### K5-02 · KAO2-21 Seviye 0 ekranı üretimde çalışmıyor
1. `App.kaoS0` **app.js'te tanımsız** (referans↔tanım farkı yalnız bu). Keşfet satırı, "Sıradaki
   adım", "Kelimeyi dinle", "Kelime kelime dinle", "Okudum" → tarayıcıda `TypeError: App.kaoS0 is not
   a function`. LEDGER seq 77 "S0 tek eylem handler'ı üzerinden çalışır" yanlış.
2. `kaoS0('start')` görünümü `s0`'a geçirmez; hiçbir kod `kaoView='s0'` yapmaz.
3. Keşfet'teki S0 satırı yalnız **kartı olan** kullanıcıda görünür (`quranLearn.js:2645`) — yani
   okuyamayan kullanıcıda hiç yok.
4. **12 dersin 6'sı çöker:** s0.01, s0.03, s0.07, s0.08, s0.09, s0.11 → `kaoS0HTML` içinde
   `TypeError: Cannot read properties of undefined (reading 'id')` (`quranLearn.js:707`,
   `flow.letters[0].id`; harfsiz dersler). Giriş satırı tam da s0.01'i açar.
5. Aşama ilerlemesi içeriği değiştirmez: intro/listen/drill/read aşamalarında aynı statik sayfa;
   kartın istediği 6–8 alıştırma (harf tanı, hece-hareke eşle, konum eşle) ekranda yok.
- KAO2-22 hece sesi hattı yalnız bu yüzeye bağlı → fiilen etkisiz.
- **Neden kaçtı:** `test_kao2_s0.js` yalnız harfli `s0.02`'yi `kaoS0HTML()`'i doğrudan çağırarak
  sınar; a11y/A-3 testlerindeki `s0` görünümü aslında ana ekranı çizer (K6-02).
- **Yeniden üret:** R-05, R-06.

## 3. 🟠 Yüksek bulgular

| ID | Bulgu | Kanıt / yeniden üret |
|---|---|---|
| **K5-03** | Canlıda görünen ders başlık/hedefleri dersin gerçek kelimeleriyle çelişiyor: u02.01 "Yön belirten ekler (-de, -den, -e)" ↔ akbar/ilâh/ayyuhâ/inn/illâ (edat yok) · u02.02 "Zamirler" ↔ subhân/salât/selâm/tayyibât/berekât (zamir yok) · u04.01 "'-an, -en' bağları" ↔ man/ann/an/kad/summ · u04.02 "Şüphesiz ve ancak" ↔ av/bal/kull/baʿd/ʿind (inne/illâ u02.01'de) · u09.01 "Emir kipi: yap!" ↔ geçmiş zaman fiilleri · u09.02 "Seslenme: ey…" ↔ attabaʿa/attahaza/ahraca · u10.01 "Yapan ve yapılan" ↔ fâil/mef'ûl kalıbı yok · u11.04 "Esenlik dileği" ↔ mu'minât/tahiyyet/**amâta (öldürdü)** · u11.05 "Hidayet" ↔ aşraka (şirk koştu) · u12.02 "Zaman bildiren yardımcı fiiller" ↔ lammâ/kabl/iz/baʿd (fiil değil). Kavram kartı (ör. g3 edatlar) ilgisiz kelimelerle pekiştiriliyor. | `QuranCurriculumV2` + `texts.tr.json` + lexicon `pos` |
| **K5-04** | 133 metnin L1 onayı **çıkarımla** verildi: `c1e11d5e` ve LEDGER seq 70 "Kullanıcının yayın talimatı proje sahibi (L1) onayı sayıldı"; `INCELEME-KAO2-17.md`'de **133 kutunun 133'ü boş**; `--apply-review` o tarihte yoktu (seq 73). K-4'ün L1'i insan incelemesidir. K5-03'teki hatalar bu yüzden yakalanmadı. | `git show c1e11d5e`; `grep -c '\[x\]'` = 0 |
| **M-01** | Belgeler onay durumunu yanlış anlatıyor: KAPANIŞ §6, CURRENT-STATE, CLAUDE.md/AGENTS.md "L1 bekliyor: 133 metin · draft görünmez" diyor; veride 133 metin `sourced` ve görünür. Gerçekte `draft`: 25 kavram + 20 sûre bağlamı + 12 `whyReview`. K5-04 ile birlikte çözülmeli. | `texts.tr.json` review.level sayımı |
| **M-02** | A-5 "PASS" ama 20/20 sûre bağlamı `draft` → 0 yayında; ölçüt "bağlam hazır" diye gevşetilmiş (09 §2 A-5 = "20/20 sûre bağlamı"). | `test_kao2_kabul.js:145-155` |
| **M-03** | 20 `contextTr` yalnız `QuranRevelationOrderV1` alanlarının (ad/yer/âyet sayısı/themeTr) yeniden cümlelenmesi; okuyucu tanıtım kartı bunları zaten gösteriyor (yeni bilgi yok). `review.sources` Diyanet meal başlıkları / TDV İA / Kahire Mushafı gösteriyor, `derivedFrom` ise yalnız iç veri → atıf gerçek türetimle uyuşmuyor. | `texts.tr.json` surahs |
| **K2-01** | Çift başlık kromu: eski `.kao-header` (eyebrow "Kur'an Arapçası · Günlük öğrenme" + h1 "Kelimelerini tanı, âyetleri anla" + X) her ekranda NavBar + LargeTitle'ın üstünde; Ayarlar'da "Ayarlar" 3 kez; kökte X + "Kapat". Dialog `aria-labelledby` her ekranda aynı h1. T-06/T-07/O-01 "kapandı" ama 06 §2 sağlanmıyor. | `kao.css:11-13`; overlay dökümü |
| **K2-02** | Ayarlar anahtarları Switch bileşeni değil: `.kao-toggle` metin düğmeleri "Gölgeleme: kapalı" (+`role="switch"`) — O-04'ün birebir tarifi. `switchRow` + `.kao-switch-track` (51×31) ayarlarda kullanılmıyor. Ayarlar hâlâ 7 eski bölüm. Tasarım sözleşmesi (f) yalnız `role` niteliğine bakıyor. | `quranLearn.js:1755-1768` |
| **K2-04** | A-4 ölçümü boş: 7 senaryonun 4'ü (s0/nightReview/rest/warmup) `daily` döndürüyor; PASS koşulu kaynakta regex'le ≥7 tür adı. (Motor doğru: `test_kao2_next_step.js` gerçekten ayırt ediyor.) | enstrümanlı koşu |
| **K3-01** | "Uygula" adımı 109 dersin **97'sinde boş**: araç eşlenemeyen derse `{kind:'examples', ref:null}` yazar (`kao2-curriculum-build.mjs:79`); `applyWords` bu türü işlemez (`quranLearnFlow.js:103-119`); ekran "Çapa metni" + boş liste. 07 §3 çapaları (seçme âyetler, kıssa, Rabbenâ duaları) üretilmedi. D-06 fiilen yok. | R-08 |
| **K3-06** | Hata: Ayarlar "Niyet" satırı `q.settings.intent` okur, niyet `q.onboarding.intent`'e yazılır → "Yatsıdan sonra" seçen "Niyet: Henüz seçilmedi" görür. KAO2-23 iddiası yanlış; test yok. | R-07; `quranLearn.js:1761` vs `2802` |
| **K6-01** | Kapanış kabul tablosu ölçmüyor: A-1 `const taps = 3` + `taps<=3` (totoloji) · A-4 regex (K2-04) · A-5 gevşek (M-02) · A-8 "Devam"a basmıyor, paneli elle kapatıyor · A-9 testleri **çalıştırmıyor**, dosya sayıyor (kao≥44, app≥77) · A-10 PASS koşulunda içerik ≤256 yok · A-3 14 görünümün 3'ü ana ekranı çiziyor. Gerçek ölçüm: A-2 (tek ders), A-6, A-7 (kısmen). | `test_kao2_kabul.js:42-247` |

## 4. 🟡 Orta bulgular

| ID | Alan | Bulgu |
|---|---|---|
| M-04 | Süreç | `KAO2-A` (`51570555`: bütçe 88→128, 20 contextTr, elif uzlaştırması, pin f→g) ve `KAO2-21 hazırlık` (`98c1ff1f`) commitleri kart dışı; LEDGER'da kayıt yok. |
| M-05 | Süreç | P4 "tek commit" ihlalleri: KAO2-24 kapanış kayıtları ayrı commit (`1a550b72`); çok sayıda yayın/pin ek commit'i; KAO2-27'de 3 commit (sonuncusu yalnız zaman damgası). |
| M-06 | Durum | `KAO2-STATE.json` bayat: `releaseApproval:"not_approved"` + `lastRelease` KAO2-20 + onay kaydı yalnız KAO2-17, oysa 21–27 canlı; G1/G3/G4 kapatılmamış; `versionPolicy` 20260928b anlatıyor; `analysis.journeyFindings {K9,Y8,O9}` yanlış (gerçek K9·Y13·O4 + P10); KAO2-19 notu "contextTr yazılmadı" bayat; backlog'da durum alanı yok. |
| M-07 | Durum | CURRENT-STATE "Açık riskler" bayat: "KAO2-18+ için ~0,6 KiB", "KAO2-17 dâhil yayınlanmamış işler", "INCELEME-KAO2-17 doldurulmalı". |
| M-08 | Kapanış | KAPANIŞ §2 bulgu kimlikleri yanlış: Y-05 (= boş âyet vaadi) "sûre bağlamı"; Y-01…03 (= hub kartı) "ilk kullanıcı yolu"; T-01…05 (= hub görseli) "gezinme yığını"; T-13…15 "Ayarlar". ~62 bulgunun kapanış eşlemesi yok (bkz. §8). |
| M-09 | Kapanış | KAPANIŞ iç çelişkileri: "son pin 20260930k (KAO2-27'de l)"; p95 7,1 ms ↔ A-KABUL 4,3–4,9; §7 "sonra push/deploy kararı" — her şey zaten canlı. |
| M-10 | Kapı | 08 §7 kapısı `kao-plan-check` **22 FAIL** (c7d5190/a488e5c `chore(kao)` kapsam dışı dosyalar, 5157055 `KAO2-A`, 98c1ff1 hazırlık, 94f866a `feat(iip)`); P3 listesinde yok; kapanış "tüm kapılar PASS". |
| K2-03 | Mimari | K-2 katmanlama yarım: "Views = tüm HTML" kararına rağmen `quranLearn.js` (290 KB) işaretlemenin çoğunu tutuyor; `kaoTaskHTML` şık durumlarını `Views.choice` yerine yeniden kuruyor; ayarlar `switchRow`'u kopyalıyor. |
| K2-05 | Test | A-3 ve tasarım sözleşmesi `primaryPerView` yalnız v1 görünüm kümesi × tek durum; ders oynatıcı, yol, ünite, özet, ilk açılış, panel-açık oturum ölçülmüyor. |
| K2-06 | Özellik | `settings.autoAdvance` için arayüz yok; 05 §5 / KAO2-23 "Doğruda otomatik geç" switch'i uygulanmadı → özellik erişilemez. |
| K3-02 | İçerik | Ünite 2 çapası bağlanmamış: namaz metinlerindeki 50 kelimenin 37'si `lp_*` (`lemmaBw:null`) → öğrenilen salât/abd/rasûl Tahiyyat'ta asla "bilinen" görünmez; u02.02/03 apply=examples (boş); u02.01 apply=tekbir, ders "Yön belirten ekler". Vaat karşılanmıyor. |
| K3-03 | Akış | Süre tahmini sistematik düşük: dakika = (tekrar + yeni **kelime**) × 0,55 (görev değil) → 17 adımlık ders "~2 dk"; `daily[].ms` hiçbir yerde yazılmıyor → 05 §4 "son 7 gün ortalaması" asla çalışmaz. Backlog B-KAO2-08-1 (hedef KAO2-12) kapanmadı. |
| K3-04 | Backlog | B-KAO2-09-1 + B-KAO2-10-1 (hedef KAO2-26) kapanmadı: 18 öksüz seçici `kao.css`'te; `test_kao_render.js:392` ölü seçicilerin **varlığını zorunlu** tutuyor; kontrast aracı `.kao-home section` (ölü yüzey) ölçüyor. |
| K3-05 | Backlog | B-KAO2-11-1 (hedef KAO2-23) kapanmadı: `kaoIntentSuggestion` `onboarding.intent`'i okumuyor; seçilen niyetin hiçbir etkisi yok (D-18). |
| K3-07 | Plan | 07 §3 "ünite 5–7 ders, ders 4–6 kelime, ayrı ustalık dersi" ↔ gerçek 2–30 ders/ünite, 3–6 kelime, ustalık bayrağı içerikli son derste. G2'de dağılım onaylandı ama 07 §3 ve `MUFREDAT-ESLEME.md` ("karar bekleyen", "taslak", kutular boş) güncellenmedi; kart başlığı "~75 ders" (gerçek 109); 08 §7 "20–45" ↔ kart "20–60". |
| K3-08 | Süreç | §4 "Handler sayacı — tek doğruluk kaynağı" bayat ("KAO2-12 sonrası yeni handler yasak, 40"); gerçek 40→43→42. KAO2-19/20 "Dokun" listelerinde olmayan 18 dosyayı (app.js, index.html, sw.js, 11 tests/app pini) değiştirdi — P6 BLOCKED gerekirdi; ara kartlarda `?v=` değişti (P5), versionPolicy güncellenmedi. |
| K4-03 | UX | Odak modu yok: ders ekranında modal başlığı (h1 + modalı kapatan X) + altında "Kapat" (dersten çık) — farklı anlamlı iki kapatma; 05 §2/06 FocusBar "yalnız ✕ + ince çubuk". |
| K5-05 | İçerik | Tanış kartı 07 §4 katmanları eksik: `examples[0]` örnek âyet yok, "Neden böyle?" notu (kök anlamı, unit11 türevleri) yok; Ünite 6+'da çapa yeri de olmadığından kelime bağlamsız tanıtılıyor (D-01 kısmi). |
| K5-06 | İçerik | Y-13 açık: yerleştirme okuma soruları Arapça → 3 Latin okunuş, uzunluk farkı büyük (مِن: min / fî / allazî; ٱلَّذِى: allazî / rabb / illâ) → harf bilmeden tahminle ≥7/8 geçilip S0 atlanabilir. |
| K6-02 | Test | Görünüm testleri yığınsız `kaoView` atar → `roots`, `s0`, `sources` ana ekranı çizer (R-09). a11y testi (`VIEWS`; `sources` iki kez) ve A-3 bu ekranları hiç sınamıyor; ders oynatıcı/ilk açılış/özet a11y matrisinde yok (kart (c) "odak modunda soruya" dahil). |
| K6-03 | Özellik | KAO2-23 eksikleri: "Öğrenme" grubu yok; "Başlangıç noktasını değiştir → ilk açılış 2. adım" yok (yerine eski kapıyı açan "Seviye 0 kontrolünü yeniden aç"); Gölgeleme/Görünürlük/Veri grupları yerine eski "Okuma · görünürlük / Ses · gölgeleme / Okuma · görünüm / Diğer". |
| K6-04 | UX | İlerleme: NavBar "İlerleme" ama büyük başlık eski "İstatistik / Tutunma ve kalibrasyon"; sıfır kullanıcıya 10 satırlık FSRS R-bandı kalibrasyon tablosu katlanmadan (P10 aşamalı ayrıntı). |
| K6-05 | UX | Kelime detayı ders bağlantısı yanlış: "Bulunduğun yer: Ünite 1" kullanıcının ünitesi (min → u03.02, kâla → u03.01 iken); "Derse dön" `kaoSetView('units')` ile Yol'u açar, kelimenin dersini değil. |
| K7-01 | Plan | D-12 "Önce kognat köprüsü: 'zaten biliyorsun' turu" hiçbir karta bağlanmadı, kodda yok (09 §4 izlenebilirliğinde D-kararları yok). |

## 5. ⚪ Düşük bulgular

| ID | Bulgu |
|---|---|
| M-11 | `test_kao2_kabul.js:282` izlenen `evidence/KAO2-27/A-KABUL.md`'yi her koşuda koşulsuz yeniden yazıyor → her test koşusu çalışma ağacını kirletiyor (`07802fa6` yalnız bunu commitledi). R-10. |
| M-12 | Yayın kanıtı incelmiş: KAO2-23…27'de `release-live.json` yok; KAO2-26 `YAYIN.md` "aşağıdaki rapor" diyor, rapor yok; KAO2-27 bayt eşleşmesi Views/Curriculum/içerik modüllerini kapsamıyor; KAO2-23 "force ile eşitlendi" ifadesinin ne olduğu/onayı kayıtsız. |
| M-13 | `kao-audio-pending` ölü sınıf adı (`quranLearn.js:1218,1243,1651`); T-26 fiilen kapalı. |
| K2-07 | CSS kalıntıları: boş `.kao-header p{}`, tekrarlı `.kao-header` kuralları, ölü `.kao-toggle[aria-pressed="true"]`. |
| K3-09 | `test_kao2_onboarding.js` başlığı "handler sayacı 43" ama assert 42; özet satırı "KAO2-12 onboarding" (kart 11). Hub halkası "20%" (Türkçe "%20"; aria-label "%20"). Bugün alt satırı sıfır kullanıcıya "0 tekrar + 3 yeni". |
| K4-04 | Ünite "0 / 23 kelime" yalnız kalıcı (settled) sayar, 8 kelime "Çalışılıyor" iken — etiket belirsiz. `namaz` taşı "tüm namaz metinleri" der, `lp_*` filtrelendiği için ~30 lemma. Ardışık tekrar eden gramer görevi (u01.02 aynı "Ek çöz" ×2). |
| K6-06 | `tests/kao/README.md` envanterinde 28 `test_kao2_*` dosyasından **26'sı yok** (KAO2-00 adım 6, KAO2-27 Dokun listesi). |
| K6-07 | Öksüz ilerleme çubuklarında `linear-gradient` kalıntısı (T-11 "degrade çubuk") — K3-04 temizliğiyle. |
| K7-02 | D-21 "T-hattı ünitelere bağlanır" (telaffuz ↔ ünite) hiçbir karta bağlanmadı, kodda yok. |
| K7-03 | `onboarding.minutes` varsayılanı 5, `settings.dailyNew` varsayılanı 10 (08 §1 "dailyNew bundan türetilir") — ilk açılış öncesi iki alan tutarsız. |

## 6. Plan kararlarının gerçek durumu

### 6.1 Bilimsel kararlar (04 · D-01…D-21)

| D | Karar | Durum | Not |
|---|---|---|---|
| D-01 | Önce tanış kartı | 🟡 kısmi | Tanış sınavdan önce ✓; Kur'an örneği ve "neden böyle" yok (K5-05) |
| D-02 | 2 şık → 4 şık → üretim | ✅ | İlk alıştırma 2 şık, sonra 4, tr>ar üretim; üretimde ses yönü var |
| D-03 | Ayrıntılı geri bildirim paneli | 🟡 kısmi | Panel "Devam"a kadar kalır ✓; gramer açıklaması taslak yedeği; gramer içeriği yanlış (K4-02) |
| D-04 | FSRS-5 korunur | ✅ | Motor değişmedi |
| D-05 | Önce blok, sonra serpiştirme | ✅ (içerik ✗) | Gramer kartları 10 gün sonra kuyrukta; ama yanlış içerikli (K4-02) |
| D-06 | Uygula gerçek metinde | ❌ | 97/109 derste boş (K3-01) |
| D-07 | Çapa-önce müfredat | 🟡 kısmi | Ünite 1 ✓, Ünite 3 ✓, Ünite 2 bağsız (K3-02) |
| D-08 | Kapsam anlatısı | ✅ | %45,2 / 54,8 / 64,5 / 70,3 / 77,4 |
| D-09 | Ünite yapısı + ustalık | ❌ | Ustalık yok (K4-01); ünite büyüklükleri 07'yle çelişik (K3-07) |
| D-10 | Seviye 0 sistematik | ❌ | Ana yol boş (K5-01), yüzey çalışmıyor (K5-02) |
| D-11 | Terminoloji geciktirme | ✅ | `termTr` katlanabilir |
| D-12 | Kognat köprüsü turu | ❌ | Kart yok, kod yok (K7-01) |
| D-13 | Tek sıradaki adım | 🟡 | Ünite 1 sonuna kadar ✓, sonrası kilit (K4-01) |
| D-14 | Tutarlılık / süs yok | 🟡 kısmi | Süsler kalktı ✓; çift başlık (K2-01) |
| D-15 | Bölümleme + özet | ✅ | Özet, "Bugün yeter / 5 dakika daha" |
| D-16 | Dinlerken okuma | ✅ | Okuyucu vurgusu, tanış "Dinle" |
| D-17 | Gerçek erken başarı | ✅ | İlk hafta "kalıcı" sayısı gizli |
| D-18 | Uygulama niyeti | ❌ | Niyet ne öneriyi ne ayarı etkiliyor (K3-05, K3-06) |
| D-19 | Yumuşak seri | ✅ | "Bu hafta N gün", ceza yok |
| D-20 | Gece hafif modu | ✅ | Gece penceresi akışa geçiyor |
| D-21 | Önce algı, sonra üretim; T-hattı ↔ ünite | 🟡 | Telaffuz stüdyosu var; ünite bağı yok (K7-02) |

### 6.2 Kararlar (10 · K-1…K-4)

| K | Durum |
|---|---|
| K-1 Bütçe | ✅ Tavan 80→88→128 KiB kullanıcı yetkisiyle; ölçüm runtime 92,4 · css 12,8 · içerik 177,7 · p95 ~4–5 ms. Revizyon 2 LEDGER'da yok (M-04). |
| K-2 Üç dosya | 🟡 Dosyalar ve yükleme sırası ✓; katman ayrımı yarım (K2-03). |
| K-3 Hece sesi | ❌ fiilen: kademe B yalnız çalışmayan S0 yüzeyinde (K5-02); kademe A hattı hazır, kayıt yok. |
| K-4 Metin incelemesi | 🟡 L0 ✓; L1 çıkarımla (K5-04); L2 bekliyor. |

### 6.3 Kabul ölçütleri (09 §2) — gerçek durum

| # | Tabloda | Gerçek |
|---|---|---|
| A-1 ≤3 dokunuş | ✅ (sabit) | ✅ `test_kao2_onboarding` (A-1) gerçekten ölçüyor — kabul testi ölçmüyor |
| A-2 Tanış önce | ✅ | ✅ (tek derste ölçülü; 109 ders yürüyüşünde ihlal görülmedi) |
| A-3 ≤1 birincil | ✅ | 🟡 ölçülen 11 ekran ✓; ders/yol/ünite/özet/ilk açılış ölçülmedi |
| A-4 7/7 durum | ✅ (regex) | 🟡 motor ✓ (next_step testi); **Ünite 1 sonrası ✗** (K4-01) |
| A-5 524/25/20 | ✅ (gevşek) | ❌ 524 ✓ · 25 bağlı ✓ ama gramer içeriği yanlış · 0/20 bağlam görünür |
| A-6 Eski veri | ✅ | ✅ veri korunur — ama eski kullanıcı ilerleyemez (K4-01) |
| A-7 Tasarım | ✅ | 🟡 CSS ölçümleri ✓; switch/çift başlık/odak modu ✗ |
| A-8 Geri bildirim | ✅ | ✅ `test_kao2_feedback` gerçekten ölçüyor |
| A-9 Aileler yeşil | ✅ (dosya sayımı) | 🟡 aileler yeşil ✓; `kao-plan-check` 22 FAIL (M-10) |
| A-10 Bütçe | ✅ | ✅ |
| A-11 / A-12 | ⏳ cihaz | ⏳ — K4-01 düzelmeden A-12 ("şimdi ne yapmalıyım" = 0) karşılanamaz |

## 7. Backlog maddelerinin gerçek durumu

| Madde | Hedef | Durum |
|---|---|---|
| B-KAO2-08-1 `daily.ms` | KAO2-12 | ❌ açık (K3-03) |
| B-KAO2-09-1 öksüz ana ekran seçicileri | KAO2-26 | ❌ açık (K3-04) |
| B-KAO2-10-1 öksüz hub seçicileri | KAO2-26 | ❌ açık (K3-04) |
| B-KAO2-11-1 niyet → hub önerisi | KAO2-23 | ❌ açık (K3-05) |
| B-KAO2-12-1 render testi rotası | KAO2-12 | ✅ kapandı |

## 8. Analiz bulgularının (01/02/03) kapanış doğrulaması

Kapanış belgesi 12 satırla özetliyor; tam eşleme (✅ davranışla doğrulandı · ❌ açık ·
🟡 kısmi · ◻︎ bu denetimde davranışla doğrulanmadı, yalnız kaynak iddiası):

| Bulgu | Durum | | Bulgu | Durum |
|---|---|---|---|---|
| K-01 karşılama | ✅ | | Y-09 etkisiz seviye kutuları | ✅ |
| K-02 okuma sorusu | ✅ | | Y-10 geri gezinme | ✅ |
| K-03 hiyerarşi | ✅ | | Y-11 katman sayfalaması | ✅ |
| K-04 öğretmeden sınav | ✅ | | Y-12 öz-beyan kontrolü | ✅ |
| K-05 gramer anlatımı | 🟡 (içerik yanlış, K4-02) | | Y-13 Latin şıklı kapı | ❌ (K5-06) |
| K-06 geri bildirim | ✅ | | O-01 ekran başlığı | ❌ (K2-01) |
| K-07 "0 kalıcı" | ✅ | | O-02 ses varsayılanı | ◻︎ |
| K-08 anlamlı üniteler | 🟡 (K5-03) | | O-03 geri al bağlamı | ✅ |
| K-09 üniteye dokunma | ✅ | | O-04 metin anahtarlar | ❌ (K2-02) |
| Y-01…Y-03 hub | ✅ | | T-01…T-05 hub görseli | ✅ |
| Y-04 sabit ünite metni | ✅ | | T-06, T-07 NavBar | ❌ (K2-01) |
| Y-05 boş âyet vaadi | ✅ | | T-08, T-09 süsler | ✅ |
| Y-06 edatla başlama | ✅ (Fâtiha ile başlıyor) | | T-10…T-13 | ✅ (T-11 kalıntı K6-07) |
| Y-07 görev etiketi | ◻︎ | | T-14…T-17 panel/ilerleme/ses | ✅ |
| Y-08 "yarın" bilgisi | 🟡 (süre K3-03) | | T-18…T-21 ünite/kelime/okuyucu | ✅ |
| P-01 ilk karşılaşma sınav | ✅ | | T-22 ayarlar düzeni | ❌ (K2-02, K6-03) |
| P-02 gramer açıklaması | 🟡 | | T-23 kaynaklar alt sayfası | ✅ |
| P-03 geri bildirim | ✅ | | T-24 kontrast | ✅ (726 çift 0 ihlal) |
| P-05 harf öğretimi | ❌ (K5-01/02) | | T-25 Dynamic Type / min-height | ✅ |
| P-06 ünite hedefi/sonu | ❌ (K4-01) | | T-26 audio-pending | ✅ (ölü ad M-13) |
| P-07…P-09 | ✅ | | P-04, P-10 | ◻︎ / ❌ (niyet, D-18) |

## 9. Geri çekilen ara bulgular (dürüstlük kaydı)

1. "Ünite 2 kelimeleri namaz dışından" — yanlış; kelimeler anlamca namaz kelimeleri, sorun kimlik bağında (K3-02).
2. "Ders planında ses → anlam yönü yok" — yanlış; ölçüm içeriğimde `audioLemmas` eksikti, üretimde var.
3. İlk "çift başlık" ölçümünde yığın başlıkları eksikti; bulgu doğru, ölçüm yöntemi düzeltildi.

## 10. Doğru uygulananlar (özet)

- 524/524 lemma tam bir derste; 25/25 kavram bir derse bağlı; S0 12 ders 07 §2 sırasıyla; Ünite 1 Fâtiha birebir.
- Sıradaki adım motoru (`quranLearnFlow.nextStep`) 7+ durumu doğru ayırıyor; Flow saf (DOM/ağ/zaman yok).
- 109 ders çalışma zamanı hatasız; plan sırası goal→intro→concept→practice→apply→summary; ilk alıştırma 2 şık.
- Bugün ekranı, hub kartı (4 durum), ilk açılış (a)–(g) + A-1, Yol (7 seviye), Ünite ekranı, gramer notu
  sayfası, okuyucu v2, kök aileleri (73+301), kelime detayı (tek sayfa, doğrulanmamış örnek yok),
  panel aynası, geri bildirim paneli (A-8) plana uygun.
- Veri modeli 08 §1 ile birebir; `migrate()` gövdesine dokunulmadı; eski veri derin eşit korunuyor.
- Tasarım CSS ölçümleri (ağırlık 2, uppercase/deco/serif 0), kontrast 726 çift 0 ihlal, bütçeler içinde.
- Dört yükleme listesi + sw.js aynı sırada; yayın pini `20260930l` tutarlı; CLAUDE.md = AGENTS.md KAO2 satırı.

## 11. Doğrulama komutları

```bash
node kao2-duzeltme/denetim/tekrar-uret.cjs          # bugün 0/10 PASS (10 FAIL) — hedef 10/10
for f in tests/kao/test_*.js; do node "$f" >/dev/null || echo "FAIL $f"; done
node docs/kuran-ogreniyorum/tools/kao-plan-check.mjs        # bugün 22 FAIL
node archive/kuran-ogreniyorum-v2/tools/kao2-sync-check.mjs   # arşivlenmiş KAO2 (tarihsel)
node kao2-duzeltme/tools/fix-sync-check.mjs                  # KAO2-FIX
```
