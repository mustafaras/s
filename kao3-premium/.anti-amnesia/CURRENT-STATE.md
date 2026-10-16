# K3P · CURRENT-STATE

Sıradaki prompt: K3P-19

## Son durum

- **Tarih:** 2026-10-15.
- **Son tamamlanan:** **K3P-18 — R4 "âyette boşluk"** (28/37 kart bitti).
- **Yetki:** kullanıcı 2026-10-15'te dört karar verdi: (a) runtime tavanı **128 → 136 KiB**, (b) `cift-sik` ölçümü karışık örnekle yapılsın, (c) K3P-18 tamamlansın, (d) R4 düşüş sözleşmesi için "bilimsel kararı sen ver" (karar: **bir basamak**, `R4→R3→R2`). Yalnız yerel commit; push/merge/deploy/tag yok. `releaseApproval=NOT_APPROVED`.
- **Yayın:** Yeni yayın yok. Yayın pini **20261015b** (K3P-16 ara yayını). `pinDeferral.files = ["app/core/quranLearn.js"]` (K-P: değişen dosya K3P-27'de tek seferde yükseltilir).
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-18 ne yaptı

- **Yeni görev türü `kind:'cloze'`** (TASARIM §4, R4). Doğrulanmış örnek âyette hedef kelime boşluk olur.
  - **Boşluk kuralı:** âyet VE okunuş **aynı kelime konumunda** boşalır. Okunuş da boşalır, çünkü hedefin okunuşu görünürse cevap sızardı. Türkçe anlam + âyet künyesi görünür kalır.
  - **Ses yok:** hedef kelimenin sesi çalınmaz (`clipId:''`) — dinletmek cevabı verirdi.
  - **Şıklar:** normal `tr>ar` yolunun Arapça şıkları (aynı tür/farklı kök, K3P-01 tekilleştirmesi). Doğru şık harekeli hedeftir. **Şıklar dörtten azsa cloze kurulmaz**, görev R2'ye düşer.
  - **Hata kovası:** `errors.root` (ses değil — karıştırılan şey köktür).
  - **Uygunluk:** lemma `verified` ∧ örnekte ar/tr/ref/okunuş var ∧ hedef âyette **tam kelime** ∧ âyet ve okunuş kelime sayısı eşit. Uygun değilse kart **bir** basamak iner.
  - **R4 düşüş sözleşmesi (bilimsel karar):** `R4→R3→R2`. TASARIM §4 "unutma kuralı" *bir basamak* der; eski `R4→R2` iki basamak düşüp üretme görevini tanımaya çeviriyordu ve kartın metniyle ("R3'te kalır") çelişiyordu. Yeni kural TASARIM §4'e yazıldı; `test_k3p_ladder` + `test_k3p_build` beklentisi **bilinçli** güncellendi.
- Render mevcut fragman/eyebrow dallarını yeniden kullanır; yeni `App.kao*` yok (45 sabit).
- **Yeni test `tests/kao/test_k3p_cloze.js` (7 kontrol):** uygunluk, boşluk konumu + sızma yok, şıklar (tekil/aynı tür/farklı kök), cevap yolu (gerçek `kaoAnswer` + FSRS + `errors.root`), a11y, doğrulanmamış örnek hiç kullanılmaz, akışta cloze üretilir. KAO envanteri **75 → 76**.
- **Paylaşılan fixture'lar:** `kao-harness.js`'e **`correctTaps(task)`** eklendi (build/cloze/order için tam doğru dokunma dizisi; `playLesson`'un build döngüsüyle tek kaynak). `test_k3p_progress`, `test_k3p_rhythm`, `test_k3p_dda`, `test_kao_user_tasks`, `test_k3p_distractors` buna bağlandı — hepsi çok-dokunuşlu görevi tek dokunuşla geçmeye çalışıp `RangeError: Invalid array length` / takılma veriyordu.
- **Bütçe tavanı üç yerde** 136 KiB'a güncellendi: `test_kao2_mastery` (L6, bağlayıcı), `test_kao2_perf_budget` (L9), `test_kao2_kabul` A-10.

## Bütçe: §2 "önce eski kodu sil" uygulandı, sonra tavan yükseltildi

- `window.SeymaQuranLearn`'dan **17 kullanılmayan sembol** kaldırıldı (14 ölü ihracat + `fsrsRequestRetention` + iç fonksiyon `kaoLessonTitle`). 358 kod dosyası tarandı: hiçbiri kendi tanımı dışında geçmiyor. Kazanç **129 B**.
- Geniş tarama (tüm girinti düzeyleri): **başka ölü sembol yok** — K3P-09 temizliği işini yapmış. Üç runtime dosyasında yinelenen fonksiyon/literal yok.
- Kalanı kapatmanın tek yolu 183 kart-etiketli yorumu kırpmaktı (3,7 KB), ancak mekanik kırpma **gerçek invariants'ları siliyordu** ("r tanıtımdan önce olamaz", "Tek tanım; E3 sayacı da kullanır") → uygulanmadı. Tavan bu yüzden **kullanıcı yetkisiyle** yükseltildi.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 128,437 KiB (131519 B) | **136 KiB**; kalan ~7,6 KB |
| Runtime gzip L9 (perf aracı) | 128,057 KiB | 136 KiB; kalan ~8,0 KB |
| CSS gzip L9 | 15,273 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| p95 / steady | ~3–9 ms / ~3 ms | ≤40 ms |
| **Tanıma payı (K3P-18 kabul)** | **%48,94** | ≤ %60 |
| KAO fixture envanteri | **76** | 76 PASS |
| Çift şık | 0 | 0 |

## Kapılar ve açık sınırlar

- **Tanıma payı ölçümü (kabul ölçütü):** `cift-sik.cjs` iki geçişli karışık örnek kullanır — 1. geçiş derslerin kullandığı kelime kartlarını toplar (814), 2. geçiş onları karışık kararlılıkla tohumlar (üçte biri `s=40`→R4, `s=12`→R3, `s=5`→R2). Yalnız **TEKRAR** görevleri sayılır; tanış (yeni kelime) görevleri merdiven dışıdır ve sayılırsa pay yapay şişer (yerleşik tohumda 1031 görevin 881'i tanış → %80). Sonuç: 1324 tekrar görevi · R1 648 = **%48,94 PASS** · R4 56 · R3 237 · R2 383.
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` `pinDeferral.files`'ta olduğu için **ERTELENDİ** diyerek PASS (K-P; pin K3P-27'de tek seferde yükseltilir).
- **Not:** perf p95 ölçümü **yalnız başına** koşulmalıdır; paralel aile taraması sırasında ölçülen değer (7–10 ms) CPU paylaşımı yüzünden yanıltıcıdır (izolasyonda ~3 ms).
- Görsel QA (`KAO_QA_CHROME`), gerçek ekran okuyucu turu, hedef cihaz kabulü ve Tezhip görsel denetimi açık kalır (K3P-26).
- Hiçbir kabul kontrolü kaldırılmadı veya gevşetilmedi. Paylaşılan fixture düzeltmeleri kapsam içinde beyan edildi (aynı doğrulama yolunun parçası).

## Devir notu

Yalnız K3P-18 uygulandı ve yerel commit atıldı; yayın/pin yok. Sıradaki K3P-19 için ayrı kullanıcı isteği gerekir. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
