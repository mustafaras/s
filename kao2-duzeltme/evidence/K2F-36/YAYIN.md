# K2F-36 — Yayın kaydı (kullanıcı isteği, 2026-10-05)
- Onay: kullanıcı "canlıya al push commit merge deploy" (2026-10-05).
- Kapsam: yalnız test ve kanıt (test_kao2_kabul.js + kao2-duzeltme/). Yayınlanan varlıklar (index.html, sw.js, app/, app.js, sync.js) `5a1aea85` ile BAYT AYNI (`git diff --quiet 5a1aea85 HEAD -- index.html sw.js app app.js sync.js` → boş). Bu yüzden pin DEĞİŞMEDİ: `20261005a`.
- `main` ff-only `a88d7066..7cecaaad` · force yok · Pages run **37343918991**: validate success, deploy success (Stage runtime-only site, Guard runtime assets present, Upload artifact, Deploy to GitHub Pages).
- Canlı bayt eşitliği: varlıklar değişmediği için K2F-35'te kullanıcı terminalinde doğrulanan 9/9 özet geçerlidir (YAYIN.md K2F-35). İsterseniz aynı komut yeniden koşulabilir.
- Kanıt düzeyi: kaynak/test ✓ · yayın: run success ✓ · cihaz — (kullanıcıda)
