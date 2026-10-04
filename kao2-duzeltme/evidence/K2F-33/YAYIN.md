# K2F-33 — Yayın kanıtı (kullanıcı isteği, 2026-10-04)
- Onay: kullanıcı "canlıya al ve yeni oturum için starter yaz" (2026-10-04).
- Kapsam: K2F-33 (kelime detayı ders bağlantısı) + görsel QA düzeltmeleri (opak/yapışık başlık çubuğu, tanımlı --f-N jetonları, › / ikon / satır hizaları, sarılan Niyet segmenti, tekrarlanan başlık, kök arama yer tutucusu). Pin `20261004a` → **`20261004b`** (index.html ×15, sw.js ×16, 8 pin taşıyan test + test_kao2_curriculum).
- Commit: `2715ad50` · `main` ff-only `ab41e056..2715ad50` · force yok · Pages run **37202523139** success
- Bayt eşitliği: 9/9 MATCH (index.html · sw.js · app/kao.css · quranLearn.js · quranLearnFlow.js · quranLearnViews.js · quranCurriculumV2.js · app.js · constants.js) · `SW_VERSION='20261004b'` · canlıda `kaoWordLessonRowHTML` ve `--f-3:16px` var
- Gizlilik 404: `kao2-duzeltme/FIX-STATE.json`, `docs/GELISTIRME-PLANI.md`
- Kapılar: pin commit öncesi `kapilar.sh` YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9) · tekrar-uret 10/10 · css 13,661 KiB
- Not: push / `gh` / `curl` sandbox dışında çalıştı. Depoya sentetik veriyle alınmış ekran görüntüleri (evidence/K2F-32/ekran, K2F-33/ekran) ve tools/gorsel-qa/ de girdi.
- Kanıt düzeyi: kaynak/test ✓ · yerel görsel ✓ · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda) · uzman L2 —
