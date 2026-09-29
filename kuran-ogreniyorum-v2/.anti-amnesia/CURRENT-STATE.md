# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-15
lastSeq: 59
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq59

## Şu an neredeyiz
KAO2-00…14 tamamlandı. KAO2-14, ders sonunda öğrenilen kelimeleri, yarınki tekrar planını ve sıradaki adımı S-07 özetinde gösterir. Tam P3 kapıları PASS; kanıt `evidence/KAO2-14/KANIT.md`. Bu kartın kaynak değişiklikleri yerel tek commit ile kapanacak; push/merge/deploy kapsamı yoktur.

## Sıradaki kartın tek cümlesi
Sıradaki KAO2-15, 25 gramer kavramı için aranabilir ve yeni başlayanlara uygun S-10 Gramer notları kütüphanesidir; bu oturumda başlanmadı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; kart başlangıcında HEAD `c1ebe168dfc4d79cfe6dfa446528c6b60603cdf1` idi ve `origin/main` ile `origin/kao2-yeniden-tasarim` aynı commit'teydi.
- `KAO2-STATE.json`: program `active`; KAO2-14 `done`; `nextCard=KAO2-15`; `ledgerLastSeq=59`.
- `releaseApproval=approved_through_KAO2-13`; bu kart için push, main'e fast-forward, tag veya Pages deploy yetkisi yoktur. Cihaz kabulü doğrulanmadı.
- G0 kapalı, G1 sunulmuş, G2 kapalı; G3/G4 açık.
- KAO2-14 yalnız `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, yeni `tests/kao/test_kao2_summary.js` ve P4 durum/kanıt kayıtlarını değiştirdi. `app/kao.css`, İlham & İbadet dosyaları ve cache pinleri değişmedi.
- KAO özeti 06 tokenlı mevcut modal bileşenlerini kullanır; İlham & İbadet Arapça sekmesi ayrı keşif/giriş yüzeyidir. Ekran 320 px/%200 metin koşulunda tarayıcıda açılmadı; kaynak fikstürü daralabilir grid, token kullanımı, odak ve 44 px ikincil hedef kurallarını denetledi.
- Kaynak/test: PASS · yayın: yapılmadı · cihaz: doğrulanmadı.

## Açık riskler ve bekleyen kullanıcı işleri
- Gerçek cihaz kabulü doğrulanmadı; kullanıcı cihazı doğrulamasının yerine headless test geçmez.
- G3/G4 kapıları açık kalıyor ve sonraki kartlarda kendi karar/inceleme koşulları geçerli.
- Yeni bir yayın için açık kullanıcı talimatı gerekir; mevcut release approval yalnız KAO2-13'e kadar.
