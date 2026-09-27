# KAO-FIX-20 · Kullanıcı kararları: gzip 160 KiB (KF-11), `eighty` %75 (KF-12)

Dal `kao-duzeltme`, taban `54af1d9`. Kararlar kullanıcıdan (2026-09-27, AskUserQuestion): KF-6 → şimdi uygula (FIX-21…26), KF-11, KF-12.

## Önce kırmızı
- `test_kao_requirements.js` (kapsam 0,75 eşik testi + etiket + üretim yolunda `eighty` ISO) eski kodla exit 1: "eighty: kapsam 0,75 eşikte kazanılır".
- Gzip: yalnız bütçe kaydı (162.177 B zaten ≤160 KiB); davranış değişmediği için kırmızı aşaması yok.

## Değişiklikler
- `quranLearn.js`: `eighty:ratio>=0.75`, etiket `'%75 kapsam'` (anahtar/veri aynı, I1–I6). +1 yorum satırı (1.858).
- `test_kao_user_tasks.js`: R-C5 bütçesi 160 KiB = büyüme tavanı, `total<=budget`.
- Belgeler: 12 R-C5 satırı, 03 §10 taş tablosu, 05 §1 notu, 06 §5, EK-1 (§3/§4), README "Kullanıcıda".
- CURRENT-STATE: KF-6 (şimdi uygula), KF-11, KF-12; FIX-20…26 kart taslakları; FIX-19 sona alındı.
- PIN-P `20260926m` → `20260927a` (9 dosya, eski 0).

## Kontroller
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok · App.kao* 35
- `kao-sim.js . 365`: `eighty` 2026-11-08'de kazanılır (önce null); maxRun 2 · ihlal 0 · grammarMax 4 · iki yön 524 · kod=plan 510 · kapsam %75,77 · hata 0

## Kalan risk
- Eşik 0,75, tavan 0,7742'ye yakın: öğrenilen kelime unutulup kapsam düşerse taş yine de kalır (bir kez kazanılır, FIX-10 kararı).
