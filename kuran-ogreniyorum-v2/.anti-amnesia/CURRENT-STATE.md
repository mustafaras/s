# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-16
lastSeq: 62
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq62

## Şu an neredeyiz
**KAO2-00…15 tamamlandı (16/28).** KAO2-15 (S-10 gramer notları kütüphanesi) kullanıcı
onayıyla kapandı: 12 ünite grubunda 25 kavram, kavram sayfası (düz Türkçe önce,
katlanır terim, içerik modülünden gelen tablo ve okunuşlar, gerçek ders bağlantıları),
Bugün → Keşfet satırı ve Ünite ekranındaki Kavramlar satırları dokunulabilir. Engel
(router beyaz listesi) kullanıcının kapsam onayıyla `quranLearnFlow.js` `VIEWS`
listesine `grammar` eklenerek çözüldü (FIX · seq 61). Kullanıcı 2026-09-29'da
KAO2-14/15'in yayınlanmasına da açık onay verdi.

## Sıradaki kartın tek cümlesi
Sıradaki **KAO2-16**, Fâtiha taşının gerçek Fâtiha lemmalarına bağlanması, ünite
taşlarının (`u1…u12`) eklenmesi ve mevcut kullanıcı verisinin kayıpsız geçişidir;
bu oturumda başlanmadı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`. Yerel kapanış commit'i KAO2-15 ile atıldı; `origin`
  yalnız KAO2-13 (`c1ebe168`) seviyesindeydi, yayın sonrası eşitlenecek.
- `KAO2-STATE.json`: program `active`; KAO2-15 `done`; `nextCard=KAO2-16`;
  `ledgerLastSeq=62`.
- `releaseApproval=approved_through_KAO2-15` (kullanıcı beyanı 2026-09-29): yerel
  commit, dal push, `main`'e fast-forward, GitHub Pages yayını ve canlı doğrulama.
- G0 kapalı, G1 sunulmuş, G2 kapalı; G3/G4 açık.
- KAO2-15 kaynak değişiklikleri: `app/core/quranLearn.js`,
  `app/core/quranLearnViews.js`, `app/core/quranLearnFlow.js` (yalnız `VIEWS` +
  onaylı FIX), `app/kao.css`, yeni `tests/kao/test_kao2_grammar_notes.js` ve P2.4
  kaydı `tests/kao/test_kao2_today.js`. Yeni `App.kao*` handler'ı **yok**: App
  yüzeyi ve fx2/v3/surface pinleri değişmedi.
- Bütçe: içerik 168.483 KiB · runtime 78.316 KiB (<=80) · CSS 10.421 KiB (<=14) ·
  yalıtılmış p95 4.743 ms — hepsi sınır içinde.
- Kaynak/test: PASS · yayın: onaylandı, canlı doğrulama kaydı ayrı · cihaz: doğrulanmadı.

## Açık riskler ve bekleyen kullanıcı işleri
- **Cihaz kabulü** doğrulanmadı; headless test kullanıcı cihaz doğrulamasının yerine
  geçmez. 320 px/%200 metin koşulu kaynak fikstürüyle denetlendi, tarayıcıda açılmadı.
- G3/G4 kapıları açık; sonraki kartlarda kendi karar/inceleme koşulları geçerli.
- **Yayın sınırı:** izin KAO2-15'e kadardır. KAO2-16 ve sonrası için yeni açık
  kullanıcı talimatı gerekir.
- Router beyaz listesi (`quranLearnFlow.js` `VIEWS`) motorun `KAO_VIEW_TITLES`
  tablosundan ayrı yaşar; yeni görünüm ekleyen kartlar üç yeri birlikte güncellemeli.
