# K2F-11 — Erken yayın kanıtı (kullanıcı isteği)
- Kapsam: K2F-11 (gramer görevleri doğrulanmış örnekten ve kavram tablosundan kurulur; ardışık aynı tür engeli: `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`) + yayın pini `20261001d` · Kullanıcı isteği: "canlıya al"
- Commit: `247c7392` · Dal: `main` (ff-only, `46a8b894..247c7392`) · force yok
- Pages run: **36858234640** · conclusion **success** (`.github/workflows/pages.yml`)
- Pin: `20261001c` → **`20261001d`** (index.html ×15, sw.js ×16, SW_VERSION, SW_OFFLINE_VERSION `iip22-20261001d`)
- Bayt eşitliği (canlı SHA-256 = yerel): `quranGrammarV1.js` · `quranLearn.js` · `quranLearnFlow.js` · `quranLearnViews.js` · `kao.css` · `sw.js` · `index.html` → **7/7 MATCH**
- Canlı işaretler: `index.html` → `quranLearn.js?v=20261001d` · `sw.js` → `SW_VERSION = '20261001d'`
- Gizlilik (404): `kao2-duzeltme/FIX-STATE.json` · `tools/kao-content-freeze.mjs` · `tests/kao/test_kao2_grammar_tasks.js` · `archive/kuran-ogreniyorum-v2/KAO2-STATE.json` · `docs/kuran-ogreniyorum/content/grammar.verified.json` · `docs/…/inceleme/GRAMER-SABLON-L2.md`
- Etki: gramer görevleri doğrulanmış örnekten/tablodan kurulur (71/86 şablon), Çekim tablosu geri geldi, Kelime dizme ipucu + öğretici geri bildirimle; aynı gramer türü ardışık gelmez.
- Bilinen açık (canlıda sürer, K2F-12…17): R-05 `App.kaoS0` · R-06 Seviye 0 çökmeleri · R-04/R-07/R-08.
- Kanıt düzeyi: kaynak/test **PASS** · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda)
- Not: `main` bu kanıt commit'inin gerisinde kalır (yalnız `kao2-duzeltme/` belgeleri; Pages'e dahil değil).

## Ek yayın — ek tur (seq 37–39) · kullanıcı isteği: "canlıya al"
- Kapsam: kavram sayfasında doğrulanmış âyet örnekleri + notlar, 83/86 gramer şablonu, dizme ipucu soldurma (`quranLearn.js`, `quranLearnViews.js`, `kao.css`) + pin `20261001e`
- Commit: `3d97c338` · `main` ff-only `247c7392..3d97c338` · force yok · Pages run **36870144118** success
- Pin: `20261001d` → **`20261001e`** (index.html ×15, sw.js ×16)
- Bayt eşitliği: 7/7 MATCH (`quranGrammarV1.js` · `quranLearn.js` · `quranLearnFlow.js` · `quranLearnViews.js` · `kao.css` · `sw.js` · `index.html`) · gizlilik: `FIX-STATE.json`, `tekrar-uret.cjs`, gramer testi, `kao-content-freeze.mjs`, `KAO2-STATE.json`, `grammar.verified.json`, `GRAMER-SABLON-L2.md` → 404 · `SW_VERSION='20261001e'`
- Kanıt düzeyi: kaynak/test PASS · yayın doğrulandı · cihaz doğrulanmadı (kullanıcıda)
