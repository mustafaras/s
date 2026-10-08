# YAYIN-6 — D3F-07, D3F-08 ve YAYIN-5 canlı kaydı canlıya

- **Onay (kullanıcı, birebir, 2026-10-08):** "başla ve tam bir push commit merge deploy istiyorum"; kapı için: "atla ve canlıya al".
  Açık kullanıcı talimatı; devir ya da çıkarım değil.
- **Kapsam:** `2f0f6f02..HEAD`: `4a0ada6f` (YAYIN-5 canlı kaydı), `13a6d345` (D3F-07), `9e5e5df6` (D3F-08) ve bu kayıt commit'i.
- **Pin:** değişmedi, `20261008a` kalıyor. **Yayına çıkan çalışma zamanı farkı yok**: Pages rsync dışlamalarından sonra `git diff --name-only origin/main HEAD` boş.
- **Yöntem:** `main` → `origin/main` fast-forward (force yok). Ayrı dal yok; "merge" ff push'tur. `mustafaras/seyma-data`'ya dokunulmaz.

## Yayın öncesi kapı — SAPMA (kullanıcı kararı)
- `9e5e5df6` üzerinde, temiz ağaçta hızlı set **9/9 PASS**: kao-plan-check · fix-sync-check --clean (seq 127) · d2f-sync-check --strict --clean (seq 26) ·
  pages-kayit-denetimi 4/4 · mutasyonlar D3F-03 5/5 · D3F-04 8/8 · D3F-06 7/7 · D3F-07 10/10 · D3F-08 5/5.
- **Tam `kapilar.sh` TAMAMLANMADI.** İzole klonda `KAO2_ACCEPT_SLOW_HOST=1` ile 17:18'de başladı; 5/20 kapı PASS (`node --check` ×5).
  `tests/kao (55)` koşarken kullanıcı "atla ve canlıya al" dedi ve koşu durduruldu. Kalan 15 kapı bu yayın için ÖLÇÜLMEDİ.
- Gerekçe (kullanıcıya söylendi): son tam yeşil kapıdan (YAYIN-4) beri çalışma zamanı dosyası değişmedi. Değişen araç ve kayıtlara dokunan
  kapılar hızlı sette koşuldu. Bu, art arda ikinci atlanan tam kapıdır (YAYIN-5, YAYIN-6). Çalışma zamanı dosyasına dokunan bir sonraki yayında tam kapı zorunlu.

## Sonrası
- Pages run ve canlı bayt eşitliği → `CANLI.md`. Geri alma: `git revert` (geçmiş yeniden yazılmaz).
- **Kanıt düzeyleri:** kaynak/test kısmi ✓ (sapma) · yayın → CANLI.md · canlı → CANLI.md · cihaz — (çalışma zamanı değişmedi).
