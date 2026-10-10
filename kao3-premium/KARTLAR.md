# K3P · Sıralı kartlar (v2)

> **Uygulama metni [PROMPTLAR.md](PROMPTLAR.md)'dedir.** Bu dosya kartların özet tablosudur. Sıra `K3P-STATE.json → executionOrder` alanındadır. Kurallar [BAGLAM-YONETIMI.md](BAGLAM-YONETIMI.md)'dedir. Pin kuralı: ara kartlarda pin yükseltilmez, yalnız K3P-27'de (BAGLAM §6). Kapı: her kartta `kapi-hizli.mjs`, dalga sonlarında `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh`.

**Kaynaklar:** Akış [AKIS.md](AKIS.md), tasarım [TASARIM.md](TASARIM.md) (v2 "Tezhip"), kararlar [KARARLAR.md](KARARLAR.md),
bulgular [ANALIZ.md](ANALIZ.md).

## Kurallar

Kurallar [BAGLAM-YONETIMI.md](BAGLAM-YONETIMI.md) içindedir:

| Bölüm | Konu |
| --- | --- |
| §1 | Açılış |
| §2 | Bağlam bütçesi |
| §3 | Kapanış: hızlı kapı, durum dosyaları, tek commit |
| §4 | Devir |
| §5 | Durma |
| §6 | Sabit kurallar: veri güvenliği, yalnız K3P-27'de pin, içerik yalnız araçtan, `App.kao*` = 45 |

Her kart en az bir **deneyim ölçüsü** taşır ve bu ölçüyü tabana göre karşılaştırır
(ANALIZ §7, AKIS §6). Ölçü kötüleşirse kart kapanmaz.

Kart işaretleri:

- 📷: O prompt'u vermek ekran görüntüsüne izin demektir.
- 🚀: Yayın; prompt ayrıca onay ister.

## Dalga 0 — Doğruluk ve ölçüm altyapısı

