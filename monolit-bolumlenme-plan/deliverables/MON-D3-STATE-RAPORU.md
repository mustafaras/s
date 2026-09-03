# MON-D3 — State Dalga 3 Kapanış ve B1 Yeniden-Atama Raporu

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-15`
**Tarih:** 2026-09-03
**Durum:** ✅ Kabul edildi — tek yerel commit, LOCAL-ONLY

## 1. Kapsam ve karar

MON-15 yeni bir state gövdesi taşımadı. MON-11’de kilitlenen M2/M2prime
kararı bağımsız kaynak ve sentetik VM kanıtıyla kapatıldı:

- `data`, `ui` ve `dark` kapanış değerleri app.js sahibidir.
- `window.data/ui/dark/migrate/getDay/createDefaultData/save` yalnızca
  getter-only canlı okuma yüzeyidir; setter, snapshot veya yazılabilir registry
  yoktur.
- Import, reset, location late-boot, auth unlock ve 6079 geçici takası app.js’te
  kalır.
- `app/core/state.js` gerçek kodunda `data=` ataması yoktur.
- `syncGlue.js`, `save()`, `sync.js`, App handler gövdeleri ve üretim state
  semantiği bu kartta taşınmadı/değiştirilmedi.

Bu kartın çalışma sayfasındaki “karar/kapanış kartında üretim gövdesi
taşınmaz” sınırı korunmuştur.

## 2. Canlı kaynak envanteri

Kullanılan sorgu:

```bash
rg -n 'data\s*=\s*[^=]' app.js
rg -n 'data\s*=\s*[^=]' app/core/state.js
```

Yorum satırları çıkarılarak ölçülen canlı sonuç:

| Ölçüm | Sonuç |
|---|---:|
| `app.js` data atama kaynak satırı | **9** |
| `app.js` data atama tokenı | **11** |
| başlangıç bildirimi hariç rebind tokenı | **10** |
| `app/core/state.js` gerçek kod data ataması | **0** |
| `app.js` satırı | **19.048** |
| `app/core/state.js` satırı | **498** |
| `App.x=function` ataması | **553** |
| `App.x=` toplamı | **715** |
| inline `onclick="App...` occurrence / eşsiz handler | **420 / 325** |

Dokuz kaynak satırı ve sahipleri:

| Canlı satır | Token | Sahiplik / davranış |
|---:|---:|---|
| `app.js:2772` | 1 | `var data=null`; app.js kapanış bildirimi |
| `app.js:4539` | 2 | localStorage parse/fallback ve catch `null`; app.js boot |
| `app.js:4540` | 1 | boot migration sonucu; app.js boot |
| `app.js:5988` | 2 | 6079 tarihli geçici `data=d` ve `finally data=savedData`; app.js adaptörü |
| `app.js:6594` | 1 | `App.start` default root; App/boot |
| `app.js:9261` | 1 | `App.importJson` ham import; App handler |
| `app.js:9265` | 1 | `App.resetConfirm` `data=null`; App handler |
| `app.js:9291` | 1 | location late-boot default root; App handler |
| `app.js:18948` | 1 | auth unlock late-boot default root; App handler |

`ui` initialization ve `dark` initialization/rebindleri de app.js’te kaldı;
state registry yalnız okur. `syncGlue.js` içinde `SeyOnSyncState` veya
`SeyOnSynced` setter/ataması bulunmuyor.

## 3. B1 canlı getter ve strict-mode kanıtı

`tests/app/test_state_rebind_boundary.js` tam üretim script sırasını sentetik
`node:vm` içinde yükler. Şunlar bağımsız olarak kanıtlandı:

- app.js tarafındaki yedi property (`data`, `ui`, `dark`, `migrate`, `getDay`,
  `createDefaultData`, `save`) getter-only ve configurable.
- `SeymaState` state getter’ları getter-only; yazılabilir store/setter yok.
- VM-local strict-mode probe, yedi window getter’ının tamamında yazmayı
  `TypeError` olarak reddediyor; `SeymaState.data` yazımı da reddediliyor.
