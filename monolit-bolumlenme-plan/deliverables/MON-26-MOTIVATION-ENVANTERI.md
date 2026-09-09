# MON-26 — Motivation Domain Envanteri ve Taşıma Kanıtı

**Tarih:** 2026-09-09 · **Öncül:** MON-25 · **Sınıf:** domain · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)

## 1. Envanter (çalışma sayfası adım 1)

Taşıma öncesi canlı ölçüm (`grep -nE 'roomOverlayHTML|roomBodyHTML|Motivation|completeMotivation' app.js`):

| Grup | Üyeler | app.js satır (taşıma öncesi) |
|---|---|---|
| Kişiselleştirme yardımcıları | `motivationIsCourageDomain`, `motivationPersonalLine`, `motivationEvidenceLine`, `motivationNextStepLabel` | 10438–10463 |
| Kompakt kart | `motivationBadgeHTML`, `motivationSignHTML`, `motivationQuoteBlockHTML`, `motivationComingSoonCardHTML`, `motivationTodayCardHTML` | 10466–10541 |
| Oda görünümleri | `roomStatsHTML`, `roomOverlayHTML`, `roomBodyHTML`, `roomPathHTML`, `roomDailyWinHTML`, `roomFlexNudgeHTML`, `roomToolCard`, `roomToolsHTML`, `roomProfileHTML` | 10543–10949 |
| Profil yardımcıları | `roomPrettyRiasec`, `roomPrettyValue`, `roomCalendarDayIndex`, `roomDailyContentHTML` | 10951–11095 |
| Katalog | `ROOM_CONTENT_CATALOG` (88 öğe: 29 read + 29 watch + 30 listen) | 10960–11054 |
| Profil parser | `parseScientificProfileMD`, `roomValueKey` | 11124–11153 |

## 2. Bağımlılık çizelgesi (adım 2)

| Aday | Etiket | Karar |
|---|---|---|
| Görünüm üreticileri (yukarıdaki 22 fonksiyon + katalog + parser) | (a) saf + (b) B1 salt-okur (`data`/`ui`/`dark` canlı getter) | `SeymaMotivation` registry'sine taşındı |
| `App.openRoom/closeRoom/updateRoom/setRoomTab/toggleRoomTool/toggleMotivationCard` | (c) ui mutasyonu + render + focus | app.js'te kaldı |
| `App.completeMotivationTask`, `App.saveDailyWin`, `App.copyFlexNudge`, `App.setMotivationReflection`, `App.copyMotivationExample` | (c) state mutasyonu (`M.record`+`save`/`commit`) | app.js'te kaldı |
| `App.saveFirstStep/saveSelfCompassion/presetSelfCompassion/setBreathPattern/toggleBreath/stopBreath/saveDecision/startDecisionTimer/chooseDecision/saveThought/saveShareNote/sendAeonShare/saveDailyWin` + tools timer'ları | (c)+(d) `data` yazımı + `setInterval` timer + `toast/haptic` | app.js'te kaldı |
| `App.fetchProfileForRoom` | (d) ağ (`fetch` GitHub contents) + parser | app.js'te kaldı (parser shim'i registry'den) |
| `App.confirmMotivationMinimum/openMotivationMinimum/closeMotivationMinimum/toggleMotivationExamples` | (c) yalnız `ui` geçici durum | app.js'te kaldı |
| `clearRoomTimers`, `updateMotivationCard`, `motivationBadgeHTML` kabuk çağrıları | (c) render/`ui` | app.js'te kaldı |

Kapanım bağımlılığı görünmeyen tüm saf üreticiler açık `MOT_DEPENDENCIES` bag'i ile çözülür: `data, ui, dark, getDay, activeDate, diffDays, icon, esc, segTabs, progBar, featuresLive, fmtWhen, fmtDateNice` (13 adet; eksik/ikinci kayıt fail-closed).

## 3. Taşıma (adım 3)

- `app/core/motivation.js` (744 satır): load-safe IIFE registry; `window.SeymaMotivation` (38 fonksiyon + katalog). Yüklemede DOM/storage/timer/ağ çağrısı yok.
- `app.js` shim bloğu: 23 imza-koruyan `window.SeymaMotivation.<ad>.apply(null,arguments)` shim'i (eski 10419–11156 aralığı). `App.saveDailyWin`/`App.copyFlexNudge` app-owned kaldı (`copyFlexNudge` gün dizisi hesabı registry `flexNudgeFor`'dan okur — tek nudge kaynağı).
- Canlı bag: `registerMotivation` çağrısı `SeymaSaygi` kaydının hemen ardından (app.js `:405–421`); `data`/`ui`/`dark` canlı getter olarak bağlanır.
- `roomDailyContentHTML` günün seçkisini canlı `data.roomContentHistory`'ye yazar (mevcut davranış); kalıcı mutasyon kabuğu app.js save/commit yüzeyinde kalır.

## 4. Yükleme ve test güncellemesi (adım 4)

