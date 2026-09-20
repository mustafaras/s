# 12 — Ek gereksinimler (bağlayıcı; kullanıcı kararı 20 Eylül 2026)

Aşağıdaki 26 madde **öneri değil, gereksinimdir**. Her birinin kimliği
(`R-xx`), sahibi olan kart(lar) ve kabul kontrolü vardır; kabul kontrolü
geçmeyen kart kapanmaz. İzlenebilirlik: [07](07-UYGULAMA-KARTLARI.md) kart
satırlarında `R-xx` referansı, [KAO-STATE.json](KAO-STATE.json) `requirements`.

## A. Bilimsel gereksinimler

| ID | Gereksinim | Kart | Kabul kontrolü |
|---|---|---|---|
| R-A1 | **Gece tekrarı.** Hub kartı ve E1, kullanıcının hedef yatış saatinden (`settings.targetBed`, mevcut `SeymaHealth.caffeineTargetBed()` yardımcısıyla okunur; yoksa öneri yok) önceki 90 dakikada "3 dakikalık gece tekrarı" (≤8 kart, yalnız review) önerir; `daily.nightRev` sayılır. Ölçüm: gece-tekrar yapılan kartların ertesi gün doğruluğu vs. diğerleri, KAO-20 raporunda | KAO-09, KAO-10, KAO-20 | Fixture: targetBed 23:30 → 22:00–23:30 arasında öneri var, dışında yok; targetBed yoksa öneri yok; otomatik ses sessiz saat (23–07) kuralına uyar, elle dokunma her zaman çalar |
| R-A2 | **Çeldirici güvenliği.** Çeldirici havuzu yalnız `st=review ∧ s≥21` kartların anlamlarından; henüz kararlı olmayan/yeni kart anlamı asla çeldirici olmaz; aynı çeldirici aynı hedef kartta ardışık iki tekrarda gelmez | KAO-09 | `test_kao_queue.js`: 1.000 sentetik oturumda ihlal 0 |
| R-A3 | **Tutunma eğrisi ve kalibrasyon.** Her kart için FSRS öngörülen R ile gerçek sonuç kaydedilir (`daily.calib: {pred, ok}` toplamları); 2 ve 6 haftalık tutunma eğrisi ve kalibrasyon raporu KAO-20'de ve E1 "istatistik" alt görünümünde | KAO-08, KAO-13, KAO-20 | Rapor üretilir; öngörü-gerçek farkı 10 R-bandında tablolanır |
| R-A4 | **İlk sunumda otomatik ses.** Yeni kelimenin ilk 2 sunumunda ses otomatik çalar (kullanıcı ses ayarı açık ve sessiz saat dışında); görsel ses'ten önce gelmez (ses başlayınca Arapça görünür, ≤150 ms) | KAO-11, KAO-17 | Fixture: yeni kart HTML'inde `data-autoplay="1"` yalnız `n<2`; sessiz saatte 0 |
| R-A5 | **Anlamsal komşu ayrımı.** Derleme aracı `semNeighbors[]` etiketi üretir (insan onaylı); aynı anlam kümesinden iki yeni kart aynı oturuma ve **3 gün içine** gelmez | KAO-02, KAO-09 | Kuyruk fixture'ı: komşu çift arası ≥3 gün |
| R-A6 | **Vakıf işaretleri = anlam noktalaması.** E6/E9'da ۚ ۖ ۗ ۘ ۙ ۛ işaretleri renkli nokta olarak görünür; dokununca "burada dur: cümle/anlam sınırı" açıklaması; T1 kuralına bağlı | KAO-06, KAO-16 | Kısa sûre içeriğinde işaretler korunmuş; render'da `.kao-waqf` düğmeleri var |
| R-A7 | **"Fiil önce gelir" mikro-kavramı (G0.5).** Türkçe SOV ↔ Arapça VSO farkı, ok şemasıyla; Ünite 1'de, kelime dizme görevinden önce zorunlu; dizme görevinde SOV hatası "sıra" hata sınıfına yazılır | KAO-04, KAO-13 | Gramer içeriğinde `g0_5` var; hata taksonomisine `order` eklendi |
| R-A8 | **Kalıp düzeyinde kognat köprüsü.** Kognat alanı kelimeden **kalıba** yükseltilir: her kök için Türkçedeki türevler kalıp etiketiyle (`ilim=masdar, talim=II masdar, muallim=II ism-i fâil, âlim=ism-i fâil, malûm=ism-i mef'ûl`); Ünite 11 bâbları Türkçe türevlerden öğretir; "Türkçedeki akrabaları" görevi | KAO-02, KAO-04, KAO-14 | Sözlükte ≥60 kök için kalıp-etiketli Türkçe türev listesi; fixture sayar |
| R-A9 | **Okuma erişilebilirliği.** Ayarlar: Arapça satır aralığı (1.9/2.2/2.5), kelime boşluğu (normal/geniş), **renkli hareke** (fetha/kesra/damme ayrı ton, açık/koyu çift; Seviye 0–1'de varsayılan açık) | KAO-15, KAO-17, KAO-18 | Kontrast ölçümü 3 hareke tonu × 2 tema; ayar `settings.readability` |

## B. Tasarım gereksinimleri

| ID | Gereksinim | Kart | Kabul kontrolü |
|---|---|---|---|
| R-B1 | **Mushaf ısı haritası (E10 `map`).** 114 sûre × anlaşılan âyet oranı; `faithAnnualHeatmapHTML` görsel diliyle; kilit yok; eşdeğer metin listesi | KAO-28b | Render fixture: 114 hücre, `aria-label` "Sûre adı: %n anlaşıldı"; sûre verisi yoksa hücre boş |
| R-B2 | **"Namazda ne diyorum" (E11 `prayer`).** Bir rekât sırası (tekbir → Sübhâneke → Fâtiha → zamm-ı sûre → rükû → secde → tahiyyat → selâm); bilinen kelime açık, bilinmeyen kapalı; Seviye 1'in bitiş ekranı; hub kartından erişilir | KAO-06 (içerik: `prayerTexts`), KAO-16b | İçerik insan doğrulamalı; render'da kapalı/açık oranı `data.quranLearn`'den |
| R-B3 | **Üç dokunuş kuralı (E5).** 1. dokunuş Arapça+ses+Türkçe; 2. kök ağacı + Türkçe akrabalar; 3. Kur'an'dan 3 örnek. Aynı anda gösterilmez | KAO-14 | Fixture: ilk render'da yalnız katman 1 DOM'da; `App.kaoWordLayer(2)` sonrası katman 2 |
| R-B4 | **Oturum sonu tek sayı (E3).** "Bugün N kelime daha kalıcı oldu" = bu oturumda `s` 21 gün eşiğini geçen kart sayısı; XP/puan yok | KAO-13 | Fixture: sayı = eşik geçen kart sayısı; "puan"/"XP" dizgisi HTML'de yok |
| R-B5 | **Hareke soldurma animasyonu.** Ayar açıkken review kartlarında hareke `--dur-5` ile solar; dokununca geri; `prefers-reduced-motion`'da anında | KAO-17 | CSS token kullanımı; reduced-motion dalı fixture'da |
| R-B6 | **Mahreç şemaları tek çizgi dili.** 8 C-kova + 5 B-kova harfi için aynı sagittal siluet, yalnız vurgu değişir; inline SVG, `currentColor`, ≤4 KB | KAO-23, KAO-26 | 13 SVG; boyut ve `fill="currentColor"` fixture'ı |
| R-B7 | **Kognat rozeti.** Kartta "Türkçede var: *rahmet*" pastili; anlam kaymasında `--quran-warn` tonu + "dikkat" simgesi + metin | KAO-11, KAO-14 | Renk tek taşıyıcı değil (simge+metin) fixture |
| R-B8 | **Sesli iki hız tek düğme.** Dokun = yavaş (Muallim), basılı tut (≥350 ms) = doğal; klavyede Enter/Space yavaş, Shift+Enter doğal; `aria-label` iki hızı söyler | KAO-11, KAO-17 | Render fixture: `data-kao-audio` düğmesi, iki id; klavye eşdeğeri |

## C. Ürün / mühendislik gereksinimleri

| ID | Gereksinim | Kart | Kabul kontrolü |
|---|---|---|---|
| R-C1 | **İçerik hata bildirimi.** Kartta uzun basma / "⋯ → Hata bildir" → `cards[id].flagged={at,kind}`; panel özetinde bayrak sayısı; içerik sürümünde düzeltme | KAO-14, KAO-19 | Manifest projeksiyonunda `flaggedCount`; serbest metin yok |
| R-C2 | **Sessiz mod garantisi.** Ses yüklenemez/ağ yoksa görev metinle devam; hiçbir görev sese *bağımlı* değil (dinleme görevleri atlanır, bilgi verilir) | KAO-11, KAO-26 | `test_kao_privacy.js` + kuyruk fixture'ı: `audio=false` ile tam oturum biter |
| R-C3 | **Geri al (3 s).** Yanlış dokunmada "Geri al"; FSRS ve `daily` geri sarılır (`ui.kaoUndo` önceki kart kopyası); Zikirmatik geri al kalıbı | KAO-11 | Fixture: cevap → undo → kart durumu bit-bit eşit |
| R-C4 | **Yerel dışa aktarma.** E7 "Kelimelerimi indir (CSV)" — Blob, ağ yok; sütunlar Anki uyumlu (`ar, tr, translit, root, tags`) | KAO-17 | Fixture: CSV başlığı ve satır sayısı = bilinen kart |
| R-C5 | **Performans bütçesi.** Görev geçişi < 50 ms (hedefli DOM, tam `render()` yok); 4 içerik modülü gzip ≤ 130 KB; ilk açılışta ses indirilmez | KAO-11, KAO-20 | Ölçüm raporu; `preload="none"` fixture |
| R-C6 | **Gecikmeli sûre testi.** "Anladım" 7 gün sonra 5 soruluk parça-çevirme ile doğrulanır; geçince ısı haritasında koyulaşır; geçmezse "tekrar oku" | KAO-16, KAO-28b | `surahs[sid].delayedScore` ≥ 4/5 koşulu fixture'da |
| R-C7 | **Ölçeklenebilir şema.** `s:<surah>:<ayah>:<i>` id'leri ve `surahs{}` 114'e hazır; Seviye 6 ayrı program olsa da şema değişmez | KAO-07 | Migration fixture 114 sûrelik sentetik veriyle |
| R-C8 | **Ölçülü gözlemci şeffaflığı.** Panel: kapsam %, seri, bugün çalışıldı mı, en çok karıştırılan **ses sınıfı** adı, bayrak sayısı; kelime düzeyi hata **yok** | KAO-19 | Projeksiyon fixture'ı: izinli alan listesi dışı anahtar yok |
| R-C9 | **Üç kullanıcı görevi.** (a) 90 sn içinde bugünkü oturuma başlayabilme, (b) kelime kartından kök ağacına 2 dokunuş, (c) ses kapalı tam oturum. Headless senaryo + kullanıcı cihaz kabulü | KAO-20, KAO-22 | Üçü de senaryo fixture'ında; cihaz kabulü kullanıcıdan |
