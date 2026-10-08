# YAYIN-5 — D3F-06 ve YAYIN-4 canlı kaydı canlıya

- **Onay (kullanıcı, birebir, 2026-10-08):** "önce düzelt sonra tüm değişiklikleri canlıya al". Açık kullanıcı talimatı; devir ya da çıkarım değil.
- **Kapsam:** `700cae25..HEAD`: `c4116a53` (YAYIN-4 canlı kaydı ve starter), `b9db08b9` (D3F-06) ve bu kayıt commit'i.
- **Pin:** değişmedi, `20261008a` kalıyor. Bu kapsamda çalışma zamanı dosyası değişmedi.
- **Yayına çıkan çalışma zamanı farkı:** yok. `git diff --name-only origin/main HEAD`, Pages rsync dışlamalarından
  (`docs`, `tests`, `tools`, `kao2-duzeltme`, `*.md` …) sonra boş. Canlıdaki dosyaların YAYIN-4 ile bayt-eş kalması bekleniyor.
- **Yöntem:** `main` → `origin/main` fast-forward (force yok). `mustafaras/seyma-data`'ya dokunulmaz.

## Yayın öncesi kapı — SAPMA (kullanıcı kararı)
- `b9db08b9` üzerinde, temiz ağaçta hızlı set 6/6 PASS: kao-plan-check · fix-sync-check --clean · d2f-sync-check --strict --clean ·
  D3F-03 kapilar mutasyonu 5/5 · D3F-04 d2f mutasyonu 8/8 · D3F-06 inceleme mutasyonu 7/7.
- D3F-06'ya doğrudan ilişkin testler: test_kao2_text_review 13/13 · test_kao2_review_apply 16/16 · l2-paket-build --check PASS.
- **Tam `kapilar.sh` koşusu TAMAMLANMADI.** İzole klonda `KAO2_ACCEPT_SLOW_HOST=1` ile 16:28'de başladı. 5/20 kapı PASS oldu
  (`node --check` ×5); `tests/kao (55)` koşarken kullanıcı "atlayalım" dedi ve koşu 16:35 civarı durduruldu.
  Kalan 15 kapı (tests/kao · app · panel · panel-v2 · quran · reminders · run-seyma ×2 · kontrast · l2-paket · plan-check ·
  fix-sync --repro · d2f --strict · d3f pin senkronu · tekrar-uret · perf) bu yayın için ÖLÇÜLMEDİ.
- Gerekçe (kullanıcıya söylendi): canlıya giden kod değişmiyor. Risk, kayıt/araç tarafında kalıyor; o taraf da hızlı setle sınandı.
  Bir sonraki yayında tam kapı yeniden zorunlu.

## Sonrası
- Pages run ve canlı bayt eşitliği → `CANLI.md`.
- Geri alma: yayın commit'lerine `git revert` (geçmiş yeniden yazılmaz).
- **Kanıt düzeyleri:** kaynak/test kısmi ✓ (yukarıdaki sapma) · yayın (push + run) → CANLI.md · canlı bayt eşitliği → CANLI.md ·
  cihaz — (çalışma zamanı değişmediği için cihazda yeni bir şey yok).
