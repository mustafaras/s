# K2F-32 — Yayın kanıtı (kullanıcı isteği, 2026-10-04)
- Onay: kullanıcı "tam ve kusursuz uygulandığından emin ol ve canlıya al" (2026-10-04).
- Kapsam: K2F-27…32 (tek başlık çubuğu, ders oynatıcı ✕, gruplu Ayarlar + Öğrenme grubu, süre ölçümü/tahmini, İlerleme başlığı + katlanan kalibrasyon). Pin `20261003d` → **`20261004a`** (index.html ×15, sw.js ×16, 8 pin taşıyan test).
- Commit: `ab41e056` · `main` ff-only `dc3f3f06..ab41e056` · force yok · Pages run **37197809774** success
- Bayt eşitliği: 8/8 MATCH (index.html · sw.js · app/kao.css · quranLearn.js · quranLearnFlow.js · quranLearnViews.js · quranCurriculumV2.js · app.js) · `SW_VERSION='20261004a'` · canlı quranLearn.js'te İlerleme başlığı var
- Gizlilik 404: `kao2-duzeltme/FIX-STATE.json`, `docs/GELISTIRME-PLANI.md`
- Kapılar: pin commit öncesi `kapilar.sh` YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9) · tekrar-uret 10/10
- Not: push/`gh`/`curl` sandbox dışında çalıştı.
- Kanıt düzeyi: kaynak/test ✓ · yayın **doğrulandı** · cihaz **doğrulanmadı** (kullanıcıda: K2F-26…32 görsel/odak/dakika metinleri) · uzman L2 —
