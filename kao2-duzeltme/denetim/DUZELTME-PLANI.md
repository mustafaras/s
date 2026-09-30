# KAO2 · Düzeltme planı (KAO2-FIX önerisi)

**Tarih:** 2026-09-30 · **Girdi:** [`KUSUR-RAPORU.md`](KUSUR-RAPORU.md) (49 bulgu: 4 kritik · 11 yüksek · 24 orta · 10 düşük)
**Durum:** ÖNERİ — KAO2 kapalı bir programdır; bu plan **ayrı kapsam onayı** ister (README "Yeni bir
KAO2 işi ayrı kapsam onayı ister"). Onay gelince kendi STATE/LEDGER/kanıt zinciriyle yürür
(KAO-FIX örüntüsü).

> **Uygulama biçimi (2026-09-30):** bu plandaki FX kartları, Sonnet 5.5 için tek tek çalıştırılacak
> 44 sıralı prompta bölündü: [`../PROMPTLAR.md`](../PROMPTLAR.md) (K2F-00…K2F-43). KR-1…KR-7 kullanıcı
> tarafından **öneri sütunuyla kabul edildi**. Program klasörü: `kao2-duzeltme/`; eski program `archive/kuran-ogreniyorum-v2/`.

---

## 1. İlkeler

1. **Önce canlı kullanıcıyı aç, sonra güzelleştir.** Dalga 1 (kritikler + niyet hatası) tek başına
   yayımlanabilir bir "acil yama" paketidir.
2. **Test önce, davranışla.** Her kart `denetim/tekrar-uret.cjs`'deki ilgili kontrolü (R-xx) ve kendi
   uçtan uca fixture'ını **önce kırmızı** görür. Hiçbir test durumu elle kurarak (`masteryAt`,
   `kaoPanel`, yığınsız `kaoView`) davranışı atlamaz.
3. **Mevcut kapılar yeşil kalır** (KAO/app/panel/panel-v2/quran/reminders/driver/zikr/kontrast/sync);
   `tekrar-uret.cjs` program sonunda 10/10 PASS.
4. **Motor ve veri güvenliği korunur:** FSRS portu, kuyruk kuralları (R-A1…R-A8), `migrate()` gövdesi,
   gizlilik değişmez; eski `data.quranLearn` her zaman geçerli kalır, ilerleme silinmez.
5. **Arapça içerik elle yazılmaz** (D-12/K-4): yalnız `tools/kao-*` hattından ve doğrulanmış kaynaklardan.
6. **Kapsam kilidi ve pin tuzakları** (README kural 1 ve 5, CLAUDE.md): yeni `App.kao*` handler
   fx2/v3/surface pinlerini kaydırır; KAO yayın pini `index.html` + `sw.js` + `tests/app/test_iip_22.js`
   üçlüsünde birlikte değişir; yorumlarda handler ataması/tıklama niteliği adı yazılmaz; yeni
   `app/core/*` dosyası dört yükleme listesine aynı committe girer.
7. **Kart başına tek commit**; kart dışı iş = önce LEDGER kaydı (M-04/M-05 tekrarlanmasın).
8. **Yayın ayrı onay:** push/deploy/tag kullanıcı onayı olmadan yok; `seyma-data`'ya yazım yok;
   tarayıcı/sunucu açılmaz (CLAUDE.md DATA SAFETY).

## 2. Kullanıcı kararları (başlamadan önce)

