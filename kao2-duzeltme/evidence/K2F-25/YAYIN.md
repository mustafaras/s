# K2F-25 — Yayın kanıtı (kullanıcı isteği, 2026-10-03)
- Onay: kullanıcı "canlıya al ve sıradakine geç" (2026-10-03), K2F-25 sonrası.
- Kapsam: K2F-25 (tanış kartı örnek âyet + "Neden böyle?"). Yayınlanan varlık değişimleri: `app/core/quranLearn.js` · `app/core/quranLearnViews.js` · `app/kao.css` (+ `index.html`, `sw.js` pin). Pin `20261003b` → **`20261003c`** (index.html ×15, sw.js ×16, 8 pin taşıyan app testi + test_kao2_curriculum).
- Commit: `8cde3903` · `main` ff-only `9adac908..8cde3903` · force yok · Pages run **37117992353** success
- Bayt eşitliği: 10/10 MATCH (index.html · sw.js · kao.css · quranLearn.js · quranLearnFlow.js · quranLearnViews.js · quranCurriculumV2.js · quranConceptTextsV1.js · quranGrammarV1.js · app.js) · `SW_VERSION='20261003c'` · canlı Views'te "Neden böyle?" var
- Gizlilik 404: `kao2-duzeltme/FIX-STATE.json`, `kao2-duzeltme/evidence/K2F-25/KANIT.md`, `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `docs/GELISTIRME-PLANI.md`, `tests/kao/test_kao2_s0.js`
- Kapılar: pin commit öncesi `kapilar.sh` YEŞİL · tekrar-uret 10/10
- İçerik notu: dinî bağlamlı metin onayları yapay zekâ incelemesidir; gerçek L2 uzman onayı yoktur (GATE seq 71 waiting).
- Kanıt düzeyi: kaynak/test ✓ · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda) · uzman L2 —
- Not: push/`gh`/`curl` sandbox dışında çalıştı; `main` bu kanıt commit'inin gerisinde kalır (yalnız `kao2-duzeltme/` belgeleri; Pages'e dahil değil).
