# KAO-FIX-24 · Haftalık aktarım testi (02 §5.10, KF-6)

Dal `kao-duzeltme`, taban `8747496`. Yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35).

## Önce kırmızı
- `node tests/kao/test_kao_requirements.js` (HEAD kodu + yeni test) → exit 1: `api.kaoTransferCandidate is not a function`.

## Değişiklikler (`quranLearn.js`)
- `kaoTransferCandidate(d, now)`: son testten ≥7 gün; hiç görülmemiş âyet (anlaşıldı işaretli, `transfer.seen`, `s:` parça kartıyla eğitilmiş olanlar dışlanır), kapsam ≥%95 (`KAO_AYAH_THRESHOLD`), seeded seçim.
- `kaoBuildTransferTask`: doğru cevap âyetin doğrulanmış kelime kelime Türkçesi (modülde âyet meali yok); çeldiriciler uzunluğu en yakın başka âyetlerin çevirileri; Arapça/okunuş kısa sûre modülünden (V3).
- `kaoStart` (gece değilse) oturum sonuna ekler; `kaoAnswer` FSRS kartı yazmaz → `quranLearn.transfer={lastAt,n,ok,seen≤120}`.
- `ensureQuranLearn`: alan yalnız varsa normalleşir (taze durum şekli değişmez; `test_kao_migration` aynı). İstatistik ekranı: "Yeni âyet testi (haftalık aktarım)" bölümü.
- Satır bütçesi için yeni bitişik satırlar birleştirildi (1.887 ≤ 1.900).
- `duzeltme/araclar/kao-sim.js`: çıktıya `link`, `errorsByClass`, `transfer` özetleri eklendi (yalnız bilgi).

## Kontroller
- Test: aday bulunur (≥%95), parça kartı ve anlaşıldı işareti dışlar, oturum sonunda görev, cevap/çeldiriciler, `transfer` kaydı, FSRS kartı yok, 7 gün kuralı, 8 gün sonra yeni âyet, istatistik satırı, bozuk alan normalleşir
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok
- PIN-P `20260927d` → `20260927e` (9 dosya, eski 0)
- `kao-sim.js . 365`: aktarım testi 25 (25 doğru), bağ kur 104 (98 doğru), maxRun 2 · ihlal 0 · iki yön 524 · kod=plan 513 · `eighty` kazanılır · hata 0 · 471,9 KB
- 02 §5.10 durum satırı → Uygulandı (KAO-FIX-24)

## Kalan risk
- Cihazda doğrulanmadı. Çeviri kelime kelime (akıcı meal değil); modülde âyet meali yok.