| Kart | İş | Dokunulan yer | Kabul (deneyim ölçüsü) |
| --- | --- | --- | --- |
| K3P-00 📷 | Görsel temel çizgi: 390 px, açık ve koyu tema, 19 görünüm + ders aşamaları (`tools/kapi/gorsel-qa/shoot-modal.mjs`) | `kao3-premium/kanit/onceki/` | Kontak sayfası üretildi. Guard 1 testi (`test_local_visual_qa_guard.js`) önceden koştu. |
| K3P-01 | **B-01 çift şık.** Çeldirici havuzu lemma bazında tekilleşir; `overlaps` ortak yardımcıya taşınır. `test_kao_queue` iki yönlü kart çiftiyle genişletilir. | `kaoPickDistractors`, `kaoBuildTask`, yeni `tests/kao/test_k3p_distractors.js` | `cift-sik.cjs` iki durumda da 0 |
| K3P-02 | **B-02 + B-05 geri bildirim metni.** Doğru cevapta geri alma yok, çift "Doğru" yok. Yanlışta "Yanlışlıkla dokundum". Özet başlığı tek. | `kaoTaskHTML` ([quranLearn.js:1777](../app/core/quranLearn.js#L1777)), `kaoOpenFeedback`, [quranLearnViews.js:316](../app/core/quranLearnViews.js#L316) | Doğru panelinde `kaoUndo` = 0; "tamamlandı" 1 kez |
| K3P-03 | **B-06 süre tahmini.** Görev başına ≥ 6 sn taban; `ms` yoksa `MIN_PER_TASK`. | [quranLearnFlow.js:366](../app/core/quranLearnFlow.js#L366), `test_kao2_next_step.js` | 24 görev hiçbir girdide < 3 dk göstermiyor |
| K3P-04 | **B-03 okunuş motoru (K-A).** Vasl, şemsî idgâm, cümle içi vasl ve vakf kuralları araca eklenir; içerik yeniden üretilip dondurulur. | `tools/kao-lexicon-build.mjs` (`transliterate`, `wordTranslitTr`), `kao-content-freeze.mjs`, içerik modülü, `test_kao_pronunciation_contract.js`, `test_kao_freeze_repro.js` | `okunus-denetim.cjs` 0; Fâtiha 1:1 = `bismi · llâhi · r-rahmâni · r-rahîm`; donmuş içerik bayt-eş |
| K3P-05 | **Deneyim ölçüleri kapıya girer.** `dokunus-olc`, `cift-sik` ve `okunus-denetim` `tools/kapi/kapilar.sh`'a eklenir. Yeni `deney-rapor.cjs` (yalnız toplu sayı basar, hiçbir şey yazmaz). | `tools/kapi/kapilar.sh`, `kao3-premium/araclar/` | Kapı yeşil; `deney-rapor` sentetik yedekte A/B tablosunu basıyor |

## Dalga A — Akış (öncelikli; Dalga 0'dan hemen sonra)

Gerekçe ve ölçümler [AKIS.md](AKIS.md)'de. Kullanıcı isteği (2026-10-10): kullanıcı öğrenme akışında
kolayca kalabilmeli. Bu yüzden akış görsel cilanın önüne alındı.

**Uygulama sırası:** Dalga 0 → **Dalga A** → Dalga 1 → 2 → 3 → 4 → 5. K3P-15 (üç kollu geri
bildirim) bu dalgada, K3P-A3'ten sonra yapılır.

| Kart | İş | Dokunulan yer | Kabul (akış ölçüsü) |
| --- | --- | --- | --- |
| K3P-A1 | **Yerinde güncelleme (D-0, A-7):** Overlay varsa yalnız `#sey-ov-body` değişir. Açılış animasyonu yalnız `kaoOpen` anında çalışır. Kaydırma ve odak korunur. | `app.js` içindeki `registerQuranLearnSurface` `mount`'u, `kao.css`; yeni `tests/kao/test_k3p_mount.js` | Ders boyunca overlay düğümü aynı kalıyor; animasyon sınıfı 1 kez uygulanıyor; `.kao-body` kaydırması korunuyor |
| K3P-A2 | **Odak kilidi (D-8, A-6):** `ui.kaoLesson` etkinken `toast()` kuyruğa alınır, ders bitince gösterilir. Kriz ve güvenlik iletileri istisnadır. | `app/core/helpers.js` (`toast`), `quranLearn.js` (çıkışta kuyruğu boşaltma) | Ders sırasında `#sey-toast` = 0, dersten sonra kuyruk gösteriliyor (test); kriz yolu etkilenmiyor (`test_crisis*` yeşil) |
| K3P-A3 | **Nefes ritmi (§3):** Hedef → Isınma (3–5) → Tanış-Sına döngüsü → örnekten kurala kavram → Karışık → Zirve | Ders planı kurucusu (`kaoLesson` planı / `SeymaQuranLearnFlow`), `test_kao2_lesson_flow.js`, `test_kao2_lesson_coherence.js` | `akis-olc`: art arda en uzun edilgin dizi ≤ 1; ilk yeni içeriğe ≤ 7 dokunuş; 109 ders taraması yeşil |
| K3P-A4 | **Zaman bütçesi:** Oturum seçilen dakikaya sığar. Sığmayan tekrarlar ertesi güne kalır; önce en düşük `R`'li kartlar sorulur. | `kaoBuildQueue`, `quranLearnFlow` tahmini | 5 dk seçen kullanıcının planı ≤ 5 dk (tahmin); kalan vadeli kartlar ertesi gün kuyruğunda (test) |
| K3P-A5 | **Uyarlanır zorluk (§4):** Son 8 görevin kayan başarısı. Kaygı bölgesinde şık 4→3→2, ses ve bilinen kelime eklenir; sıkılma bölgesinde basamak çıkılır. `kaoGrade` şık sayısını hesaba katar. | `kaoAnswer`, `currentTask` (`choiceCount` zaten var), `kaoGrade` | `akis-olc` 4. ölçüm: 2 yanlıştan sonra şık 3; kolaylaştırılmış doğru = not 2 (test); kayan pencere yalnız `ui`'da |
| K3P-A6 | **Bölümlü ilerleme ve sabit eylem bölgesi (D-2, D-3)** | `quranLearnViews.js` (focusBar), `kao.css` | 5 bölüm; ardışık ekranlarda birincil eylemin konumu ≤ 8 px kayıyor (görsel QA) |
| K3P-A7 | **Devam ipucu (D-7, A-5):** Bugün ekranında "Kaldığın yerden · n/N"; çubuk dolu başlar | `kaoHomeHero`, `kaoNextStepFor` (`resume` okunur) | `akis-olc` 3. ölçüm: yeniden yüklemeden sonra etiket ve ilerleme korunuyor |
| K3P-A8 | **Edilgin ekran bütçesi (D-4):** Tanış ve kavram ekranlarında ilk görünüm ≤ 45 sözcük; geri kalanı "Daha fazla" ile açılır. İçerik değişmez, yalnız sunum. | `quranLearnViews.js` ders kartları | `akis-olc`: zirve dışında hiçbir edilgin ekran ilk görünümde 45 sözcüğü aşmıyor |

## Dalga 1 — Görsel sistem

| Kart | İş | Dokunulan yer | Kabul |
| --- | --- | --- | --- |
| K3P-06 | **Tokenlar:** 3 materyal katmanı, `--kao-ar-hero/body/inline`, hareket grameri tokenları. Hepsi `--quran*`'tan `color-mix` ile türer. | `kao.css` başı, `test_kao2_design_contract.js` | Yeni tokenlar sözleşmede; yeni hex yok; `test_kao2_a11y` yeşil |
| K3P-07 | **Yazı tipi (K-B):** Scheherazade New alt kümesi `woff2` + `unicode-range` + `swap` + `sw.js` önbelleği + OFL lisans dosyası | `assets/kao/font/`, `kao.css`, `sw.js`, `index.html`, yeni `tools/kao/kao-font-subset.mjs` | ≤ 150 KiB; alt küme Hafs kod noktalarının hepsini kapsıyor (araç sayar); çevrimdışı çalışıyor |
| K3P-08 | **Arapça tipografi:** Bütün Arapça kurallar `--kao-ar-*` tokenlarına bağlanır; `font-weight:700` kaldırılır; Arapça ≥ 1,3 × Latin | `kao.css` (yaklaşık 15 kural) | Arapça kurallarda 700 = 0; şık hedefi ≥ 56 px |
| K3P-09 | **Materyal hiyerarşisi:** Zemin / kart / an kartı. Altın yalnız kazanılmış şeylerde, yeşil kaldırılır (doğru = altın). Açık temada altın metin rengi olarak kullanılmaz. | `kao.css`, `quranLearnViews.js` (yalnız sınıf adları) | Kontrast ≥ 4,5 (a11y testi); `onclick` sayısı değişmedi |
| K3P-10 | **Hareket grameri:** mikro / geçiş / an sınıfları; görev geçişi yatay kayma; `kaoFx('wrong')` | `kao.css`, `kaoFx` ([quranLearn.js:1791](../app/core/quranLearn.js#L1791)) | Reduced-motion'da animasyon 0 (test); dokunuşa yanıt < 100 ms (ilk kare sınıfı senkron) |

## Dalga 2 — Tezhip (imza deneyimi)

| Kart | İş | Dokunulan yer | Kabul |
| --- | --- | --- | --- |
| K3P-11 | **Tezhip sayfası bileşeni.** Saf görünüm: `views.tezhipPage({lines, known, learning})`. Rumî SVG kenarlık ve cetvel. `forced-colors` ve `aria-label` ile erişilebilir. | `quranLearnViews.js`, `kao.css`, `test_kao2_components.js` | Bileşen testi: 3 durum, kaçırma, erişilebilir ad. Yaldız oranı = `kaoCoverage` (test) |
| K3P-12 | **Bugün ekranı yeniden (K-F):** Tezhip an kartı + hedef eğimi cümlesi + tek eylem + haftalık hedef + Sûreler / Namaz / Kütüphane | `kaoHomeHTML`, `kaoHomeLists`, `todayScreen`, `KAO_VIEW_TITLES` (+ `library`) | İlk ekranda ≤ 5 seçim (`ekran-dok`); eski hedeflerin hepsine ≤ 2 dokunuş (test) |
| K3P-13 | **Ders üç perde (K-G):** Hedef âyet perdesi açılışta, Okuma perdesi kapanışta (ses + sırayla yaldızlanma) | `kaoLesson` planı, `quranLearnViews.js` ders bölümü | `test_kao2_lesson_flow` yeşil; her ders bir âyetle açılıp kapanıyor (109 ders taraması) |
| K3P-14 | **Ders sonu anı:** İlk kez yaldızlanan kelimeler, kapsamda +%x (`countUp`), taş parıltısı (≤ 1,2 sn). Konfeti KAO paletine geçer: `SeymaHelpers.confetti` renk parametresi alır; bugün uygulamanın pembe paletini kullanıyor. | Özet görünümü, `kao.css`, `helpers.js` (`confetti(colors?)`) | Reduced-motion'da statik; özet metni tek başlıklı; KAO'da konfeti lacivert/altın |

## Dalga 3 — Öğrenme motoru

| Kart | İş | Dokunulan yer | Kabul |
| --- | --- | --- | --- |
| K3P-15 | **Üç kollu geri bildirim (K-C):** Hızlı doğru 600 ms, yavaş doğru 1.600 ms şerit, yanlış tam kart. Kişisel medyan `ui` içinde. | `kaoAnswer`, `kaoAutoAdvance`, `kaoTaskHTML` | `dokunus-olc` ≤ 40 (varsayılan); yanlış cevapta bekleme korunuyor (test) |
| K3P-16 | **Merdiven seçici + deney ataması (K-I, H3):** `s` → R1…R4; hash ile A/B; unutmada bir basamak iner | `kaoBuildTask` öncesi seçici, `kaoBuildQueue` | Saf fonksiyon testi (tablo güdümlü); B kolu hep R1; atama deterministik |
| K3P-17 | **R3 Harflerden kur:** Harf çipleri + biçimce yakın 2 çeldirici harf; `App.kaoAnswer` çoklu seçim | Görev kurucu, `kaoTaskHTML` order yolu | 109 ders taramasında R3 görevleri geçerli; tanıma payı ↓ |
| K3P-18 | **R4 Âyette boşluk:** Doğrulanmış örnek âyetten cloze; çeldiriciler aynı türden, farklı kökten | Görev kurucu (yalnız `verified` örnekler) | Tanıma payı ≤ %60 (`cift-sik` görev sayımı) |
| K3P-19 | **Okunuş soldurma (P4):** s ≥ 21'de okunuş gizli, dokununca açılır | `kaoArabicPairHTML` | Ayarla kapatılabilir (mevcut `translit` ayarı); H4 ölçüsü raporda |
| K3P-20 | **Sürükleyerek dizme:** Pointer ile görsel sürükleme, bırakınca `App.kaoAnswer`; dokunma ve klavye yolu aynen kalır | `kaoTaskHTML` order bloğu, `kao.css` | `test_kao2_a11y` yeşil; `App.kao*` = 45 |
| K3P-21 | **Ses kontrolleri:** İki görünür düğme (yavaş / doğal); inline ok fonksiyonu kalkar | `kaoTaskHTML` ses bloğu ([quranLearn.js:1751](../app/core/quranLearn.js#L1751)) | Yeni handler yok; iki düğme ≥ 44 px |

## Dalga 4 — Ödül, okuyucu, ilerleme

| Kart | İş | Dokunulan yer | Kabul |
| --- | --- | --- | --- |
| K3P-22 | **Âyet merdiveni (K-E):** Boş durum yerine en yakın âyet + eksik kelimeler + "öğren" eylemi | `kaoAyahHTML`, `kaoNearestAyah` | 20 kelimelik kullanıcı boş durum görmüyor |
| K3P-23 | **Okuyucu:** Senkron altın halka + balonda "Kartlarıma ekle" (`kaoReader('add')`) | `kaoReaderHTML`, `kaoReader` | Kart şeması aynı; ekleme mevcut kart kurucusundan geçiyor |
| K3P-24 | **İlerleme (K-H):** 3 ölçü + Tezhip küçük resimleri + haftalık 5/7 hedef (`daily`'den türetilir); ayrıntılar katlanır | `kaoStatsHTML`, `kaoProgressModel` | Veri yokken kalibrasyon tablosu görünmüyor; seri cezası metni 0 |
| K3P-25 | **Mevcut kullanıcı notu (K-C):** `KAO_WHATS_NEW` ile bir kez "Hızlı geçişi aç / Böyle kalsın" | `kaoOpen`, `kaoOnboard('whats-new-…')` | Ayar sessizce değişmiyor (test); not bir kez gösteriliyor |

## Dalga 5 — Kapanış

| Kart | İş | Kabul |
| --- | --- | --- |
| K3P-26 📷 | **Sonrası görsel QA:** 320 / 390 / 460 px, açık ve koyu; `KAO_QA_SCAN=1` taşma taraması; a11y, kontrast, perf; ANALIZ §7 tablosu yeniden ölçülür; kapanış belgesi | Taşma 0; §7'deki bütün hedefler tutuyor; öncesi/sonrası kontak sayfası |
| K3P-27 🚀 | **Yayın:** `kao3-premium` → `main`, Pages | Pages run başarılı. Ardından 30 gün boyunca H2–H5 için `deney-rapor` takvimi: 14. ve 30. gün |

**Cihaz kabulü** (iPhone'da imlâ işaretleri, ses, his) yalnız kullanıcıdan gelir ve ayrı raporlanır.
H3 hipotezinin sonucu ancak yayından 30 gün sonra okunabilir.
