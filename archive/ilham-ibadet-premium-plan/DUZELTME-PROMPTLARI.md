# IIP-24 sonrası kusur kapatma programı — süper odaklı sıralı promptlar

**Tarih:** 2026-09-22 · **Denetim HEAD:** `bc4372f` ("chore(iip-22): close evidence and state gates")
**Durum:** ⛔ Program "24/24 done" beyan ediyor, ancak **doğrulanabilir değil**.
**Bu dosya:** denetimde bulunan 10 kusur sınıfının sıralı, bağımsız, tek-oturumluk düzeltme promptları.

> Bu dosya **uygulama izni değildir**. Her prompt tek başına, kullanıcı o oturumda o promptu seçtiğinde çalıştırılır. Commit/push/merge/tag/deploy bu promptlarla yetkili değildir (P16 hariç, o da yalnız kullanıcı açıkça isterse).

---

## 0. Neden bu dosya var — denetim kanıtı

Kod ve test değiştirilmedi; yalnız okundu ve çalıştırıldı. Ölçülen sonuçlar:

| Kontrol | Sonuç | Kanıt komutu |
|---|---|---|
| `plan-check.mjs` | **FAIL / exit 1** — `card contract drift IIP-24` | `node ilham-ibadet-premium-plan/tools/plan-check.mjs` |
| `plan-check.mjs --self-test` | **FAIL / exit 1** — "Self-test requires structurally valid baseline" | aynı araç, `--self-test` |
| `plan-check.integration.py` | **FAIL / exit 1** — `FileExistsError` (satır 12) | `python3 ilham-ibadet-premium-plan/tools/plan-check.integration.py` |
| `tests/app` | **60 PASS / 13 FAIL** | bkz. §0.1 |
| `tests/app/test_iip_*` | **10 PASS / 6 FAIL** | — |
| `tests/panel` | 23/23 PASS | — |
| `tests/panel-v2` | 27/27 PASS | — |
| `tests/quran` | 8/9 PASS | `test_quran_striking_verses.js` FAIL |
| geniş regresyon (saygi/prayer/zikir/quran boundary, driver, shell-gate) | PASS | — |

### 0.1 Başarısız 13 fixture (exit 1)

```
tests/app/test_iip_03.js
tests/app/test_iip_05.js
tests/app/test_iip_06.js
tests/app/test_iip_09.js
tests/app/test_iip_12.js
tests/app/test_iip_13.js
tests/app/test_app_surface_boot_boundary.js
tests/app/test_app_surface_domain_boundary.js
tests/app/test_app_surface_lifecycle_boundary.js
tests/app/test_app_surface_overlay_boundary.js
tests/app/test_header_celestial_timeline.js
tests/app/test_header_night_contrast.js
tests/app/test_v3_welcome.js
tests/quran/test_quran_striking_verses.js   (ayrı aile)
```

### 0.2 Kök neden — programın önleyemediği tek şey

**IIP-20 ve IIP-21, önceki kartların dosyasına (`app/core/saygi.js`) yazdı ama önceki kartların gate'lerini yeniden koşmadı.**

| Eklenen kod | Satır | Kart | Commit |
|---|---|---|---|
| `App.saygiReader=` | `app/core/saygi.js:153` | **IIP-20** | `8449cc2` |
| `function iip21Root(){ ... d.programs=... }` | `app/core/saygi.js:586` | **IIP-21** | `de59f03` |

IIP-12'nin kendi commit'i `705fc13`'te bu kod **yoktu** → o an IIP-12 testi geçiyordu. Bugün geçmiyor. Programda "aynı dosyaya sonradan yazan kart, önceki kartların fixture'larını yeniden koşar" kuralı/aracı yok; bu yüzden regresyon sessizce birikti.

### 0.3 Kanıt zinciri dürüstlük sorunu (ağır)

`evidence/IIP-12/source.json` ve `evidence/IIP-13/source.json` şu komutları **`exitCode: 0`** olarak kaydetmiş:

```
0 node tests/app/test_iip_12.js
0 node tests/app/test_saygi_boundary.js
0 node tests/app/test_zikir_boundary.js
...
status: pass
```

Aynı komutlar bugün **exit 1** veriyor. Ayrıca `plan-check.mjs`, `--self-test` ve `plan-check.integration.py` kayıtlarda `exitCode: 0` görünse de bugün üçü de exit 1. Kanıt makbuzları **denetlenebilir değil** — bu, planın kendi REQ-048 ilkesinin ("sahte done denetimle yakalanır") ihlalidir.

### 0.4 Denetim raporumdaki DÜZELTME (önemli)

İlk raporda "cache-bust eklenmiş ama eşlenmemiş" demiştim. Git geçmişi bunu **kısmen yanlış** çıkardı:

- `index.html` **doğru**: `appSurface.js?v=20260921c` (commit `9a2674a` bump'ladı), `styles.css?v=20260922a` (commit `3df00c8` bump'ladı), `app.js?v=20260921e`.
- **Bayat olan test pinleridir**: fixture'lar hâlâ `appSurface.js?v=20260921b` ve `styles.css?v=20260921f` bekliyor.

Yani doğru düzeltme **`index.html`'i düşürmek değil, test pinlerini gerekçeli güncellemektir**. P01 bunu yapar. (Planın kendi kuralı: "pinleri körlemesine yenilemek yasaktır" — bu yüzden her pin için gerçek fark açıklanır.)

### 0.5 Diğer kusurlar

| # | Kusur | Kanıt |
|---|---|---|
| A | Cihaz çelişkisi | `IIP-STATE.json` → `deviceAcceptance: not_verified`; `evidence/IIP-23/visual.json` → `status: pass`, deviceMatrix "user-confirmed" |
| B | p50/p95 ölçülmedi | `evidence/IIP-23/visual.json` → `performance: "not measured: 5 warmup + 30 samples p50/p95"`; hedef ≤200 ms |
| C | IIP-24 kart sözleşmesi sapması | Denetleyici "drift" diyor; fark yalnız fazladan boş satırlar |
| D | Test yanlış-pozitifi | `App\.[A-Za-z0-9_]+\s*=` regex'i `window.App.saygiReader==='function'` içindeki `==`'in ilk `=`'ini yakalıyor |
| E | IIP-12 kendi kendisiyle çelişik | "yeni kalıcı alan yok → `days,quranJourney,saygi`" derken IIP-20/21 meşru şekilde `bookmarks`/`reader`/`programs` ekledi |
| F | IIP-03 payda bekçisi bayat | `panel/panel.js:622` artık `max:null` kullanıyor; test `max:days*6` arıyor |
| G | `--self-test` yapısal bozuk | `validate(..., checkFiles=false)` kanıt dosyalarını yine diskten okuyor → hiç geçemez |
| H | `.integration.py` çalışmıyor | `e.mkdir()` mevcut dizinde `FileExistsError` |
| I | Program kök dokümanlara işlenmemiş | `AGENTS.md`/`CLAUDE.md`/`docs/GELISTIRME-PLANI.md`/`tests/README.md`'de sıfır IIP referansı |
| J | 7 commit'siz dosya | `IIP-STATE.json`, `cards/IIP-24.md`, 3 tracking dosyası, `evidence/IIP-23/`, `evidence/IIP-24/` |

---

## 1. Ortak kurallar (her promptta geçerli)

1. **CWD** `/Users/m_ras/Desktop/seyma`. Yalnız seçili promptu uygula; dosyayı okumak yetki değildir.
2. **Başlamadan:** `git -c core.fsmonitor=false status --short --branch` ve `git -c core.fsmonitor=false log -1 --format='%H%n%s'`. Canlı HEAD kullan; mevcut dirty dosyaları koru.
3. **Veri güvenliği (kök AGENTS.md):** gerçek token/localStorage/kişisel veri yok; `mustafaras/seyma-data`'ya yazma yok. Tarayıcı/server yalnız ayrı yetkili kontrollü QA (127.0.0.1:9000).
4. **Commit/push/merge/tag/deploy yok** — yalnız kullanıcı o oturumda açıkça isterse.
5. **Kanıt dürüstlüğü:** bir testin exit kodunu "pass" yazmadan önce **gerçekten çalıştır**. Bayat/iddia edilen sonucu kanıt olarak kaydetme. Exit kodunu pipeline ile gizleme (`$?` ayrıca oku).
6. **Pin disiplini:** bir fixture beklentisini güncellemeden önce **gerçek farkı açıkla**, davranış kontratını bağımsız doğrula, sonra yalnız yetkili beklenen değeri güncelle. Körlemesine pin yenileme yasak.
7. **Kapsam:** yalnız promptta listelenen dosyalara dokun. Yeni kapsam gerekiyorsa dur, kullanıcıya yaz.
8. **Kapanış:** değişen dosyalar, çalıştırılan komutlar + **gerçek exit kodları**, kalan engel. Sonraki promptu kendiliğinden başlatma.