| # | Karar | Seçenekler | Öneri |
|---|---|---|---|
| KR-1 | Ustalık kontrolünün biçimi | (a) 07 §3 aynen: çapa metnini dokunmadan oku + 10 soruluk karma test, ≥8/10, altında onarım dersi · (b) yalnız 10 soruluk test | **(a)**; çapa metni olmayan ünitelerde yalnız test |
| KR-2 | v1 ilerlemesi olan kullanıcılar | (a) ünite ustalığı kontrolü teklif edilir, "şimdilik atla" ile sonraki üniteye geçilebilir · (b) kelimelerin tümü kalıcıysa (s≥21) ustalık otomatik verilir | **(a)** — kilit yok, kazanım uydurulmaz |
| KR-3 | Başlık ↔ kelime uyuşmazlığı (K5-03) | (a) başlık/hedefleri derslerin gerçek kelimelerine göre yeniden yaz · (b) kelimeleri başlıklara göre yeniden dağıt (spec `poolRules` + G2 tekrar) | **(b)** gramer kavramı ile kelimeler birlikte anlam kazanır; (a) daha hızlı ama kavram–kelime kopukluğu sürer |
| KR-4 | Açık inceleme yapılmamış 133 metin (K5-04) | (a) inceleme bitene kadar uyuşmayan derslerin metnini `draft`'a çek (güvenli başlık "Ünite N · Ders M") · (b) hepsi görünür kalsın | **(a)** |
| KR-5 | 20 sûre bağlamı (`contextTr`, M-03) | (a) gerçek kaynaklı yeniden yaz (L2 gerekir) · (b) kaldır; tanıtım kartı zaten tema/yer/âyet sayısını gösteriyor; A-5 hedefi revize edilir | **(b)** kısa vadede; (a) ayrı içerik işi |
| KR-6 | `kao-plan-check` 22 FAIL (M-10) | (a) geçmiş commitler için gerekçeli istisna listesi · (b) kapıyı yalnız yeni commitlere uygula (taban commit) | **(b)** |
| KR-7 | Acil yama yayını | Dalga 1 bitince ayrı yayın · program sonunda tek yayın | **Dalga 1 sonrası ayrı yayın** (kullanıcı şu an Ünite 1'de kilitli) |

## 3. Kartlar

Her kartta: **Yap** · **Kapatır** (rapor kimlikleri) · **Test önce** (kırmızı görülecek kontrol) · **Kabul**.

### Dalga 0 — Hazırlık

#### FX-00 · Program iskeleti ve test altyapısı
- **Yap:** `kao2-duzeltme/` (STATE, LEDGER, CURRENT-STATE, sync-check — oluşturuldu) · dal
  `kao2-duzeltme` · test yardımcısı `tests/kao/helpers/kao-view.js`: görünümü **yığınla** kuran
  `openView(t, view, param)` ve ders oynatıcısını gerçek handler'larla yürüten `walkLesson` ·
  `tests/kao/test_kao2_handler_surface.js`: işaretlemede çağrılan her `App.kao*` app.js'te tanımlı
  (R-05 kalıcı fixture) · `test_kao2_kabul.js` rapor yazımını `KAO2_WRITE_EVIDENCE=1` bayrağına bağla.
- **Kapatır:** M-11 · R-05'in kalıcı testi (düzeltme FX-03'te) · K6-02 altyapısı.
- **Kabul:** yeni handler testi kırmızı (kaoS0) ve **izinli kırmızı** olarak kayıtlı; kabul testi
  bayraksız koşunca ağaç temiz; sync-check PASS.

### Dalga 1 — Acil: canlı kullanıcıyı aç (yayımlanabilir paket)

#### FX-01 · Ünite ustalığı (KR-1, KR-2)
- **Yap:** Flow'a saf `masteryPlan(snapshot, unitId, now, content)` (çapa okuma adımı + ünite
  lemmalarından 10 karma soru); `kaoLessonStart` ünite kimliğini **ustalık planına** çözer (son içerik
  dersine değil); bitişte `path.units[id] = {masteryAt, masteryScore}`; ≥0,8 → ünite tamam + `u<n>` taşı;
  altında → zayıf kelimelerden **onarım dersi** (`path.units[id].repair`), sonra ustalık yeniden teklif.
  KR-2(a) için "şimdilik atla" ikincil eylemi → `path.units[id].skippedAt` ve `currentUnit` atlanmış
  üniteyi geçer (kazanım yazılmaz). Yol'da `aria-current="step"` gerçek sıradaki üniteye. `lesson.mastery`
  bayrağı içerik dersinden kaldırılır; ünite ekranında ayrı "Ustalık" satırı. Yeni `path.units` alanları
  `ensureQuranLearn` normalizasyonuna eklenir (eski veri geçerli kalır).
