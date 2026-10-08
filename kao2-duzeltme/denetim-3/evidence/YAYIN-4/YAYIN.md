# YAYIN-4 — denetim-3 düzeltmeleri D3F-00…D3F-05 canlıya

- **Onay (kullanıcı, birebir, 2026-10-08):** "önce buraya kadar olan kısımları canlıya al son ra yeni adım için starter yaz"
  — açık kullanıcı talimatı; devir ya da çıkarım değil.
- **Kapsam:** `128ab06d..HEAD` — 8 commit (D3F-00 ×2, D3F-01, D3F-02 ×2, D3F-03, D3F-04, D3F-05) + bu kayıt commit'i.
- **Pin:** `20261007b` → `20261008a` (D3F-01'de yükseltildi; index.html, sw.js `SW_VERSION`/`SW_OFFLINE_VERSION`, panel-v2.html, 12 pin testi).
- **Yayına çıkan çalışma zamanı farkı** (Pages rsync dışlamalarından sonra): `app/core/quranLearn.js`, `app/content/quranGrammarV1.js`
  (F-01: g21-k1 aynı kökten üç kelime) + pin dosyaları `index.html`, `sw.js`, `panel-v2.html`. Testler, araçlar, kayıtlar yayına çıkmaz
  (`kao2-duzeltme`, `tests`, `tools`, `docs`, `*.md` dışlanır).
- **Yöntem:** `main` → `origin/main` fast-forward (`--ff-only` doğrulandı; force yok). `mustafaras/seyma-data`'ya dokunulmaz.
- **Yayın öncesi kapı:** izole klonda `KAO2_ACCEPT_SLOW_HOST=1 kapilar.sh` → `kapilar-yayin-oncesi.txt`.
  Bayraksız koşu bu makinede göreli p95 bandı yüzünden oynak (D3F-STATE `openDecisions.perf-goreli-bant`, kullanıcı kararı bekliyor).
- **Yayın sonrası:** Pages run ve canlı bayt eşitliği → `CANLI.md`.
- **Geri alma:** yayın commit'lerini `git revert` + yeni pin (geçmiş yeniden yazılmaz).
- **Kanıt düzeyleri:** kaynak/test ✓ · yayın (push + run) → CANLI.md · canlı bayt eşitliği → CANLI.md · cihaz — (kullanıcıda).