---

## 2. Sıralı çalışma listesi

**Dalga 0 — Doğruluk tabanı**
1. **P00** — Denetim baseline'ını dondur (salt-okur)

**Dalga 1 — Kırmızıyı yeşile çevir (test pinleri; üretim kodu DEĞİŞMEZ)**
2. **P01** — Cache-bust pin güncellemesi (6 fixture)
3. **P02** — `test_iip_12/13` yanlış-pozitif regex düzeltmesi
4. **P03** — `test_iip_12` alan listesi revizyonu
5. **P04** — `test_iip_03` payda bekçisi revizyonu
6. **P05** — `tests/quran/test_quran_striking_verses.js` onarımı

**Dalga 2 — Gerçek davranış kusurları (üretim kodu)**
7. **P06** — `saygi.js` render mutasyonu (`iip21Root` okuma yolu saf olmalı)
8. **P07** — IIP-05/06/09 gate'lerinin gerçek kapsam doğrulaması

**Dalga 3 — Kanıt ve state dürüstlüğü**
9. **P08** — Kanıt makbuzlarının exit-kodu gerçeğiyle uzlaştırılması
10. **P09** — IIP-24 kart sözleşmesinin normalize edilmesi
11. **P10** — IIP-24 `visual` gate + `deviceAcceptance` uzlaştırması

**Dalga 4 — Altyapı onarımı (plan-check araçları)**
12. **P11** — `plan-check.mjs --self-test` kusuru
13. **P12** — `plan-check.integration.py` `FileExistsError`
14. **P13** — Kök-neden önleyici: "kardeş kart regresyonu" kapısı

**Dalga 5 — Cihaz, yayın ve entegrasyon**
15. **P14** — p50/p95 ölçüm protokolü ve cihaz kanıtı çelişkisi
16. **P15** — Programın kök dokümanlara işlenmesi
17. **P16** — Commit'siz 7 dosyanın karara bağlanması

**Dalga 6 — Kapanış**
18. **P17** — Tam regresyon ve yayın adayı yeniden beyanı

---

## P00 — Denetim baseline'ını dondur

**Amaç:** Sonraki tüm düzeltmelerin karşılaştırılacağı, tartışmasız bir "önce" tablosu üret. Kod değiştirme.

**Adımlar**
1. Tüm aileleri koş, her fixture'ın **gerçek exit kodunu** kaydet:
   - `tests/app/test_*.js`, `tests/panel/test_*.js`, `tests/panel-v2/test_panel_v2_*.js`, `tests/quran/test_*.js`
   - `node ilham-ibadet-premium-plan/tools/plan-check.mjs` (+ `--self-test`)
   - `python3 ilham-ibadet-premium-plan/tools/plan-check.integration.py`
   - `node .claude/skills/run-seyma/driver.mjs`, `zikr-harness.mjs`
   - `node tools/shell-inventory.mjs --gate`
2. Sonucu `evidence/DENETIM-BASELINE.md` (yeni dosya, program kanıtı değil, denetim notu) olarak yaz: fixture | exit | kısa hata.
3. `git status --short` çıktısını da ekle (7 dirty dosya).

**Dokunulacak dosyalar:** yalnız yeni `ilham-ibadet-premium-plan/evidence/DENETIM-BASELINE.md`. **Üretim ve test dosyası değişmez.**

**Bitiş koşulu:** Tablo tam; sayılar bu dosyanın §0'ıyla tutarlı (sapma varsa sapmayı yaz).

**Durma koşulu:** Hiçbir düzeltmeye başlama.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P00 uygula. Kod değiştirme. tests/app, tests/panel, tests/panel-v2, tests/quran ailelerini ve plan-check (+ --self-test), plan-check.integration.py, driver.mjs, zikr-harness.mjs, shell-inventory --gate komutlarını koşup her birinin GERÇEK exit kodunu kaydet. Sonucu ilham-ibadet-premium-plan/evidence/DENETIM-BASELINE.md dosyasına tablo olarak yaz (fixture | exit | kısa hata) ve git status --short çıktısını ekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P01 — Cache-bust pin güncellemesi (6 fixture)

**Amaç:** Bayat **test pinlerini** canlı gerçekle hizala. `index.html` doğru; `index.html`'e dokunma.

**Kanıt (git geçmişinden)**
- `index.html`: `app/core/appSurface.js?v=20260921c` — commit `9a2674a` ("feat(ui): redesign header celestial timeline") bump'ladı.
- `index.html`: `app/styles.css?v=20260922a` — commit `3df00c8` ("fix(iip): refine prayer and Hijri reading UI") bump'ladı.
- `index.html`: `app.js?v=20260921e`.
- Fixture'lar hâlâ `appSurface.js?v=20260921b` ve `styles.css?v=20260921f` bekliyor → **bayat**.

**Etkilenen fixture'lar ve pinleri**
| Fixture | Bayat beklenti | Canlı değer |
|---|---|---|
| `test_app_surface_domain_boundary.js` | `appSurface?=20260921b` | `20260921c` |
| `test_app_surface_lifecycle_boundary.js` | `appSurface?=20260921b` | `20260921c` |
| `test_app_surface_overlay_boundary.js` | `appSurface?=20260921b` | `20260921c` |
| `test_app_surface_boot_boundary.js` | (doğrula: "data rebinds stay out of the registry and production cache-bust is paired" assertion) | canlı değer |
| `test_header_celestial_timeline.js` | `styles.css?=20260921f` | `20260922a` |
| `test_header_night_contrast.js` | "stylesheet cache sürümü yükseltildi" | canlı değer |
| `test_v3_welcome.js` | `appSurface?=20260921b` | `20260921c` |

**Adımlar**
1. Her fixture'ın pin assertion'ını oku (`grep -n "v=2026"`).
2. Her pin için **gerçek farkı tek satır yaz**: hangi commit hangi varlığı bump'ladı, neden (ör. `9a2674a` appSurface'i değiştirdi → sürüm `c`'ye çıktı; test `b`'de kalmış).
3. Kanıtla ki **sürüm artışı meşru**: `git show <commit> --stat -- app/core/appSurface.js` (ilgili varlık gerçekten değişmiş olmalı).
4. Pinleri güncelle. `index.html`'e **dokunma**.
5. Her fixture'ı koş, exit 0 bekle.

**Bitiş koşulu:** 6 fixture exit 0; her pin güncellemesi için gerekçe yazılı.

**Durma koşulu:** Bir varlık gerçekten değişmemişse (yani bump yanlışsa) — dur ve yaz; `index.html`'i düzeltme, kullanıcıya sor.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P01 uygula. index.html'e DOKUNMA — orası doğru (appSurface 20260921c, styles.css 20260922a, app.js 20260921e). Bayat olan TEST pinlerini güncelle: tests/app/test_app_surface_{domain,lifecycle,overlay,boot}_boundary.js, test_header_celestial_timeline.js, test_header_night_contrast.js, test_v3_welcome.js. Her pin için önce git show <commit> --stat ile sürüm artışının meşru olduğunu DOĞRULA ve gerekçeyi tek satır yaz; sonra beklenen değeri güncelle. Ardından 6 fixture'ı koş, exit 0 bekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P02 — `test_iip_12/13` yanlış-pozitif regex düzeltmesi

**Amaç:** Bekçinin `==` karşılaştırmasını yanlışlıkla "App ataması" sanmasını engelle.

**Kanıt**
- `tests/app/test_iip_12.js:307` → `!/App\.[A-Za-z]+\s*=/.test(src)`
- `tests/app/test_iip_13.js` → aynı desen
- `app/core/saygi.js:153` içinde yalnız **meşru okuma** var: `typeof window.App.saygiReader==='function'`
- Regex `=` işaretini `==`'in ilk karakteriyle eşliyor → sahte FAIL.

