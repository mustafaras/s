# KAO2-15 — Yayın kaydı (canlı)

Tarih: 2026-09-29 · Dal: `kao2-yeniden-tasarim` · Yayın: GitHub Pages

## Kapsam
Kullanıcı 2026-09-29'da "izinleri veriyorum ve onaylıyorum tümünü canlıya da al"
diyerek KAO2-14 ve KAO2-15'in yayınlanmasına açık onay verdi. Kapsam: dal push,
`main`'e fast-forward, GitHub Pages yayını ve canlı doğrulama. `mustafaras/seyma-data`
yazımı yoktur.

## Adımlar
| # | İşlem | Sonuç |
|---|---|---|
| 1 | `git push origin kao2-yeniden-tasarim` | `c1ebe168..3b0fcb6f` |
| 2 | `main` fast-forward + push | ilk denemede GitHub **500**; tekrar denendi → `c1ebe168..3b0fcb6f` |
| 3 | Pages run **36586060856** | validate + deploy **success** |
| 4 | **Pin denetimi** | pin ve `SW_VERSION` `20260928b` kaldığı için PWA önbelleği eski KAO dosyalarını sunuyordu → pin **`20260929d`**'ye yükseltildi |
| 5 | Pin commit `0ee2a018` + push | `3b0fcb6f..0ee2a018` |
| 6 | Pages run **36586684295** | validate + deploy **success** |
| 7 | Canlı doğrulama | 5/5 dosya **bayt-eş**, pinler `20260929d`, özel malzeme 404 |

## Canlı (doğrulandı)
- Taban: `https://mustafaras.github.io/s/`
- Commit: `0ee2a01881445e746837a24a73c564626afd93ac` (dal ve `main` eşit)
- Pinler: `kaoRuntime=20260929d` · `swVersion=20260929d`
- Bayt-eş dosyalar: `app/core/quranLearn.js`, `app/core/quranLearnFlow.js`,
  `app/core/quranLearnViews.js`, `app/kao.css`, `sw.js`
- Yayında **olmayan** (beklendiği gibi 404): `kuran-ogreniyorum-v2/KAO2-STATE.json`,
  `tests/kao/test_kao2_grammar_notes.js`

## Temizlik (aynı yayında)
- `app/core/quranLearnFlow 2.js` dâhil **51 düzenleyici çakışma kopyası** silindi
  (`* 2.js` / `* 2.md`). Hiçbiri git'te takipli değildi; 51/51 ilgili dosyayla
  **birebir aynı** olduğu hash ile doğrulandı. Kopya dosya K-1 runtime bütçesini
  şişirip `test_kao2_perf_budget.js`'i kırıyordu.

## Kapılar (yayın sonrası koşuldu)
KAO 31/31 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders ·
driver · zikr 95/95 · contrast 594 çift / 0 ihlal · perf PASS · `kao2-sync-check` PASS.

## Kanıt düzeyleri
- Kaynak/test: **PASS** · Yayın/run/hash: **PASS** · **Cihaz kabulü: doğrulanmadı**
  (kullanıcıya ait; headless test cihaz doğrulamasının yerine geçmez).

## Sınır
Bu izin KAO2-15'e kadardır. **KAO2-16 ve sonrası için yeni açık kullanıcı talimatı
gerekir.** Makine kaydı: `release-live.json` + `KAO2-STATE.json.releaseApprovalRecord`.
