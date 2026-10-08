# YAYIN-7 — D3F-09 ve D3F-10 canlıya (pin 20261008c)

- **Onay (kullanıcı, birebir, 2026-10-08):** program düzeyinde "başla ve tam bir push commit merge deploy istiyorum"; YAYIN-7 planı
  ("kapı yeşil biterse push, Pages ve canlı bayt kontrolü") sunulduktan sonra "beklememize gerek yok bence sıradakiyle devam edelim".
  Açık kullanıcı talimatına dayanır; ayrı "YAYIN-7 onaylı" cümlesi yoktur.
- **Kapsam:** `93785f8f..HEAD`: `2f88c0ee`, `8e558843` (D3F-09), `b828aaea`, `b6915f19` (D3F-10) ve bu kayıt commit'i.
  Çalışma ağacındaki commit'lenmemiş D3F-11 işi bu yayına **girmez**; kayıt commit'ine yalnız bu dizin ve D3F-STATE açık yolla eklendi.
- **Pin:** `20261008a` → `20261008b` (D3F-09) → **`20261008c`** (D3F-10).
- **Yayına çıkan çalışma zamanı farkı** (Pages dışlamalarından sonra): `app/content/quranCurriculumV2.js` (u09.01 inceleme tarihi),
  `index.html`, `panel-v2.html`, `sw.js` (pinler; 6 bayat URL dahil: manifest.json, state.js, zikir.js, skyFx.js, panelCoverageManifest.js, panel-v2.js).
- **Yayın öncesi kapı — TAM, YEŞİL:** izole klonda `b6915f19` üzerinde `KAO2_ACCEPT_SLOW_HOST=1 kapilar.sh` → **TÜM KAPILAR YEŞİL**
  (tests/kao 55 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · fix-sync --repro ·
  d2f --strict · d3f pin senkronu · tekrar-uret 10/10 · perf PASS p95 5,125 ms). Ham çıktı: `kapilar-yayin-oncesi.txt`.
  Bu, YAYIN-5 ve YAYIN-6'da atlanan tam kapının yeniden koşulduğu yayındır.
- **Yöntem:** `main` → `origin/main` fast-forward (force yok). `mustafaras/seyma-data`'ya dokunulmaz.
- **Sonrası:** Pages run ve canlı bayt eşitliği → `CANLI.md`. Geri alma: `git revert` + yeni pin.
- **Kanıt düzeyleri:** kaynak/test ✓ (tam kapı) · yayın → CANLI.md · canlı → CANLI.md · cihaz — (yeni `SW_VERSION`; cihazda kullanıcıda).