**Adımlar**
1. Her iki fixture'da regex'i `=(?!=)` (veya `==={0,1}` değil, atama için `=(?!=)`) yapacak şekilde düzelt; **kapsamı dar tut**, başka assertion'ı bozma.
2. Bekçinin gerçek amacını doğrula: `app/core/saygi.js` gerçekten `App.<ad> =` (yeni handler) atamıyor mu? Kanıt: `grep -nE "App\.[A-Za-z0-9_]+\s*=(?!=)" app/core/saygi.js` → boş olmalı.
3. Mutasyonla doğrula: geçici olarak `saygi.js`'e bir `App.testX=1` ekleyip fixture'ın **yakaladığını** gör, sonra geri al.

**Bitiş koşulu:** `test_iip_12.js` ve `test_iip_13.js` bu assertion'da PASS; mutasyon testi bekçinin çalıştığını kanıtlıyor.

**Durma koşulu:** `saygi.js` gerçekten atama içeriyorsa — bu P06'nın konusu; dur ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P02 uygula. tests/app/test_iip_12.js ve test_iip_13.js içindeki `App\.[A-Za-z0-9_]+\s*=` bekçi regex'i `window.App.saygiReader==='function'` gibi MEŞRU karşılaştırmaları yanlış yakalıyor. Regex'i atamayı gerçekten ayırt edecek şekilde (`=(?!=)`) düzelt, kapsamı dar tut. Sonra grep -nE ile app/core/saygi.js'te gerçek App ataması OLMADIĞINI kanıtla. Mutasyon testi yap: saygi.js'e geçici `App.testX=1` ekle, fixture'ın yakaladığını gör, geri al. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P03 — `test_iip_12` alan listesi revizyonu

**Amaç:** IIP-12'nin kendi kendisiyle çelişen "yeni kalıcı alan yok" beklentisini gerçek kontratla hizala.