- **Kapatır:** K4-01 · A-4/D-09/D-13 (Ünite 1 sonrası) · P-06 · `u1…u12` taşları.
- **Test önce:** R-01, R-02 · yeni `test_kao2_mastery.js` uçtan uca (ders → ustalık → geçti/kaldı →
  onarım → sonraki ünite; v1 kullanıcı; atla); `test_kao2_next_step.js:120,144` ve
  `test_kao2_milestones.js:50`'deki elle `masteryAt` yazımı gerçek akışla değiştirilir.
- **Kabul:** R-01/R-02 PASS; Ünite 1 → 12 boyunca nextStep hiçbir noktada döngüye girmez (12 ünitelik
  simülasyon); eski veri derin eşit (A-6); bütçe içinde.

#### FX-02 · Gramer görevleri doğru öğretir
- **Yap:** (1) İçerik hattı: `tools/kao-content-freeze.mjs` `QuranGrammarV1`'e doğrulanmış `examples`
  (`resolved.ar/words/ref/tr`) ve gerekiyorsa `explanation` alanlarını taşır; modül yeniden üretilir,
  içerik bütçesi ölçülür. (2) `kaoBuildGrammarTask`: şablonun `exampleId`'si varsa uyaran/cevap
  **yalnız o örnekten**; "Kelime dizme" gerçek sıralama görevi (mevcut `order`/fragment altyapısı);
  "Ek çöz" cevabı kavram tablosunun kendi sütun/parça yapısından (sabit `'el + '` kalkar; yalnız g1'de
  "el"); uyaran Arapça olmalı; geçerli görev kurulamıyorsa şablon **atlanır** (fail-closed, tek şıklı
  görev asla üretilmez). (3) Hızlı güvenlik ağı (gerekirse FX-02'nin ilk adımı): kusurlu şablonları
  plan dışı bırakan filtre — yanlış öğretmektense hiç göstermemek.
- **Kapatır:** K4-02 · K-05/P-02 (içerik doğruluğu) · D-03/D-05 içerik · K4-04 (ardışık tekrar görev).
- **Test önce:** R-03 · yeni `test_kao2_grammar_tasks.js`: 25 kavram × tüm şablonlar — her görevde ≥2
  şık, tek doğru, uyaran Arapça ve (exampleId varsa) örneğin içinde, "Ek çöz" cevabı kavrama uygun;
  109 ders yürüyüşünde 0 kusur.
- **Kabul:** R-03 PASS; alan uzmanı (L2) için örnek görev listesi `inceleme/`'ye üretilir.

#### FX-03 · Seviye 0 tek, çalışan deneyim
- **Yap:** (1) `App.kaoS0` shim (+1 handler; fx2/v3/surface pinleri ve §4 sayaç güncellenir).
  (2) `kaoS0('start', id)` görünümü `s0`'a **iter** (yığın). (3) `nextStep` `s0-lesson` eylemi ders
  oynatıcı yerine S0 yüzeyine gider; ders oynatıcı S0 kimliği alırsa S0 yüzeyine yönlendirir (boş plan
  asla). (4) Harfsiz dersler (s0.01, .03, .07, .08, .09, .11) için içerik: hareke/sükûn/med/şedde/tenvin
  örnekleri `QuranPhonicsV1` + lexicon'dan araçla (`tools/kao2-curriculum-build.mjs` S0 bölümü);
  `kaoS0HTML` harfsiz derste çökmez. (5) Aşamalar gerçekten değişir: açıklama → dinle-gör → 6–8 alıştırma
  (harf tanı / hece-hareke eşle / konum eşle; cevaplar puanlanır) → gerçek kelime okuma.
  (6) `path.lessons[s0.xx].doneAt` yalnız alıştırmalar bitince; `besmele` taşı yalnız gerçek S0.12
  tamamlanınca ya da yerleştirmeyle. (7) Keşfet'teki S0 satırı `start==='s0'` kullanıcılara da görünür.
- **Kapatır:** K5-01 · K5-02 · D-10 · P-05 · K-3 kademe B (ve A hattının bağlanması).
- **Test önce:** R-04, R-05, R-06 · `test_kao2_s0.js` genişler: 12 dersin 12'si yığınla açılır, çizilir,
  her aşama farklı içerik, 6–8 alıştırma, tamamlanma yalnız alıştırma sonrası; ana yoldan (Bugün
  düğmesi) S0 yüzeyine ulaşım.
- **Kabul:** R-04/R-05/R-06 PASS; okuyamayan sıfır kullanıcı Bugün düğmesiyle harf dersine ulaşır.

#### FX-04 · Niyet (D-18)
- **Yap:** Ayarlar niyet satırı `q.onboarding.intent`'ten okur ve değiştirilebilir (mevcut
  `App.kaoOnboard` dağıtıcısı yeniden kullanılır; yeni handler yok); `kaoIntentSuggestion` seçilen
  niyetin namaz vaktini önerir, niyet yoksa mevcut sıradaki-vakit davranışı.
