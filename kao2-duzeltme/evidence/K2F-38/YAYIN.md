# K2F-38 — Yayın kaydı (kullanıcı isteği "önce bu düzeltmeyi canlıya", 2026-10-06)
- Yayın 1: S0 örnek kelime satırı düzeltmesi + denetim fixture'ı. `main` ff-only 1998f25..a70d9c1, pin 20261006b, Pages run 37479346437 success. Tam kapilar.sh koşulmadı (LEDGER seq 110).
- Yayın 2: NavBar geri etiketi (tüm yüzey taraması bulgusu), pin 20261006c — `app/kao.css`; `main` ff-only a70d9c1..1e93f59, Pages run **37480226060**: validate + deploy success.
- Canlı bayt eşitliği: bu konteynerin egress'i github.io'yu engelliyor → kullanıcı terminalinde doğrulanmalı. DOĞRULANMADI.
- Kanıt düzeyi: kaynak/test ✓ · yerel görsel (390/320/koyu) ✓ · yayın run success ✓ · cihaz — (kullanıcıda)
- Yayın 3 (kullanıcı: "tüm eksikleri tamamla ve canlıya al", 2026-10-06): ana uygulama alt çubuk "İlham" etiketi, İlham&İbadet alt sekmesi "Arapça" kırılması (≤340 px), Raşit kartları alt yazısı, panel-v2 ≤360 px üst çubuk + alt çubuk. Pin 20261006c (render.js, styles.css, panel-v2.css). Tarama/kapı ayrıntısı LEDGER seq 114. Run numarası LEDGER seq 115.
