# K2F-04 — Kabul testi kanıt yazımı opt-in
Tarih: 2026-09-30 · Dal: kao2-duzeltme · Önceki commit: 945e37bd · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: M-11 · R değişimi: R-10 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS, dal doğru, K2F-04 in_progress
- [x] Kırmızı ölçüldü: R-10 FAIL (koşulsuz `fs.writeFileSync(… A-KABUL.md)`)
- [x] `test_kao2_kabul.js` rapor yazımı `KAO2_EVIDENCE_OUT` arkasına alındı; yoksa stdout
- [x] `kapilar.sh` A-KABUL yedek/geri koyma bloğu kaldırıldı
- [x] Doğrulama: test sonrası `git status` A-KABUL içermiyor; env ile yazım çalışıyor
- [x] iCloud kopyaları temizlendi (945e37bd, LEDGER seq 12), P4

## Yapılan
- `tests/kao/test_kao2_kabul.js`: rapor `md` yalnız `process.env.KAO2_EVIDENCE_OUT` tanımlıysa `path.resolve` edilen yola yazılır; aksi hâlde stdout'a basılır. Ölçümler ve 10/10 sonucu değişmedi.
- `kao2-duzeltme/tools/kapilar.sh`: `KABUL_FILE/KABUL_SAVED/KABUL_CONTENT` yedek bloğu ve geri yazma satırı silindi (artık gereksiz).
- Ayrı temizlik commit'i `945e37bd`: `5e0665bd` ile yanlışlıkla eklenen 15 iCloud kopyası (`… 2.*`) `git rm` ile kaldırıldı.

## TDD
- Kırmızı (ölçüm): `node kao2-duzeltme/denetim/tekrar-uret.cjs` → `FAIL R-10 (M-11) · kabul testi izlenen kanıt dosyasını her koşuda koşulsuz yeniden yazıyor`
- Yeşil: aynı komut → `PASS R-10`; `KAO2 denetim tekrar üretimi: 2/10 PASS`
- Davranış: `node tests/kao/test_kao2_kabul.js` → `10/10 ölçüt PASS`, `git status --porcelain` A-KABUL içermiyor; `KAO2_EVIDENCE_OUT=$TMPDIR/akabul.md …` → dosya yazıldı, ağaç temiz.

## Kapılar (P3)
```
node --check (5 modül) PASS · tests/kao (47) · app (77) · panel (23) · panel-v2 (27) · quran (9) PASS
reminders · driver · zikr · kontrast · kao-plan-check · fix-sync-check --repro PASS
SONUÇ: TÜM KAPILAR YEŞİL
KAO2 perf: PASS (content 177.657 KiB · runtime 92.439 KiB · css 12.815 KiB)
```
tekrar-uret: 2/10 PASS (önceki 1/10)

## Ölçümler
- Test koşusu sonrası kirli dosya: 3 (her koşuda A-KABUL) → 0.
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20260930m. Üretim kodu değişmedi.

## Bilerek değişen testler
- yok (yalnız rapor çıktı biçimi; ölçüt sayısı ve sonuçları aynı)

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlıdaki son yayın f0e8b1c1, bu prompt içermez) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- iCloud Drive kopyaları (`… 2.*`) 85 + 15 dosya olarak çıktı; `git add <dizin>` bunları içeri alabiliyor (LEDGER seq 12). Sonraki commit'lerde `git add` açık dosya yollarıyla yapılmalı; `git ls-files | grep ' 2\.'` her kapanışta boş olmalı.
- K2F-36 bu testi `KAO2_EVIDENCE_OUT=kao2-duzeltme/evidence/K2F-36/A-KABUL.md` ile kullanacak.