- **Kapatır:** K3-06 · K3-05 (B-KAO2-11-1) · P-10.
- **Test önce:** R-07 · `test_kao2_settings.js` + `test_kao2_hub.js` niyet senaryoları.
- **Kabul:** R-07 PASS; hub "bekliyor" durumunda seçilen niyet görünür.

> **Dalga 1 çıkışı:** R-01…R-07 PASS · tüm kapılar yeşil · yayın pini tek committe · KR-7'ye göre
> kullanıcı onayıyla yayın · cihazda "Ünite 1 → Ünite 2" ve "harflerle başla" akışının kullanıcı teyidi.

### Dalga 2 — İçerik doğruluğu

#### FX-05 · Ders başlık/hedefleri içerikle uyumlu (KR-3, KR-4)
- **Yap:** KR-3(b): `curriculum.spec.json` odak listeleri ve `poolRules` ile kavram–kelime eşleşmesi
  (ör. g3 dersine gerçekten yön edatları; "Zamirler" dersine zamirler; u09 emir/seslenme derslerine
  emir kipleri ve seslenme; u12.02'ye zaman fiilleri) → araç yeniden üretir → `MUFREDAT-ESLEME.md`
  yeniden G2 onayına. Başlık/hedef metinleri yeni dağılıma göre yeniden yazılır (`draft`); otomatik
  **tutarlılık kapısı**: başlıkta adı geçen kategori (edat/zamir/emir/seslenme/fiil…) derste `pos` ile
  karşılanıyor mu. KR-4(a): açık L1 incelemesi (`INCELEME-*.md` kutuları + `--apply-review`) bitene kadar
  uyuşmayan dersler `draft`.
- **Kapatır:** K5-03 · K5-04 · M-01 · K-08 · K3-07 (07 §3 ve inceleme sayfası güncellenir).
- **Test önce:** yeni `test_kao2_lesson_coherence.js` (başlık kategorisi ↔ kelime `pos`/kavram); onay
  durumunun gerçek işaretli kutudan geldiğini sınayan kontrol (`by:'owner'` yalnız `--apply-review` ile).
- **Kabul:** tutarlılık kapısı 109/109; `sourced` metinlerin tümü işaretli inceleme kutusuna dayanır.

#### FX-06 · "Uygula" adımı her derste dolu
- **Yap:** Flow `applyWords` için `examples` türü: dersin kelimelerinden okunuşu doğrulanmış
  `examples[0]` âyet parçası kelime kelime (yeni kelimeler vurgulu); ünite çapaları 07 §3'e göre
  (seçme âyet / kıssa / Rabbenâ duaları) spec'te kimlikle tanımlanır ve araç doğrular. Ünite 2 için
  `lp_*` → `l_*` eşleme tablosu (`lemmaBw`) içerik hattında üretilir; u02 dersleri kendi namaz metnine
  bağlanır. Boş uygula adımı asla gösterilmez.
- **Kapatır:** K3-01 · K3-02 · D-06 · D-07 (Ünite 2).
- **Test önce:** R-08 · `test_kao2_lesson_flow.js` tüm 109 ders için apply ≥1 kelime; Ünite 2'de öğrenilen
  kelime Tahiyyat'ta "bilinen".
- **Kabul:** R-08 PASS (0/109 boş).

#### FX-07 · Tanış kartı tam katmanlarıyla
- **Yap:** tanış kartına okunuşu doğrulanmış `examples[0]` (Arapça + okunuş + Türkçe + ref) ve
  katlanabilir "Neden böyle?" (kök anlamı, unit11 türevleri, `cognate.shift` uyarısı). D-12 kognat turu
  için ayrı karar kaydı (yeni kart ya da bilinçli erteleme).
- **Kapatır:** K5-05 · D-01 · K7-01 (karar kaydıyla).
- **Test önce:** `test_kao2_lesson_flow.js` tanış kartı içerik kontrolleri.
- **Kabul:** her tanış kartında doğrulanmış örnek; doğrulanmamış örnek hiç gösterilmez.

#### FX-08 · Sûre bağlamı (KR-5)
- **Yap:** KR-5(b): `contextTr` kaldırılır ya da `draft` kalır ve A-5 hedefi "20/20 sûre tanıtımı
  (tema/yer/âyet sayısı)" olarak revize edilir; `review.sources` yalnız gerçek türetim kaynağını gösterir.
- **Kapatır:** M-02 · M-03.
- **Kabul:** atıf = türetim; A-5 yeni hedefle gerçek ölçüm.

### Dalga 3 — Arayüz sözleşmesi

#### FX-09 · Tek başlık ve odak modu
- **Yap:** eski `.kao-header` kaldırılır; NavBar modalın tek üst çubuğu (kökte "Kapat", diğerlerinde
  "‹ önceki"); dialog `aria-labelledby` görünümün LargeTitle'ına; ders/tekrar ekranı odak modu: yalnız
  ✕ + ince ilerleme çubuğu (✕ = dersten çık, ilerleme korunur).
- **Kapatır:** K2-01 · K4-03 · O-01 · T-06 · T-07 · K2-07.
- **Test önce:** `test_kao2_navigation.js` + tasarım sözleşmesine "ekran başına tek üst çubuk / tek
  kapatma kontrolü" ölçümü (tüm görünümler yığınla).
- **Kabul:** her ekranda tek başlık bloğu; ders ekranında yalnız ✕ + çubuk.

#### FX-10 · Ayarlar (S-13) kartın istediği gibi
- **Yap:** `Views.switchRow` / `groupedList` ile yeniden kurulum; gruplar: Günlük hedef (süre, niyet) ·
  Ses · Okuma · Öğrenme ("Doğruda otomatik geç" switch, "Başlangıç noktasını değiştir" → ilk açılış
  2. adım) · Gölgeleme · Görünürlük · Veri · "Hakkında ve kaynaklar ›"; eski metin düğmeleri ve
  `.kao-toggle` kalkar; `onboarding.minutes` ↔ `settings.dailyNew` tutarlılığı.
- **Kapatır:** K2-02 · K2-06 · K6-03 · K7-03 · O-04 · T-22.
- **Test önce:** `test_kao2_settings.js` grup sırası, gerçek switch bileşeni (`.kao-switch-track`),
  autoAdvance switch'i, başlangıç noktası eylemi; tasarım sözleşmesi (f) switch **bileşenini** sınar.
- **Kabul:** ayar handler sayısı değişmez (mevcut handler'lar yeniden kullanılır).

#### FX-11 · Gerçek süre tahmini
- **Yap:** `daily[today].ms` cevap sürelerinden yazılır (B-KAO2-08-1); `lessonStep` dakikayı görev
  sayısından (tanış + alıştırma + uygula) hesaplar; Bugün/hub/özet aynı hesap.
- **Kapatır:** K3-03 · Y-08 (süre) · K3-09 ("0 tekrar" metni).
- **Test önce:** `test_kao2_next_step.js` görev bazlı tahmin + ölçülmüş ms ile tahmin.
- **Kabul:** 17 adımlık ders tahmini ölçülmüş ortalamayla tutarlı.

#### FX-12 · Küçük arayüz düzeltmeleri
- **Yap:** İlerleme LargeTitle "İlerleme" + kalibrasyon tablosu katlanır (K6-04) · kelime detayı
  "Bu kelimenin dersi: Ünite N · Ders M" + "Derse dön" o derse (K6-05) · yerleştirme şıkları uzunluk
  dengeli çeldiricilerle (K5-06, Y-13) · ünite "x / y kelime" etiketi "kalıcı" diye açık (K4-04) ·
  hub halkası "%20" (K3-09) · `namaz` taşı metni gerçek kapsamla (K4-04).
- **Kapatır:** K6-04 · K6-05 · K5-06 · K4-04 · K3-09.
- **Test önce:** ilgili fixture'lara ekler (`test_kao2_progress`, `test_kao2_word`, `test_kao2_onboarding`,
  `test_kao2_hub`).

### Dalga 4 — Ölçüm ve test sağlamlığı

#### FX-13 · Kabul tablosu gerçekten ölçer
- **Yap:** `test_kao2_kabul.js`: A-1 onboarding akışını gerçek handler'larla sayar; A-2 109 dersin
  tamamı; A-3 tüm görünümler **yığınla** × boş/tohumlu/panel-açık + ders oynatıcı/yol/ünite/özet/ilk
  açılış/S0; A-4 7 durum × beklenen tür eşlemesi + 12 ünitelik simülasyon; A-5 gerçek hedef; A-8
  "Devam"a gerçekten basar; A-9 aileleri **çalıştırır**; A-10 içerik bütçesi koşulda. a11y matrisi
  aynı yardımcıyla genişler (ders oynatıcı odak kuralı dahil); `tekrar-uret.cjs` kontrolleri kalıcı
  fixture'a (`tests/kao/test_kao2_denetim.js`) taşınır.
- **Kapatır:** K6-01 · K2-04 · K2-05 · K6-02 · M-02 (ölçüm tarafı).
- **Kabul:** kabul tablosu her satırda gerçek değer; bilerek bozulan bir davranış (ör. masteryAt yazımını
  kaldırmak) ilgili satırı FAIL yapar (mutasyon kanıtı kanıt dosyasına).

### Dalga 5 — Temizlik ve kayıtlar

#### FX-14 · CSS ve ölü kod
- **Yap:** 18 öksüz seçici + degrade kalıntıları + `kao-audio-pending` + ölü `.kao-toggle` stilleri
  silinir; `test_kao_render.js:392` ve kontrast aracının ölü seçici bağımlılıkları güncellenir (P2.4
  gerekçesiyle). İsteğe bağlı: K-2 katman tamamlama (`kaoTaskHTML` şıkları `Views.choice`, ayarlar
  `Views` bileşenleri) — davranış eşitliği dökümle kanıtlanır.
- **Kapatır:** K3-04 (B-KAO2-09-1, B-KAO2-10-1) · K6-07 · M-13 · K2-07 · K2-03 (isteğe bağlı).
- **Kabul:** kontrast PASS; tasarım sözleşmesi PASS; `kao.css` gzip küçülür.

#### FX-15 · Program kayıtlarını gerçeğe eşitle
- **Yap:** KAO2-STATE (onay/yayın kaydı 21–27, kapılar, versionPolicy, analiz sayıları, KAO2-19 notu,
  backlog durum alanı) · CURRENT-STATE açık riskler · KAO2-KAPANIŞ (§2 doğru kimlikler + tam eşleme,
  pin, p95, §6 onay durumu, §7) · LEDGER'a KAO2-A ve hazırlık commitleri için geriye dönük `NOTE` ·
  §4 handler sayacı · 07 §3 ve MUFREDAT-ESLEME · `tests/kao/README.md` envanteri (28 KAO2 testi) ·
  CLAUDE.md/AGENTS.md KAO2 satırı (onay durumu) · KAO2-26 YAYIN.md eksik rapor · KR-6'ya göre
  `kao-plan-check` taban commit'i.
- **Kapatır:** M-01 (belge) · M-04…M-10 · M-12 · K3-07 (belge) · K3-08 · K6-06 · K7-02 (karar kaydı).
- **Kabul:** `kao-plan-check` exit 0; sync-check PASS; belgelerdeki her sayı kaynaktan yeniden türetilebilir.

#### FX-16 · Regresyon, pin, kapanış
- **Yap:** P3 tamamı + `tekrar-uret.cjs` **10/10 PASS** + yeni kabul tablosu; tek committe yayın pini;
  kapanış belgesi (49 bulgu → kart eşlemesi, kanıt düzeyleri ayrı); yayın yalnız kullanıcı onayıyla;
  cihaz kabulü (A-11/A-12, "Ünite 1 → 2" geçişi, S0 akışı, ekran okuyucu turu) kullanıcıda.

## 4. Sıra, bağımlılık ve kabaca boyut

```
FX-00 → FX-01 ┐
        FX-02 ├→ (Dalga 1 yayını, KR-7) → FX-05 → FX-06 → FX-07 → FX-08
        FX-03 │                           FX-09 → FX-10 → FX-11 → FX-12
        FX-04 ┘                           FX-13 (FX-01…03 testlerini kalıcılaştırır)
                                          FX-14 → FX-15 → FX-16
```

| Kart | Boyut | Not |
|---|---|---|
| FX-01 | büyük | Flow + motor + görünüm + taşlar; en yüksek etki |
| FX-02 | büyük | İçerik hattı + görev kurucu; L2 örnek listesi |
| FX-03 | büyük | +1 handler (pinler); S0 içerik araçla |
| FX-04 | küçük | Tek alan hatası + öneri |
| FX-05 | büyük | Müfredat yeniden dağıtım + G2 + L1 |
| FX-06 | orta | Flow + içerik hattı |
| FX-07…FX-12 | küçük–orta | Görünüm ağırlıklı |
| FX-13 | orta | Test sağlamlığı |
| FX-14…FX-16 | küçük–orta | Temizlik, kayıt, kapanış |

## 5. Bulgu → kart eşlemesi (49/49)

| Kart | Bulgular |
|---|---|
| FX-00 | M-11 |
| FX-01 | K4-01 |
| FX-02 | K4-02 |
| FX-03 | K5-01, K5-02 |
| FX-04 | K3-05, K3-06 |
| FX-05 | K5-03, K5-04, M-01, K3-07 |
| FX-06 | K3-01, K3-02 |
| FX-07 | K5-05, K7-01 |
| FX-08 | M-02, M-03 |
| FX-09 | K2-01, K4-03, K2-07 |
| FX-10 | K2-02, K2-06, K6-03, K7-03 |
| FX-11 | K3-03 |
| FX-12 | K6-04, K6-05, K5-06, K4-04, K3-09 |
| FX-13 | K6-01, K2-04, K2-05, K6-02 |
| FX-14 | K3-04, K6-07, M-13, K2-03 |
| FX-15 | M-04, M-05, M-06, M-07, M-08, M-09, M-10, M-12, K3-08, K6-06, K7-02 |
| FX-16 | kapanış doğrulaması (tüm liste) |

## 6. Başlatma için tek adım

Kullanıcı KR-1…KR-7'yi yanıtlayıp kapsamı onaylayınca FX-00 başlar. O ana kadar bu klasör
yalnız rapor, plan ve salt-okur `tekrar-uret.cjs` içerir; hiçbir üretim dosyası değişmemiştir.
