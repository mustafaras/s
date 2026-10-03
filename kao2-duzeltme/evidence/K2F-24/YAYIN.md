# K2F-24 — Yayın kanıtı (kullanıcı isteği, 2026-10-03)
- Onay: kullanıcı "canlıya alalım" (2026-10-03), K2F-24 + ek turlar sonrası.
- Kapsam: K2F-24 (namaz eşlemesi, Ünite 2 çapası) + ek tur 1–2. Yayınlanan varlık değişimleri: `app/core/quranLearnFlow.js` · `app/content/quranCurriculumV2.js` (+ `index.html`, `sw.js` pin). Pin `20261003a` → **`20261003b`** (index.html ×15, sw.js ×16, 8 pin taşıyan app testi + test_kao2_curriculum).
- Commit: `9adac908` · `main` ff-only `b25ee012..9adac908` · force yok · Pages run **37116493085** success
- Bayt eşitliği: 10/10 MATCH (index.html · sw.js · kao.css · quranLearn.js · quranLearnFlow.js · quranLearnViews.js · quranCurriculumV2.js · quranConceptTextsV1.js · quranGrammarV1.js · app.js) · `SW_VERSION='20261003b'` · canlı Flow'da `mappedLemmaId` var
- Gizlilik 404: `kao2-duzeltme/FIX-STATE.json`, `docs/kuran-ogreniyorum/kao2/content/texts.tr.json`, `docs/GELISTIRME-PLANI.md`, `tests/kao/test_kao2_s0.js`
- Kapılar: pin commit öncesi `kapilar.sh` YEŞİL (kao 52 · app 77 · panel 23 · panel-v2 27 · quran 9) · tekrar-uret 10/10
- Yayına giren içerik notu: dinî bağlamlı metinlerin onayları yapay zekâ incelemesidir; **gerçek L2 uzman onayı yoktur** (GATE seq 71 waiting). Namaz eşlemesi muhafazakârdır (19/32 kelime).
- Kanıt düzeyi: kaynak/test ✓ · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda) · uzman L2 —
- Not: push/`gh`/`curl` sandbox dışında çalıştı; `main` bu kanıt commit'inin gerisinde kalır (yalnız `kao2-duzeltme/` belgeleri; Pages'e dahil değil).