**Kanıt**
- `tests/app/test_iip_12.js:262` → `Object.keys(data).sort().join(',') === 'days,quranJourney,saygi'`
- Bugünkü gerçek: `days,programs,quranJourney,saygi,bookmarks,reader` (IIP-20 `bookmarks`/`reader`, IIP-21 `programs` ekledi — ikisi de **meşru ve onaylı**, `app/core/state.js:316,331,354` migration'larıyla).
- IIP-12'nin amacı "render yeni alan **açmasın**" idi; sonraki kartların bilinçli şema genişletmesi bu amacı ihlal etmiyor.

**Adımlar**
1. Testin amacını yeniden ifade et: **davranış** = "IIP-12 render fonksiyonları `data`'ya yeni alan eklemez / mevcut alanları mutasyona uğratmaz".
2. Beklentiyi iki parçaya ayır:
   - **Mutasyon yok:** `before === after` (render öncesi/sonrası) — bu zaten doğru test.
   - **Alan listesi:** sabit `'days,quranJourney,saygi'` yerine **bilinen şema kümesini** temsil eden bir kontrol kullan (ör. allowlist: `days, quranJourney, saygi, bookmarks, reader, programs`) ve yanına yorum: "IIP-20/21 ile onaylı genişleme".
3. `bookmarks`/`reader`/`programs` şema alanlarının **state.js migration'ında** tanımlı olduğunu kanıtla (satır referansı yorum olarak ekle).
4. Fixture'ı koş.

**Bitiş koşulu:** `test_iip_12.js` exit 0; "yeni kalıcı alan" kontrolü artık şema allowlist'i ile ifade edilmiş ve gerekçesi yazılı.

**Durma koşulu:** `bookmarks`/`reader`/`programs` gerçekten IIP-20/21 dışı bir kaynaktan geliyorsa — dur ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P03 uygula. tests/app/test_iip_12.js:262'deki `Object.keys(data)=== 'days,quranJourney,saygi'` beklentisi kendi kendisiyle çelişiyor: IIP-20 bookmarks/reader, IIP-21 programs alanlarını MEŞRU ve onaylı şekilde ekledi (app/core/state.js:316,331,354). Testin ASIL amacı "render data'yı mutasyona uğratmaz" — o kontrolü (before===after) koru. Alan listesi kontrolünü bilinen şema allowlist'i (days,quranJourney,saygi,bookmarks,reader,programs) olarak güncelle ve migration satır referanslarını yorum olarak ekle. Fixture'ı koş, exit 0 bekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P04 — `test_iip_03` payda bekçisi revizyonu

**Amaç:** Bayat pin'i güncel kontratla hizala.

**Kanıt**
- `tests/app/test_iip_03.js:40-41` → `check(panel.includes('max:days*6'), 'panel weekly denominator remains unchanged and is documented as unresolved')`
- `panel/panel.js:622` bugün: `return {prays, max:null, rate:null, denominatorReliable:false, sourceRecords, ...}` — yani `max` **bilinçli olarak `null`**, güvenilmez payda bastırılıyor.
- `panel/panel.js:633` → `denominatorReliable:false, rate:null, compatibilityLabel:'Payda bilinmiyor · uyum yüzdesi hesaplanmadı'`
- Yani davranış **iyileşti** (sahte payda kaldırıldı); test eski metni arıyor.

**Adımlar**
1. `panel/panel.js`'te payda davranışının gerçek kontratını oku (satır 620-635).
2. Testi iki kontrole böl:
   - **App tarafı (değişmedi):** `saygi.js` `denominatorReliable:false` yayıyor mu?
   - **Panel tarafı (güncellendi):** panel de aynı bayrağı `false` yayıyor ve oran üretmiyor mu? (`max:null` + `rate:null` + açıklama metni)
3. Bayat `max:days*6` beklentisini bu yeni kontratla değiştir; gerekçeyi yorum olarak yaz.
4. Fixture'ı koş.

**Bitiş koşulu:** `test_iip_03.js` exit 0; panel ve app aynı "payda bilinmiyor" sözleşmesini doğruluyor.

**Durma koşulu:** Panel'de hâlâ bir yerde hesaplanmış oran varsa — dur ve yaz (bu gerçek kusur olur).

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P04 uygula. tests/app/test_iip_03.js:40 'max:days*6' bayat pin — panel/panel.js:622 artık bilinçli olarak max:null, rate:null, denominatorReliable:false yayıyor ve satır 633'te 'Payda bilinmiyor · uyum yüzdesi hesaplanmadı' diyor. Testi gerçek kontrata göre güncelle: app ve panel AYNI 'payda bilinmiyor' sözleşmesini doğrulasın (oran üretilmiyor). Gerekçeyi yorum olarak yaz. Önce panel'de hesaplanmış oran KALMADIĞINI kanıtla. Fixture'ı koş, exit 0 bekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P05 — `tests/quran/test_quran_striking_verses.js` onarımı

**Amaç:** Kuran ailesindeki tek başarısız fixture'ı incele ve onar.

**Adımlar**
1. Fixture'ı koş, **tam** hata çıktısını oku (assertion + beklenen/gerçek).
2. Kaynağı belirle: bayat pin mi (versiyon/sayı), yoksa gerçek veri kontratı ihlali mi?
3. `app/content/quranStrikingVersesV1.js` değişti mi? `git log -3 -- app/content/quranStrikingVersesV1.js`
4. Kusur bayat pinsa → pin disipliniyle güncelle (gerekçe yaz). Gerçek ihlalse → kodu düzelt.
5. `tests/quran/` ailesini bütün olarak koş (9/9 beklenir).

**Bitiş koşulu:** `tests/quran` 9/9 exit 0; neden (pin/kod) yazılı.

**Durma koşulu:** İhlal içerik doğruluğunu etkiliyorsa (âyet metni/insan doğrulaması) — uydurma; dur ve kullanıcıya yaz (plan: "yeni içerik ihtiyacı insan incelemesi ister").

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P05 uygula. tests/quran/test_quran_striking_verses.js şu an exit 1 (Kuran ailesi 8/9). Tam hata çıktısını oku, bayat pin mi gerçek kontrat ihlali mi olduğunu belirle (git log ile app/content/quranStrikingVersesV1.js geçmişini kontrol et). Bayat pinsa gerekçeli güncelle; gerçek ihlalse kodu düzelt. İçerik doğruluğu/insan doğrulaması gerekiyorsa UYDURMA — dur ve bildir. Sonunda tests/quran 9/9 exit 0 bekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P06 — `saygi.js` render mutasyonu (`iip21Root` okuma yolu saf olmalı)

**Amaç:** IIP-12'nin gerçek regresyonunu düzelt: render fonksiyonu `data`'yı mutasyona uğratıyor.

**Kanıt**
- `tests/app/test_iip_12.js` → `FAIL odak render data'yı değiştirmez` ve `FAIL yeni kalıcı alan açılmaz → ...programs`
- `app/core/saygi.js:586`:
  ```js
  function iip21Root(){ var d=stateData(); if(!d)return null; if(!d.programs||typeof d.programs!=='object'||Array.isArray(d.programs))d.programs={schemaVersion:1,items:{}}; ... return d.programs; }
  ```
  → IIP-21 commit'i `de59f03`.
- Bu fonksiyon **okuma** yolunda çağrılıyor; `data.programs` yokken **yazıyor** → IIP-12 render-salt-okur kontratı ihlal.

**Adımlar**
1. `iip21Root`'un çağrı yerlerini bul: `grep -n "iip21Root" app/core/saygi.js`
2. Her çağrı yerini sınıfla: **okuma yolu mu** (render/HTML üretimi) yoksa **yazma yolu mu** (kullanıcı eylemi, kayıt)?
3. Okuma yollarında mutasyonu kaldır:
   - `stateData()` `null` ise veya `programs` yoksa → **okuma için** `null` (veya boş, salt-okur bir görünüm) döndür, `d.programs=...` **yazma**.
   - Yazma gerekiyorsa bunu `App.*` komut yoluna taşı (kullanıcı eylemi), render'dan uzak tut.
4. **Kapsam kısıtı:** `app.js` bu kartın allowlist'inde değil. Yeni `App.*` üyesi gerekiyorsa — dur ve kullanıcıya yaz (App yüzeyi pinli).
5. `programs` alanının salt-okur varlığını koru: veri varsa oku ve göster; yoksa dürüst boş hâl.
6. Koş: `test_iip_12.js`, `test_iip_21.js`, `test_iip_20.js`, `test_saygi_boundary.js`, `test_iip_13.js`.

**Bitiş koşulu:** IIP-12 render-salt-okur kontrolü PASS; IIP-20/21 fixture'ları da PASS (yolculuk özelliği bozulmadı).

**Durma koşulu:** Düzeltme `App.*` yüzeyini değiştirmeyi gerektiriyorsa — kapsam genişletme onayı iste, uygulama.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P06 uygula. Gerçek kusur: app/core/saygi.js:586 iip21Root() OKUMA yolunda çağrılıyor ama data.programs yoksa YAZIYOR (IIP-21, commit de59f03) → IIP-12'nin 'render data'yı değiştirmez' kontratını bozuyor. iip21Root çağrılarını sınıfla (okuma vs yazma). Okuma yollarında mutasyonu kaldır: programs yoksa salt-okur null/boş dön, yazma. Yazma gerekiyorsa App.* komut yoluna taşı — ama app.js bu kartın allowlist'inde DEĞİL; yeni App.* üyesi gerekiyorsa DUR ve onay iste. Sonra koş: test_iip_12, test_iip_21, test_iip_20, test_saygi_boundary, test_iip_13. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P07 — IIP-05/06/09 gate'lerinin gerçek kapsam doğrulaması

**Amaç:** Üç fixture'ın kapsam bekçileri kırmızı. Hangisi sahte (regex/pin), hangisi gerçek ihlal — ayır ve kapat.

**Kanıt**
- `test_iip_05.js` → `FAIL scope contract: no App assignment or migration change was introduced`
- `test_iip_06.js` → `FAIL scope contract: no migration, App assignment or live data behavior was added`
- `test_iip_09.js` → `FAIL scope contract: no migration/storage/network behavior was added`

**Adımlar**
1. Her fixture'ın kapsam bekçisinin **tam ifadesini** oku (dosya adı + satır).
2. Aynı soruyu sor: bekçi `saygi.js`'te ne arıyor? Gerçek durum ne?
   - **App ataması** arıyorsa → P02 ile aynı yanlış-pozitif olabilir; doğrula.
   - **migration** arıyorsa → `saygi.js`'te `migrate(` var mı? (IIP-03 bulgusu: yok)
   - **ağ/depo** arıyorsa → gerçekten `fetch`/`localStorage` var mı?
3. Her biri için tek satır karar yaz: **sahte pozitif** (bekçi düzeltilir) veya **gerçek ihlal** (kodu düzelt / kapsam genişletme iste).
4. Sahte pozitifleri P03/P04 disipliniyle düzelt.
5. Koş: `test_iip_03..13` ailesi tam.

**Bitiş koşulu:** 6 IIP fixture'ının hepsi exit 0 **veya** gerçek ihlal için kullanıcıya onay sorusu yazılı.

**Durma koşulu:** Gerçek ihlal + düzeltme `app.js` gerektiriyorsa → onay iste, uygulama.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P07 uygula. tests/app/test_iip_05/06/09.js üçü de 'scope contract' bekçisinde FAIL. Her bekçinin tam ifadesini oku ve sahte pozitif mi (regex/pin) gerçek ihlal mi olduğunu AYIR: saygi.js'te gerçek App ataması var mı (grep), migrate( var mı, fetch/localStorage var mı? Her biri için tek satır karar yaz. Sahte pozitifleri düzelt (P02/P03 disiplini: gerekçe yaz, körlemesine pin yenileme). Gerçek ihlal app.js düzeltmesi gerektiriyorsa DUR ve onay iste. Sonunda test_iip_03..13 ailesini koş. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P08 — Kanıt makbuzlarının exit-kodu gerçeğiyle uzlaştırılması

**Amaç:** Kanıt zincirinin denetlenebilirliğini geri kazan. Şu an makbuzlar bugünkü gerçekle uyuşmuyor.

**Kanıt**
- `evidence/IIP-12/source.json`: `0 node tests/app/test_iip_12.js`, `0 node tests/app/test_saygi_boundary.js`, ... `status: pass`
- `evidence/IIP-13/source.json`: aynı desen, `0 node tests/app/test_iip_13.js`, `0 node tests/app/test_iip_12.js`
- Bugün aynı komutlar exit 1.
- `plan-check.mjs` / `--self-test` / `integration.py` de makbuzlarda `exitCode: 0`, bugün exit 1.

**Adımlar**
1. `evidence/IIP-12/` ve `evidence/IIP-13/` altındaki tüm `*.json` makbuzlarını listele ve her `commands[].exitCode` kaydını canlı gerçekle karşılaştır.
2. Her sapma için bir **düzeltme kaydı** yaz: komut | kayıtlı exit | gerçek exit | neden | düzeltme.
3. Uzlaştır (P01-P07 düzeltmeleri tamamlandıktan sonra):
   - Eğer test artık gerçekten geçiyorsa → makbuzda yeni bir **revision** kaydı oluştur (eskisini silme; append-only disiplini), `verifiedHead`/`diffHash` güncelle.
   - Test hâlâ geçmiyorsa → makbuz `status: pass` **olamaz**; kartın durumunu `in_review`e çek (P09 kararı ile birlikte).
4. `plan-check.mjs`'in `source` gate kuralını hatırla: `commands.some(x => !x.command || x.exitCode !== 0)` → fail. Yani exit 1 kaydı makbuza girerse gate kapanır. **Bu bilinçli bir tercih olmalı**: ya kart in_review'e döner, ya komut gerçekten geçer.
5. Kanıtla: `node ilham-ibadet-premium-plan/tools/plan-check.mjs` (exit 0 beklenir *veya* kart in_review için tutarlı çıktı).

**Bitiş koşulu:** Hiçbir makbuz, bugün exit 1 olan bir komutu `exitCode: 0` diye göstermiyor. Sapmalar yazılı ve karara bağlı.

**Durma koşulu:** Kart durumunu `in_review`e çekmek state/ledger yazımı gerektirir → kullanıcı onayı al (P09 ile birleştirilebilir).

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P08 uygula. Kanıt dürüstlüğü sorunu: evidence/IIP-12/source.json ve evidence/IIP-13/source.json, bugün exit 1 veren komutları (test_iip_12.js, test_iip_13.js, test_saygi_boundary.js, plan-check.mjs) 'exitCode: 0 / status: pass' kaydetmiş. Tüm commands[] kayıtlarını canlı gerçekle karşılaştır, her sapmayı tablo olarak yaz (komut | kayıtlı exit | gerçek exit | neden | düzeltme). Append-only disiplini koru — eski kaydı silme, yeni revision ekle. Test hâlâ geçmiyorsa makbuz pass OLAMAZ; kart durumunu in_review'e çekmek gerekiyorsa DUR ve onay iste. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P09 — IIP-24 kart sözleşmesinin normalize edilmesi

**Amaç:** `plan-check.mjs` exit 1'ini kapat ("card contract drift IIP-24").

**Kanıt**
- `plan-check.mjs` → `FAIL: card contract drift IIP-24` (exit 1)
- Fark içerikte değil: `cards/IIP-24.md` sözleşme bloğu 1107 bayt, beklenen 1105; fark yalnız **fazladan boş satırlar** (`--` ayrılmış 29 satır vs 27).
- Yani blok elle biçimlendirilmiş; `contract()` üreticisiyle birebir eşleşmiyor.

**Adımlar**
1. Sapmayı doğrula: beklenen ve gerçek bloğu satır satır karşılaştır (yalnız boş satır farkı olmalı).
2. **İçeriğin doğru olduğunu teyit et**: `## Yürütme sözleşmesi` başlığı, bağımlılıklar, allowlist, gate'ler, REQ-047/048 metinleri state/REQUIREMENTS ile tutarlı mı?
3. Normalize et: `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render` (üreticinin kendi çıktısını yazar).
4. `git diff --stat -- cards/IIP-24.md` ile **yalnız boş satır** değiştiğini kanıtla; anlamlı içerik değişmediyse bu meşrudur.
5. Koş: `plan-check.mjs` → exit 0.

**Uyarı:** `--render` aynı zamanda `tracking/CURRENT-STATE.md`, `TRACEABILITY.md`, `DEPENDENCIES.md`, `DECISIONS.md` dosyalarını yeniden üretir. Bu dosyalardaki farkı da `git diff` ile incele; **beklenmeyen** içerik değişimi varsa dur.

**Bitiş koşulu:** `plan-check.mjs` exit 0; IIP-24 kart diff'i yalnız biçimlendirme.

**Durma koşulu:** `--render` beklenmeyen içerik değiştiriyorsa — `git checkout` ile geri al, dur ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P09 uygula. plan-check.mjs 'card contract drift IIP-24' diyerek exit 1 veriyor; fark içerikte DEĞİL, cards/IIP-24.md sözleşme bloğunda yalnız fazladan boş satırlarda (1107 vs 1105 bayt). Önce içeriğin doğru olduğunu teyit et (başlık/bağımlılık/allowlist/gate/REQ-047-048 metinleri state ile tutarlı mı). Sonra `node ilham-ibadet-premium-plan/tools/plan-check.mjs --render` ile normalize et. `git diff --stat` ile değişimin yalnız biçimlendirme olduğunu kanıtla. --render tracking/CURRENT-STATE.md, TRACEABILITY.md, DEPENDENCIES.md, DECISIONS.md dosyalarını da yeniden üretir — onların farkını da incele, beklenmeyen içerik değişimi varsa git checkout ile geri al ve DUR. Sonunda plan-check exit 0 bekle. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P10 — IIP-24 `visual` gate + `deviceAcceptance` uzlaştırması

**Amaç:** Kart/state/kanıt arasındaki cihaz çelişkisini çöz.

**Kanıt**
- `IIP-STATE.json` → `deviceAcceptance: "not_verified"`
- `IIP-24` kartı state'te `requiredGates: ["scope","requirements","review"]` — **`visual` gate yok**
- Ancak `evidence/IIP-23/visual.json` → `status: pass`, `deviceMatrix` üç hedef "user-confirmed"
- `evidence/IIP-24/` içinde `visual.json` **yok** — buna rağmen plan-check geçmiş olmalıydı (gate listesinde olmadığı için)
- `IIP-23` ledger kaydı (seq 48): "REQ-046 kullanıcının iPhone Safari/PWA, Android Chrome ve klavye/ekran okuyucu incelemesi teyidiyle PASS"
- Ama `evidence/IIP-23/visual.json` → `performance: "not measured: 5 warmup + 30 samples p50/p95"`

**Karar gerekiyor — iki yol var:**
- **(A) Cihaz kabulü gerçek:** kullanıcı gerçekten inceledi. O halde `deviceAcceptance` `user_confirmed` olmalı; `IIP-24`'e `visual` gate geri konmalı; ve `performance` sınırı **açıkça** "ölçülmedi" olarak bilinen sınırlarda kalmalı (`07-KALITE-VE-KABUL.md`: p95 ≤200 ms hedef).
- **(B) Cihaz kabulü teyitsiz:** o halde IIP-23/24 `in_review`e dönmeli, `visual.json` makbuzu pass olmamalı.

**Adımlar**
1. Kullanıcının **gerçekte** ne teyit ettiğini netleştir (sohbet/ledger kaydı: seq 48).
2. (A)/(B) yolunu seç ve gerekçeyi yaz.
3. Yol A ise: `deviceAcceptance` güncelle + IIP-24'e `visual` gate ekle + `evidence/IIP-24/visual.json` üret (kaynak: IIP-23 makbuzu + kullanıcı teyidi) + `performance` bilinen sınırı yaz.
4. Yol B ise: IIP-23/24 `in_review`; `visual.json` düzelt/çek.
5. Koş: `plan-check.mjs`.

**Bitiş koşulu:** `deviceAcceptance`, kart `requiredGates`'i, makbuzlar ve ledger **aynı hikâyeyi** anlatıyor.

**Durma koşulu:** Kullanıcı hangi yolu istediğini söylememişse — **dur ve sor**. Cihaz kabulünü ajan kendisi teyit edemez (kök kural: cihaz kabulü yalnız kullanıcıdan gelir).

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P10 uygula. Çelişki: IIP-STATE.json deviceAcceptance='not_verified' ama evidence/IIP-23/visual.json status='pass' ve deviceMatrix üç hedef 'user-confirmed'; IIP-23 ledger (seq 48) kullanıcı iPhone/Android/ekran okuyucu teyidi diyor; evidence/IIP-23/visual.json ise performance='not measured' diyor; IIP-24'ün requiredGates'inde 'visual' YOK. Bana iki yolu net sun: (A) cihaz kabulü gerçek → deviceAcceptance güncelle + IIP-24'e visual gate ekle + performance bilinen sınırı yaz, (B) teyitsiz → IIP-23/24 in_review. KULLANICI HANGİ YOLU İSTEDİĞİNİ SÖYLEMEDEN UYGULAMA — dur ve sor. Cihaz kabulünü ajan kendisi teyit edemez. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P11 — `plan-check.mjs --self-test` kusuru

**Amaç:** Aracın kendi öz-testini çalışır hale getir.

**Kanıt**
- `node .../plan-check.mjs --self-test` → `Error: Self-test requires structurally valid baseline` (exit 1)
- Sebep `plan-check.mjs:161`: `if(validate(state,requirements,ledger,false).length) throw Error('Self-test requires structurally valid baseline')`
- `validate(..., checkFiles=false)` **kanıt dosyalarını yine diskten okumaya çalışıyor**: `for (const ep of c.evidence)` bloğu `checkFiles=false` iken `safe(ep)` + `path.startsWith` kontrolünden sonra `if (!checkFiles) continue;` diyor — ama `missing evidence` fail'i zaten `checkFiles` kontrolünden **önce** ekleniyor:
  ```
  if (!safe(ep) || !ep.startsWith(`evidence/${c.id}/`) || (checkFiles && !exists(ep))) { fail(`missing evidence ${c.id}`); continue; }
  ```
  → `safe()`/`startsWith` geçerli, `checkFiles=false` olduğu için `exists` atlanır; sonra `if(!checkFiles) continue;` — yani atlanır. **O kısım doğru.**
- Gerçek sorun başka yerde olmalı. `--self-test` bloğuna girmeden önce tüm `validate(state, requirements, ledger, false)` hata döndürüyor. Sırada: `done lacks gates`, `done lacks REQ evidence`, `done lacks ledger` — bunlar `checkFiles=false`'ta `passed`/`covered` kümelerini kanıt olmadan boş bırakır.
  ```
  for (const ep of c.evidence || []) { ... if (!checkFiles) continue; ...  passed.add(...); }
  if (!c.requiredGates.every(g=>passed.has(g))) fail(`done lacks gates ${c.id}`);
  ```
  → `checkFiles=false` iken `passed` **her zaman boş** → 24 done kart için "done lacks gates" hatası → baseline "structurally valid" değil → self-test asla başlamaz.

**Adımlar**
1. Bu hipotezi **kanıtla**: `validate(state, requirements, ledger, false)` çıktısını geçici olarak yazdır (kodu geçici olarak enstrümante et, kalıcı değiştirme).
2. Düzeltmenin doğru yeri: `checkFiles === false` iken `passed`/`covered` ve diğer disk-bağımlı kapılar için **erken çıkış** yap; yani "structural-only" doğrulama yalnız **yapısal** kuralları (id, bağımlılık, onay, kilit, döngü) kontrol etsin, kanıt türetmeyi atlasın.
3. Alternatif (daha dar): `--self-test` bloğunda `validate(..., true)` çağır — ama sonra self-test disk durumuna bağımlı olur (istenmeyen). Tercih edilen: `checkFiles=false` semantiğini gerçekten "yalnız yapı" yap.
4. Değişikliği **dar tut**: yalnız `validate()` içinde `checkFiles` koşullarını netleştir.
5. Koş:
   - `plan-check.mjs --self-test` → exit 0, "PASS: 15 invalid-state rejection tests"
   - `plan-check.mjs` → exit 0 (salt-okur kontrol bozulmadı)
6. Mutasyon kanıtı: `--self-test`'in 15 senaryosu gerçekten çalışıyor mu? (Kodda 15 `cases` var.) En az bir bozuk örnek enjekte edip yakalandığını gör.

**Bitiş koşulu:** `--self-test` exit 0 ve 15 negatif senaryo raporluyor; salt-okur `plan-check.mjs` hâlâ exit 0.

**Durma koşulu:** Değişiklik salt-okur kontrolü zayıflatıyorsa — geri al ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P11 uygula. Araç kusuru: `node ilham-ibadet-premium-plan/tools/plan-check.mjs --self-test` her zaman exit 1 veriyor ("Self-test requires structurally valid baseline"). Hipotez: validate(...,checkFiles=false) çağrısında `passed`/`covered` kümeleri kanıt okunmadığı için BOŞ kalıyor, bu yüzden 24 done kart 'done lacks gates' hatası üretiyor → baseline 'valid' sayılmıyor. Önce bunu geçici enstrümantasyonla KANITLA (kalıcı değiştirme). Sonra checkFiles=false semantiğini gerçekten 'yalnız yapısal doğrulama' yapacak şekilde düzelt (kanıt türetmeyi atla, yapısal kurallar id/bağımlılık/onay/kilit/döngü kalsın). Değişikliği DAR tut. Sonra `--self-test` exit 0 + 15 negatif senaryo, `plan-check.mjs` exit 0 (salt-okur kontrol zayıflamadı) bekle. Salt-okur kontrol zayıflıyorsa geri al ve DUR. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P12 — `plan-check.integration.py` `FileExistsError`

**Amaç:** README'de "çalışıyor" diye tanıtılan entegrasyon denetimini gerçekten çalışır yap.

**Kanıt**
- `python3 ilham-ibadet-premium-plan/tools/plan-check.integration.py` → exit 1
- `File "/.../plan-check.integration.py", line 12, in <module>` → `e=p/'evidence/IIP-01';e.mkdir()` → `FileExistsError: [Errno 17] File exists: '/private/tmp/iip-validator-.../ilham-ibadet-premium-plan/evidence/IIP-01'`
- Sebep: `shutil.copytree(repo/p.name, p)` zaten `evidence/IIP-01`'i kopyalıyor; script sonra aynı dizini `mkdir()` ediyor.

**Adımlar**
1. Satır 12'deki `e.mkdir()`'i `e.mkdir(exist_ok=True)` yap **veya** daha doğrusu: geçici kopyada **temiz bir fixture** istiyorsa önce mevcut `evidence/IIP-01`'i kaldır.
2. Script'in asıl amacını koru: "geçerli tamamlanma kaydı kabul edilir" + "bozulmuş kanıt reddedilir".
3. Çalıştır: `python3 .../plan-check.integration.py` → exit 0, üç PASS satırı:
   - `PASS: valid synthetic done card accepted (isolated copy)`
   - `PASS: tampered artifact rejected`
   - `PASS: card/state contract drift rejected`
   - `PASS: unresolved high review finding rejected`
4. **Kanıtla ki üretim planı değişmiyor**: script `tmp`'de çalışır; `git status` çalıştırma sonrası **aynı** kalmalı.
5. `README.md`'deki "Denetleme" bölümü gerçekten çalışan komutları listeliyor mu? Doğrula.

**Bitiş koşulu:** `.integration.py` exit 0, dört PASS satırı; repo kökü değişmemiş.

**Durma koşulu:** Düzeltme script'in izolasyonunu bozuyorsa (üretim planına yazıyorsa) — geri al ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P12 uygula. `python3 ilham-ibadet-premium-plan/tools/plan-check.integration.py` exit 1 veriyor: satır 12 `e.mkdir()` → FileExistsError, çünkü shutil.copytree zaten evidence/IIP-01'i kopyalamış. Düzelt (mkdir(exist_ok=True) veya geçici kopyada temiz fixture kur). Script'in amacını koru: geçerli sentetik done kabul + bozulmuş artifact/kontrat/review reddi. Çalıştır, dört PASS satırı ve exit 0 bekle. Script'in İZOLE çalıştığını kanıtla: sonrasında git status değişmemeli. README'nin 'Denetleme' bölümünün gerçekten çalışan komutları listelediğini doğrula. İzolasyon bozulursa geri al ve DUR. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P13 — Kök-neden önleyici: "kardeş kart regresyonu" kapısı

**Amaç:** §0.2'deki kök nedeni bir daha yaşanmayacak hale getir. **Bu programın en değerli düzeltmesi.**

**Kanıt**
- IIP-20/21, IIP-05/06/09/12/13'ün dosyasına (`app/core/saygi.js`) yazdı; önceki fixture'lar kırıldı; kimse fark etmedi.
- `plan-check.mjs` bugün yalnız **plan/kanıt tutarlılığını** kontrol ediyor; **testleri hiç koşmuyor**.

**Tasarım (öneri)**
`plan-check.mjs`'e **salt-okur, ağsız** bir "sibling regression" kontrolü ekle:

1. Her kart için dokunduğu dosyaları biliyoruz: `allowedProductionFiles` + `locks` + (varsa) `plannedWriteFiles`.
2. Her fixture dosyası, hangi üretim dosyasını doğruladığını **beyan ediyor** varsayımı yapılamaz (fixture'larda bu metadata yok). İki seçenek:
   - **(A) Manifest:** `tests/app/FIXTURE-MAP.json` — `{fixture: [production files]}`. P13 kapsamında **üret**, sonra `plan-check` bunu doğrular: bir kart `X.js` yazdıysa, `X.js`'e bağlı **tüm** fixture'lar kartın `fixtureFiles` listesinde olmalı.
   - **(B) Hafif kural:** her kartın `requiredGates`'ine `regression` ekle ve `evidence/<KART>/regression.json` makbuzunda **dokunulan dosyalara bağlı fixture'ların** exit kodlarını zorunlu kıl.
3. Öneri: **(A) manifest + (B) gate** birlikte. Manifest üretimi tek seferlik iş; sonra `plan-check` otomatik doğrular.

**Adımlar**
1. `tests/app/`, `tests/panel/`, `tests/panel-v2/`, `tests/quran/` altındaki her fixture'ın hangi üretim dosyalarını okuduğunu çıkar (fixture'ların `FILES`/`require`/`readFileSync` satırlarından). Yarı-otomatik bir tarama yeterli; belirsizleri elle işaretle.
2. `tests/app/FIXTURE-MAP.json` üret.
3. `plan-check.mjs`'e doğrulama ekle: `card.allowedProductionFiles ∩ fixtureMap` → ilgili fixture'lar kartın `fixtureFiles`'ında mı?
4. **IIP programı için retro-doğrulama yap:** IIP-20/21 için `fixtureFiles` listelerini kontrol et; `test_iip_05/06/09/12/13` **eksikse bu kusurun kanıtıdır** → raporla (düzeltme kullanıcı onayıyla).
5. `node plan-check.mjs` → exit 0 (veya gerçek kusuru raporla, exit 1).
6. `--self-test`'e bu yeni kural için bir negatif senaryo ekle.

**Bitiş koşulu:** `plan-check` artık "aynı dosyaya yazan sonraki kart, önceki fixture'ları listelemezse" hatayı yakalıyor; negatif senaryo kanıtlı.

**Durma koşulu:** Manifest üretimi 50+ fixture için güvenilir değilse — (B) hafif kuralı uygula ve yaz.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P13 uygula. Bu programın KÖK NEDENİ: IIP-20/21 aynı dosyaya (app/core/saygi.js) yazdı ama IIP-05/06/09/12/13 fixture'larını yeniden koşmadı; plan-check testleri hiç koşmuyor, kimse fark etmedi. Önleyici kontrol ekle: (1) tests/app/FIXTURE-MAP.json üret — her fixture hangi üretim dosyalarını doğruluyor (fixture'ların FILES/require/readFileSync satırlarından türet, belirsizleri işaretle); (2) plan-check.mjs'e doğrulama ekle: bir kartın dokunduğu üretim dosyasına bağlı TÜM fixture'lar kartın fixtureFiles listesinde olmalı; (3) IIP-20/21 için RETRO doğrulama yap — test_iip_05/06/09/12/13 eksikse bunu kusur kanıtı olarak raporla; (4) --self-test'e yeni kural için negatif senaryo ekle. Manifest güvenilir değilse hafif 'regression gate' kuralına düş. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P14 — p50/p95 ölçüm protokolü ve cihaz kanıtı

