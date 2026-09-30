# K2F-02 — Test düzeneği ve yığınsız görünüm çözümü
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: 3491c785 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K6-02 (altyapı) · R değişimi: R-09 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS, dal doğru, K2F-02 in_progress
- [x] Kök neden ölçüldü: gerçek `kaoNav('s0'|'sources')` true dönüp ana ekranda kalıyor; `kaoNav('roots')` false
- [x] Kullanıcı kararı: Flow Dokun'a eklendi (LEDGER seq 7)
- [x] `kao-harness.js` yazıldı
- [x] `test_kao2_view_resolution.js` yazıldı, kırmızı görüldü
- [x] Flow VIEWS + kaoNav roots + kaoS0HTML düzeltmesi → yeşil (11/11)
- [x] README satırı, R-09 PASS, kapilar.sh YEŞİL, P4

## Yapılan
- `tests/kao/helpers/kao-harness.js`: `bootKao({now,seeded})`, `freshUser`, `seed`, `openView` (gerçek kaoOpen+kaoNav/kaoSetView),
  `walkLesson({answer,visit})`, `text`, `navTitle`. Diziler yerel realm'e çevrilir.
- `tests/kao/test_kao2_view_resolution.js`: 11 kontrol (yığınsız çözüm ×12 görünüm, türetilen yığın, bilinmeyen görünüm, kaoNav, kaoSetView, 4 parametreli görünüm, geçersiz parametre, düzenek öz-testi).
- `app/core/quranLearnFlow.js`: VIEWS beyaz listesine `roots`, `s0`, `sources`.
- `app/core/quranLearn.js`: `kaoNav` roots doğrulaması yalnız parametre verildiğinde; `kaoS0HTML` `objectOr(ui.kaoS0,{})`.
- `tests/kao/README.md`: fixture satırı.

## TDD
- Kırmızı: `node tests/kao/test_kao2_view_resolution.js` → `yığınsız görünüm ana ekrana düştü: roots/s0/sources: "Kur'an Arapçası" ≠ …` (session NavBar'sızdır, testte istisna)
- Yeşil: aynı komut → `test_kao2_view_resolution: 11 kontrol PASS`
- Ara kırmızı (üretim düzeltmesi sonrası): `TypeError … 'lessonId'` (`kaoS0HTML` null durum) → `{}` ile kapandı.

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (46) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 92.439 KiB · css 12.815 KiB)
```
tekrar-uret: 1/10 PASS (önceki 0/10)

## Ölçümler
- R-09: yığınsız `roots`, `s0`, `sources` → yok (yanlış ekran sayısı 3 → 0).
- Runtime bütçesi 92,431 → 92,439 KiB (tavan 128).
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930l.

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Flow beyaz listesi yalnız test yolunu değil gerçek kullanıcı yolunu da bozuyordu (`s0`/`sources`/`roots` açılmıyordu).
- s0 artık render edildiği için R-06 çökmeleri (6 ders) sahada görünür olur; K2F-13 önceliği yüksek. `kaoS0` handler'ı hâlâ tanımsız (K2F-12).
- `KAO_VIEW_TITLES.s0` zaten "Seviye 0"; prompt'taki "Harfler" eklemesi gerekmedi.