- `App.go('ayarlar')` sonrası `SeymaState.ui.tab` taze değeri verir.
- `App.setTheme(true)` sonrası `SeymaState.dark` taze `true` değerini verir.
- `SeymaState.data`, aynı canlı closure root’unu döndürmeye devam eder.

Node VM’nin host-backed sandbox nesnesine doğrudan strict assignment yazımı
ortam tarafından sessiz karşılanabildiği için fixture, gerçek accessor
descriptor’ını VM-local objeye kopyalayarak strict-mode semantiğini ölçer.
Bu, descriptor’ın setter’sız olma koşulunu gevşetmez; tersine onu doğrudan
ölçer.

## 4. Rebind senaryoları

| Senaryo | Sentetik kanıt |
|---|---|
| Import | `App.importJson` eski root yerine import edilen marker’lı yeni root’u canlı getter’da gösterir; `data=d` app.js’tedir. |
| Reset | İki aşamalı `App.resetConfirm` sonrası `SeymaState.data === null`; yalnız sentetik localStorage anahtarı kaldırılır. |
| Location late-boot | Boş boot sonrası sentetik başarılı konum callback’i default root üretir; `settings.locationEnabled === true`; getter tazedir. |
| Auth unlock late-boot | Gerçek `App.submitAuth` gövdesi, yalnız test sandbox’ında değiştirilmiş hash ile çalıştırılır; default root ve `auth.unlockedAt` oluşur. Üretim `AUTH_HASH` değişmez. |
| 6079 takası | `SeymaState.migrate(candidate)` candidate’ı döndürür; migrate içindeki app.js `try/finally` takası sonrası önceki closure root aynı kimlikle geri gelir. |

Auth fixture’ındaki hash değişimi yalnız in-memory source override’dır; gerçek
kullanıcı parolası, token veya üretim dosyası kullanılmamıştır.

## 5. Değişmezlik ve dosya etkisi

| Alan | MON-15 sonucu |
|---|---|
| `data` kökü / settings / migrate / getDay / default semantiği | Değişmedi; MON-14 default hash ve B2 parity korunuyor. |
| `data` rebind sahipliği | Dokuz app.js kaynak satırı korunuyor; registryde sıfır. |
| `6079` `try/finally` | Değişmedi; hata/normal dönüşte geri-bind kanıtlandı. |
| App function / App toplamı / inline onclick / FX | Kaynak değişmedi; mevcut metrikler korunuyor. |
| `syncGlue.js`, `save()`, `sync.js` | Dokunulmadı. |
| `index.html` cache-bust | Değişmedi: state `20260903e`, app `20260903c`. |
| driver / zikr `FILES` | Değişmedi; yeni production `app/core` dosyası yok. |
| production `data/`, panel, SW, remote/deploy | Dokunulmadı. |

## 6. Kanıt ve sonuç

Özel fixture:

```text
node tests/app/test_state_rebind_boundary.js
MON-15 result: PASS (37 passed, 0 failed)
```

Kartın zorunlu state üçlüsü ve ilişkili kapıları:

```text
verify-state-helper-boundary.mjs       PASS (0 failures)
verify-state-migration-boundary.mjs   PASS (60 passed, 0 failed)
verify-state-adapter-contract.mjs     PASS (20 passed, 0 failed)
test_faz10_sync.js                    PASS (69 passed, 0 failed)
driver.mjs                            PASS
zikr-harness.mjs                      PASS (95/95)
node --check app.js/sync.js/state.js  PASS
premium fixture family               PASS
```

Tam app/panel/Panel-v2/Quran/reminder fixture aileleri ve diff/cache kontrolleri
de commit öncesi exit 0 verdi. Headless kaynak kanıtı deploy veya kullanıcı
cihazı kabulü değildir; bu kartta browser, push, merge, tag, deploy ve gerçek
veri deposu yazımı yapılmadı.

## 7. Handoff

MON-15 kabul edilmiştir. `MON-STATE.json` Dalga 3’ü `5/5` tamamlanmış,
`blockedPrompt` boş ve sıradaki kartı `MON-16` olarak gösterir. MON-16
syncGlue kapsamındadır ve yeni açık kullanıcı onayı olmadan başlatılmaz.