**Amaç:** Planın ölçülebilir performans hedefini gerçekten ölç.

**Kanıt**
- `07-KALITE-VE-KABUL.md`: "Hub geçişinde hedef cihazda p95 ≤200 ms · En az 30 tekrar, cihaz/tarayıcı kaydı; **baseline henüz yok**"
- `evidence/IIP-23/visual.json`: `performance: "not measured: 5 warmup + 30 samples p50/p95"`
- `evidence/IIP-23/HANDOFF.md`/ledger: p50/p95 "paylaşılmadı, bilinen sınır olarak kaydedildi"

**Adımlar**
1. **Headless ölçüm koşumu** yaz (yeni test dosyası, ör. `tests/app/test_iip_perf_measure.js`): `driver.mjs` yaklaşımıyla `app.js`'i VM'de boot et, hub geçişini (ör. Bugün → Öncü → Bugün) 5 ısınma + **30 örnek** koştur, render süresini `performance.now()` yerine `process.hrtime.bigint()` ile ölç, p50/p95 hesapla.
2. Ayrı ayrı raporla: **yerel VM render süresi** (makine hızı) vs **hedef cihaz** (yalnız kullanıcı ölçebilir). VM sonucu cihaz hızı kanıtı **değildir** — bunu makbuza yaz.
3. Sonucu `evidence/` altına makine-okunur JSON olarak ekle (fixture adı, tekrar sayısı, p50, p95, ortam).
4. Kullanıcıya cihaz ölçümü için **protokol** ver (kendisi yapacak): hangi ekran, kaç tekrar, ne kaydedilecek.
5. Cihaz ölçümü gelmezse: hedef **karşılanmadı** olarak değil, **ölçülmedi** olarak raporla (plan diliyle aynı).

