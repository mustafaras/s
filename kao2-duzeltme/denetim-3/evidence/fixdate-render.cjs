// Denetim-3: YALNIZ test_kao_render.js sürecinde argümansız Date'i öğlene sabitler; diğer süreçler gerçek saat.
if (/test_kao_render\.js$/.test(process.argv[1] || '')) require(__dirname + '/fixdate.cjs');
