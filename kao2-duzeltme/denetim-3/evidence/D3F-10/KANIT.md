# D3F-10 — F-10: bayat önbellek pinleri yükseltildi; pin tazeliği artık testle zorunlu

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-10

## Kök neden
CLAUDE.md kural 5 ("değişen her dosyanın `?v=`'si yükseltilir") araçla sınanmıyordu. Rapor 4 dosya saydı
(`state.js`, `zikir.js`, `skyFx.js`, `panelCoverageManifest.js`). Tarayıcı ve service worker önbelleği URL'ye göre çalıştığı için aynı
`?v=` eski içeriği sunabilir; önceden kurulmuş çevrimdışı paket de eski sürümde kalabilir.

## Ölçüm
Genel değişmez: index.html, panel-v2.html ve sw.js'teki her benzersiz `<dosya>?v=<pin>` URL'si (60 adet) için, URL'nin **herhangi bir**
host'ta ilk göründüğü commit'ten sonra dosya değişmiş mi? İlk ölçümüm host başına ayrı bakıyordu. Bu, sw.js kopyalarını (sonradan eklendikleri
için) yanlışlıkla taze gösterir; önbellek URL'ye göre çalıştığından ölçüt URL bazına çekildi. Sonuç **6 bayat URL**:

| URL | pin konduğu commit | sonraki değişiklik |
|---|---|---|
| `manifest.json?v=20260730f` | `e09c5e6b` | `c1f9daca` (08-22): ikon yolları `assets/` altına taşındı |
| `app/core/state.js?v=20260910b` | `47a9575a` | 3 commit, son `4d71eb19` (09-24, KAO-07) |
| `app/core/zikir.js?v=20260915a` | `98e51a8a` | `45d9ce40` (09-20) |
| `app/core/skyFx.js?v=20260909a` | `856400a6` | 7 commit, SKY-03…09 (09-09) |
| `panel/panelCoverageManifest.js?v=20260926a` | `9f604a87` | `4e8a778d` (09-30, KAO2-25) |
| `panel/v2/panel-v2.js?v=20260812c` | `c1f9daca` | `833e84d2` (09-21, IIP-15) |

Raporun 4'üne ek iki gerçek bulgu var: `manifest.json` (eski önbellek artık var olmayan ikon yollarını gösterebilir) ve `panel-v2.js`.

## Yapılan
- **Test:** `tests/app/test_asset_pin_freshness.js` (yeni; `kapilar.sh` `tests/app` ailesinde koşar, ~7 sn). Yukarıdaki değişmez.
  Commit'lenmemiş dosya değişikliği bayat sayılır; commit'lenmemiş yeni pin tazedir. Git yoksa ya da klon sığsa açık SKIP yazar.
- **Pin:** yayın pini `20261008b` → **`20261008c`** (kullanıcı kararı: her düzeltme kendi pini): index.html, sw.js
  (`SW_VERSION`, `SW_OFFLINE_VERSION`), panel-v2.html, 12 pin testi, `D3F-STATE.pins.release`.
  6 bayat URL de `?v=20261008c` oldu (index.html, sw.js, panel-v2.html'deki tüm kopyaları).
- Dosyaların içeriği değişmedi; yalnız URL'leri değişti.

## Bilerek değişen testler
- `tests/panel-v2/test_panel_v2_performance.js`: `panel-v2.js?v=20260812c` → `?v=20261008c` (test eski pini sabitliyordu).
- 12 pin testi: `20261008b` → `20261008c`.

## TDD
- RED: `bayat önbellek pini … 6 satır` (yukarıdaki tablo).
- GREEN: `PASS  60 benzersiz ?v= bağlantısı taze`.
- Sürüm dizgisine bakan 18 test ok · panel-v2 ailesi 27/27 · `run-seyma/driver.mjs` rc=0 · `zikr-harness.mjs` rc=0.
- Mutasyon (commit'ten sonra): `bash kao2-duzeltme/denetim-3/evidence/D3F-10/pin-mutasyon.sh` → sonuç aşağıda "Commit sonrası".

## Sınır
- Değişmez yalnız bu üç host dosyasındaki `?v=` bağlantılarını kapsar; `panel.html` (eski panel) ve `v3-tanitim/` kapsam dışı.
- Pin URL'si bir kez kaldırılıp sonra yeniden eklenirse "ilk görünüş" en eski commit sayılır (temkinli: bayat görünebilir, taze görünmez).

## Kanıt düzeyleri
kaynak/test ✓ · yayın → sonraki YAYIN kaydı · canlı → sonraki YAYIN kaydı · cihaz — (PWA önbelleği yeni `SW_VERSION` ile yenilenir; cihazda doğrulama kullanıcıda)

## Commit sonrası (b828aaea, temiz ağaç)
- Mutasyon `pin-mutasyon.sh` **6/6 PASS**: M0 yeşil · M1 state.js eski pin (commit'li) kırmızı · M2 commit'lenmemiş dosya değişikliği kırmızı · M3 pinsiz commit kırmızı · M4 pin yükseltilince taze · M5 sığ klon açık SKIP.
- Hızlı set **12/12 PASS**:
```
[17:42:59] PASS 8s kao-plan-check :: kao-plan-check: PASS (0 warn)
[17:42:59] PASS 0s fix-sync :: KAO2-FIX senkron: PASS · 44/44 prompt done · nextPrompt none · ledger seq 127 · App.kao* 45 · pin 20261007b (dondurulmuş
[17:43:00] PASS 1s d2f-strict :: D2F senkron: PASS · 16/16 prompt done · nextPrompt none · ledger seq 26 · N 9/9 pass · App.kao* 45 · yüzey 766 · atama 6
[17:43:03] PASS 3s pin-tazeligi :: asset pin freshness: PASS (1 kontrol)
[17:43:04] PASS 1s pages-kayit :: pages-kayit: PASS — 4/4 run kayıtlı (dönem cbe0d604..128ab06d)
[17:43:05] PASS 1s mut D3F-03 :: kapilar mutasyon: 5/5 PASS
[17:43:21] PASS 16s mut D3F-04 :: d2f mutasyon: 8/8 PASS
[17:43:43] PASS 22s mut D3F-06 :: d3f06 mutasyon: 7/7 PASS
[17:43:58] PASS 15s mut D3F-07 :: d3f07 mutasyon: 10/10 PASS
[17:44:07] PASS 9s mut D3F-08 :: d3f08 mutasyon: 5/5 PASS
[17:44:27] PASS 20s mut D3F-09 :: d3f09 mutasyon: 6/6 PASS
[17:45:06] PASS 39s mut D3F-10 :: d3f10 mutasyon: 6/6 PASS
```
