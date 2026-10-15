# K3P · K3P-13 oturum başlatıcısı (Ders âyetle açılır ve kapanır · K-G)

**Bu dosya kimin için:** K3P-13'ü uygulayacak yeni oturumun **ilk mesajı** olarak yapıştırılır.
Genel başlatıcı [STARTER.md](STARTER.md)'dir; bu dosya **üç perde** (Hedef → Çalışma → Okuma),
**Tezhip açılış/kapanış**, **ses + sırayla yaldızlanma** ve **üç dar bütçe** uyarılarını ekler.

---

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-13 ("Ders âyetle açılır ve
   kapanır — K-G"). Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
   (Kart "in-progress" ise ağacın kirli olması beklenir; o durumda devir notundan devam et.)
4. Bitirirken §3 kapanış protokolünü uygula: hızlı kapı → K3P-STATE / CURRENT-STATE / LEDGER →
   tek commit → kısa rapor. Bu kart DALGA SONU DEĞİL; yalnız `kapi-hizli --kart K3P-13` yeterli.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

⚠️ ÜÇ DAR BÜTÇE (devralınan ölçüm, 2026-10-14 · birleşik ara yayın 20261014b canlıda):
- Çalışma zamanı 127,988 / 128 KiB (gzip L6; L9 127,630). İKİ test de ölçer ve İKİSİ de ≤128
  olmalıdır: `test_kao2_mastery.js` L6 (level 1, **bağlayıcı** olan: pay yalnız ~0,012 KiB) ve
  `test_kao2_perf_budget.js` L9 (level 9). Kapı ikisini birlikte koşar → L6'yı baz al.
- CSS 15,221 / 16 KiB (pay ~0,8 KiB).
- app.js kabuğu 7799 / 7800 satır (tests/app/test_modularization_boundary.js) → app.js'te yer
  neredeyse yok. Bu kart quranLearn.js/Flow/Views ve kao.css'e yazar; app.js'e DOKUNMA.
- Bu kart HEM JS HEM CSS ekler. HER commit'ten önce runtime'ı ölç ve sayıyı LEDGER'a yaz.
  Pay yetmezse §5 gereği DUR ve tavan kararını bana sor; kodu büyütmeden önce aynı işi gören
  ESKİ kodu sil ya da en uzun yorumlarda DAVRANIŞI DEĞİŞTİRMEDEN yalnız parantez içi açıklamaları
  kısalt (K3P-11/12'de böyle ~1,1 KiB kazanıldı). Yorum sıkıştırırken SATIR SONU yutma:
  sıkıştırma sonrası her hedef satırı `sed -n '<n>p'` ile ham oku (K3P-09/10'da bir satır-birleşme
  tuzağı yaşandı ve yalnız elle yakalandı).

Kartın özü (prompt metnini senkron çıktısından oku, burası yalnız hatırlatma):
- **① Hedef (goal) — açılış:** Hedef ekranı, dersin çapa âyetindeki HEDEF KELİMELERİ içeren
  satırı K3P-11 `tezhipPage` bileşeniyle Tezhip olarak gösterir. Hedef kelimeler SOLUK ALTINLA
  işaretlenir (`state:'learning'` = yumuşak altın; `state:'known'` = tam yaldız; `state:'new'` =
  mürekkep). Metin EN ÇOK 25 SÖZCÜK (AKIS §3 ①; bu bir K3P-A8 `<details>` bütçesi DEĞİL, tam ekran
  bütçesidir → ölçümünü `akis-olc.cjs` sözcük sayımıyla yap).
- **⑤ Zirve (apply) — kapanış:** Aynı satır SESLE çalınır ve kelimeler SIRAYLA yaldızlanır
  (`kaoReaderPlayWords` mantığı; ders içinde `kaoPlaySequence` ~2914). Hareket azaltma açıksa
  (`SeyFx.shouldAnimate() === false` ya da `prefers-reduced-motion`) yaldız STATİK gösterilir.
  Ses yoksa/kapalıysa yaldız sesle değil ZAMANLAYICIYLA (ritimle) ilerler. Toplam an ≤ 1,2 sn.
- **Veri değişmez:** `goal` ve `apply` öğeleri ZATEN `lesson.apply` ref'ini paylaşır
  (`Flow: goal.apply=lesson.apply`, `apply.ref=lesson.apply`) — kart veri şemasına DOKUNMAZ,
  `migrate()` değişmez, yalnız sunum/oynatma katmanı eklenir.
- **Handler sayısı 45'te SABİT:** yeni `App.kao*` YOK; mevcut `kaoLesson`/`kaoPlay`/`kaoSeg`
  çoğaltıcılarını kullan. `data-countup` deseni (varsa kapsam artışı) render.js sweepCounters'ta.

Kabul:
- `tests/kao/test_k3p_lesson_ayah.js` (109 ders taraması) yeşil: her dersin goal ve apply öğeleri
  AYNI âyet referansını taşır; hedef lemmaların HEPSİ o satırda vardır. Uymayan ders yalnızca
  GEREKÇELİ istisna listesine girer; liste YALNIZ KÜÇÜLEBİLİR (bayat istisna = kırmızı).
- `test_kao2_lesson_coherence` yeşil.
- `kapi-hizli --kart K3P-13` yeşil.

Okunacaklar (prompt senkron çıktısından):
- kao3-premium/TASARIM.md → §3.2 (üç perde) · AKIS.md → §3 ① ve ⑤
- app/core/quranLearnFlow.js → lessonPlan içindeki goal (~229) ve apply (~308) öğeleri
- app/core/quranLearnViews.js → ders kartları (goal/apply ekranları)
- app/core/quranLearn.js → kaoPlaySequence (~2914), kaoReaderPlayWords (~3294), kaoLessonHTML

Değişmez kurallar:
- Push, merge ve deploy yok. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır. (Ara yayınları
  ben ayrıca onaylarım; sen kendiliğinden push etme. Şu an main = 20261014b, dal = kao3-premium.)
- Uygulamayı tarayıcıda açma (CLAUDE.md DATA SAFETY). Ekran görüntüsü istersem kontrollü yerel
  CDP aracını kullanırım (KAO_QA_CHROME; sunucu açmaz, token/forceSync yok).
- mustafaras/seyma-data deposuna yazma. Token ya da parola isteme.
- Pin yükseltme yok (K-P): değiştirdiğin pinli dosyaları K3P-STATE.pinDeferral.files'a ekle;
  yükseltme K3P-27'de tek geçişte.
- Test envanteri: her yeni tests/kao/test_*.js dosyasını tests/kao/README.md tablosuna ekle.
```

---

**İlerlemeyi görmek için:** `node kao3-premium/araclar/senkron.mjs --liste`
**Bu kartın tam metni:** `node kao3-premium/araclar/senkron.mjs --prompt K3P-13`
**Dalga 2 akışı:** K3P-11 (Tezhip bileşeni) → K3P-12 (Bugün ekranı) → **K3P-13 (ders âyetle açılır/kapanır)** → K3P-14 (ders sonu anı) → K3P-17 (İlerleme) → K3P-18 (Yol küçük resimleri).
**Kapanışta:** hızlı kapı + tek commit. Yayın (push) ayrı onayımla yapılır.
**Not:** K3P-11 `tezhipPage` bileşenini bu kart İLK tüketici olarak kullanır; bileşenin `interactive:false` kipini açılışta, `interactive:true` (kelime → okuyucu balonu) kipini kapanışta değerlendir.
