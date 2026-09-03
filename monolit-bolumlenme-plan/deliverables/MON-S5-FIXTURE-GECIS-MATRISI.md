# MON-S5 — Boundary Fixture Geçiş Matrisi

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-05` · **Tarih:** 2026-09-03
**Tür:** Assertion geçiş planı (kod/fixture değişikliği yok) · **Dal:** `zikirmatik-manuel-zikir` — LOCAL-ONLY
**Öncüller:** MON-S1..S4 · **Kapsam:** 4 boundary fixture · **Sınıf:** yapılandırma

## 1. Amaç ve dürüstlük ilkesi

Refactor boyunca bazı başlangıç assertionları **kasıtlı olarak** değişecektir
(örn. "migrate hâlâ app.js'te" — MON-12'de artık yanlış olacak). Bu belge,
her assertion grubunun **(A) bugünkü anlamını**, **(B) hangi MON'da
değişeceğini**, **(C) yeni semantiğini** ve **(D) güncelleme kuralını** önceden
sabitler. Kural: eski PASS kanıtı ile yeni semantik kanıtı **ayrı** raporlanır;
fixture güncellemesi yalnızca ilgili MON'un kendi commitinde yapılır ve o
commit "fixture geçişi" olarak LEDGER'a işlenir. **"Eski test" diye bastırma
yasaktır** — bir assertion artık anlamsızsa bu matriste karşılığı yoksa
o MON bloke olur.

## 2. Envanter (canlı sayım, 2026-09-03)

| Fixture | Satır | ok() assertion | Grup |
|---|---:|---:|---|
| `tests/app/test_modularization_boundary.js` | 232 | ~48 | [0]–[10] |
| `tests/app/test_faz_minus11_boundary.js` | 65 | ~13 | modül varlık + FX çağrı + B1 erken |
| `tests/app/test_date_utils_boundary.js` | 178 | 59 | expose + fonksiyon varlığı + davranış + B1 |
| `tests/app/test_helpers_boundary.js` | 104 | 31 | expose + fonksiyon varlığı + davranış + B1 + negatif FX |
| **Toplam** | **579** | **~151** | 4 dosya |

## 3. Geçiş matrisi

Her satır: assertion grubu → sahibi MON → yeni semantik → güncelleme zamanı.

### 3.1 `test_modularization_boundary.js`

| # | Assertion grubu (bugünkü anlam) | Değişecek MON | Yeni semantik | Aynı-commit güncelleme |
|---|---|---|---|---|
| [0] | 5 Faz-1.1 modülü index'te yüklü ve app.js'ten önce | — (daima) | Değişmez; yeni modüller bu gruba eklenir, eski satır korunur | Yeni modül eklenirken diziye satır eklenir |
| [1] | app.js 18.000+ satır | MON-50..54 sonrası | Eşik **düşürülür** (örn. 8.000+); "monolit hâlâ var" anlamı "azaltılmış çekirdek" olur. Her taşıma kartında eşik yeniden ölçülür | Taşıma commitinde eşik + yorum güncellenir |
| [2] | constants.js mevcut | Daima | Değişmez | — |
| [3] | constants → app.js sırası | Daima | Değişmez (MON-S4 assertion'ıyla birleşik koruma) | — |
| [4] | "modüllerin çoğu henüz oluşturulmadı" (`existing < 24`) | **İlk domain taşıması (MON-19)** | İddia tersine döner: `existing > 0` olur; "planlanan N modülden M'si taşındı" sayacı olur. Üst sınır koşulu kaldırılır | MON-19 commitinde [4] bloğu yeniden yazılır |
| [5] | 28 App.* sembolü kaynakta var (I2) | Daima | Değişmez; taşınan handler'larda referans app.js shim'inde kaldığı sürece PASS | — |
| [6] | IIFE + `window.App=App` | MON-50..54 | IIFE deseni korunur; `window.App=App` app.js'te kalır (M2/M2prime) — **değişmez** | — |
| [7] | MODULARIZATION.md v2.1 + 24 satır | Daima | Değişmez (kaynak belge korunur) | — |
| [8] | `migrate(d)` ve `save(…)` gövdeleri app.js'te | **MON-12** (migrate), **MON-17** (save) | Kalıcı app.js **imza-koruyan shim** kabul edilir: regex, `function migrate(d)` **veya** `window.SeymaState.migrate` delege biçimini kabul eder; gövdenin nerede olduğu manifestte raporlanır | İlgili MON commitinde regex güncellenir |
| [9] | `SeyOnSync*` app.js'te atanıyor; `window.data/ui/save =` **yok** (B1) | Daima (M3/B1) | Değişmez — getter-only tuzağı yasak; `window.data=` ataması hiçbir aşamada görülmemeli | — |
| [10] | Faz-1.1 registry'leri expose; `SeymaState.data`/`SeymaSave` undefined (B1) | **MON-11** | app.js boot edildikten sonra getter **tanımlı** olmalı; "undefined" iddiası yalnız app.js'siz izole VM bootu için korunur. Test app.js'i hiç yüklemediği için aslında bugün de geçerli kalır; yalnızca yorum netleştirilir | MON-11 commitinde yorum + iddia ayrıştırılır |

### 3.2 `test_faz_minus11_boundary.js`

| # | Assertion grubu | Değişecek MON | Yeni semantik | Güncelleme |
|---|---|---|---|---|
| F-1 | 5 modül diskte + index'te | Daima | Değişmez; yeni modüllerle dizi büyür | Yeni MON ile satır eklenir |
| F-2 | FX çağrı noktaları app.js'te var (`SeyAudio.tap/success/warning/bell`, `SeyHaptics.tap/streak/water`, `SeyTimeTheme` guard) | **MON-22..21 zikir taşınmasında** zikir-bölgesi çağrıları; genel kural: her domain taşımada | Çağrı noktası app.js **veya** ilgili `app/core/<domain>.js`'te olabilir; toplam çağrı sayısı MON-S2 manifestiyle eşitlenir (48 satır/101 occurrence referans) | Taşıma kartı commitinde: manifest delta tablosu + fixture satırı dosya-çifti kabulüne geçer |
| F-3 | `SeymaDateUtils`/`SeymaHelpers` app.js'te **hiç çağrılmıyor** | **MON-07..10** | İlk tüketim izinli hale gelir: assertion "app.js yalnız shim üzerinden çağırır" olur; doğrudan gövde kopyası yasak kalır | MON-07 commitinde negatif tarama, shim-deseni kabulüne dönüşür |

### 3.3 `test_date_utils_boundary.js` (59 assertion)

| # | Grup | Değişecek MON | Yeni semantik | Güncelleme |
|---|---|---|---|---|
| D-1 | `SeymaDateUtils` expose | Daima | Değişmez | — |
| D-2 | 10 fonksiyon varlığı + saf davranış testleri (pad/fmt/addDays/diffDays/…) | Daima | Değişmez — gövde taşındığında bile saf davranış aynıdır (I3 benzeri saf eşdeğerlik) | — |
| D-3 | `activeDate`/`curDay` B1 okuma yolu (state getter'larıyla) | **MON-11** | `SeymaState.data` undefined iddiası yalnız izole bootta; app.js'li bootta getter tanımlı olmalı. Test iki modlu çalışır: (izole) undefined, (app.js'li) tanımlı | MON-11 commitinde iki-mod assertion ayrımı yazılır |
| D-4 | state/syncGlue getter varlığı | Daima | Değişmez (M3) | — |

### 3.4 `test_helpers_boundary.js` (31 assertion)

| # | Grup | Değişecek MON | Yeni semantik | Güncelleme |
|---|---|---|---|---|
| H-1 | `SeymaHelpers` expose + 11 fonksiyon varlığı + saf davranış | Daima | Değişmez | — |
| H-2 | `haptic` B1 okuma yolu (data yokken kırılmaz; `haptics=false` vibrate çağırmaz) | **MON-09..10** | Davranış eşdeğerliği korunur; yalnız çağrı yolu shim kabulü eklenir | İlgili kart commitinde |
| H-3 | Negatif FX assertionları: helpers dosyasında `SeyAudio.*` **yok** | Daima (M4/MON-S2) | Değişmez — helpers FX çağıramaz; ses yalnız `mediaFx` üzerinden | — |
| H-4 | `SeymaState` 6 getter + `data` undefined (Faz -1.1) + `SeymaSave` undefined | **MON-11 / MON-17** | D-3 ile aynı iki-mod kuralı: izole boot undefined, app.js'li boot tanımlı. `SeymaSave` MON-17'de gerçek `save`'e bağlanır (getter çözülür) | MON-11/17 commitlerinde iki-mod assertion |

## 4. Ortak güncelleme kuralları (her geçiş için)

1. **Eski PASS ≠ yeni semantik:** her geçiş commitinde LEDGER satırı "fixture
   geçişi: X assertion eski anlamdan yeni anlama" olarak yazılır; eski PASS
   çıktısı (commit öncesi koşu) ile yeni koşu ayrı raporlanır.
2. Fixture güncellemesi **yalnız o MON'un kendi commitinde** olur; önceden
   "geleceğe hazır" yazılmaz (bu kartın yasağı).
3. Bir assertionın yeni semantiği tarif edilemiyorsa → halt; MON-S5 güncellenir,
   state `blocked`, LEDGER'a kanıt.
4. `assertLoadOrder` (MON-S4) hiçbir geçişte kaldırılamaz; yalnız index ile
   birlikte büyür.
5. Kapı paketi her geçişte koşar; "eski test FAIL ama yeni semantik geçiyor"
   durumu ancak aynı committe fixture güncellemesiyle meşrudur.

## 5. Kapsam dışı / dokunulmayan

Bu kart **hiçbir fixture, modül, index veya app.js satırını değiştirmedi**.
Dört fixture bugünkü hâliyle PASS kanıtı aşağıdadır; tablo yalnızca gelecek
geçişlerin sözleşmesidir.

## 6. Doğrulama kanıtı

| Kapı | Sonuç |
|---|---|
| 4 boundary fixture (modularization, faz-minus11, date-utils, helpers) | TÜMÜ PASS |
| syntax ×2, driver, zikr 95/95, 6 app fixture, panel faz11, premium (8), reminder-smoke | TÜMÜ PASS |
| `git diff --check` | PASS |

## 7. Halt değerlendirmesi

Tüm assertion grupları için yeni semantik tarif edilebildi; halt tetiklenmedi.
Üç grup daima-değişmez ilan edildi: [5]/[6]/[9] (I2 + M3/B1), D-2 (saf
davranış), H-3 (helpers FX çağıramaz).

## 8. Sonraki kart

`MON-06 · Dalga 1 kapanışı` — yeni açık kullanıcı onayı ile.