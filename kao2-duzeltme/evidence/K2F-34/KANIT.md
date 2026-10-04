# K2F-34 — Yerleştirme şıkları
Tarih: 2026-10-04 · Dal: kao2-duzeltme · Önceki commit: a352fa77 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-06 · R değişimi: yok (10/10 korunur)

## İlerleme günlüğü
- [x] P1: sync PASS (34/44, seq 94), ağaç temiz, dal kao2-duzeltme
- [x] Ölçüm (öncesi, `$TMPDIR` probu): 8 yerleştirme sorusundan 3'ünde doğru şık tek başına uç (3. okuma en kısa; 8. ve 18. en uzun), 20 kapı sorusundan 10'unda; **doğru şık 20/20 görevde 1. sırada** (şıklar dizi sırasıyla çiziliyor). Kapı havuzunda (20 kelime) en uzun cevap (6 harf) için ≥6 çeldirici yok → havuz en sık 60 doğrulanmış kelimeye genişletildi
- [x] Test önce yazıldı: K2F-34 (a)…(e) → (b) kırmızı: `read-l_min_1f6fa6: çeldirici bandı aşıyor — farklar -1,3`
- [x] kaoGateChoices yazıldı (havuz 60, ≥/≤ iki taraf, |fark| sırası + turn eşitleyici, konum index%3, aynı Arapça okunuşları engelli)
- [x] (f) testi gerçek kodda kırıldı: aynı Arapçanın okunuşu başka kelimenin okunuşu olarak sızıyordu → `all` taramasıyla okunuş kümesi engellendi
- [x] Mutasyonlar: en az 9 mutant (hep ilk, ar engeli yok, tekrar eleme yok, iki taraf yok, yakınlık sırası yok, turn yok, havuz 20…) — hepsi kırıldı (iki denk çıkan mutant için (g) eklendi)
- [x] Kapılar YEŞİL, code-reviewer APPROVE, kapanış

## Yapılan
- `kaoGateTasks` okuma şıkları: çeldiriciler en sık 60 doğrulanmış kelimeden `kaoGateChoices` ile seçilir — NFC uzunluk farkı en küçük, bir tane ≥ ve bir tane ≤ (|fark|, sonra `(at-index) mod n` eşitleyici); aynı Arapçanın tüm okunuşları ve tekrar eden okunuşlar elenir; doğru şık `index%3` konumuna yerleşir. `kaoPlacementTasks` kapı görevlerinin birebir alt kümesi kaldı. Yeni handler/CSS/pin yok.
- Kapsam dışı: dinleme şıklarında doğru harf hep 1. düğme → LEDGER NOTE seq 96.

## TDD
- Kırmızı: `node tests/kao/test_kao2_onboarding.js` → `AssertionError: read-l_min_1f6fa6: çeldirici bandı aşıyor — farklar -1,3`
- Yeşil: `node tests/kao/test_kao2_onboarding.js` → PASS (28 kontrol; 21 + K2F-34 a–g)

## Kapılar (P3)
`bash kao2-duzeltme/tools/kapilar.sh` → SONUÇ: TÜM KAPILAR YEŞİL (kao 53 · app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync)
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- Sonrası (ölçüldü): 20 kapı görevinin 20'sinde (yerleştirme 8'i dahil) iki çeldirici de doğru okunuşla birebir aynı uzunlukta (en büyük fark 0; kabul ±2); 5 sezgi (ilk/son/kısa/uzun/orta) yerleştirmede <7/8, kapıda <18/20 (test c)
- 20 görevde 25 ayrı çeldirici, en çok 2 tekrar (turn eşitleyicisiz: 14 / 5)
- Doğru şık konumu: yerleştirme 3/2/3, kapı 7/7/6
- Bütçe: runtime 115,784 → 116,270 KiB (tavan 128) · css 13,661 KiB değişmedi · içerik 183,544 KiB

## Bilerek değişen testler
- yok (test_kao2_onboarding'e K2F-34 a–g eklendi; özet satırı dosyanın sonuna taşındı)

## Kanıt düzeyleri
- Kaynak/test ✓ (bağımsız code-reviewer: APPROVE, CRITICAL/HIGH/MEDIUM yok; LOW: seyrek havuzda bant aşılabilir = spec'teki "en yakın") · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Doğru şık 20/20 okuma görevinde 1. sıradaydı; 20'lik havuzda en uzun cevap için ≥ uzunlukta çeldirici yoktu → havuz 60. Bunlar K5-06'nın amacı (tahmin edilememe) için gerekliydi.
- Dinleme şıklarında aynı konum sorunu açık (LEDGER NOTE seq 96).
- Yayın pini bu prompt'ta değişmez; quranLearn.js değiştiği için canlıya alınırken yeni pin gerekir.