**Bitiş koşulu:** Yerel ölçüm sayıları (n≥30, p50/p95) makine-okunur kayıtlı; sınır (yerel ≠ cihaz) açıkça yazılı.

**Durma koşulu:** Ölçüm için kontrollü tarayıcı QA gerekiyorsa — 127.0.0.1:9000 protokolü + Guard 1 doğrulaması + sunucuyu tur sonunda kapatma şartlarını uygula; aksi halde yalnız VM ölçümüyle kal.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P14 uygula. Hedef 07-KALITE-VE-KABUL.md'de 'hedef cihazda p95 ≤200 ms, en az 30 tekrar' ama evidence/IIP-23/visual.json 'not measured' diyor ve hiçbir yerde p50/p95 yok. Headless VM ölçüm fixture'ı yaz (tests/app/test_iip_perf_measure.js): app.js'i driver.mjs yaklaşımıyla boot et, hub geçişini 5 ısınma + 30 örnek koştur, process.hrtime.bigint ile ölç, p50/p95 hesapla. YEREL VM süresi ile HEDEF CİHAZ hızını AYIR — VM sonucu cihaz kanıtı değildir, bunu makbuza yaz. Sonucu evidence altına makine-okunur JSON olarak kaydet. Kullanıcıya cihaz ölçümü için protokol ver. Cihaz ölçümü gelmezse hedefi 'karşılanmadı' değil 'ölçülmedi' say. Tarayıcı QA gerekiyorsa yalnız 127.0.0.1:9000 protokolü + Guard 1 doğrulaması + tur sonunda sunucuyu kapat. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P15 — Programın kök dokümanlara işlenmesi

