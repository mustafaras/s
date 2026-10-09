# YAYIN-9 — D3F-15, D3F-16 (+ ek: F-20) canlıya (pin 20261008e)

- **Onay (kullanıcı, birebir, 2026-10-09):** "tümünü canlıya al ve sıradaki işe gec".
- **Kapsam:** `6119f442..a384aa8a` ve bu kayıt commit'i:
  - `7a4a0f6d` (D3F-15): yalnız kayıt/belge, Pages'e çıkan çalışma zamanı farkı yok.
  - `d6623275` (D3F-16): okuyucu anlam paneli `role="region"` + `aria-live`, açan kelime `aria-expanded`/`aria-controls`, odak kelimeye döner.
  - `a384aa8a` (D3F-16 ek, F-20): yalnız test düzeneği saati.
- **Pin:** `20261008d` → **`20261008e`** (D3F-16). Yayına çıkan çalışma zamanı farkı: `app/core/quranLearn.js` (+527 bayt) ve pin dosyaları
  (`index.html`, `sw.js`, `panel-v2.html`).

## Yayın öncesi kapı
`KAO2_ACCEPT_SLOW_HOST=1 bash kao2-duzeltme/tools/kapilar.sh`, izole klon `a384aa8a`, 2026-10-09 13:23–13:34, yük 4–6:
**SONUÇ: TÜM KAPILAR YEŞİL** (ham çıktı `kapilar-a384aa8a.txt`). Sapma yok.
- tests/kao 55 (kabul A-9 ve perf bütçesi dahil) · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket ·
  plan-check · fix-sync --repro · d2f --strict · d3f pin senkronu · tekrar-uret 10/10.
- perf: içerik 183,950 KiB · çalışma zamanı 118,105 KiB · css 13,035 KiB · **p95 6,075 ms** (mutlak tavan 40 ms; YAYIN-8'deki sapma bu kez yok) ·
  steady 3,471 ms (göreli bant yavaş makine modunda atlandı; 6,360 ms bandın içinde).
- F-20 düzeltmesinden sonra `test_kao2_grammar_tasks` D4 ve kabul A-9 kapıda yeşil.

## Hız kararı (kullanıcı, 2026-10-09)
- D3F-16 ek'teki 5 tarihlik saat taraması yarıda durduruldu: "bunu beklememiz zorunlu mu hiç yapmayalım ztn çok fazla gereksiz test var".
- Commit öncesi düzenek kullanıcı koşusu sürerken "onaylıyorum" denildi: koşu durduruldu (o ana kadar 17/17 PASS), commit atıldı, doğrudan tam kapıya geçildi.
- Saat mutasyonunun M2/M3 adımları yayın sırasında koşuldu: M0 yeşil · M1 (gerçek Date) kırmızı · M2 (new Date kaymaz) kırmızı; M3 sonucu `CANLI.md`te
- Önerilen kalıcı hızlandırma (`kapilar.sh` A-9 tekrarını atlasın, aileler paralel koşsun; perf tek başına): yayından sonra ayrı adım, kullanıcı onayıyla.

- **Yöntem:** `main` → `origin/main` fast-forward (force yok). `mustafaras/seyma-data`'ya dokunulmaz. Geri alma: `git revert` + yeni pin.
- **Kanıt düzeyleri:** kaynak/test → yukarıda · yayın → CANLI.md · canlı → CANLI.md · cihaz/ekran okuyucu — (anlam paneli, VoiceOver/TalkBack kullanıcıda).
