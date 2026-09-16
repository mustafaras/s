# MON-D6 — Terapi ve bakım çapraz kapanış raporu

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Öncüller: MON-26, MON-27, MON-28, MON-29, MON-30, MON-31
Durum: **TAMAMLANDI — LOCAL-ONLY**

## Karar

Dalga 6 kapanmıştır. Motivation, crisis, journal ve health registry'lerinin
mevcut dependency read contract'ları; App-owned state, mutation, save, DOM,
render ve modal focus sınırlarıyla birlikte canlı kaynak ve sentetik headless
fixture'larda doğrulanmıştır. Bu kapanış yeni modül, UX veya data alanı
eklemez; yalnız mevcut kanıtları tek raporda birleştirir.

## Dört registry dependency grafiği

Grafik canlı modül sabitleri ile app.js'deki tekil registration bag'lerinden
türetilmiştir. Her okuma dependency'si çağrı anında resolver üzerinden gelir;
registry'ler `data=` ataması, kalıcı save, DOM/focus, timer veya network sahibi
değildir.

| Registry | Dependency read contract | Canlı sahiplik / sınır |
|---|---|---|
| `SeymaMotivation` | `data`, `ui`, `dark`, `getDay`, `activeDate`, `diffDays`, `icon`, `esc`, `segTabs`, `progBar`, `featuresLive`, `fmtWhen`, `fmtDateNice` (**13**) | Terapi Odası view/parser üretimi registry'de; `completeMotivationTask`, `saveDailyWin`, timer/fetch, App handler ve modal focus app.js'te. |
| `SeymaCrisis` | `data`, `ui`, `dark`, `todayStr`, `isVacationDay`, `icon`, `esc`, `find`, `pad` (**9**) | Güvenlik kopyası, crisis catalog ve modal HTML registry'de; craving state write, save, App handler ve focus app.js'te. |
| `SeymaJournal` | `data`, `ui`, `activeDate`, `dayIndexFor`, `todayStr`, `addDays`, `icon`, `esc`, `find`, `motivationProgram` (**10**) | Günlük kart/modal ve faz yardımcıları registry'de; text/count/streak/savedAt save sırası, DOM, focus ve App handler app.js'te. |
| `SeymaHealth` | Çekirdek: `data`, `dateUtils`, `isVacationDay`, `vacationSettings`, `cycleStats`, `readingStats`, `num`, `windDownSteps` (**8**); görünüm: `ui`, `activeDate`, `dayIndexFor`, `shortDate`, `dark`, `icon`, `esc`, `find`, `cardOpen`, `editing`, `collapsibleCardHTML`, `emptyMealItems`, `meals`, `sleepQ`, `sleepMed`, `mgForms`, `moods`, `phases`, `flow`, `symptoms`, `bodyRegions`, `dzSilhouette`, `dlevels`, `dmeds`, `findRegion`, `dzColor`, `sciNote`, `hBadge`, `fmtDist`, `fmtDur`, `bodyData`, `ghCfgApp`, `dateLabelTR`, `energyStressBlock`, `timeHM`, `ensureHealthCardState` (**36**) | Hesaplama ve health kart/view üretimi registry'de; kart tercih state'i, mutation/save, DOM, render ve App handler app.js'te. |

Ortak çapraz zincir:

```text
app.js canlı data/ui/dark + yardımcı resolverlar
  ├─> SeymaMotivation ──> Terapi Odası HTML/parser
  ├─> SeymaCrisis ──────> kriz/triggers/modal HTML
  ├─> SeymaJournal ─────> Günlük Işığı kart/modal
  └─> SeymaHealth ──────> health hesapları/kartları/saglikHTML
        └─> app.js App.* + DOM/focus/mutation/save/render kabuğu
```

## UI, modal, save ve state kanıtı

| Alan | Kanıt | Sonuç |
|---|---|---|
| Motivation / Terapi Odası | `test_motivation_room_accessibility.js` | **12/12 PASS**; dialog semantiği, Escape, Tab/Shift+Tab, focus ve render'sız reflection yolu. |
| Ortak modal focus | `test_modal_focus_containment.js` | **41/41 PASS**; Günlük, Kriz, İman, Kıble, Öncü, zikir, Kur’an, ÆON ve ortak modal yüzeyleri. |
| Save sahipliği/sırası | `test_syncGlue_save_boundary.js` | **19/19 PASS**; dirty/event → derived → local persistence → projection → lazy sync sırası korunuyor. |
| Migration/getDay | `verify-state-migration-boundary.mjs` | **67/67 PASS**; legacy/normal/future, unknown alan, idempotence ve MON-31 malformed sleep guard'ları. |
| Health registry | `test_health_boundary.js` | **30/30 PASS**; hesap eşdeğerliği, no-mutation ve görünüm shimleri. |
| Cross-surface smoke | `driver.mjs`, `zikr-harness.mjs` | Driver **PASS**, Zikirmatik **95/95 PASS**; light/dark, tab, onboarding ve reminder yüzeyleri. |
| Sync/premium | Faz10 + `tests/app/test_premium_*.js` | Sync **69/69 PASS**; premium ailesi exit 0, `test_premium_settings` **39/39**. |

