# D3F-03 — F-03: kapilar.sh artık hatayı geçirmiyor ve gizlemiyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-03

## Kök neden
1. Perf bloğu: `perf satırı okunamadı` yazıp `FAILED=1` atamıyordu → perf testi çökse de kapı yeşil.
2. `gate`/`family` başarısız komutun çıktısını `/dev/null`'a atıyordu → kırmızının nedeni görülemiyordu
   (D3F-02'nin gece koşusundaki kabul kırmızısı bu yüzden teşhis edilemedi).

## Yapılan (yalnız `kao2-duzeltme/tools/kapilar.sh`)
- Kırmızı kapının / aile dosyasının tam çıktısı depo DIŞINA yazılır (`$TMPDIR/kapilar-<zaman>-<pid>/`, `KAPILAR_LOG_DIR` ile
  değişir), yolu satırda ve sonda "kırmızı çıktılar:" olarak gösterilir. Yeşil koşuda günlük klasörü oluşmaz, geçici dosya kalmaz.
- Perf: satır okunamazsa YA DA perf testi sıfırdan farklı çıkarsa kapı kırmızı; çıktı günlüğe.
- Uygulama kodu değişmedi → pin yok.

## TDD / mutasyon
`kapilar-mutasyon.sh` (depoda, yeniden üretilebilir; kapilar.sh'ın kendi metnini çıkarıp sahte testlerle koşar) → `mutasyon.txt` 5/5:
M0 yeşil/günlük yok · M1 perf satırsız çıkış 1 → kırmızı · M2 satır var çıkış 1 → kırmızı · M3 aile dosyası kırık → kırmızı + çıktı
günlükte · M4 tek kapı kırık → kırmızı + çıktı günlükte. Eski kapılar perf bloğu M1'de `FAILED=0` verdi (elle; eski metin betiğin
çıkarma kalıbına uymadığından betik onu "çıkarılamadı" diye reddeder).

## Kapılar
İzole klonda yeni kapilar.sh ile iki gerçek tam koşu (`kapilar-tam.txt`):
- bayraksız (15:05): tek kırmızı `test_kao2_kabul.js`; günlük (`kabul-bayraksiz-kirmizi.log`) nedenini İLK KEZ gösterdi:
  `A-10 FAIL — bütçe testi kırmızı: steady p95 8.613 ms exceeds baseline +25% (5.09 ms)`.
- `KAO2_ACCEPT_SLOW_HOST=1` (15:17): TÜM KAPILAR YEŞİL, exit 0, günlük klasörü oluşmadı; perf satırı "GÖRELİ BANT ATLANDI: steady 5,158 ≤ bant 6,360 ms".

## Ölçümler
Kırmızının kökü göreli p95 bandı: KAO2-01 makinesinin tabanı +%25 = 5,09 ms; bu makinede steady p95 yük altında 2,8–8,6 ms
oynuyor. Mutlak tavanlar rahat: p95 ≤40 ms (ölçülen 4,5–8,1), runtime 117,7 ≤128 KiB, css 13,0 ≤14, içerik 183,9 ≤256.
D3F-02'deki "yeniden üretilemeyen gece kırmızısı" ve önceki "perf satırı okunamadı" bu bandın oynaklığıdır; saatle ilgisi yok.

## Bilerek değişen testler
Yok (yalnız kapı betiği).

## Kanıt düzeyleri
kaynak/araç ✓ · yayın — · canlı — · cihaz —

## Sürprizler
- `$(keep_log …)` alt kabukta çalıştığından ilk taslaktaki `LOGGED=1` bayrağı ana kabuğa geçmiyordu; özet satırı günlük
  klasörünün varlığına bakacak şekilde değiştirildi (M4 bunu sınar).
- Göreli bant kararı (bayraksız kapının bu makinede oynak olması) bu kartın kapsamı dışında; kullanıcıya ayrı soruldu.
