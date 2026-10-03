# K2F-23 — Erken yayın kanıtı (kullanıcı isteği, 2026-10-03)
- Onay: kullanıcı "yayına alalım ve 23 ün kusursuz oldugundan emin olalım" (2026-10-03).
- Kapsam: K2F-19…23 + ek turlar. Yayınlanan varlık değişimleri: `app/core/quranLearn.js` · `quranLearnFlow.js` · `quranLearnViews.js` · `app/kao.css` · `app/content/quranCurriculumV2.js` · `quranConceptTextsV1.js` (+ `index.html`, `sw.js` pin). Pin `20261001g` → **`20261003a`** (index.html ×15, sw.js ×16, 8 pin taşıyan test + 1 kao testi).
- Commit: `b25ee012` · `main` ff-only `19f0bfd6..b25ee012` · force yok · Pages run **37113366008** success
- Bayt eşitliği: 10/10 MATCH (index.html · sw.js · kao.css · quranLearn.js · quranLearnFlow.js · quranLearnViews.js · quranCurriculumV2.js · quranConceptTextsV1.js · quranGrammarV1.js · app.js) · `SW_VERSION='20261003a'` · canlı Flow'da `applySentences` var
- Gizlilik 404: `kao2-duzeltme/FIX-STATE.json`, `archive/kuran-ogreniyorum-v2/README.md`, `docs/GELISTIRME-PLANI.md`, `tests/kao/test_kao2_s0.js`, `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`
- Kapılar: pin commit öncesi `kapilar.sh` YEŞİL · tekrar-uret 10/10
- Yayına giren içerik notu: 122 metin kullanıcı devriyle yapay zekâ incelemesinden geçti (gerçek L2 uzman onayı DEĞİL; bkz. LEDGER seq 65).
- Kanıt düzeyi: kaynak/test ✓ · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda)
- Not: push/`gh`/`curl` sandbox dışında çalıştı; `main` bu kanıt commit'inin gerisinde kalır (yalnız `kao2-duzeltme/` belgeleri; Pages'e dahil değil).
