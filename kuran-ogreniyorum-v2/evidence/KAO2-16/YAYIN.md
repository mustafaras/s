# KAO2-16 — Yayın kaydı (canlı)

Tarih: 2026-09-29 · Dal: `kao2-yeniden-tasarim` · Yayın: GitHub Pages

## Kapsam
Kullanıcı 2026-09-29'da "tam ve kusursuz uygulandığından emin ol ve canlıya al"
diyerek KAO2-16'nın yayınlanmasına açık onay verdi. Kapsam: dal push, `main`'e
fast-forward, Pages yayını ve canlı doğrulama.

## Adımlar
| # | İşlem | Sonuç |
|---|---|---|
| 1 | Kapı turu (yayın öncesi) | KAO 33/33 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/kontrast/perf/sync PASS |
| 2 | **Pin yükseltmesi** `20260929d → 20260929e` | `quranLearn.js` değiştiği için zorunlu; 9 dosya + `tests/kao` sözleşmesi |
| 3 | Pin sonrası kapılar | KAO 33/33 · app 77/77 · panel 23/23 PASS |
| 4 | Dal push + `main` fast-forward | `6dae1c9c..cbd07c51` |
| 5 | Pages run **36593068552** | validate + deploy **success** |
| 6 | Canlı doğrulama | 6/6 dosya **bayt-eş**, pinler `20260929e`, özel malzeme 404 |

## Canlı (doğrulandı)
- Taban: `https://mustafaras.github.io/s/` · commit `cbd07c51` (dal ve `main` eşit)
- Pinler: `kaoRuntime=20260929e` · `swVersion=20260929e`
- Bayt-eş: `quranLearn.js`, `quranLearnFlow.js`, `quranLearnViews.js`, `kao.css`,
  `sw.js`, `index.html`
- Yayında **yok** (beklendiği gibi 404): `kuran-ogreniyorum-v2/KAO2-STATE.json`,
  `tests/kao/test_kao2_milestones.js`

## Bu yayında değişen kullanıcı davranışı
- **Fâtiha taşı artık gerçek Fâtiha'yı gerektiriyor** (23 doğrulanmış lemma). Eskiden
  yalnız sıklık dilimi yetiyordu; Fâtiha bilmeden taş kazanılabiliyordu.
- **Namaz taşı** tüm namaz metinlerine bağlı (35 lemma).
- **Yeni taşlar:** "Besmele'yi okudum" (S0.12 ∨ yerleştirme ≥7/8) ve 12 ünite taşı.
- Mevcut kullanıcı verisi kayıpsız taşınır; eski taş kayıtları korunur.

## Kapılar (yayın sonrası)
KAO 33/33 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders ·
driver · zikr · kontrast · perf PASS · `kao2-sync-check` PASS.

## Kanıt düzeyleri
- Kaynak/test: **PASS** · Yayın/run/hash: **PASS** · **Cihaz kabulü: doğrulanmadı**

## Sınır
İzin KAO2-16'ya kadardır. **KAO2-17 ve sonrası için yeni açık talimat gerekir.**
Makine kaydı: `release-live.json` + `KAO2-STATE.json.releaseApprovalRecord`.
