# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-14
lastSeq: 56
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq56

## Şu an neredeyiz
KAO2-00…13 tamamlandı. KAO2-13, yedi seviyeli Yol ve gerçek müfredat/ilerlemeden türetilen Ünite ekranını kapattı. Seq54 P6 eski fikstür engeli, kullanıcının yalnız test bölüm (b) kapsamını onaylamasıyla seq55 FIX kaydında çözüldü; yeni Yol → Ünite → ilk ders akışı ve kelime listesi doğrulanıyor. Tam P3 aile kapıları ve `kao2-sync-check` PASS; kanıt `evidence/KAO2-13/KANIT.md`.

## Sıradaki kartın tek cümlesi
Sıradaki KAO2-14, oturum sonunda öğrenilenleri ve yarınki tekrarları özetleyen S-07 ekranıdır; bu oturumda başlanmadı.

## Canlı gerçekler
- Dal: `kao2-yeniden-tasarim`; kapanış öncesi HEAD `31b63d600e1a840a7eff3734d3ab9080e492ab29`; bu kaydı taşıyan kapanış commit'i `HEAD+1`.
- `KAO2-STATE.json`: program `active`; KAO2-13 `done`; `nextCard=KAO2-14`; `ledgerLastSeq=56`.
- `releaseApproval=approved_through_KAO2-12`; push, merge, tag ve deploy yok. Cihaz kabulü doğrulanmadı.
- G0 kapalı, G1 sunulmuş, G2 kapalı; G3/G4 açık.
- `kaoUnitSlices()` KAO2-16 taş geçişine kadar korunuyor. IIP Arapça keşif sekmesi KAO modalından ayrı; `saygi.js`, `app/styles.css`, yayındaki sekme dosyaları ve sürüm pinleri bu kartta değişmedi.
- KAO2-13 test kapsamı: yalnız `tests/kao/test_kao_user_tasks.js` bölüm (b) ve bu senaryonun özet metriği (seq55 onayı).

## Açık riskler ve bekleyen kullanıcı işleri
- Yayın ve gerçek cihaz kabulü bu kartın kanıtı değildir; yeni yayın için ayrıca açık kullanıcı talimatı gerekir.
- G3/G4 kapıları açık kalıyor ve sonraki kartlarda kendi karar/inceleme koşulları geçerli.
