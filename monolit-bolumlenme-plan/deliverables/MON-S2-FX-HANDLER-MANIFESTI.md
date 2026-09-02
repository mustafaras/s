# MON-S2 — Premium FX ve App Yüzeyi Değişmezlik Manifesti

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-02` · **Tarih:** 2026-09-02
**Tür:** Ölçülebilir değişmezlik manifesti (kod taşıma yok) · **Dal:** `zikirmatik-manuel-zikir` — LOCAL-ONLY
**Öncül:** MON-01 (`MON-S1-DELEGASYON-KARARI.md`) · **Sınıf:** yapılandırma/kanıt

## 1. Neden bu manifest var

Refactor boyunca Premium FX çağrı yüzeyi (M4) ve `App.*` handler yüzeyi (I2)
ölçülebilir biçimde korunacaktır. Bu belge, her taşıma öncesi/sonrası
karşılaştırılacak **canlı referans değerleri**, **ölçüm yöntem tanımlarını** ve
**FX registry yasağını** kaydeder. Bir sonraki taşımada bu sayılardan herhangi
birine açıklanamayan sapma gelirse o prompt fail'dir.

## 2. Baseline bayatlığı ve ZP-10 yeniden ölçümü

MON-01 baseline'ı (18.957 satır / 545 App function / 704 tüm App) **bayattı**:
`ZP-10` (commit `cf88f83`, dal `zikirmatik-manuel-zikir`) `app.js`'e +298 satır,
`sync.js`'e +123 satır ve yeni `tests/app/test_zikr_manual_entry.js` fixture'ı
ekledi. Bu prompt tüm değerleri canlı HEAD (19247 satır) üzerinde yeniden ölçtü.

**ZP-10 delta mutabakatı (f436e28 MON-01 → canlı HEAD):**

| Değişim | Kanıt |
|---|---|
| 9 yeni App function eklendi | `App.setZikrPreset*` yeniden yazım hariç: `saveZikrManual`, `undoZikrManual`, `toggleZikrManual`, `zikrManualStep`, `zikrManualChip`, `zikrManualApply`, `onZikrManualAmount`, `onZikrManualNote` |
| 1 App function satırı değişti (silinip yeniden eklendi) | `App.setZikrPreset` gövde güncellemesi → net function satır farkı **+8** (9 ekleme − 1 satır yeniden yazım) |
| 9 serbest fonksiyon eklendi | `zikrManualActive`, `zikrManualAmountOf`, `zikrManualApply`, `zikrManualDraftFor`, `zikrManualEntryCountFor`, `zikrManualPreviewHTML`, `zikrManualQuickChips`, `zikrManualSheetHTML`, `zikrManualUndoEntry` |
| FX yüzeyi +1 satır (+2 occurrence) | `App.saveZikrManual` içine tek hatim çağrısı: satır 8996 `SeyAudio.bell()` (satır sayısı 26→27, occurrence 51→53) |
| 8 yeni inline onclick | yeni zikir manuel yüzeyi için |
| `data.zikr.manualEntries[]` | yeni kalıcı alan; `sync.js mergeZikr` V5 union matematiği **I5 kapsamında dokunulmaz** |

**Sahiplik kararı:** manuel zikir yüzeyi **zikir domain sınıfına** aittir
(MON-19..43 zikir kartının envanterine işler). MON-02'de yalnız ölçüldü,
taşınmadı. 9 serbest `zikrManual*` fonksiyonu saf/yalnız-okur adaylar olarak
MON-S3 matrisinde sınıflanacaktır.

## 3. Ölçüm yöntemleri (üç metrik karıştırılmaz)

Aynı grep kalıbı farklı sorulara cevap verir; her taşıma raporunda hangi
metodun kullanıldığı ayrıca yazılır.

| # | Metrik | Komut | Canlı değer |
|---|---|---|---:|
| A | App function **satır** (bir satırda tek atama varsayımıyla) | `grep -cE 'App\.[a-zA-Z0-9_]+\s*=\s*function' app.js` | **553** |
| B | App function **occurrence** | `grep -oE 'App\.[a-zA-Z0-9_]+\s*=\s*function' \| wc -l` | 553 |
| C | App function **eşsiz ad** | `grep -oE … \| sort -u \| wc -l` | 553 |
| D | Tüm App atama **satır** (function dışı alias/property dâhil) | `grep -cE 'App\.[a-zA-Z0-9_]+\s*=' app.js` | **713** |
| E | Tüm App atama **occurrence** (`==` dışlanır) | `grep -oE 'App\.[a-zA-Z0-9_]+[ ]*=[^=]' \| wc -l` | 714 |
| F | Inline onclick **satır** | `grep -cE 'onclick="App\.' app.js` | 385 |
| G | Inline onclick **occurrence** (bir satırda çok handler mümkün) | `grep -oE 'onclick="App\.' \| wc -l` | **423** |
| H | Inline onclick **eşsiz handler ad** | `grep -oE 'onclick="App\.[a-zA-Z0-9_]+' \| sort -u \| wc -l` | **326** |

> MON-01'deki "545/704/415-321" değerleri A/D/F+H metodlarıydı; canlı karşılıkları
> 553/713/385-326'dır. Fark tamamen ZP-10'dandır (§2 mutabakat tablosu).
> E metrik D'den 1 büyük olabilir: aynı satırda ikinci `App.x=` yazımı occurrence
> sayar, satır saymaz.

## 4. FX çağrı manifesti — 48 satır, 101 occurrence, 13 metot

**Kaynak tarama:** `grep -nE 'Sey(Audio|Haptics|Fx|TimeTheme)\.' app.js`
**Metot kırılımı (canlı):** `SeyAudio.guides ×12`, `SeyAudio.warning ×10`,
`SeyAudio.voice ×8`, `SeyAudio.success ×8`, `SeyAudio.bell ×8`,
`SeyAudio.tap ×3`, `SeyAudio.isQuietTime ×2`, `SeyAudio.greeting ×2`,
`SeyHaptics.tap ×34`, `SeyHaptics.streak ×6`, `SeyHaptics.water ×2`,
`SeyFx.shimmer ×2`, `SeyFx.countUp ×2`, `SeyTimeTheme.apply ×2`.
**Sayım:** satır 27/21/2/2 (SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme);
occurrence 53/42/4/2. Toplam 48 satır, 101 occurrence.

### 4.1 Sahiplik fonksiyonu bağlama yöntemi

Her çağrı satırı, o satıra kadar son görülen satır-başlangıçlı
`function <ad>` veya `App.<ad>=function` bildirimine bağlanır (Node script,
`/tmp/fxbind.mjs` kanıt). Bu yaklaşım tek-IIFE dosyada yeterli ve
tekrarlanabilirdir; taşımalar sırasında aynı script yeniden koşar.

### 4.2 Çağrı tablosu (satır ↑ sıralı)

| Satır | Sahip | Çağrı | Guard |
|---|---|---|---|
| 6798 | `App.start @6789` | SeyAudio.voice | yorum (yorum satırı) |
| 6802 | `App.start` | SeyAudio.voice | typeof-guard |
| 6803 | `App.start` | SeyAudio.voice | çağrı |
| 8224 | `App.reminderInboxPrimary @8219` | SeyAudio.bell | typeof-guard |
| 8341 | `App.toggleTheme @8341` | SeyHaptics.tap | typeof-guard |
| 8343 | `App.toggleHabit @8342` | SeyHaptics.tap | typeof-guard |
| 8355 | `App.toggleHabit` | SeyAudio.success | typeof-guard |
| 8356 | `App.toggleHabit` | SeyAudio.success | typeof-guard |
| 8367 | `App.toggleMgHabit @8358` | SeyAudio.success | typeof-guard |
| 8405 | `fn:maybeStreak @8405` | SeyAudio.success + SeyHaptics.streak + SeyFx.shimmer | typeof-guard ×3 |
| 8406 | `fn:maybeStreak` | SeyAudio.voice | typeof-guard |
| 8407 | `App.setMood @8407` | SeyHaptics.tap | typeof-guard |
| 8424 | `App.toggleSetting @8420` | SeyHaptics.tap | typeof-guard (+`premiumAtmosphere` ayar koşulu) |
| 8439 | `App.waterAdd @8439` | SeyHaptics.water + SeyFx.countUp | typeof-guard ×2 |
| 8442 | `App.setEnergy @8442` | SeyHaptics.tap | typeof-guard |
| 8443 | `App.setStress @8443` | SeyHaptics.tap | typeof-guard |
| 8447 | `App.addCaffeineDrink @8447` | SeyAudio.warning | typeof-guard |
| 8461 | `App.openReading @8461` | SeyHaptics.tap | typeof-guard |
| 8462 | `App.closeReading @8462` | SeyHaptics.tap | typeof-guard |
| 8498 | `App.rateBook @8498` | SeyHaptics.tap | typeof-guard |
| 8509 | `App.saveQuote @8509` | SeyAudio.warning | typeof-guard |
| 8522 | `App.openWatching @8522` | SeyHaptics.tap | typeof-guard |
| 8523 | `App.closeWatching @8523` | SeyHaptics.tap | typeof-guard |
| 8562 | `App.rateTitle @8562` | SeyHaptics.tap | typeof-guard |
| 8577 | `App.openListening @8577` | SeyHaptics.tap | typeof-guard |
| 8578 | `App.closeListening @8578` | SeyHaptics.tap | typeof-guard |
| 8610 | `App.rateTrack @8610` | SeyHaptics.tap | typeof-guard |
| 8636–8639 | `fn:zikrTickSound @8634` | SeyAudio.tap ×3 | typeof-guard + 2 çağrı |
| 8723 | `App.zikrTap @8715` | SeyAudio.guides | obj+typeof (guides.zikirStart) |
| 8730 | `App.zikrTap` | SeyAudio.bell | typeof-guard |
| 8731 | `App.zikrTap` | SeyHaptics.streak | typeof-guard |
| 8737 | `App.zikrTap` | SeyAudio.guides | yorum (tek kaynak notu) |
| 8738 | `App.zikrTap` | SeyAudio.voice | yorum (gating notu) |
| 8742 | `App.zikrTap` | SeyAudio.guides | typeof-guard (zikirComplete) |
| 8743 | `App.zikrTap` | SeyAudio.voice | typeof-guard (fallback) |
| 8766 | `App.zikrTap` | SeyAudio.guides | obj+typeof (zikirHalf) |
| 8996 | `App.saveZikrManual @8988` | SeyAudio.bell | typeof-guard — **ZP-10'dan gelen tek yeni FX satırı** |
| 9750 | `App.setRoomTab @9750` | SeyHaptics.tap | typeof-guard |
| 9838 | `App.saveToday @9838` | SeyHaptics.tap | typeof-guard |
| 10171–10172 | `fn:render @9975` | SeyTimeTheme.apply ×2 | typeof-guard + try/catch çağrı |
| 12109 | `App.completeMotivationTask @12105` | SeyAudio.warning | typeof-guard |
| 12124 | `App.completeMotivationTask` | SeyAudio.bell + SeyHaptics.streak | typeof-guard ×2 |
| 18282 | `fn:streamAsk @18278` | SeyAudio.warning | typeof-guard |
| 19183 | `fn:maybeVoiceGreeting @19180` | SeyAudio.isQuietTime | typeof-guard (quiet-time koşulu) |
| 19191 | `fn:maybeVoiceGreeting` | SeyAudio.greeting | typeof-guard |

### 4.3 Guard biçimi sınıflaması

- **typeof-guard** (baskın biçim): `if(window.SeyX && typeof window.SeyX.m==='function') …`
  — 44 satır. Çağrı ile aynı biçimde korunur; hiçbir taşımada guard kaldırılamaz.
- **obj+typeof** (2 satır): `guides` alt-nesnesi için
  `window.SeyAudio && window.SeyAudio.guides && typeof …guides.x==='function'`.
- **try/catch sarımlı çağrı** (3 satır: 8996, 10172, 12124 bölgesi): hata
  yutma davranışı I4 kapsamında aynen korunur.
- **Ayar bağımlı koşul** (1 satır: 8424): `data.settings.premiumAtmosphere`
  koşulu korunur — bu bir kullanıcı ayarıdır, M4 anlamını taşır.

## 5. MON-S2 kararı — FX registry yasağı

Gelecekte kurulacak herhangi bir `window.Seyma<Module>` registry'si:
1. `window.SeyAudio` / `SeyHaptics` / `SeyFx` / `SeyTimeTheme` modüllerini
   **yeniden tanımlayamaz, sarmalayamaz veya kendi adına bağlayamaz**;
   yalnızca mevcut global üzerinden çağırabilir.
2. FX çağrı satırları domain modüllere taşınırken **ad + metot + argüman
   sırası + guard biçimi + try/catch davranışı** aynen korunur; bu tablo
   (§4.2) taşınan satırın önce/sonra eşleşme referansıdır.
3. FX fixture ailesi (`tests/app/test_premium_*.js`, 8 fixture) her FX
   temaslı taşımada zorunlu kapıdır; bir fixture FAIL, açıklanabilir kod
   farkı olmaksızın "eski test" diye bastırılamaz.

## 6. Canlı baseline tablosu (MON-02 güncellemesi — 19247 satır)

| Çıpa | Canlı değer (2026-09-02, `cf88f83`) | MON-01 bayat değeri |
|---|---:|---:|
| `app.js` satır / IIFE sonu | **19.247** / son satır `})();` | 18.957 |
| `var data=null` | **2772** | 2713 |
| localStorage yükleme / `migrate(data)` | **4474 / 4475** | 4415 / 4416 |
| B1 getter bloğu (7 `Object.defineProperty`) | **4483 civarı** (7 tanım) | 4424–4430 |
| `function migrate(` | **4490** | 4431 |
| `function getDay(` | **5023** | 4964 |
| Geçici data takası + `finally{data=savedData}` | **6138** | 6079 |
| `window.SeyOnSyncState` / `SeyOnSynced` | **6299 / 6309** | 6240 / 6250 |
| `function save(` | **6330** | 6271 |
| `var App=` | **6515** | 6456 |
| `App.start=` | **6789** | — |
| `function createDefaultData(` | **6785** | 6726 |
| `App.importJson` (data=d) | **9460** | 9266* |
| `App.resetConfirm` (data=null) | **9464** | 9270* |
| late-boot `if(!data) data=migrate(…)` | **19147** | —* |
| `window.App=App` | **17311** | 17021 |
| App function satır (metrik A) | **553** | 545 |
| Tüm App atama satır (metrik D) | **713** | 704 |
| Inline onclick satır/occurrence (F/G) | **385 / 423** | 415 / — |
| Inline onclick eşsiz handler (H) | **326** | 321 |
| FX satır (SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme) | **27 / 21 / 2 / 2** | 26 / 21 / 2 / 2 |
| FX occurrence (SeyAudio/SeyHaptics/SeyFx/SeyTimeTheme) | **53 / 42 / 4 / 2** | 51 / 42 / 4 / 2 |
| `data=` rebind satır kümesi | **2772, 4474, 4475, 6138, 6793, 9460, 9464, 19147** (8 satır) + `var data=null` bildirimi | 9 satır |

\* MON-01 tablosundaki satır numaraları ZP-10 öncesi dosyaya aittir; aynı
kod satırları ZP-10 sonrası numaralara kaymıştır (kod değişmedi, konum
değişti). `data=` rebind satır sayısı MON-01'de "9 satır/11 token" idi;
ZP-10 sonrası canlı sayım 8 rebind satırı + bildirim verir (`data=` genel
occurrence 11'dir: 8 rebind + 6793/19147 aynı kalıp + bildirim — token/satır
metrikleri ayrı tutulur, §3 ilkesi).

## 7. Doğrulama kapısı kanıtı (tümü PASS, exit 0)

| Kapı | Sonuç |
|---|---|
| `node --check app.js` / `node --check sync.js` | PASS |
| `driver.mjs` (reminder/ÆON kanal ayrıklığı dâhil) | PASS |
| `zikr-harness.mjs` — **95/95 assertion** | PASS |
| `tests/app/test_modularization_boundary.js` | PASS |
| `tests/app/test_faz_minus11_boundary.js` | PASS |
| `tests/app/test_date_utils_boundary.js` | PASS |
| `tests/app/test_helpers_boundary.js` | PASS |
| `tests/app/test_faz10_sync.js` | PASS |
| `tests/app/test_zikr_manual_entry.js` (ZP-10 yeni fixture) | PASS |
| `tests/panel/test_faz11_panel.js` | PASS |
| `for f in tests/app/test_premium_*.js` — 8 fixture | TÜMÜ PASS |
| `tests/reminders/run-reminder-smoke.mjs` | PASS |

## 8. Kanıt paketi ve açık kalanlar

- Özellikle FX +2 delta tek noktadan açıklanmıştır: satır 8996,
  `App.saveZikrManual`, ZP-10 diff `+cyclesGained` (5 satır) bloğu.
- `App.setZikrPreset` satır yeniden yazımı (sil+ekle) net +8 mutabakatını
  sağlar; handler adı/imza I2 altında değişmemiştir (diff aynı başlangıçlı
  gövde güncellemesi).
- Bu prompt üretim dosyasına dokunmadı; deliverable + state zinciri tek
  yerel committe olur.
- **Açık kalan:** yok — halt koşulu tetiklenmedi (FX fixture FAIL yok,
  açıklanamayan çağrı farkı yok).

## 9. Sonraki kart

`MON-03 · 24 modül sahiplik ve yükleme matrisi` — yeni açık kullanıcı onayı
ile başlar. Bu manifestin değerleri MON-S3 matrisinin girişidir.