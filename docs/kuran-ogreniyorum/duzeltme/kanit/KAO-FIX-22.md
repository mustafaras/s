# KAO-FIX-22 · Hata taksonomisi → kuyruk ağırlığı + "en çok karıştırdıkların" (02 §5.7, KF-6)

Dal `kao-duzeltme`, taban `10fbc06`. Yeni `App.*` handler / onclick yok (App 756, onclick 393, App.kao* 35).

## Önce kırmızı
- `node tests/kao/test_kao_requirements.js` (HEAD kodu + yeni test, `$TMPDIR/red22-*`) → exit 1: `api.kaoWeakClass is not a function`.

## Değişiklikler (`quranLearn.js`)
- `kaoWeakClass(q)`: `errors` içinde ≥3 ve en yüksek sınıf; eşitlikte `KAO_ERROR_ORDER` (ses, kök, ek, kognat, kural, sıra).
- `kaoCandidates`: zayıf sınıfın adayları öncelik +1 → vadesi gelenler 60 sınırında ve sırada öne geçer. Eşleme: kognat → `cognate.shift`'li kelime (iki yön), kök/ek/kural → gramer adayı `errorClass` (`grammarErrorClass`, tek kaynak), sıra → dizme parçası. `sound` kuyrukta değil (telaffuz modülü).
- `kaoConfusedLine(q)` + ana ekran (`kaoHomeHTML`, Bugünkü ders bölümü): "En çok karıştırdıkların: Türkçe benzeri kelimeler (5) · kök (3)"; hata yoksa satır yok. Mevcut `kao-milestone` sınıfı (yeni CSS/renk yok).
- Dışa açık: `kaoCandidates`, `kaoWeakClass` (registry; handler değil).

Test notu: tek yönlü (yalnız ar>tr) vadesi gelmiş deste KF-9 (aynı tür ≤2) yüzünden 2 görevde durur; fixture iki yönlü kuruldu (80 lemma × 2, sınır 60).

## Kontroller
- kao 17/17 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · driver 0 · zikr 0 (95/95) · rebind 0 · shell-inventory PASS · plan-check PASS (6 warn) · kontrast 336/0 · diff-check ok
- Test: kognat zayıfken kayma kartları 40/40 girer; ağırlık yokken <40; <3 hata → zayıf sınıf yok; satır iki sınıf + sayı
- `quranLearn.js` 1.876 satır (≤1.900) · PIN-P `20260927b` → `20260927c` (9 dosya, eski 0)
- `kao-sim.js . 365`: maxRun 2 · ihlal 0 · grammarMax 4 · iki yön 524 · kod=plan 506 · kapsam %75,92 · `eighty` kazanılır · hata 0
- 02 §5.7 durum satırı → Uygulandı (KAO-FIX-22)

## Kalan risk
- Cihazda doğrulanmadı. Ağırlık yalnız sıralama önceliği; FSRS aralıklarını değiştirmez.
