# REM-51 — App surface adapter ve feature deep-link conformance

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-51
- **Tarih:** 2026-08-18
- **Commit:** `3a7fdfa`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `b6b33eebaf4ce077131f575025a6cd7edf207b69`
- **Bitiş HEAD:** `3a7fdfa` (+ closure receipt docs commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `app.js` (feature adapters), `tests/reminders/test_reminder_app_surface_conformance.js`, feature-specific reminder fixtures
- **Closure records:** `docs/reminders/evidence/REM-51.md`, `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`
- **Kapsam dışı düzeltme:** `tests/test_panel_p3_timeline_drawer.js` (aşağıda discrepancy olarak kayıtlı)

## Yapılan

REM-51, reminder hedeflerinin gerçek app surface'lerine bağlandığını tek
adapter sözleşmesinde kanıtlar.

**Görev 1 — tablo.** `REMINDER_DEEP_LINK_TARGETS` artık her hedef için
`targetId`, `kind`, `handler`, `requiredState` ve `backPath` taşır.
`App.reminderSurfaceTable()` katalogdaki her tanım için bu satırı üretir ve
`handlerBound` alanıyla handler'ın App'te gerçekten var olduğunu raporlar.

**Görev 2 — ayrı durumlar.** `reminderSurfaceState(requiredState)` altı
özellik durumunu birbirinden ayrı sebep koduyla döndürür:
`prayer-data-stale`, `prayer-data-unavailable`, `zikr-session-paused`,
`therapy-tool-unselected`, `saygi-content-unavailable`,
`reading-library-empty`, `care-unconfigured`. Bu durumlar `ok`'i düşürmez —
kullanıcı yüzeyi açabilir, fakat uygulama taze/hazır veri varmış gibi
davranmaz. Ayrım kasıtlıdır ve fixture tarafından tekil sebep kümesi olarak
doğrulanır.

**Görev 3 — otomatik completion yok.** `App.openReminderTarget` çağrısı
sonrası `days`, `zikr` ve `library` blokları byte düzeyinde değişmeden kalır.

**Görev 4 — event semantiği ayrı.** Bir öneriyi çözümlemek
(`reminderDeepLinkTarget`) tek başına hiçbir action kaydı üretmez;
`reminders.actions` boş kalır.

**Görev 5 — fail-closed.** Bilinmeyen reminder, kayıtsız hedef ve deep-link
uyuşmazlığına ek olarak **yeni** `handler-missing` durumu eklendi: kayıtlı
handler App'te bağlı değilse hedef açılmış gibi davranılmaz. Önceki sürümde
`ok:true` dönüyor ve ardından sessizce hiçbir şey olmuyordu.

**Gizlilik sınırı (kapsam içi düzeltme).** `reminderNativeDeliveryCopy`
önceden **tüm** target nesnesini native kopyaya koyuyordu; REM-51 ile eklenen
surface teşhis alanları böylece native yüzeye sızacaktı. Mevcut
`test_reminder_copy` fixture'ı bunu yakaladı. Çözüm sebep adını değiştirmek
değil, sınırı daraltmak oldu: `reminderNativeTargetView` yalnız yönlendirme
alanlarını (`deepLink`, `targetId`, `kind`, `openDetail`, `therapyToolId`)
geçirir. Surface teşhisi uygulama içinde kalır.

## Doğrulama

| Kapı | Sonuç |
|---|---|
| `test_reminder_app_surface_conformance.js` (yeni) | PASS · 110 assertion · 14 senaryo |
| `test_reminder_prayer.js` | PASS · 48 |
| `test_reminder_zikr.js` | PASS · 35 |
| `test_reminder_therapy.js` | PASS · 82 |
| `test_reminder_saygi.js` | PASS · 71 |
| `zikr-harness.mjs` | PASS · 90/90 |
| Tüm fixture (`tests/reminders`, `tests`, `tests/panel-v2`) | PASS · 112/112 |
| Headless harness (driver, quran×3, B1/B2/B3) | PASS · 7/7 |
| `node --check` (app, sync, panel, sw, reminderCatalog) | PASS |
| `verify-reminder-context.mjs` | PASS · 73 prompt, 66 link |

Gerçek tarayıcı, gerçek ağ çağrısı ve `mustafaras/seyma-data` yazması **yok**.

## Discrepancy

`tests/test_panel_p3_timeline_drawer.js` REM-51 allowlist'i dışındadır fakat
düzeltildi. Gerekçe: test `panel.js?v=20260811a` damgasını **sabit metin**
olarak bekliyordu ve CLAUDE.md ilke 5 her deploy'da bu damganın bumplanmasını
zorunlu kıldığı için her teslimatta kırılıyordu. Aynı kusur sınıfı bu oturumda
`test_reminder_boot.js` ve `test_reminder_visual.js` içinde de bulunup
düzeltilmişti (commit `b6b33ee`); üçüncüsü o düzeltmenin eksik kalan
parçasıydı. İddianın niyeti ("cache-bust var") korunarak desen kontrolüne
çevrildi, kapsam genişletilmedi.

## Kapanış

APP-05 kapandı. `activePrompt=REM-52`, `lastCompletedPrompt=REM-51`.
Release `not_approved`; S5 kullanıcı-cihaz kabulü pending.