## Birleştirilen dump manifestleri

Önceki domain kanıtları ve canlı dump üretimleri tek kapanış zincirinde
birleştirildi:

| Yüzey | Kaynak kanıtı | Canlı headless dump |
|---|---|---:|
| Motivation / Terapi Odası | `MON-26-MOTIVATION-ENVANTERI.md` | `driver --dump bugun` **PASS — 111.961 byte** |
| Crisis / SOS | `MON-27-CRISIS-ENVANTERI.md` | `driver --dump sos` **PASS — 8.072 byte** |
| Journal / Günlük Işığı | `MON-28-JOURNAL-STATE-TRANSITION.md` | `bugun` kartı **1.116/1.116 byte**, SHA parity kayıtlı |
| Health / Sağlık | `MON-30-SAGLIK-DUMP-MANIFESTI.md`, `MON-D6-HEALTH-RAPORU.md` | `driver --dump saglik` **PASS — 65.622 byte** |

Dump boyutları üretim makbuzudur; dinamik zaman/skor alanları nedeniyle tek
başına davranış veya cihaz kabulü iddiası değildir. Davranış kabulü yukarıdaki
focused fixture'lar ve tam regression ile birlikte değerlendirilmiştir.

## Load order, cache-bust ve FILES etkisi

MON-32 yeni dosya veya yeni runtime module eklemedi. `index.html`, driver,
zikr harness ve state-rebind boot listelerindeki mevcut dört registry üyesi
aynı sırada kaldı:

```text
motivation → crisis → journal → health → app.js
```

Bu nedenle bu kartta cache-bust değişikliği ve yeni FILES üyesi yoktur. Önceki
kartların canlı cache-bust'leri korunur: motivation/crisis/journal/health
modülleri ile app.js mevcut sürümleriyle yüklenir; MON-31 state fix'i de
`state.js?v=20260910b` olarak korunur.

## S1–S8, I1–I6, M1–M4 kapanış özeti

| Sözleşme | Kanıt |
|---|---|
| S1–S8 | Dört registry load-safe; dependency bag tek-kayıt ve lazy resolver; ilgili boundary ve full regression PASS. |
| I1 | State şekli/persistence semantics ve normal/malformed migration parity korunuyor. |
| I2 | App handler isimleri, imzaları, inline `onclick` yüzeyi ve modal close yolları korunuyor. |
| I3 | `migrate()` registry/shim parity, legacy/normal/future ve MON-31 health normalization PASS. |
| I4 | Render call graph, DOM ownership ve ortak modal keyboard/focus contract değişmedi. |
| I5 | `sync.js`, Guard 1/2 ve remote boundary untouched; synthetic tests network/write üretmedi. |
| I6 | Bu rapor, state, current state ve LEDGER tek yerel MON-32 commit'inde kapanmıştır. |
| M1 | Registry'ler app.js signature-preserving shimleriyle çağrılıyor; eager DOM/network işi yok. |
| M2/M2' | `data`, `ui`, `dark`, reset/import/location/auth rebind sahipliği app.js'te kaldı. |
| M3 | `SeyOnSyncState`/`SeyOnSynced` app.js-owned callback yüzeyi korunuyor. |
| M4 | Premium FX API'leri ve guard'lı call site semantics değişmedi; premium suite PASS. |

## Dalga 6 açık riskleri ve ayrı kabul sınırı

- Headless Node/VM ve fixture PASS, gerçek iPhone/Safari veya başka kullanıcı
  cihazı kabulü değildir; cihaz doğrulaması ayrı ve yapılmamıştır.
- GitHub Pages/deploy, push, merge, tag ve `mustafaras/seyma-data` yazımı bu
  kapanışın dışında ve yapılmamıştır.
- `run-seyma` harness'i gerçek browser/localStorage/token kullanmaz; canlı
  cihazdaki network, OS izinleri ve Safari odak davranışı ayrıca doğrulanabilir.
- Test çıktısındaki mevcut Node module-type ve Git fsmonitor IPC uyarıları
  kapı başarısızlığı değildir; ilgili komutların exit kodu 0'dır.

## Değişmezlik

Bu kartta `app.js`, `app/core/*`, `sync.js`, `panel/*`, `styles.css`, settings
schema, content ve data kaynakları değiştirilmedi. Yeni modül, UX veya data
alanı eklenmedi. Kanıt seviyesi source + synthetic headless regression'dır;
deploy/device acceptance iddiası yoktur.

**Sonuç:** Dalga 6 (`MON-26..MON-32`) kapanmıştır. MON-32 tamamlandı; state
`in_progress`, `blockedPrompt=null`, sıradaki kart MON-33'tür ve yeni açık
kullanıcı yönü olmadan başlatılmayacaktır.
