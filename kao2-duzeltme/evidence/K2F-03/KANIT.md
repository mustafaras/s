# K2F-03 — Handler yüzeyi fixture'ı
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: a97c63ed · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: (K5-02 tespitinin kalıcı testi) · R değişimi: yok (R-05 K2F-12'de)

## İlerleme günlüğü
- [x] P1: sync PASS, K2F-03 in_progress
- [x] Referans desenleri ölçüldü: App.x · name: · action: + kaoSegHTML dize argümanı (3 gizli işleyici)
- [x] test yazıldı, PASS; mutasyon kontrolü (KNOWN_MISSING=[] → kaoS0 FAIL)
- [x] README satırı, kapilar.sh YEŞİL, P4

## Yapılan
- `tests/kao/test_kao2_handler_surface.js` (6 kontrol): referans kümesi ↔ app.js atamaları, `KNOWN_MISSING=['kaoS0']` bayatlık denetimi,
  42 tek satırlık shim biçimi ve hedef adı, her shim hedefinin `window.SeymaQuranLearn`'da işlev olması, çağrılmayan tanım üst sınırı (≤5).
- `tests/kao/README.md`: fixture satırı.

## TDD
- Altyapı/fixture promptu: mevcut durumu kilitler; kırmızı yerine mutasyon ölçümü.
- Mutasyon: `KNOWN_MISSING=[]` → `AssertionError: app.js'te tanımsız: kaoS0` (R-05 ile aynı bulgu). Gerçek dosyada → 6 kontrol PASS.

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (47) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 92.439 KiB · css 12.815 KiB)
```
tekrar-uret: 1/10 PASS (önceki 1/10)

## Ölçümler
- Referans 40 · tanım 42 · eksik 1 (`kaoS0`) · çağrılmayan tanım 3 (kaoRevealWord, kaoMarkUnderstood, kaoOpenMap).
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l.

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- İşleyici adları `kaoSegHTML(..., 'kaoX')` dize argümanıyla da geçiyor; R-05 aracı (tekrar-uret) bunu görmez ama yeni test görür.
- K2F-12 `kaoS0` eklerken `KNOWN_MISSING`'i boşaltmak zorunda (bayatlık kontrolü zorlar).
