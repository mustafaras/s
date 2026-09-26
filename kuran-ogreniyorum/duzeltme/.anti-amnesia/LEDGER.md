# KAO-FIX · Olay günlüğü (yalnız ekleme; eski satır değiştirilmez)

Kural: her prompt en az bir satır ekler; parti ya da durma da bir satırdır.
Sütun "Kanıt": komut + exit ya da `kanit/KAO-FIX-NN.md`, varsa commit kısa hash'i.
Okurken yalnız `tail -5`.

| Seq | Tarih | Prompt | Olay | Kanıt |
|---|---|---|---|---|
| 1 | 2026-09-26 | — | Bağımsız uygunluk denetimi tamamlandı: 145 gereksinim; TAM 86 · TESTSİZ 4 · KISMİ 31 · EKSİK 10 · ÇELİŞKİLİ 2 · KULLANICI-KARARI 9 · ATLANDI 3. Bulgular: 1 KRİTİK, 4 YÜKSEK, 11 ORTA, 6 DÜŞÜK. | `deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md` (commit edilmedi; FIX-00 commit'ler) |
| 2 | 2026-09-26 | — | Düzeltme programı planlandı: 20 prompt (FIX-03 dört parti), bağlam yönetimi belgesi, durum dosyası; denetim betikleri `duzeltme/araclar/`'a alındı (4 dosya, `node --check` PASS). Taban `main` @ `58e0ceb`; tests/app 77/77, tests/kao 14/14. | `duzeltme/FIX-PROMPTLARI.md`, `BAGLAM-YONETIMI.md` |
| 3 | 2026-09-26 | KAO-FIX-00 | Dal `kao-duzeltme` açıldı; KF-1…KF-9 varsayılan (kullanıcı değiştirmedi); taban: kao 14/14, app 77/77, panel 23/23, panel-v2 27/27, quran 9/9; sim 120 g iki yönlü 0 / kod bilinen 524 / plan bilinen 0; STD exit 0; CLAUDE.md+AGENTS.md yönlendirme satırı. Commit: denetim `201ff6d` + KAO-FIX-00. | `duzeltme/kanit/KAO-FIX-00.md` |
| 4 | 2026-09-26 | KAO-FIX-01 | O-4: `kao-content-freeze.mjs` `lexicon.verified.json` pini `cf65aa…`→`16a159…` (diğer 3 pin shasum ile eş); hata metnine pin yönergesi. Yeni `test_kao_freeze_repro.js`: önce kırmızı (exit 1, `--freeze-surahs` sha256), sonra PASS 4 modül bayt-eş; girdisiz SKIP exit 0. `app/content` değişmedi. FIXTURE-MAP yenilendi (önceki kayma). STD exit 0. | `duzeltme/kanit/KAO-FIX-01.md` |
