# D3F-06 — F-06: inceleme sayfaları `[x]` işaretini kimin koyduğunu söylüyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-06

## Kök neden
`tools/kao2-curriculum-build.mjs` iki inceleme sayfasını (`INCELEME-KAO2-17.md` ve `INCELEME-KAO2-18.md`) metin kaynağından üretiyor,
ama `review.by` alanını sayfaya hiç yazmıyordu. D2F-12'den beri 158 kaydın 158'i şu durumda:
`sourced · by: ai-delegated · delegatedBy: owner · delegatedAt: 2026-10-02` (133 metin + 25 kavram). Sayfalardaki 133 + 25 `[x]` ise
yalnız kutu olarak görünüyordu: "devir", "ai-delegated" ya da "yapay zekâ" ifadesi geçmiyordu.
Üstelik INCELEME-17'nin "Yeniden onay gerekli" bölümü, kutu durumuna bakmadan `draft` olmayan her metni "açık kutu onayı olmayan"
diye sayıyordu. Bu, aynı sayfadaki işaretli kutularla çelişiyordu.
Rapor yalnız INCELEME-17'yi adlandırdı. INCELEME-18 aynı araçtan ve aynı D2F-12 kaydından geliyor; kökü ortak olduğu için
o da bu commit'te düzeltildi (kullanıcıya bildirilen varsayım).

## Yapılan
- Araç: `renderReviewAttribution` iki sayfaya da "## Onayı kim verdi" bölümünü ekliyor. Bu bölüm veriden üretilir:
  `ai-delegated` sayısı (devreden ve devir tarihine göre gruplanır), kullanıcının kendi onayı (`owner`) ve L2 uzman onayı (`expert`).
  Örneğin: "`ai-delegated`: **133** — bu metinlerdeki `[x]` L1 işaretlerini kullanıcı değil, yetki devriyle yapay zekâ koydu
  (yetkiyi devreden: `owner`, devir tarihi 2026-10-02)" · `owner` **0** · `expert` **0**.
- Kayıt başı etiket (`reviewerLabel`): ünite ve kavram bloklarında `- İnceleme:` satırına, ders ve S0 tablolarında düzey hücresinin
  backtick'i içine eklenir (örn. `sourced · ai-delegated`). Bu iki yer işaret taşımanın bağlam karşılaştırmasına girmez,
  dolayısıyla mevcut işaretler korunur: 17'de 133 `[x]` / 12 `[ ]`, 18'de 25 `[x]` / 25 `[ ]` (önce ve sonra aynı), taşıma uyarısı yok.
- "Yeniden onay gerekli" artık `review.by`'dan türüyor: görünür olup kullanıcının kendi onayını (`owner`/`expert`) taşımayan
  metinleri listeler. Çelişen "kutu onayı olmayan" dili kaldırıldı.
- Sayfalar araçla yeniden üretildi. Elle düzenleme yok, Arapça içerik değişmedi.

## TDD
- RED: `tests/kao/test_kao2_text_review.js` → yeni kontrol "D3F-06: inceleme sayfaları [x] işaretini kimin koyduğunu veriden söyler";
  eski sayfada `AssertionError: INCELEME-KAO2-17.md: "Onayı kim verdi" bölümü yok`.
- GREEN: `KAO2-17 text review: PASS (13 kontrol)` · `KAO2 review-apply: PASS (16 kontrol)` · `l2-paket-build --check` PASS.
- Mutasyon (depoda, yeniden üretilebilir): `bash kao2-duzeltme/denetim-3/evidence/D3F-06/inceleme-mutasyon.sh` → `7/7 PASS`.
  Senaryolar: M0 düzeltilmiş araç yeşil ve uyarısız · M1 INCELEME-17 bölümü yok · M2 INCELEME-18 bölümü yok · M3 kayıt başı etiket yok ·
  M4 "yapay zekâ" ifadesi yok · M5 eski çelişen dil · M6 veri türetimi (u1 `owner` yapılınca sayfa owner 1 / devir 132 der, u1 listeden düşer).
  Her kırmızının nedeni çıktı metniyle eşleştirildi. İlk koşuda M2 sözdizimi hatasıyla, yani yanlış nedenle kırmızıydı; betik bunu
  yakaladı ve mutasyon parantez dengeli olacak şekilde düzeltildi.

## Bayt eşitliği ve çalışma zamanı
- `node tools/kao2-curriculum-build.mjs --out-dir <boş>` ile depo karşılaştırıldı; iki sayfa, `quranCurriculumV2.js` ve
  `quranConceptTextsV1.js` bayt-eşit.
- Çalışma zamanı dosyası değişmedi (`app/`, `index.html`, `sw.js`, `panel-v2.html`) → pin yükseltilmedi (20261008a kalır).

## Bilerek değişen testler
`test_kao2_text_review.js`: yeni kontrol eklendi; mevcut kontroller değişmedi.

## Kanıt düzeyleri
kaynak/test ✓ · yayın: YAYIN-5 kaydında · canlı: YAYIN-5 kaydında · cihaz — (belge değişikliği; cihaz yüzeyi yok)

## Dürüstlük notu
Bu düzeltme işaretlerin anlamını değiştirmez. 158 kaydın hiçbiri kullanıcının kendi kutu onayı ya da L2 uzman onayı değildir;
sayfalar artık bunu açıkça söylüyor.