- `index.html`: `app/core/motivation.js?v=20260909a` saygi ile mediaFx arasına (MON-S3 matris konumu); app.js değiştiği için `app.js?v=20260909c` ile cache-bust yükseltildi.
- `driver.mjs` FILES, `zikr-harness.mjs` FILES, `test_state_rebind_boundary.js` boot listesi: motivation aynı konuma eklendi (S4 parite zinciri, 4 liste).
- app.js boot eden diğer fixture'lara da motivation registry yüklendi (fail-closed preflight bulgusu): `verify-state-migration-boundary.mjs`, `test_aeon_message_expand.js`, `test_zikr_manual_entry.js`, `test_reminder_boot.js` (SOURCE+runInContext), `test_reminder_migration.js`, `test_reminder_app_acceptance.js`, `test_reminder_app_privacy.js`, `test_reminder_app_notification_boundary.js`, `test_reminder_concurrency.js`, `test_reminder_integrated_privacy.js`, `test_reminder_integrated_ux.js`, `test_reminder_cross_surface_schema.js`.
- `test_motivation_room_accessibility.js`: room sözleşme kaynağı `app/core/motivation.js`'ten okunacak şekilde güncellendi (assertion semantiği değişmedi).
- fx2 yüzey sayım fixture'ları (FX2-16.2, FX2-15.7, FX2-10.9): `app.js + motivation.js` birleşik kaynak üzerinde ölçecek şekilde güncellendi — MON-S5 geçiş izni kapsamında (yüzey aslında değişmedi; ölçüm tabanı iki dosyaya bölündü).

## 5. Değişmezlik kanıtı (adım 5)

| Ölçüm | MON-25 HEAD | MON-26 çalışma ağacı | Delta | Yorum |
|---|---|---|---|---|
| `App.fn = function` (app.js) | 556 | 556 | 0 | Handler yüzeyi app.js'te |
| `onclick="App.` (app.js) | 354 | 333 | −21 | 24 onclick registry gövdelerine taşındı (+3 inline `onclick=` farkı); **App handler adları birebir aynı** (birleşik kaynakta 391 onclick, 718 unique App ataması — fx2 fixture'ları bunu birleşik kaynakta doğrular) |
| Birleşik kaynak `onclick=` | 391 | 391 | 0 | I2 yüzey bütünlüğü |
| Birleşik kaynak unique `App.x=` | 718 | 718 | 0 | I2 |
| Gerçek `data=` atama tokeni (app.js) | 9 | 9 | 0 | M2: rebind tamamı app.js'te |
| `sheetClose(` çağrıları | 12 | 12 | 0 | FX yüzeyi |
| dump paritesi (`--dump bugun`, stokastik MG skoru normalize) | — | **birebir eşit** | — | Görünüm byte-paritesi |

İlk koşumda yakalanan ve düzeltilen **fail-closed bulgu**: dilim silme sırasında `App.saveDailyWin`/`App.copyFlexNudge` app-owned gövdeleri yanlışlıkla silinmişti (combined App 718→716, fx2 fixture'ları FAIL ile yakaladı). Gövdeler HEAD'den birebir geri getirildi; `copyFlexNudge` gün dizisi hesabı tek kaynağa (`flexNudgeFor`) bağlandı.

## 6. Kapı sonuçları (adım 6, tümü exit 0)

- `node --check app.js` / `sync.js` / `app/core/motivation.js` · `driver.mjs` · `zikr-harness.mjs` 95/95
- modularization 68/68 · motivation_room_accessibility PASS · Faz−1.1 27/27 · date-utils 59/59 · helpers 31/31
- B1 0 failure · B2 60/60 · B3 20/20 · rebind 37/37 · save boundary 19/19 · Faz10 69/69 · large-file 15/15
- Dört manevi boundary 19/17/20/20 · manual 21/21 · modal focus · aeon_message_expand 24/24
- fx2 ailesi 66/66 · premium ailesi 249/249 · Quran ailesi · reminder smoke 20/20 · panel faz11
- `git diff --check` temiz

## 7. Kabul — dört cümle (adım 7)

1. Tek sahip: motivation saf görünüm/parser/katalog gövdeleri `app/core/motivation.js` registrysinde; app.js shim + canlı bag + App-owned mutation kabuğu.
2. Doğru yükleme sırası: index/driver/zikr/state-rebind/reminder boot listeleri motivation'ı saygi→mediaFx arasına aldı (S4 parite).
3. Hedef suite PASS: §6'daki tüm kapılar.
4. I1–I6/M1–M4 farkı yok: birleşik kaynakta 718/391 yüzey korunur, `data=` 9 token app.js'te, migrate/getDay/save/Guard dokunulmadı; dump paritesi birebir.

## 8. Sınırın açık ayrımı (adım 8)

- Yerel PASS deploy veya cihaz kabulü değildir; push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yok.
- Kalan açık: `App.fetchProfileForRoom` ağ yüzeyi app.js'te kalır (registry ağ açmaz); `ui.motivationReflectionDraft` gibi geçici durumlar app.js `ui` sahipliğinde.
- Sıradaki kart: **MON-27 (crisis domain)** — `approvalRequired: true`, yeni açık kullanıcı yönü olmadan başlamaz.
