# D3F-02 — F-02: test_kao_render.js saatten bağımsız

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-02

## Kök neden
`api.kaoHubCardHTML()` saati içeride okur. Testin verisi `targetBed: '23:00'`; `kaoNightWindow` yatmadan önceki 90 dk'da
(21:30–23:00) hub'ı "Uyumadan önce N kart · Tekrar et"e çevirir. Test gündüz metnini beklediği için her akşam kırmızıydı →
tests/kao → kabul A-9 → kapilar.sh. Uygulama doğru davranıyordu; kusur testin gerçek saate bağlı olmasıydı.

## Yapılan
- Yalnız `tests/kao/test_kao_render.js`: `atClock(iso, run)` sandbox'ın `Date`'ini yalnız çağrı süresince sabitler.
  Gündüz hub çağrıları 12:00'de; gece penceresi 22:00'de AYRICA sınanır (önceden hiç sınanmıyordu):
  "Uyumadan önce N kart · N dk", "Tekrar et", yeni ders önerilmez; saat geri alınınca gündüz metni değişmez.
- Uygulama kodu değişmedi → pin yükseltmesi yok (20261008a).

## TDD
- RED (düzeltme öncesi): denetimin ön-yüklemesiyle 21:45 / 22:00 / 23:00 FAIL; kabul A-9 render alt süreci 22:00 → exit 1.
- GREEN: 11 saatin hepsi + gerçek saat PASS; kabul 22:00 → exit 0, 10/10 (`saat-taramasi.txt`).
- Mutasyon: NIGHT_CLOCK öğlene çekilirse test FAIL (gece kontrolü gerçekten ölçüyor).

## Kapılar
Commit sonrası izole klonda (`6a20c702`) iki tam koşu → `kapilar-commit-sonrasi.txt`:
- gerçek saat (14:20): TÜM KAPILAR YEŞİL, exit 0.
- render süreci 22:00 (`NODE_OPTIONS=-r fixdate-render.cjs`): tek kırmızı `test_kao2_kabul.js`, exit 1.
  Aynı klonda aynı ortamla kabul tek başına 10/10 PASS, `tests/kao` ailesi sırasıyla koşulunca da 10/10 PASS (`kabul-gece.txt`;
  A-9 190/190, A-10 p95 6–8 ms). Kırmızı yeniden üretilemedi → saat değil, yük altındaki zamana duyarlı bir ölçüt;
  kapilar.sh başarısız testin çıktısını yuttuğu için hangisi olduğu görülemedi. Bu açık F-03'e (kapı hatayı gizliyor) devredildi:
  kapı başarısız testin çıktısını saklayacak, sonra gece koşusu yeniden ölçülecek. D3F-02 "kapılar her saatte yeşil" İDDİA ETMEZ;
  iddiası: render testi ve kabul saatten bağımsız (11 saat taraması + 22:00 kabul).

## Ölçümler
`saat-taramasi.txt` (00:30…23:59, 11 saat) · kabul A-9 190/190.

## Bilerek değişen testler
`test_kao_render.js`: hub çağrıları sabit saatte; +4 gece penceresi kontrolü.

## Kanıt düzeyleri
kaynak/test ✓ · yayın — (çalışma zamanı değişmedi) · canlı — · cihaz —

## Sürprizler
Yok. Not: önceki belgelerdeki "bayraklı ve bayraksız TÜM KAPILAR YEŞİL" iddialarının saate bağlılığı F-13 (belge düzeltmeleri) kapsamında işlenecek.
