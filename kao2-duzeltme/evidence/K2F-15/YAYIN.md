# K2F-15 — Erken yayın kanıtı (kullanıcı isteği)
- Kapsam: K2F-12…15 Seviye 0 zinciri (`App.kaoS0`, harfsiz dersler + örnekler, aşamalı puanlı alıştırma, Bugün/ilk açılıştan S0, tamamlama kaydı) + görsel QA düzeltmeleri + geri bildirim satırları + NavBar + pin `20261001f` · Kullanıcı isteği: "canlıya al"
- Commit: `4fd00131` · `main` ff-only `3d97c338..4fd00131` · force yok · Pages run **36890470595** success
- Pin: `20261001e` → **`20261001f`** (index.html ×15, sw.js ×16)
- Bayt eşitliği: 9/9 MATCH (`app.js` · `quranCurriculumV2.js` · `quranGrammarV1.js` · `quranLearn.js` · `quranLearnFlow.js` · `quranLearnViews.js` · `kao.css` · `sw.js` · `index.html`) · `App.kaoS0=function` canlı `app.js`'te · gizlilik 404: `FIX-STATE.json`, `tekrar-uret.cjs`, `test_kao2_s0.js`, `kao2-curriculum-build.mjs`, `curriculum.spec.json`, `KAO2-STATE.json`, `grammar.verified.json` · `SW_VERSION='20261001f'`
- Kanıt düzeyi: kaynak/test PASS · kaynak-görsel (geçici yerel QA; cihaz kabulü değil) · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda)
- Not: `main` bu kanıt commit'inin gerisinde kalır (yalnız `kao2-duzeltme/` belgeleri; Pages'e dahil değil).