**Amaç:** Yeni bir ajan/oturum bu programı keşfedebilsin.

**Kanıt**
- `grep -rn "ilham-ibadet-premium-plan\|IIP-" AGENTS.md CLAUDE.md docs/GELISTIRME-PLANI.md tests/README.md` → **sıfır sonuç**
- Diğer programlar (MON, MON2, FX2, SKY/PREM, AD, REM, Panel-v2, kuran-ogreniyorum) hepsinin kök yönlendirmesinde bir maddesi var.

**Adımlar**
1. `AGENTS.md` "Agent Routing" listesine **tek madde** ekle (diğer programların üslubuyla): program yolu, durum kaynağı (`IIP-STATE.json`), kart kataloğu, kanıt dizini, denetim/onarım dosyası (`DUZELTME-PROMPTLARI.md`), ve **bilinen durum** (24/24 beyan; 13 fixture kırmızı; `plan-check` exit 1; cihaz teyitsiz).
2. `CLAUDE.md`'ye **paralel** madde ekle (kök kural: "keep both in sync").
3. `tests/README.md` envanterine IIP fixture ailesini ekle: `test_iip_02..22` (16 dosya) + hangi ailenin hangi REQ'i doğruladığı.
4. `docs/GELISTIRME-PLANI.md` durum tablosuna İlham & İbadet satırı ekle (✅/🟡/❌) — gerçek durumla.
5. `ilham-ibadet-premium-plan/README.md` başına "**Şu an ne hazır**" bölümünü gerçekle güncelle: "Plan hazır; üretim kodu yazıldı; **ancak 13 fixture kırmızı ve plan-check exit 1**; ayrıntı `DUZELTME-PROMPTLARI.md`".
6. Bağlantıları doğrula (kırık link yok).

**Bitiş koşulu:** Dört kök dosyada IIP referansı var; README gerçek durumu söylüyor.

**Durma koşulu:** `AGENTS.md`'nin yapısını bozacak büyük düzenleme gerekiyorsa — yalnız tek madde ekle, yapı değiştirme.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P15 uygula. Program kök dokümanlara hiç işlenmemiş (AGENTS.md, CLAUDE.md, docs/GELISTIRME-PLANI.md, tests/README.md'de IIP referansı sıfır), oysa MON/MON2/FX2/SKY/PREM/AD/REM/Panel-v2 hepsinin kök yönlendirmesinde maddesi var. AGENTS.md 'Agent Routing'e tek madde ekle (yol, IIP-STATE.json, kart kataloğu, kanıt dizini, DUZELTME-PROMPTLARI.md, ve GERÇEK durum: 24/24 beyan ama 13 fixture kırmızı + plan-check exit 1 + cihaz teyitsiz). CLAUDE.md'ye paralel madde ekle (kök kural: ikisi senkron). tests/README.md'ye 16 IIP fixture'ını ekle. docs/GELISTIRME-PLANI.md durum tablosuna gerçek satır ekle. ilham-ibadet-premium-plan/README.md'nin 'Şu an ne hazır' bölümünü gerçekle düzelt. AGENTS.md yapısını bozma — tek madde. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## P16 — Commit'siz 7 dosyanın karara bağlanması

**Amaç:** Çalışma ağacını temiz bir duruma getir — ama **git kararı kullanıcının**.

