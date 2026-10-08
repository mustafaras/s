# D3F-12 — F-12: ünitelerin "Neden önemli" metninin ayrı (draft) onayı artık sayfada ve kayıtlarda yazıyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-12

## Ölçüm (kök neden)
- `texts.tr.json`: 12 ünitenin her birinde `review` = `sourced · ai-delegated`, ama `review.whyReview` = `{level: "draft", l0: "pass", at: "2026-09-30"}` (12/12).
  Ünite kutusundaki L1 işareti `review`'a uygulanır; `why` metnini kapsamaz. Yani "Neden önemli" metinleri onaysızdır.
- `tools/kao2-curriculum-build.mjs` `why`'ı modüle yazar (`why: unitText.why`). `app/core/quranLearn*.js`, `render.js` ve panel dosyalarında ünite `why`'ını
  okuyan görünüm yok (`grep \.why` → yalnız ders tanıtım kartının `model.why`'ı, başka bir alan). **Kullanıcı etkisi yok.**
- Dürüstlük boşluğu:
  - INCELEME-KAO2-17, her ünitede "Neden önemli" metnini "İnceleme: `sourced`" satırı ve işaretli L1 kutusuyla gösteriyordu; metnin draft olduğunu söylemiyordu.
  - denetim-2 CURRENT-STATE "158 kayıt · draft 0" satırı bu alt düzeyi anmıyordu.
  - Sayı kendi kapsamında (133 metin + 25 kavram) doğru.

## Yapılan
- **Araç** (`renderTextReview`, veriden):
  - Durum bölümüne şu satır eklendi: `- Ünite "Neden önemli" (why) metni, ayrı onay: 12 metin · draft 12 · sourced 0 · expert 0 — ünite kutusundaki L1 işareti bu metni kapsamaz; draft olan onaysızdır.`
  - Her ünitenin `- İnceleme:` satırına `· neden önemli: \`draft\`` eklendi. Bu satır işaret taşımanın bağlam karşılaştırmasına girmez; işaretler korundu (133 / 25), taşıma uyarısı yok.
  - Yeni `whyLevel()`: kayıt yoksa draft sayılır.
- **Kayıtlar:**
  - denetim-2 LEDGER **seq 27 NOTE · D2F-12** (geçmiş satırlar değişmedi) · `D2F-STATE.ledgerLastSeq` 26 → 27.
  - CURRENT-STATE senkron bloğu, "Son güncelleme" ve "Metin durumu" satırına why notu.
  - CLAUDE.md + AGENTS.md KAO2 satırı: "ünitelerin 'Neden önemli' (why) metinleri ayrı onaylıdır ve 12/12 draft, D3F-12". İki dosya aynı.
- **Yapılmayan (bilerek):**
  - `why` metinleri onaylanmadı. Onay kullanıcının ya da yetki devrinin kararıdır.
  - `why` modülden çıkarılmadı. Ders metinlerinde de draft metin modülde durur ve görünümde gizlenir; aynı ilke burada da geçerli, okuyan görünüm de yok.
  - `MUFREDAT-ESLEME.md`'nin "Tüm başlık ve vaatler onaylıdır" satırı `why`'ı kapsamadığı ve göstermediği için doğru; değiştirilmedi.
- Çalışma zamanı değişmedi (`quranCurriculumV2.js` bayt-eş) → **pin yok**.

## TDD
- RED (`test_kao2_text_review.js` yeni kontrol "D3F-12: … why metninin ayrı onay durumunu veriden söyler"): `Durum bölümü ünite why metninin onay durumunu saymıyor`.
- GREEN: text_review 15/15 · review_apply 18/18 · iki üretim bayt-eş (INCELEME-17/18, quranCurriculumV2, quranConceptTextsV1) · `d2f-sync-check --strict` PASS (seq 27) · pages-kayit 4/4.
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-12/why-mutasyon.sh` → **5/5 PASS** (M0 yeşil · M1 Durum'da why sayımı yok → kırmızı ·
  M2 İnceleme satırında why düzeyi yok → kırmızı · M3 Ünite 1 why `sourced` yapılınca sayfa veriyi izler: test yeşil, sayım "draft 11 · sourced 1").

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (kod/pin yok; sonraki yayınla belge olarak gider, Pages'e çıkmaz) · cihaz —
