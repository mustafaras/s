# K3P · CURRENT-STATE

Sıradaki prompt: K3P-18 — **kullanıcı kararı bekliyor** (aşağıdaki "Devir notu")

## Son durum

- **Tarih:** 2026-10-15.
- **Son tamamlanan:** K3P-17 (R3 "harflerden kur") — 27/37 kart bitti. K3P-18 **açılmadı**; ön incelemesi ve iki denemesi yapıldı, iki engelde duruldu (aşağıda).
- **Yetki:** kullanıcı "tüm açıkları kapat ve sıradaki adımdan devam et" dedi. K3P-17'nin açık maddeleri kapatıldı (ölü yüzey temizliği). K3P-18'in kendisi, §5 gereği, aşağıdaki iki engel çözülmeden **uygulanmadı**. Yalnız yerel commit; push/merge/deploy/tag yok. `releaseApproval=NOT_APPROVED`.
- **Yayın:** Yeni yayın yok. Yayın pini **20261015b** (K3P-16 ara yayını). `pinDeferral.files = ["app/core/quranLearn.js"]` (K-P: değişen dosya K3P-27'de tek seferde yükseltilir).
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## Ölü yüzey temizliği (bu oturumda yapıldı)

- `window.SeymaQuranLearn`'dan dışarıdan tüketicisi olmayan **17 sembol** kaldırıldı: 14 ölü ihracat (`kaoDelayedCandidates`, `kaoLessonTitle`, `kaoCurriculumLesson`, `kaoGateLessons`, `kaoS0Play`, `kaoSourcesHTML`, `kaoGrammarHTML`, `kaoGrammarNoteModel`, `kaoConceptModel`, `kaoOnboardHTML`, `kaoCoverageCurve`, `kaoCoverageAt`, `kaoMapHTML`, `kaoPrayerStats`), `fsrsRequestRetention` ve iç fonksiyon `kaoLessonTitle`.
- Doğrulama: 358 kod dosyası tarandı (`app.js`, `tests/`, `tools/`, tüm modüller, HTML) — hiçbiri kendi tanımı dışında geçmiyor; hiçbir fixture yüzey anahtar kümesini sabitlemiyor; hiçbiri shim hedefi değil.
- Değişiklik yalnız **silme**: 20 satır, 0 ekleme. Davranış değişmedi.
- Kazanç: runtime gzip **L6 131067 → 130905 B** (kalan **5 → 167 B**), L9 130686 → 130525 B.

## K3P-18 (R4 "âyette boşluk") — neden durdu

**Engel 1 · Sözleşme çelişkisi.** Kart diyor: "Doğrulanmış örneği olmayan lemma R4'e çıkmaz, **R3'te kalır**." Mevcut motor R4'ü **R2**'ye düşürüyor. Kartın istediği R4→R3 geri düşüşü, `test_k3p_ladder.js` ve `test_k3p_build.js`'in sabitlediği davranışla doğrudan çelişiyor; denemede 5 K3P fixture'ı kırıldı (build · ladder · distractors · ddc · rhythm). İkisini de memnun etmek K3P-17'nin kabul edilmiş düşüş sözleşmesini değiştirmek demek → bu kartın kapsamı dışı (§5).

**Engel 2 · Bütçe.** Cloze işlevsel olarak doğrulandı: boşluk ve okunuş **aynı konumda** boşalıyor, cevap sızmıyor, 4 tekil şık (aynı tür/farklı kök, K3P-01 tekilleştirmesi), anlam + âyet künyesi görünüyor, `verified` örneği olmayan lemma kurulmuyor. Ancak temizlik kazancından sonra **94 B yetmiyor** (L6 128,092 > 128 KiB). Yetmezlik yalnız kabul kapısı değil: **yeni fixture için de yer yok**, yani kartın istediği `tests/kao/test_k3p_cloze.js` yazılamadı. Ölçülen kazançlar: 15 ölü ihracat 129 B · `kaoLessonTitle` 38 B · cloze sıkıştırma 20 B.

**Neden yükseltilmedi:** §2 "önce kart içinde aynı işi gören eski kod silinir; yetmiyorsa §5 gereği DUR" diyor. Tüm girinti düzeylerinde 358 dosya tarandı: **başka ölü sembol yok** (K3P-09 temizliği işini yapmış). Üç runtime dosyasında yinelenen fonksiyon/literal yok. Kalanı kapatmanın tek yolu **183 kart-etiketli yorumu** kırpmaktı (3,7 KB gzip), ama mekanik kırpma **gerçek invariants'ları siliyordu** (örn. "r tanıtımdan önce olamaz", "Tek tanım; E3 sayacı da kullanır", "görev kümesi aynı") ve bir yorumu cümle ortasından bölüyordu → uygulanmadı. **Tavanı yalnız kullanıcı yükseltebilir** (öncekiler 80 → 88 → 128 KiB kullanıcı yetkisiyle).

**Kart denemesi tamamen geri alındı.** Ağaçta yalnız temizlik kaldı; `git diff` = 20 silme, 0 ekleme.

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 127,837 KiB (130905 B) | 128 KiB; kalan **167 B** |
| Runtime gzip L9 (perf aracı) | 127,466 KiB | 128 KiB; kalan 547 B |
| CSS gzip L9 | 15,273 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| app.js / sync.js / state.js | değişmedi | veri ve migration korunur |
| KAO fixture envanteri | 75 | 75 PASS |

## Kapılar ve açık sınırlar

- Tam aile yeşil: tests/kao **75 PASS** (L6 bütçe dâhil), `test_k3p_build` · `ladder` · `distractors` PASS; `senkron.mjs` UYUMLU · 27/37. Cloze geri alındıktan sonra hiçbir kabul kontrolü kaldırılmadı veya gevşetilmedi.
- `tests/app/test_asset_pin_freshness.js`: `app/core/quranLearn.js` `pinDeferral.files`'ta olduğu için **ERTELENDİ** diyerek PASS (K-P; pin K3P-27'de tek seferde yükseltilir).
- Görsel QA (`KAO_QA_CHROME`), gerçek ekran okuyucu turu, hedef cihaz kabulü ve Tezhip görsel denetimi açık kalır (K3P-26).
- `cift-sik` ders taramasındaki tohumlu kullanıcı `s=40` (R4 bandı) olduğu için R3 görevini hiç üretmez; R3 ayrı ve sabit bir örnekle ölçülür.

## Devir notu — K3P-18 için kullanıcı kararı gerekiyor

K3P-18'e devam etmek için şu iki karardan biri gerekiyor:

1. **Bütçe yetkisi:** runtime tavanını yükselt (öneri: **128 → 132 KiB**, ~4 KB pay; bu, cloze koduna *ve* `test_k3p_cloze.js` fixture'ına yeter) — ya da tavan sabit kalsın ve K3P-18 kapsamdan düşsün.
2. **R4 düşüş sözleşmesi:** doğrulanmış örneği olmayan lemma R4'ten **R3'e** mi düşsün (kartın metni) yoksa bugünkü gibi **R2'ye** mi (mevcut testlerin sabitlediği)? R3 isteniyorsa `test_k3p_ladder.js` ve `test_k3p_build.js`'in kabul edilmiş beklentisi bu kart kapsamında bilinçli olarak güncellenmeli — bu açık kullanıcı onayı ister (§5).

Bunlar çözülene kadar K3P-18 başlatılmamalı. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
