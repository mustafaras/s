# IIP-22 scope gate

Yalnız `sw.js`, `index.html` ve yeni sentetik `tests/app/test_iip_22.js` değiştirildi. İzinli fakat değiştirilmeyen `tests/app/test_saygi_boundary.js` regresyon kapısı olarak çalıştırıldı. Veri, sync, migration, panel, App handler, içerik kaynağı ve runtime state yüzeylerine dokunulmadı. Commit, push, deploy, tarayıcı, gerçek localStorage, token ve kişisel veri kullanılmadı.
