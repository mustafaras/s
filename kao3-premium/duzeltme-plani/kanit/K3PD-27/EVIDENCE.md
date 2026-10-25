# K3PD-27 — Donmuş içerik ve fontun teknik kanıtı

Tarih: 2026-10-25 · Başlangıç HEAD: `35cf4b1faf4fcb97b9513142a8520eaaf8568a95` · Branch: `k3pd-denetim-duzeltmeleri`

## Kabul özeti

| Kabul | Sonuç | Kanıt |
|---|---|---|
| Üç yerel girdi ve source pinleri | PASS | [DONDURMA-KANITI.md](DONDURMA-KANITI.md) |
| Dört üretim modülünü gerçek araçlarla yeniden üretme | PASS · 4/4 bayt-eş | [DONDURMA-KANITI.md](DONDURMA-KANITI.md) |
| Üretim modülü önce/sonra SHA-256 eşliği | PASS · 4/4 aynı | [DONDURMA-KANITI.md](DONDURMA-KANITI.md) |
| Araç → doğrulanmış girdi → runtime telaffuz eşliği | PASS · 524/524, sapma 0 | [DONDURMA-KANITI.md](DONDURMA-KANITI.md) |
| Font mevcut binary, boyut ve cmap | PASS · HEAD/K3P-07 hash eşliği; 25.060 bayt; 105/105 | [FONT-KANITI.md](FONT-KANITI.md) |
| CSS font kuralı ve SIL lisansı | PASS · swap/range ve yerel OFL 1.1 doğrulandı | [FONT-KANITI.md](FONT-KANITI.md) |
| CSS font URL’si ile gerçek SW offline URL’si | PASS · exact `?v=20261021a`; IIP-22 15/15 | [FONT-KANITI.md](FONT-KANITI.md) |
| Temp cleanup / production veya kişisel veri yazımı | PASS · izole kopya silindi; yazım 0 | [DONDURMA-KANITI.md](DONDURMA-KANITI.md) |

Testler: pronunciation contract, phonics contract, freeze reproduction ve IIP-22 exit 0. Freeze testi dört modülü kendi geçici kopyasında üretti; SKIP oluşmadı. Font komutu `--build` olmadan çalıştırıldı. DENETLEYICI §4 G0’ın 13 komutu exit 0; zikr harness 95/95 assertion verdi. IIP-22 exact offline URL regresyonu dahil 15/15 kontrolde PASS. Tam komut ve ölçüler [COMMANDS.json](COMMANDS.json)’da.

İlk bağımsız salt-okur denetim `PARTIAL` verdi: CSS/SW query farkı ile `durum.mjs` parser’ının exact status/log yolları istemesi. Kullanıcı bu iki kapsamı ayrıca onayladı; K3PD-27 prompt allowlist’i onarıldı, CSS URL’si eşitlendi ve IIP-22’ye exact URL regresyonu eklendi. Taze bağımsız salt-okur denetçi `/root/k3pd27_audit` düzeltilmiş diff’e `PASS` verdi; dosya yazmadı. G0 13/13, G3 4/4, IIP-22 15/15, exact scope 10/10 ve korunan hashler 4/4 doğrulandı. Kart `done/PASS` olarak kapandı.

## Açık sınırlamalar

- 30 zor glifin görsel karşılaştırması ve gerçek şekillendirme kabulü K3PD-29’a aittir; bu teknik font kanıtı görsel/cihaz kabulü değildir.
- `app/kao.css` exact pin deferral listesine K3PD-32’ye kadar eklendi; `index.html` ve `sw.js` pinleri değişmedi.
- K3PD-28 yalnız sıradaki adaydır; bu kart K3PD-28 uygulama izni vermez.
- `releaseApproval=NOT_APPROVED`, `candidateSha=null`; push, merge, tag ve deploy yapılmadı.

## Değişen exact yollar

- `kao3-premium/duzeltme-plani/PROMPTLAR.md`
- `kao3-premium/duzeltme-plani/DURUM.json`
- `kao3-premium/duzeltme-plani/GUNCEL-DURUM.md`
- `kao3-premium/duzeltme-plani/KAYIT.md`
- `app/kao.css` (yalnız Scheherazade `@font-face` URL query’si)
- `tests/app/test_iip_22.js` (exact offline URL regresyonu)
- `kao3-premium/duzeltme-plani/kanit/K3PD-27/DONDURMA-KANITI.md`
- `kao3-premium/duzeltme-plani/kanit/K3PD-27/FONT-KANITI.md`
- `kao3-premium/duzeltme-plani/kanit/K3PD-27/EVIDENCE.md`
- `kao3-premium/duzeltme-plani/kanit/K3PD-27/COMMANDS.json`
