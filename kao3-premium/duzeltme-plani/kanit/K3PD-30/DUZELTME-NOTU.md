# K3PD-30 düzeltme notu (2026-10-29)

Ölçüm HEAD `746ecdd2` (= origin/main). Eski kayıtlar silinmedi; bu not onları **geriye dönük PASS'e çevirmez**, yalnız bayat sayıları güncel ölçüyle ayırır. Ayrıntılı matris: [K3P-37-YENIDEN-DENETIM.md](K3P-37-YENIDEN-DENETIM.md).

## 1. Kart sayısı: 36 → 37
Eski K3P kayıt başlığındaki "36" bayattır; `K3P-STATE.json` içinde gerçek kart sayısı **37** (K3P-00…K3P-27, tekil). Eski state tarihsel kapanıştır ve değiştirilmedi.

## 2. Boyutlar (L6/L9 ayrı)
`app/core/quranLearn*.js` (3 dosya, dosya başına gzip toplamı) ve `app/kao.css`:

| Ölçü | L6 | L9 (perf testinin yöntemi) |
| --- | --- | --- |
| Runtime | 141 461 B / 138,146 KiB | 141 049 B / **137,743 KiB** |
| CSS | 16 557 B | 16 336 B / **15,953 KiB** |

İçerik gzip (perf testi): 184,591 KiB (≤256 KiB tavan). `test_kao2_perf_budget` p95 4,888 ms, steady 2,832 ms. Eski L6/L9 etiketi karışıktı: perf testi **L9** ile ölçer; L6 sayısı bu yüzden daha büyüktür.

**Tavan zinciri (düzeltildi):** Runtime tavanı kullanıcı onaylarıyla kademeli yükseltildi ve kaynağı `tests/kao/test_kao2_perf_budget.js` başlık yorumundadır: 128 → 136 (K3P-18) → 137 (K3PD-11) → 137,25 (K3PD-13) → 137,5 (K3PD-16) → 137,625 (K3PD-17) → **137,75 KiB (K3PD-22, 2026-10-23)**. Yani geçerli onaylı tavan 137,75 KiB'dir; PROMPTLAR/DURUM'daki "136 KiB" karar metni geride kalmıştır ve bu notla tarihsel kabul edilir (karar metni ayrıca güncellenmedi; güncelleme K3PD-31 final kaydında yapılmalıdır). Güncel 137,743 KiB tavanın **7 bayt** altındadır (141 056 − 141 049); yeni runtime kodu bu payı aşar, tavan onaysız artırılmamalıdır.

**CSS payı:** 16 384 − 16 336 = **48 B** (L9; tavan 16 KiB). **Font:** `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2` 25 060 B (24,47 KiB), tavan 150 KiB.

`K3P-STATE.json` `targets.runtimeKiBMax=128` eski kayıtta bayat kalır (128 → 136 kararı K3PD planında; test tavanı 137,75).

## 3. Kalıcı alan
`daily.calib.s21={n, ok}` kalıcı alanı mevcuttur; eski "şema değişmedi" ifadesi yanlıştır (K3PD-02 kararı A: alan korunur, yeni alan/migration yok, yalnız kesim sonrası kohort ölçülür).

## 4. Görsel kanıt
Eski sentetik çekimler yanlış tema/token sorgusu nedeniyle geçersiz işaretlidir. Güncel kanıt K3PD-29 v11 (7 koşum, 546 satır) ve kullanıcı görsel kabulüdür; bağımsız denetim PARTIAL idi, kart `ACCEPTED_DEVIATION` ile kapandı.

## 5. Yayın makbuzu (zincir dışı, kullanıcı talimatlı)
2026-10-29'da kullanıcı açıkça commit/push/merge/deploy istedi. Resmî K3PD-31/32/33 zinciri izlenmedi:
- Yayın adayı `746ecdd256b26129c587104050b5e9cb716150c2`, pin `20261029a` (yalnız `index.html`, `sw.js`, `app/kao.css` font URL'i, `tests/app/test_iip_22.js`).
- `origin/main` = bu SHA; Pages run **40863074376** "Deploy static content to Pages": completed/success (GitHub API okuması).
- Canlı parity: 6 dosya (`index.html`, `sw.js`, `app/kao.css`, `quranLearn.js`, `quranLearnViews.js`, `quranLearnFlow.js`) SHA-256 yerelle eşit; tam manifest taraması yapılmadı.
- DURUM.json `releaseApproval=NOT_APPROVED` bilerek değiştirilmedi: program zinciri onaylanmadı, bu tek seferlik kullanıcı talimatlı yayındır.
- Cihaz, ekran okuyucu, L2/230 kayıt ve öğrenme etkisi açık.