**Kanıt**
```
 M ilham-ibadet-premium-plan/IIP-STATE.json
 M ilham-ibadet-premium-plan/cards/IIP-24.md
 M ilham-ibadet-premium-plan/tracking/CURRENT-STATE.md
 M ilham-ibadet-premium-plan/tracking/LEDGER.jsonl
 M ilham-ibadet-premium-plan/tracking/TRACEABILITY.md
?? ilham-ibadet-premium-plan/evidence/IIP-23/
?? ilham-ibadet-premium-plan/evidence/IIP-24/
```
- HEAD `bc4372f` = IIP-22 kapanışı. **IIP-23 ve IIP-24 hiç commit'lenmemiş** — ama state "done" diyor.
- Yani "24/24 tamamlandı" beyanı, iki kartın kanıtı **sürüm kontrolünde olmadan** yapılmış.

**Adımlar**
1. Farkı gözden geçir: `git diff --stat` + her dosya için `git diff <dosya>`.
2. Değerlendir: bu dosyalar tutarlı bir kapanış mı, yoksa P08/P09/P10 düzeltmeleriyle **değişecek** mi?
3. Kullanıcıya **net seçenek** sun:
   - **(A) IIP-23/24'ü commit'le** — ama önce P08-P10 tamamlanmalı (kanıt dürüstlüğü).
   - **(B) IIP-23/24'ü `in_review`e çek, commit'le** — kanıt gerçeğiyle.
   - **(C) Şimdilik bırak**, P08-P10 sonrası tek commit.
4. Kullanıcı seçmeden **commit yapma**.

**Bitiş koşulu:** Karar yazılı; çalışma ağacı ya temiz ya da "neden dirty" açık.

**Durma koşulu:** Commit/push yetkisi yok → **dur ve sor**.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P16 uygula. HEAD bc4372f (IIP-22 kapanışı) ama IIP-23 ve IIP-24 HİÇ commit'lenmemiş; 7 dosya dirty (5 M + 2 ??). State '24/24 done' diyor ama iki kartın kanıtı sürüm kontrolünde değil. git diff --stat ve dosya bazında diff'i incele. Bana net seçenek sun: (A) IIP-23/24'ü commit'le (ama önce P08-P10 tamamlanmalı), (B) in_review'e çekip commit'le, (C) P08-P10 sonrası tek commit için şimdilik bırak. KULLANICI SEÇMEDEN COMMIT YAPMA — commit/push yetkisi bu promptta yok. Sonraki promptu başlatma.
```

---

## P17 — Tam regresyon ve yayın adayı yeniden beyanı

**Amaç:** Tüm düzeltmeler sonrası gerçeği ölç ve "yayın adayı" beyanını hak edilmiş hale getir.

**Adımlar**
1. Tüm aileleri koş (P00'daki listeyle **aynı**), her fixture'ın gerçek exit kodunu kaydet.
2. `evidence/DENETIM-BASELINE.md` (P00) ile **karşılaştırma tablosu** üret: önce | sonra | durum.
3. `plan-check.mjs`, `--self-test`, `.integration.py` üçü de yeşil mi?
4. Kalan kırmızı varsa: her biri için kart/dosya + neden + engel yaz. **Gizleme.**
5. `07-KALITE-VE-KABUL.md` "Bitmiş sayılma koşulu"nu madde madde kontrol et: çalışan eylem, boş/yükleniyor/hata durumu, erişilebilirlik, test çıktısı, diff.
6. Yayın adayı beyanını **dürüstçe** yaz:
   - Kaynak/headless kanıt seviyesi (1) tamam mı?
   - Yerel görsel QA (2) tamam mı/yapıldı mı?
   - Cihaz (3) kullanıcı teyitli mi? (P10 kararı)
   - Yayın (4) yapıldı mı? (ayrı yetki)
7. `IIP-STATE.json`'da `nextExecutableCard`, `deviceAcceptance`, `releaseApproval` alanlarını gerçekle hizala (onayla).
8. `plan-check.mjs --render` ile panoları üret.

**Bitiş koşulu:** Karşılaştırma tablosu var; her seviye için gerçek durum beyan edilmiş; gizli kırmızı yok.

**Durma koşulu:** Cihaz/yayın beyanı kullanıcı teyidi gerektiriyorsa — beyan etme, sor.

```text
/Users/m_ras/Desktop/seyma reposunda ilham-ibadet-premium-plan/DUZELTME-PROMPTLARI.md ortak kurallarıyla YALNIZ P17 uygula. Tüm düzeltmeler sonrası TAM regresyon koş (P00 ile aynı liste), her fixture'ın GERÇEK exit kodunu kaydet. evidence/DENETIM-BASELINE.md ile önce/sonra karşılaştırma tablosu üret. plan-check, --self-test, .integration.py üçü de yeşil mi? Kalan kırmızı varsa her biri için kart + neden + engel yaz — GİZLEME. 07-KALITE-VE-KABUL.md 'Bitmiş sayılma koşulu'nu madde madde kontrol et. Yayın adayı beyanını DÜRÜSTÇE yaz: seviye 1 kaynak/headless, seviye 2 yerel görsel QA, seviye 3 cihaz (kullanıcı teyidi — P10), seviye 4 yayın (ayrı yetki) AYRI AYRI. IIP-STATE.json alanlarını (nextExecutableCard/deviceAcceptance/releaseApproval) gerçekle hizala ve plan-check --render ile panoları üret. Cihaz/yayın beyanı kullanıcı teyidi gerektiriyorsa beyan etme, sor. Commit/push/deploy yok. Sonraki promptu başlatma.
```

---

## 3. Hızlı referans — hangi prompt neyi çözer

| Prompt | Çözdüğü kusur | Dosyalar | Üretim kodu? |
|---|---|---|---|
| P00 | Baseline yok | yeni denetim notu | hayır |
| P01 | Bayat cache-bust pinleri (6 fixture) | 6 fixture | **hayır** |
| P02 | `==` yanlış-pozitifi | 2 fixture | hayır |
| P03 | IIP-12 alan listesi çelişkisi | 1 fixture | hayır |
| P04 | IIP-03 payda bayat pini | 1 fixture | hayır |
| P05 | Kuran 1/9 kırmızı | 1 fixture veya içerik | belki |
| P06 | Render mutasyonu | `app/core/saygi.js` | **evet** |
| P07 | IIP-05/06/09 kapsam bekçileri | 3 fixture ± saygi.js | belki |
| P08 | Kanıt exit-kodu uyuşmazlığı | `evidence/IIP-12`, `IIP-13` | hayır |
| P09 | IIP-24 kart drift | `cards/IIP-24.md` + tracking | hayır |
| P10 | Cihaz çelişkisi | state + evidence | hayır |
| P11 | `--self-test` bozuk | `plan-check.mjs` | hayır (araç) |
| P12 | `.integration.py` bozuk | `plan-check.integration.py` | hayır (araç) |
| P13 | **Kök neden** önleyici kapı | `plan-check.mjs` + FIXTURE-MAP | hayır (araç) |
| P14 | p50/p95 ölçülmemiş | yeni perf fixture | hayır |
| P15 | Kök dokümanlarda görünmüyor | 4 kök dosya + README | hayır |
| P16 | 7 commit'siz dosya | git kararı | hayır |
| P17 | Yayın adayı beyanı | state + rapor | hayır |

**Önerilen sıra zorunluluğu:** P00 → P01-P05 (test yeşili) → P06-P07 (kod) → P08 (kanıt) → P09-P10 (state) → P11-P13 (araç) → P14-P16 → P17.
**Paralel yapılabilir:** P11, P12, P13 birbirinden ve diğerlerinden bağımsız (yalnız araç dosyaları).
**Paralel yapılamaz:** P06 ile P07 (ikisi de `saygi.js`); P08 ile P09/P10 (ikisi de state/ledger).

---

## 4. Kapanış sözleşmesi

Her prompt bittiğinde şunu raporla:

1. **Kart/bulgu:** hangi numaralı kusur kapandı.
2. **Değişen dosyalar:** tam liste (`git status --short`).
3. **Komutlar + GERÇEK exit kodları:** iddia değil, çıktı.
4. **Kalan engel:** varsa açıkça; yoksa "yok".
5. **Sonraki adım:** başlatma, yalnız söyle.

Ve son uyarı: **bir testi/kapıyı "pass" yazmadan önce gerçekten çalıştır.** Bu programın tüm sorunu, kanıtın gerçeği yansıtmamasıyla başladı.
