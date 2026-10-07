# D2F-12 · L1 onay kaynağı ve u09.01 metni · KANIT

Oturum: copilot-cli:4ec68470-d2f12
Tarih: 2026-10-07 · önceki commit `3f3b28cd` · dal `main`.

## İlerleme günlüğü
1. `ORTAK-KURALLAR.md`, D2F-11 kanıtı ve seq 17 yetki devri kararı okundu; başlangıçta `nextPrompt=D2F-12`, çalışma ağacı temizdi.
2. Kararlar devirle uygulandı: `L1 kararı: B`, `u09.01: 1`. Bu kullanıcı incelemesi/onayı değil, kullanıcının açık yetki devriyle Claude kararıdır.
3. Önce üç fixture yeni sözleşmeye çevrildi ve kırmızı görüldü: araç `--by` seçeneğini tanımıyordu; 158 kayıtta `owner` vardı; u09.01 emir iddiası taşıyordu.
4. Üretici araca dar devir modu eklendi; kaynak metin düzeltildi; tüm türetilen dosyalar araçla üretildi. L2 kutuları işaretlenmedi.

## Yapılan
- `tools/kao2-curriculum-build.mjs`: `--by ai-delegated --delegated-by owner --delegated-at YYYY-AA-GG`; metadata doğrulaması; mevcut `sourced` kayıtların dürüst kaynak dönüşümü; yalnız L1 kutusunu işaretleyen araç çıktısı.
- `texts.tr.json`: 158/158 kayıt `sourced` + `by:"ai-delegated"` + `delegatedBy:"owner"` + `delegatedAt:"2026-10-02"`; `by:"owner"` 0.
- u09.01: başlık `Anmak, yemek, vermek: fiil kökleri`; hedef `Anmak, yemek, merhamet etmek, bağışlamak ve vermek fiillerini tanıyacaksın.`
- `quranCurriculumV2.js`, `MUFREDAT-ESLEME.md`, `INCELEME-KAO2-17.md` yalnız üretici araç çıktısıdır.
- `CLAUDE.md` ve `AGENTS.md` KAO2 satırları birebir aynı gerçeği yazar: L1 kullanıcı incelemesi değildir; gerçek L2 onayı yoktur.

## TDD
- Kırmızı: `test_kao2_review_apply.js` bilinmeyen `--by`; `test_kao2_text_review.js` gerçek `owner`; `test_kao2_lesson_coherence.js` eski emir başlığı nedeniyle FAIL.
- Yeşil: review-apply **16 kontrol**, text-review **12 kontrol**, lesson-coherence **9 kontrol** PASS.
- Ek regresyon: iki kutulu satırda global işaretleme ilk denemede L2'yi de `[x]` yaptı; test yakaladı. Araç yalnız ilk L1 kutusuna daraltıldı, L2 boş kaldı.

## Kapılar
- `node tests/kao/test_kao2_review_apply.js` → PASS (16).
- `node tests/kao/test_kao2_text_review.js` → PASS (12).
- `node tests/kao/test_kao2_lesson_coherence.js` → PASS (9).
- `node --check tools/kao2-curriculum-build.mjs` ve `git diff --check` → PASS.
- D2F yeniden üretimi **9/9 PASS**; önceki denetim **10/10 PASS**.

## Ölçümler
- İnceleme kaydı: toplam 158 · sourced 158 · ai-delegated 158 · delegatedBy owner 158 · delegatedAt 2026-10-02 158 · owner 0.
- Üretici iki bağımsız `/tmp` çıktısında bayt-eş; depodaki `quranCurriculumV2.js` ve `MUFREDAT-ESLEME.md` araç çıktısıyla eş.
- N-04 PASS: belgelerde “L1 onayı kullanıcıda” kalmadı; veri 158 sourced kaydı dürüst devir kaynağıyla taşır.
- Uygulama yüzeyi/pin değiştirilmedi; yayın pini `20261007a`.

## Bilerek değişen testler
- `test_kao2_review_apply.js`: devir modunu ve 158 kaydın metadata sözleşmesini kapsar; kısmi-onay sentetiği araç çıktısındaki `[x]` durumundan bağımsızlaştırıldı.
- `test_kao2_text_review.js`: `ai-delegated` yalnız eksiksiz devir metadata'sıyla geçer; gerçek 158 kayıt denetlenir.
- `test_kao2_lesson_coherence.js`: u09.01'in emir iddiası taşımadığını ve seçilen metni sabitler.

## Kanıt düzeyleri
Kaynak/test ✓ · yayın — (pin değişmedi) · cihaz — · kullanıcı onayı: **yok**; açık yetki devriyle Claude kararı (`LEDGER` seq 17), L2 uzman onayı hâlâ yok.

## Sürprizler
1. Üretici review sayfasında iki kutuyu global regex ile işaretleyince gerçek olmayan L2 onayı oluşabiliyordu; aynı oturumda testle yakalanıp L1'e daraltıldı.
2. `MUFREDAT-ESLEME.md` u09.01 başlığını taşıdığı için prompt listesindeki dar dosya sayımına ek, üretici bütünlüğü gereği araç çıktısı olarak değişti.
3. Önceden yayımlanan `3f3b28cd` yanlışlıkla D2F-12 öneki taşıyor; geçmiş yeniden yazılmadı. Bu uygulama commit'iyle oluşan iki-commit durumu kullanıcı seçimi doğrultusunda dar `strictExceptions` kaydıyla açıklanır.
